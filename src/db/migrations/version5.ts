import type { IDBPTransaction } from 'idb';
import { DEFAULT_PLAYER_ID, LEGACY_PLAYER_ID } from '../constants';
import type { MojiBoukenDbSchema } from '../schema';
import type {
  AlbumEntry,
  AppSettings,
  CollectionProgress,
  Inventory,
  LearningLog,
  LetterProgress,
  Player,
  ReviewSchedule,
  SaveSlot,
  WorldProgress,
} from '../../types';

type Version5Transaction = IDBPTransaction<
  MojiBoukenDbSchema,
  [
    'players',
    'learningLogs',
    'letterProgress',
    'reviewSchedules',
    'worldProgress',
    'inventories',
    'settings',
    'collectionProgress',
    'albumEntries',
    'saveSlots',
  ],
  'versionchange'
>;

type CursorLike<T> = {
  value: T;
  continue: () => Promise<CursorLike<T> | null>;
};

export function migrateToVersion5(transaction: Version5Transaction) {
  const db = transaction.db;
  if (!db.objectStoreNames.contains('saveSlots')) {
    db.createObjectStore('saveSlots', { keyPath: 'id' });
  }

  void migrateLegacyPlayerToSlotOne(transaction);
}

async function migrateLegacyPlayerToSlotOne(transaction: Version5Transaction) {
  const now = new Date().toISOString();
  const slots = transaction.objectStore('saveSlots');
  if (await slots.get('slot-1')) {
    return;
  }

  await slots.put({
    id: 'slot-1',
    playerId: DEFAULT_PLAYER_ID,
    name: 'ぼうけん①',
    createdAt: now,
    updatedAt: now,
    lastPlayedAt: null,
    playTimeMs: 0,
    migratedFromLegacy: true,
  } satisfies SaveSlot);
  await slots.put(createEmptySlot('slot-2', 'ぼうけん②', now));
  await slots.put(createEmptySlot('slot-3', 'ぼうけん③', now));

  const players = transaction.objectStore('players');
  const legacyPlayer = await players.get(LEGACY_PLAYER_ID);
  if (legacyPlayer && !(await players.get(DEFAULT_PLAYER_ID))) {
    await players.put({
      ...legacyPlayer,
      id: DEFAULT_PLAYER_ID,
      updatedAt: now,
    } satisfies Player);
  }

  await copyByPlayer<LearningLog>({
    store: transaction.objectStore('learningLogs'),
    transform: (value) => ({
      ...value,
      id: replaceLegacyPrefix(value.id),
      playerId: DEFAULT_PLAYER_ID,
    }),
  });
  await copyByPlayer<LetterProgress>({
    store: transaction.objectStore('letterProgress'),
    transform: (value) => ({
      ...value,
      id: replaceLegacyPrefix(value.id),
      playerId: DEFAULT_PLAYER_ID,
    }),
  });
  await copyByPlayer<ReviewSchedule>({
    store: transaction.objectStore('reviewSchedules'),
    transform: (value) => ({
      ...value,
      id: replaceLegacyPrefix(value.id),
      playerId: DEFAULT_PLAYER_ID,
    }),
  });
  await copyByPlayer<WorldProgress>({
    store: transaction.objectStore('worldProgress'),
    transform: (value) => ({
      ...value,
      id: replaceLegacyPrefix(value.id),
      playerId: DEFAULT_PLAYER_ID,
    }),
  });
  await copySingle<Inventory>({
    key: LEGACY_PLAYER_ID,
    store: transaction.objectStore('inventories'),
    transform: (value) => ({
      ...value,
      playerId: DEFAULT_PLAYER_ID,
      updatedAt: now,
    }),
  });
  await copySingle<AppSettings>({
    key: LEGACY_PLAYER_ID,
    store: transaction.objectStore('settings'),
    transform: (value) => ({
      ...value,
      playerId: DEFAULT_PLAYER_ID,
      updatedAt: now,
    }),
  });
  await copyByPlayer<CollectionProgress>({
    store: transaction.objectStore('collectionProgress'),
    transform: (value) => ({
      ...value,
      id: replaceLegacyPrefix(value.id),
      playerId: DEFAULT_PLAYER_ID,
    }),
  });
  await copyByPlayer<AlbumEntry>({
    store: transaction.objectStore('albumEntries'),
    transform: (value) => ({
      ...value,
      eventId: `${DEFAULT_PLAYER_ID}:${value.eventId}`,
      playerId: DEFAULT_PLAYER_ID,
    }),
  });
}

function createEmptySlot(
  id: SaveSlot['id'],
  name: string,
  now: string,
): SaveSlot {
  return {
    id,
    playerId: id.replace('slot', 'save-slot'),
    name,
    createdAt: now,
    updatedAt: now,
    lastPlayedAt: null,
    playTimeMs: 0,
    migratedFromLegacy: false,
  };
}

function replaceLegacyPrefix(id: string) {
  return id.startsWith(`${LEGACY_PLAYER_ID}:`)
    ? `${DEFAULT_PLAYER_ID}:${id.slice(LEGACY_PLAYER_ID.length + 1)}`
    : id;
}

async function copySingle<T>(input: {
  key: string;
  store: {
    get: (key: string) => Promise<T | undefined>;
    put: (value: T) => Promise<unknown>;
  };
  transform: (value: T) => T;
}) {
  const value = await input.store.get(input.key);
  if (value) {
    await input.store.put(input.transform(value));
  }
}

async function copyByPlayer<T extends { playerId: string }>(input: {
  store: {
    openCursor: () => Promise<CursorLike<T> | null>;
    put: (value: T) => Promise<unknown>;
  };
  transform: (value: T) => T;
}) {
  let cursor = await input.store.openCursor();
  while (cursor) {
    const value = cursor.value;
    if (value.playerId === LEGACY_PLAYER_ID) {
      await input.store.put(input.transform(value));
    }
    cursor = await cursor.continue();
  }
}
