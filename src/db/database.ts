import { openDB, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, OBJECT_STORES } from './constants';
import { runMigrations } from './migrations';
import type { MojiBoukenDbSchema } from './schema';

let dbPromise: Promise<IDBPDatabase<MojiBoukenDbSchema>> | null = null;

export class DatabaseInitializationError extends Error {
  constructor(cause: unknown) {
    super('IndexedDBの初期化を確認できませんでした。', { cause });
    this.name = 'DatabaseInitializationError';
  }
}

export function openMojiBoukenDb() {
  dbPromise ??= openDB<MojiBoukenDbSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      runMigrations(db, oldVersion);
    },
  }).catch((error: unknown) => {
    dbPromise = null;
    throw new DatabaseInitializationError(error);
  });

  return dbPromise;
}

export async function getObjectStoreNames() {
  const db = await openMojiBoukenDb();
  return Array.from(db.objectStoreNames);
}

export function getRequiredObjectStores() {
  return [...OBJECT_STORES];
}

export function resetDbConnectionForTests() {
  dbPromise = null;
}

export async function closeDbConnectionForTests() {
  const db = await dbPromise?.catch(() => undefined);
  db?.close();
  dbPromise = null;
}
