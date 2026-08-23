import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/** Stored as `salt:key`, both hex. Node's crypto only — no new dependency. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, keyHex] = stored.split(":");
  if (!salt || !keyHex) return false;

  const expected = Buffer.from(keyHex, "hex");
  const actual = await scryptAsync(password, salt, KEY_LENGTH);

  // timingSafeEqual throws on a length mismatch, so guard it first.
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export function newId(): string {
  return randomBytes(12).toString("hex");
}
