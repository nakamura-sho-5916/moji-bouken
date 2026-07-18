import type { IDBPDatabase } from 'idb';
import type { MojiBoukenDbSchema } from '../schema';
import { migrateToVersion1 } from './version1';

export function runMigrations(
  db: IDBPDatabase<MojiBoukenDbSchema>,
  oldVersion: number,
) {
  if (oldVersion < 1) {
    migrateToVersion1(db);
  }
}
