import type { IDBPDatabase } from 'idb';
import type { MojiBoukenDbSchema } from '../schema';

export function migrateToVersion2(db: IDBPDatabase<MojiBoukenDbSchema>) {
  if (!db.objectStoreNames.contains('collectionProgress')) {
    const collection = db.createObjectStore('collectionProgress', {
      keyPath: 'id',
    });
    collection.createIndex('by-player', 'playerId');
    collection.createIndex('by-category', 'category');
    collection.createIndex('by-target', 'targetId');
  }

  if (!db.objectStoreNames.contains('albumEntries')) {
    const album = db.createObjectStore('albumEntries', {
      keyPath: 'eventId',
    });
    album.createIndex('by-player', 'playerId');
    album.createIndex('by-area', 'areaId');
    album.createIndex('by-unlocked-at', 'unlockedAt');
  }
}
