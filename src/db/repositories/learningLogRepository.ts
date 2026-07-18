import { openMojiBoukenDb } from '../database';
import type { LearningLog } from '../../types';

export async function addLearningLog(log: LearningLog) {
  const db = await openMojiBoukenDb();
  await db.add('learningLogs', log);
  return log;
}

export async function getLearningLogsByPlayer(playerId: string) {
  const db = await openMojiBoukenDb();
  return db.getAllFromIndex('learningLogs', 'by-player', playerId);
}

export async function getLearningLogsByLetter(letterId: string) {
  const db = await openMojiBoukenDb();
  return db.getAllFromIndex('learningLogs', 'by-letter', letterId);
}

export async function getLearningLogsByDateRange(start: string, end: string) {
  const db = await openMojiBoukenDb();
  return db.getAllFromIndex(
    'learningLogs',
    'by-answered-at',
    IDBKeyRange.bound(start, end),
  );
}
