import { beforeEach, describe, expect, it } from 'vitest';
import { DB_NAME, DB_VERSION, OBJECT_STORES } from '../../src/db/constants';
import { getObjectStoreNames, openMojiBoukenDb } from '../../src/db/database';
import { runMigrations } from '../../src/db/migrations';
import { resetIndexedDb } from './dbTestUtils';

describe('database', () => {
  beforeEach(async () => {
    await resetIndexedDb();
  });

  it('DB初期化に成功する', async () => {
    const db = await openMojiBoukenDb();

    expect(db.name).toBe(DB_NAME);
    expect(db.version).toBe(DB_VERSION);
  });

  it('必要なobject storeがすべて存在する', async () => {
    const storeNames = await getObjectStoreNames();

    expect(storeNames.sort()).toEqual([...OBJECT_STORES].sort());
  });

  it('migration処理が実行される', async () => {
    const db = await openMojiBoukenDb();

    expect(() => runMigrations(db, DB_VERSION)).not.toThrow();
    expect(Array.from(db.objectStoreNames)).toContain('players');
  });
});
