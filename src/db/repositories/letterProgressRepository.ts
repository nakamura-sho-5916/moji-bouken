import { openMojiBoukenDb } from '../database';
import type { LetterProgress } from '../../types';

export function createLetterProgressId(playerId: string, letterId: string) {
  return `${playerId}:${letterId}`;
}

export async function saveLetterProgress(progress: LetterProgress) {
  const db = await openMojiBoukenDb();
  const stored: LetterProgress = {
    ...progress,
    weakFlagIndex: progress.weakFlag ? 1 : 0,
    masteredFlagIndex: progress.masteredFlag ? 1 : 0,
  };
  await db.put('letterProgress', stored);
  return stored;
}

export async function getLetterProgress(playerId: string, letterId: string) {
  const db = await openMojiBoukenDb();
  return db.get('letterProgress', createLetterProgressId(playerId, letterId));
}

export async function updateLetterProgress(
  playerId: string,
  letterId: string,
  patch: Partial<Omit<LetterProgress, 'id' | 'playerId' | 'letterId'>>,
) {
  const current = await getLetterProgress(playerId, letterId);

  if (!current) {
    return undefined;
  }

  const updated: LetterProgress = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  return saveLetterProgress(updated);
}

export async function getWeakLetterProgress() {
  const db = await openMojiBoukenDb();
  return db.getAllFromIndex('letterProgress', 'by-weak-flag', 1);
}

export async function getMasteredLetterProgress() {
  const db = await openMojiBoukenDb();
  return db.getAllFromIndex('letterProgress', 'by-mastered-flag', 1);
}
