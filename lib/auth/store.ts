import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import type { LedgerEntry, Session, User } from "@/lib/auth/types";

/**
 * The local auth backend's storage: one JSON file under `.data/`, which is
 * gitignored. Deliberately dependency-free — a SQLite driver would mean a
 * native build step, and the whole point of this provider is that it runs
 * with nothing installed and nothing configured.
 *
 * Server-only. Importing this from a client component is a bug.
 */
export type Db = {
  users: User[];
  sessions: Session[];
  ledger: LedgerEntry[];
};

// Vercel's serverless functions run on a read-only filesystem outside of
// /tmp — process.cwd() is fine for local dev but throws EROFS in
// production there. This keeps local dev's persistent, gitignored .data/
// folder and only switches to /tmp (ephemeral per instance, but writable)
// when actually running on Vercel. See README's deploy notes.
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "waresnap-data")
  : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "waresnap.json");

const empty = (): Db => ({ users: [], sessions: [], ledger: [] });

/** Writes are serialised through this chain so two concurrent requests can
 * never read-modify-write over each other's changes. */
let chain: Promise<unknown> = Promise.resolve();

/**
 * Always reads from disk. An in-memory cache looks obviously right here and
 * is obviously wrong: Next bundles server components and server actions into
 * separate module instances, so a spend recorded through the action's copy is
 * invisible to the page's copy, and the header goes on showing a stale
 * balance until the process restarts. The file is small; read it.
 */
async function load(): Promise<Db> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Db>;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      ledger: parsed.ledger ?? [],
    };
  } catch {
    // Missing or unreadable file — start clean rather than crash the app.
    return empty();
  }
}

async function persist(db: Db): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file and rename, so a crash mid-write cannot leave a
  // half-written JSON file that would read as an empty database next boot.
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

/** Read-only access. Do not mutate the object handed to `fn`. */
export async function read<T>(fn: (db: Db) => T): Promise<T> {
  const db = await load();
  return fn(db);
}

/** Read-modify-write under the serialisation lock. */
export async function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const db = await load();
    const result = await fn(db);
    await persist(db);
    return result;
  };
  const next = chain.then(run, run);
  // Keep the chain alive even when a caller's mutation rejects.
  chain = next.catch(() => undefined);
  return next;
}

export function nextLedgerId(db: Db): number {
  return db.ledger.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
}
