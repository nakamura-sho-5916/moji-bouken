import { DEFAULT_PLAYER_ID, STARTING_AREA_ID } from '../constants';
import { openMojiBoukenDb } from '../database';
import type { WorldProgress } from '../../types';

export function createWorldProgressId(playerId: string, areaId: string) {
  return `${playerId}:${areaId}`;
}

export function createInitialWorldProgress(
  now = new Date().toISOString(),
): WorldProgress {
  return {
    id: createWorldProgressId(DEFAULT_PLAYER_ID, STARTING_AREA_ID),
    playerId: DEFAULT_PLAYER_ID,
    areaId: STARTING_AREA_ID,
    unlocked: true,
    recoveryStage: 0,
    unlockedEvents: [],
    updatedAt: now,
  };
}

export async function saveWorldProgress(progress: WorldProgress) {
  const db = await openMojiBoukenDb();
  await db.put('worldProgress', progress);
  return progress;
}

export async function getWorldProgress(playerId: string, areaId: string) {
  const db = await openMojiBoukenDb();
  return db.get('worldProgress', createWorldProgressId(playerId, areaId));
}

export async function updateRecoveryStage(
  playerId: string,
  areaId: string,
  recoveryStage: number,
) {
  const progress = await getWorldProgress(playerId, areaId);

  if (!progress) {
    return undefined;
  }

  return saveWorldProgress({
    ...progress,
    recoveryStage,
    updatedAt: new Date().toISOString(),
  });
}

export async function unlockWorldEvent(
  playerId: string,
  areaId: string,
  eventId: string,
) {
  const progress = await getWorldProgress(playerId, areaId);

  if (!progress) {
    return undefined;
  }

  const unlockedEvents = progress.unlockedEvents.includes(eventId)
    ? progress.unlockedEvents
    : [...progress.unlockedEvents, eventId];

  return saveWorldProgress({
    ...progress,
    unlockedEvents,
    updatedAt: new Date().toISOString(),
  });
}
