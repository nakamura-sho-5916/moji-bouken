import {
  DB_VERSION,
  DEFAULT_PLAYER_ID,
  LEGACY_PLAYER_ID,
} from '../../db/constants';
import { initializeAppData } from '../../db/initializeAppData';
import { closeDbConnectionForTests, openMojiBoukenDb } from '../../db/database';
import { SAVE_SLOT_IDS } from '../../db/repositories/saveSlotRepository';
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

export const BACKUP_FORMAT = 'moji-bouken-backup';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const APP_VERSION = '0.6.2';

export type BackupData = {
  players: Player[];
  learningLogs: LearningLog[];
  letterProgress: LetterProgress[];
  reviewSchedules: ReviewSchedule[];
  worldProgress: WorldProgress[];
  inventories: Inventory[];
  settings: AppSettings[];
  collectionProgress: CollectionProgress[];
  albumEntries: AlbumEntry[];
  saveSlots: SaveSlot[];
  localStorage: {
    rewardedBattleIds: string | null;
    entries: Record<string, string>;
  };
};

export type MojiBoukenBackup = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  appVersion: string;
  createdAt: string;
  databaseVersion: number;
  data: BackupData;
};

function sanitizeSettings(settings: AppSettings): AppSettings {
  return {
    ...settings,
    parentPinConfigured: false,
    parentPinHash: null,
    parentPinSalt: null,
    parentPinFailedAttempts: 0,
    parentPinLockUntil: null,
  };
}

const RESTORABLE_LOCAL_STORAGE_KEYS = [
  'moji-bouken:active-save-slot',
  'moji-bouken:story-progress',
  'moji-bouken:boss-battle-stats',
  'moji-bouken:companion-battle-stats',
  'moji-bouken:area-unlock-stats',
  'moji-bouken:world-recovery-points',
  'moji-bouken:recent-question-history',
  'moji-bouken:rewarded-battle-ids',
] as const;

function shouldBackupLocalStorageKey(key: string) {
  return RESTORABLE_LOCAL_STORAGE_KEYS.some(
    (restorableKey) =>
      key === restorableKey || key.startsWith(`${restorableKey}:`),
  );
}

function collectRestorableLocalStorage() {
  return Object.fromEntries(
    Object.keys(localStorage)
      .filter(shouldBackupLocalStorageKey)
      .map((key) => [key, localStorage.getItem(key) ?? '']),
  );
}

export async function createBackup(): Promise<MojiBoukenBackup> {
  await initializeAppData();
  const db = await openMojiBoukenDb();
  const data: BackupData = {
    players: await db.getAll('players'),
    learningLogs: await db.getAll('learningLogs'),
    letterProgress: await db.getAll('letterProgress'),
    reviewSchedules: await db.getAll('reviewSchedules'),
    worldProgress: await db.getAll('worldProgress'),
    inventories: await db.getAll('inventories'),
    settings: (await db.getAll('settings')).map(sanitizeSettings),
    collectionProgress: await db.getAll('collectionProgress'),
    albumEntries: await db.getAll('albumEntries'),
    saveSlots: await db.getAll('saveSlots'),
    localStorage: {
      rewardedBattleIds: localStorage.getItem(
        'moji-bouken:rewarded-battle-ids',
      ),
      entries: collectRestorableLocalStorage(),
    },
  };
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    appVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
    databaseVersion: DB_VERSION,
    data,
  };
}

export function createBackupFileName(createdAt = new Date().toISOString()) {
  return `moji-bouken-backup-${createdAt.slice(0, 10)}.json`;
}

export function serializeBackup(backup: MojiBoukenBackup) {
  return JSON.stringify(backup, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseBackupJson(json: string): MojiBoukenBackup {
  const parsed = JSON.parse(json) as unknown;
  if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT) {
    throw new Error('バックアップ形式が違います。');
  }
  if (parsed.version !== BACKUP_VERSION) {
    throw new Error('バックアップのバージョンを確認してください。');
  }
  if (!isRecord(parsed.data)) {
    throw new Error('バックアップの中身を確認できません。');
  }
  const requiredArrays = [
    'players',
    'learningLogs',
    'letterProgress',
    'reviewSchedules',
    'worldProgress',
    'inventories',
    'settings',
    'collectionProgress',
    'albumEntries',
  ];
  for (const key of requiredArrays) {
    if (!Array.isArray(parsed.data[key])) {
      throw new Error('必要なデータが足りません。');
    }
  }
  return parsed as MojiBoukenBackup;
}

function retargetLegacyId(id: string) {
  return id.startsWith(`${LEGACY_PLAYER_ID}:`)
    ? `${DEFAULT_PLAYER_ID}:${id.slice(LEGACY_PLAYER_ID.length + 1)}`
    : id;
}

function retargetLegacyStorageKey(key: string) {
  return key.includes(LEGACY_PLAYER_ID)
    ? key.replaceAll(LEGACY_PLAYER_ID, DEFAULT_PLAYER_ID)
    : key;
}

function createBackupSlot(
  id: SaveSlot['id'],
  now: string,
  migratedFromLegacy: boolean,
): SaveSlot {
  return {
    id,
    playerId: id.replace('slot', 'save-slot'),
    name:
      id === 'slot-1'
        ? 'ぼうけん①'
        : id === 'slot-2'
          ? 'ぼうけん②'
          : 'ぼうけん③',
    createdAt: now,
    updatedAt: now,
    lastPlayedAt: null,
    playTimeMs: 0,
    migratedFromLegacy,
  };
}

function normalizeSaveSlots(input: SaveSlot[] | undefined, now: string) {
  return SAVE_SLOT_IDS.map(
    (slotId) =>
      input?.find((slot) => slot.id === slotId) ??
      createBackupSlot(slotId, now, slotId === 'slot-1'),
  );
}

function normalizeBackupData(data: MojiBoukenBackup['data']): BackupData {
  const now = new Date().toISOString();
  const raw = data as Omit<BackupData, 'saveSlots'> & {
    saveSlots?: SaveSlot[];
    localStorage?: {
      rewardedBattleIds?: string | null;
      entries?: Record<string, string>;
    };
  };
  const hasSaveSlots = Array.isArray(raw.saveSlots) && raw.saveSlots.length > 0;
  const shouldRetargetLegacy =
    !hasSaveSlots &&
    raw.players.some((player) => player.id === LEGACY_PLAYER_ID);
  const retargetPlayerId = (playerId: string) =>
    shouldRetargetLegacy && playerId === LEGACY_PLAYER_ID
      ? DEFAULT_PLAYER_ID
      : playerId;
  const retargetId = (id: string) =>
    shouldRetargetLegacy ? retargetLegacyId(id) : id;
  const entries = Object.fromEntries(
    Object.entries(raw.localStorage?.entries ?? {})
      .filter(([key]) => shouldBackupLocalStorageKey(key))
      .map(([key, value]) => [
        shouldRetargetLegacy ? retargetLegacyStorageKey(key) : key,
        value,
      ]),
  );
  const rewardedBattleIds =
    raw.localStorage?.rewardedBattleIds ??
    entries['moji-bouken:rewarded-battle-ids'] ??
    null;
  if (rewardedBattleIds && !entries['moji-bouken:rewarded-battle-ids']) {
    entries['moji-bouken:rewarded-battle-ids'] = rewardedBattleIds;
  }

  return {
    players: raw.players.map((player) => ({
      ...player,
      id: retargetPlayerId(player.id),
    })),
    learningLogs: raw.learningLogs.map((item) => ({
      ...item,
      id: retargetId(item.id),
      playerId: retargetPlayerId(item.playerId),
    })),
    letterProgress: raw.letterProgress.map((item) => ({
      ...item,
      id: retargetId(item.id),
      playerId: retargetPlayerId(item.playerId),
    })),
    reviewSchedules: raw.reviewSchedules.map((item) => ({
      ...item,
      id: retargetId(item.id),
      playerId: retargetPlayerId(item.playerId),
    })),
    worldProgress: raw.worldProgress.map((item) => ({
      ...item,
      id: retargetId(item.id),
      playerId: retargetPlayerId(item.playerId),
    })),
    inventories: raw.inventories.map((item) => ({
      ...item,
      playerId: retargetPlayerId(item.playerId),
    })),
    settings: raw.settings.map((item) =>
      sanitizeSettings({
        ...item,
        playerId: retargetPlayerId(item.playerId),
      }),
    ),
    collectionProgress: raw.collectionProgress.map((item) => ({
      ...item,
      id: retargetId(item.id),
      playerId: retargetPlayerId(item.playerId),
    })),
    albumEntries: raw.albumEntries.map((item) => ({
      ...item,
      eventId:
        shouldRetargetLegacy && item.playerId === LEGACY_PLAYER_ID
          ? `${DEFAULT_PLAYER_ID}:${item.eventId.split(':').pop() ?? item.eventId}`
          : item.eventId,
      playerId: retargetPlayerId(item.playerId),
    })),
    saveSlots: normalizeSaveSlots(raw.saveSlots, now),
    localStorage: {
      rewardedBattleIds,
      entries,
    },
  };
}

function restoreLocalStorage(entries: Record<string, string>) {
  for (const key of Object.keys(localStorage)) {
    if (shouldBackupLocalStorageKey(key)) {
      localStorage.removeItem(key);
    }
  }
  for (const [key, value] of Object.entries(entries)) {
    if (shouldBackupLocalStorageKey(key)) {
      localStorage.setItem(key, value);
    }
  }
}

export async function restoreBackup(backup: MojiBoukenBackup) {
  const beforeRestore = await createBackup();
  const data = normalizeBackupData(backup.data);
  const db = await openMojiBoukenDb();
  const tx = db.transaction(
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
    'readwrite',
  );
  await Promise.all([
    tx.objectStore('players').clear(),
    tx.objectStore('learningLogs').clear(),
    tx.objectStore('letterProgress').clear(),
    tx.objectStore('reviewSchedules').clear(),
    tx.objectStore('worldProgress').clear(),
    tx.objectStore('inventories').clear(),
    tx.objectStore('settings').clear(),
    tx.objectStore('collectionProgress').clear(),
    tx.objectStore('albumEntries').clear(),
    tx.objectStore('saveSlots').clear(),
  ]);
  for (const item of data.players) {
    await tx.objectStore('players').put(item);
  }
  for (const item of data.learningLogs) {
    await tx.objectStore('learningLogs').put(item);
  }
  for (const item of data.letterProgress) {
    await tx.objectStore('letterProgress').put(item);
  }
  for (const item of data.reviewSchedules) {
    await tx.objectStore('reviewSchedules').put(item);
  }
  for (const item of data.worldProgress) {
    await tx.objectStore('worldProgress').put(item);
  }
  for (const item of data.inventories) {
    await tx.objectStore('inventories').put(item);
  }
  for (const item of data.settings) {
    await tx.objectStore('settings').put(item);
  }
  for (const item of data.collectionProgress) {
    await tx.objectStore('collectionProgress').put(item);
  }
  for (const item of data.albumEntries) {
    await tx.objectStore('albumEntries').put(item);
  }
  for (const item of data.saveSlots) {
    await tx.objectStore('saveSlots').put(item);
  }
  await tx.done;
  restoreLocalStorage(data.localStorage.entries);
  await closeDbConnectionForTests();
  return beforeRestore;
}
