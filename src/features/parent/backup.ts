import { DB_VERSION } from '../../db/constants';
import { initializeAppData } from '../../db/initializeAppData';
import { closeDbConnectionForTests, openMojiBoukenDb } from '../../db/database';
import type {
  AlbumEntry,
  AppSettings,
  CollectionProgress,
  Inventory,
  LearningLog,
  LetterProgress,
  Player,
  ReviewSchedule,
  WorldProgress,
} from '../../types';

export const BACKUP_FORMAT = 'moji-bouken-backup';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const APP_VERSION = '0.1.3';

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
  localStorage: {
    rewardedBattleIds: string | null;
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
    localStorage: {
      rewardedBattleIds: localStorage.getItem(
        'moji-bouken:rewarded-battle-ids',
      ),
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

export async function restoreBackup(backup: MojiBoukenBackup) {
  const beforeRestore = await createBackup();
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
  ]);
  for (const item of backup.data.players) {
    await tx.objectStore('players').put(item);
  }
  for (const item of backup.data.learningLogs) {
    await tx.objectStore('learningLogs').put(item);
  }
  for (const item of backup.data.letterProgress) {
    await tx.objectStore('letterProgress').put(item);
  }
  for (const item of backup.data.reviewSchedules) {
    await tx.objectStore('reviewSchedules').put(item);
  }
  for (const item of backup.data.worldProgress) {
    await tx.objectStore('worldProgress').put(item);
  }
  for (const item of backup.data.inventories) {
    await tx.objectStore('inventories').put(item);
  }
  for (const item of backup.data.settings.map(sanitizeSettings)) {
    await tx.objectStore('settings').put(item);
  }
  for (const item of backup.data.collectionProgress) {
    await tx.objectStore('collectionProgress').put(item);
  }
  for (const item of backup.data.albumEntries) {
    await tx.objectStore('albumEntries').put(item);
  }
  await tx.done;
  await closeDbConnectionForTests();
  return beforeRestore;
}
