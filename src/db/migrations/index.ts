import type { IDBPDatabase, IDBPTransaction, StoreNames } from 'idb';
import type { MojiBoukenDbSchema } from '../schema';
import { migrateToVersion1 } from './version1';
import { migrateToVersion2 } from './version2';
import { migrateToVersion4 } from './version4';

export function runMigrations(
  db: IDBPDatabase<MojiBoukenDbSchema>,
  oldVersion: number,
  transaction?: IDBPTransaction<
    MojiBoukenDbSchema,
    StoreNames<MojiBoukenDbSchema>[],
    'versionchange'
  >,
) {
  if (oldVersion < 1) {
    migrateToVersion1(db);
  }
  if (oldVersion < 2) {
    migrateToVersion2(db);
  }
  if (oldVersion < 4) {
    if (!transaction) {
      throw new Error(
        'Settings migration requires a versionchange transaction.',
      );
    }
    migrateToVersion4(
      transaction as unknown as IDBPTransaction<
        MojiBoukenDbSchema,
        ['settings'],
        'versionchange'
      >,
    );
  }
}
