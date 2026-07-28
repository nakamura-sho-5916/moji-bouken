import { STARTING_AREA_ID } from '../constants';
import { openMojiBoukenDb } from '../database';
import { createInitialPlayer } from './playerRepository';
import {
  createInitialWorldProgress,
  createWorldProgressId,
} from './worldProgressRepository';
import { createInitialInventory } from './inventoryRepository';
import { createInitialAppSettings } from './settingsRepository';
import { worldAreas } from '../../features/world/areaData';
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

export const SAVE_SLOT_IDS = ['slot-1', 'slot-2', 'slot-3'] as const;
export type SaveSlotId = (typeof SAVE_SLOT_IDS)[number];
export const ACTIVE_SAVE_SLOT_STORAGE_KEY = 'moji-bouken:active-save-slot';

export type SaveSlotSummary = SaveSlot & {
  empty: boolean;
  level: number;
  townRecoveryRate: number;
  currentAreaName: string;
};

export function getPlayerIdForSlot(slotId: SaveSlotId) {
  return slotId.replace('slot', 'save-slot');
}

export function getActiveSaveSlotId(): SaveSlotId {
  const stored = localStorage.getItem(ACTIVE_SAVE_SLOT_STORAGE_KEY);
  return SAVE_SLOT_IDS.includes(stored as SaveSlotId)
    ? (stored as SaveSlotId)
    : 'slot-1';
}

export function getActivePlayerId() {
  return getPlayerIdForSlot(getActiveSaveSlotId());
}

export function setActiveSaveSlot(slotId: SaveSlotId) {
  localStorage.setItem(ACTIVE_SAVE_SLOT_STORAGE_KEY, slotId);
}

export async function ensureSaveSlots() {
  const db = await openMojiBoukenDb();
  const now = new Date().toISOString();
  for (const slotId of SAVE_SLOT_IDS) {
    if (!(await db.get('saveSlots', slotId))) {
      await db.put('saveSlots', createSlot(slotId, now));
    }
  }
}

export async function listSaveSlotSummaries(): Promise<SaveSlotSummary[]> {
  await ensureSaveSlots();
  const db = await openMojiBoukenDb();
  const slots = await db.getAll('saveSlots');
  const orderedSlots = SAVE_SLOT_IDS.map((slotId) =>
    slots.find((slot) => slot.id === slotId),
  ).filter((slot): slot is SaveSlot => Boolean(slot));

  return Promise.all(
    orderedSlots.map(async (slot) => {
      const [player, worldProgress] = await Promise.all([
        db.get('players', slot.playerId),
        db.getAllFromIndex('worldProgress', 'by-player', slot.playerId),
      ]);
      const recoveryStages = worldProgress.map(
        (progress) => progress.recoveryStage,
      );
      const totalStages = Math.max(1, worldAreas.length * 10);
      const currentArea =
        [...worldProgress]
          .filter((progress) => progress.unlocked)
          .sort((a, b) => {
            const areaA =
              worldAreas.find((area) => area.id === a.areaId)?.order ?? 0;
            const areaB =
              worldAreas.find((area) => area.id === b.areaId)?.order ?? 0;
            return areaB - areaA;
          })[0]?.areaId ?? STARTING_AREA_ID;

      return {
        ...slot,
        empty: !player,
        level: player?.level ?? 1,
        townRecoveryRate: Math.round(
          (recoveryStages.reduce((sum, stage) => sum + stage, 0) /
            totalStages) *
            100,
        ),
        currentAreaName:
          worldAreas.find((area) => area.id === currentArea)?.name ??
          'はじまりの まち',
      };
    }),
  );
}

export async function startSaveSlot(slotId: SaveSlotId) {
  await ensureSaveSlots();
  setActiveSaveSlot(slotId);
  await createSaveSlotDataIfMissing(slotId);
  await touchSaveSlot(slotId, 0);
}

export async function renameSaveSlot(slotId: SaveSlotId, name: string) {
  const db = await openMojiBoukenDb();
  const slot = await db.get('saveSlots', slotId);
  if (!slot) {
    return undefined;
  }
  const updated = {
    ...slot,
    name: name.trim() || slot.name,
    updatedAt: new Date().toISOString(),
  };
  await db.put('saveSlots', updated);
  return updated;
}

export async function touchSaveSlot(slotId = getActiveSaveSlotId(), addMs = 0) {
  const db = await openMojiBoukenDb();
  const slot = await db.get('saveSlots', slotId);
  if (!slot) {
    return undefined;
  }
  const updated = {
    ...slot,
    lastPlayedAt: new Date().toISOString(),
    playTimeMs: Math.max(0, slot.playTimeMs + addMs),
    updatedAt: new Date().toISOString(),
  };
  await db.put('saveSlots', updated);
  return updated;
}

export async function deleteSaveSlot(slotId: SaveSlotId) {
  const db = await openMojiBoukenDb();
  const playerId = getPlayerIdForSlot(slotId);
  await deletePlayerData(playerId);
  await db.put('saveSlots', createSlot(slotId, new Date().toISOString()));
  if (getActiveSaveSlotId() === slotId) {
    setActiveSaveSlot('slot-1');
  }
}

export async function copySaveSlot(
  fromSlotId: SaveSlotId,
  toSlotId: SaveSlotId,
) {
  if (fromSlotId === toSlotId) {
    return;
  }
  const db = await openMojiBoukenDb();
  const sourcePlayerId = getPlayerIdForSlot(fromSlotId);
  const targetPlayerId = getPlayerIdForSlot(toSlotId);
  const sourceSlot = await db.get('saveSlots', fromSlotId);
  await deletePlayerData(targetPlayerId);
  await copyPlayerData(sourcePlayerId, targetPlayerId);
  await db.put('saveSlots', {
    ...(sourceSlot ?? createSlot(fromSlotId, new Date().toISOString())),
    id: toSlotId,
    playerId: targetPlayerId,
    name: `${sourceSlot?.name ?? slotDefaultName(fromSlotId)} コピー`,
    updatedAt: new Date().toISOString(),
    lastPlayedAt: null,
  });
}

async function createSaveSlotDataIfMissing(slotId: SaveSlotId) {
  const db = await openMojiBoukenDb();
  const playerId = getPlayerIdForSlot(slotId);
  const now = new Date().toISOString();
  if (!(await db.get('players', playerId))) {
    await db.put('players', createInitialPlayer(now, playerId));
  }
  if (
    !(await db.get(
      'worldProgress',
      createWorldProgressId(playerId, STARTING_AREA_ID),
    ))
  ) {
    await db.put('worldProgress', createInitialWorldProgress(now, playerId));
  }
  if (!(await db.get('inventories', playerId))) {
    await db.put('inventories', createInitialInventory(now, playerId));
  }
  if (!(await db.get('settings', playerId))) {
    await db.put('settings', createInitialAppSettings(now, playerId));
  }
}

function createSlot(slotId: SaveSlotId, now: string): SaveSlot {
  return {
    id: slotId,
    playerId: getPlayerIdForSlot(slotId),
    name: slotDefaultName(slotId),
    createdAt: now,
    updatedAt: now,
    lastPlayedAt: null,
    playTimeMs: 0,
    migratedFromLegacy: slotId === 'slot-1',
  };
}

function slotDefaultName(slotId: SaveSlotId) {
  return slotId === 'slot-1'
    ? 'ぼうけん①'
    : slotId === 'slot-2'
      ? 'ぼうけん②'
      : 'ぼうけん③';
}

async function deletePlayerData(playerId: string) {
  const db = await openMojiBoukenDb();
  await db.delete('players', playerId);
  await db.delete('inventories', playerId);
  await db.delete('settings', playerId);
  await deleteByPlayer('learningLogs', playerId);
  await deleteByPlayer('letterProgress', playerId);
  await deleteByPlayer('reviewSchedules', playerId);
  await deleteByPlayer('worldProgress', playerId);
  await deleteByPlayer('collectionProgress', playerId);
  await deleteByPlayer('albumEntries', playerId);
}

async function deleteByPlayer(
  storeName:
    | 'learningLogs'
    | 'letterProgress'
    | 'reviewSchedules'
    | 'worldProgress'
    | 'collectionProgress'
    | 'albumEntries',
  playerId: string,
) {
  const db = await openMojiBoukenDb();
  const tx = db.transaction(storeName, 'readwrite');
  let cursor = await tx.store.index('by-player').openCursor(playerId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

async function copyPlayerData(sourcePlayerId: string, targetPlayerId: string) {
  const db = await openMojiBoukenDb();
  const now = new Date().toISOString();
  const player = await db.get('players', sourcePlayerId);
  if (player) {
    await db.put('players', {
      ...player,
      id: targetPlayerId,
      updatedAt: now,
    } satisfies Player);
  }
  await copySingle<Inventory>('inventories', sourcePlayerId, {
    playerId: targetPlayerId,
    updatedAt: now,
  });
  await copySingle<AppSettings>('settings', sourcePlayerId, {
    playerId: targetPlayerId,
    updatedAt: now,
  });
  await copyIndexed<LearningLog>('learningLogs', sourcePlayerId, (value) => ({
    ...value,
    id: retargetId(value.id, sourcePlayerId, targetPlayerId),
    playerId: targetPlayerId,
  }));
  await copyIndexed<LetterProgress>(
    'letterProgress',
    sourcePlayerId,
    (value) => ({
      ...value,
      id: retargetId(value.id, sourcePlayerId, targetPlayerId),
      playerId: targetPlayerId,
    }),
  );
  await copyIndexed<ReviewSchedule>(
    'reviewSchedules',
    sourcePlayerId,
    (value) => ({
      ...value,
      id: retargetId(value.id, sourcePlayerId, targetPlayerId),
      playerId: targetPlayerId,
    }),
  );
  await copyIndexed<WorldProgress>(
    'worldProgress',
    sourcePlayerId,
    (value) => ({
      ...value,
      id: retargetId(value.id, sourcePlayerId, targetPlayerId),
      playerId: targetPlayerId,
    }),
  );
  await copyIndexed<CollectionProgress>(
    'collectionProgress',
    sourcePlayerId,
    (value) => ({
      ...value,
      id: retargetId(value.id, sourcePlayerId, targetPlayerId),
      playerId: targetPlayerId,
    }),
  );
  await copyIndexed<AlbumEntry>('albumEntries', sourcePlayerId, (value) => ({
    ...value,
    eventId: `${targetPlayerId}:${value.eventId.split(':').pop() ?? value.eventId}`,
    playerId: targetPlayerId,
  }));
}

async function copySingle<T>(
  storeName: 'inventories' | 'settings',
  sourcePlayerId: string,
  patch: Partial<T>,
) {
  const db = await openMojiBoukenDb();
  const value = await db.get(storeName, sourcePlayerId);
  if (value) {
    await db.put(storeName, { ...value, ...patch });
  }
}

async function copyIndexed<T extends { playerId: string }>(
  storeName:
    | 'learningLogs'
    | 'letterProgress'
    | 'reviewSchedules'
    | 'worldProgress'
    | 'collectionProgress'
    | 'albumEntries',
  sourcePlayerId: string,
  transform: (value: T) => T,
) {
  const db = await openMojiBoukenDb();
  const tx = db.transaction(storeName, 'readwrite');
  const values = await tx.store.index('by-player').getAll(sourcePlayerId);
  for (const value of values) {
    await tx.store.put(transform(value as unknown as T) as never);
  }
  await tx.done;
}

function retargetId(
  id: string,
  sourcePlayerId: string,
  targetPlayerId: string,
) {
  return id.startsWith(`${sourcePlayerId}:`)
    ? `${targetPlayerId}:${id.slice(sourcePlayerId.length + 1)}`
    : `${targetPlayerId}:${id}`;
}
