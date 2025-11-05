import initSqlJs, { type Database } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { loadFromIndexedDb, saveToIndexedDb } from "@/lib/indexed-db";

export interface DatabaseHandles {
  db: Database;
  persist: () => Promise<void>;
}

export async function initDatabase(): Promise<DatabaseHandles> {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const saved = await loadFromIndexedDb();
  const db = saved ? new SQL.Database(new Uint8Array(saved)) : new SQL.Database();
  bootstrap(db);
  const persist = async () => {
    const binaryArray = db.export();
    await saveToIndexedDb(binaryArray);
  };
  return { db, persist };
}

function bootstrap(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      title TEXT,
      createdAt TEXT,
      json TEXT
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      taskId TEXT,
      score INTEGER,
      passed INTEGER,
      timestamp TEXT,
      weaknesses TEXT
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS rank (
      k TEXT PRIMARY KEY,
      v TEXT
    );
  `);
}
