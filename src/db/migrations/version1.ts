import type { IDBPDatabase } from 'idb';
import type { MojiBoukenDbSchema } from '../schema';

export function migrateToVersion1(db: IDBPDatabase<MojiBoukenDbSchema>) {
  if (!db.objectStoreNames.contains('players')) {
    db.createObjectStore('players', { keyPath: 'id' });
  }

  if (!db.objectStoreNames.contains('learningLogs')) {
    const store = db.createObjectStore('learningLogs', { keyPath: 'id' });
    store.createIndex('by-player', 'playerId');
    store.createIndex('by-letter', 'targetLetter');
    store.createIndex('by-mission', 'missionId');
    store.createIndex('by-answered-at', 'answeredAt');
  }

  if (!db.objectStoreNames.contains('letterProgress')) {
    const store = db.createObjectStore('letterProgress', { keyPath: 'id' });
    store.createIndex('by-player', 'playerId');
    store.createIndex('by-letter', 'letterId');
    store.createIndex('by-weak-flag', 'weakFlagIndex');
    store.createIndex('by-mastered-flag', 'masteredFlagIndex');
  }

  if (!db.objectStoreNames.contains('reviewSchedules')) {
    const store = db.createObjectStore('reviewSchedules', { keyPath: 'id' });
    store.createIndex('by-player', 'playerId');
    store.createIndex('by-letter', 'letterId');
    store.createIndex('by-scheduled-date', 'scheduledDate');
    store.createIndex('by-completed', 'completed');
  }

  if (!db.objectStoreNames.contains('worldProgress')) {
    const store = db.createObjectStore('worldProgress', { keyPath: 'id' });
    store.createIndex('by-player', 'playerId');
    store.createIndex('by-area', 'areaId');
  }

  if (!db.objectStoreNames.contains('inventories')) {
    db.createObjectStore('inventories', { keyPath: 'playerId' });
  }

  if (!db.objectStoreNames.contains('settings')) {
    db.createObjectStore('settings', { keyPath: 'playerId' });
  }
}
