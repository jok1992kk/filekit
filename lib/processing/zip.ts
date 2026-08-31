/**
 * A minimal ZIP writer, store-only (no deflate).
 *
 * Everything we put in an archive is a JPG, PNG or WebP — already compressed,
 * so deflating them again costs CPU and saves nothing. Storing them keeps this
 * to one small file instead of a compression dependency.
 */

const CRC_TABLE = /* @__PURE__ */ (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array<ArrayBuffer>): number {
  let value = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    value = CRC_TABLE[(value ^ bytes[index]) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

/** MS-DOS packed date and time, the only clock format ZIP understands. */
function dosStamp(date: Date) {
  const time =
    (date.getHours() << 11) | (date.getMinutes() << 5) | (Math.floor(date.getSeconds() / 2) & 0x1f);
  const day =
    ((Math.max(1980, date.getFullYear()) - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  return { time, day };
}

class ByteWriter {
  // Pinned to ArrayBuffer (not ArrayBufferLike) so the chunks satisfy BlobPart.
  private chunks: Uint8Array<ArrayBuffer>[] = [];
  length = 0;

  u16(value: number) {
    const bytes = new Uint8Array(2);
    new DataView(bytes.buffer).setUint16(0, value, true);
    this.raw(bytes);
  }

  u32(value: number) {
    const bytes = new Uint8Array(4);
    new DataView(bytes.buffer).setUint32(0, value >>> 0, true);
    this.raw(bytes);
  }

  raw(bytes: Uint8Array<ArrayBuffer>) {
    this.chunks.push(bytes);
    this.length += bytes.length;
  }

  collect(): Uint8Array<ArrayBuffer>[] {
    return this.chunks;
  }
}

export type ZipEntry = { name: string; blob: Blob };

/** Builds a ZIP from already-encoded files. Names are stored as UTF-8. */
export async function createZip(entries: ZipEntry[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const { time, day } = dosStamp(new Date());

  const local = new ByteWriter();
  const central = new ByteWriter();

  // Each entry's offset, size and CRC are written twice — once in the local
  // header, once in the central directory — so the first pass records them.
  const recorded: { name: Uint8Array<ArrayBuffer>; offset: number; size: number; crc: number }[] = [];

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const body = new Uint8Array(await entry.blob.arrayBuffer());
    const crc = crc32(body);
    const offset = local.length;

    local.u32(0x04034b50);
    local.u16(20); // version needed
    local.u16(0x0800); // UTF-8 filename
    local.u16(0); // stored, not deflated
    local.u16(time);
    local.u16(day);
    local.u32(crc);
    local.u32(body.length);
    local.u32(body.length);
    local.u16(name.length);
    local.u16(0); // no extra field
    local.raw(name);
    local.raw(body);

    recorded.push({ name, offset, size: body.length, crc });
  }

  for (const entry of recorded) {
    central.u32(0x02014b50);
    central.u16(20); // version made by
    central.u16(20); // version needed
    central.u16(0x0800);
    central.u16(0);
    central.u16(time);
    central.u16(day);
    central.u32(entry.crc);
    central.u32(entry.size);
    central.u32(entry.size);
    central.u16(entry.name.length);
    central.u16(0); // extra
    central.u16(0); // comment
    central.u16(0); // disk
    central.u16(0); // internal attributes
    central.u32(0); // external attributes
    central.u32(entry.offset);
    central.raw(entry.name);
  }

  const tail = new ByteWriter();
  tail.u32(0x06054b50);
  tail.u16(0); // this disk
  tail.u16(0); // disk holding the central directory
  tail.u16(recorded.length);
  tail.u16(recorded.length);
  tail.u32(central.length);
  tail.u32(local.length);
  tail.u16(0); // no archive comment

  return new Blob([...local.collect(), ...central.collect(), ...tail.collect()], {
    type: "application/zip",
  });
}
