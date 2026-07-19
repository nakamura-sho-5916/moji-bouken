import { openMojiBoukenDb } from '../database';
import type { AlbumEntry, CollectionProgress } from '../../types';

export function createCollectionProgressId(input: {
  playerId: string;
  category: CollectionProgress['category'];
  targetId: string;
}) {
  return `${input.playerId}:${input.category}:${input.targetId}`;
}

export async function saveCollectionProgress(progress: CollectionProgress) {
  const db = await openMojiBoukenDb();
  await db.put('collectionProgress', progress);
  return progress;
}

export async function getCollectionProgress(
  playerId: string,
  category: CollectionProgress['category'],
  targetId: string,
) {
  const db = await openMojiBoukenDb();
  return db.get(
    'collectionProgress',
    createCollectionProgressId({ playerId, category, targetId }),
  );
}

export async function getCollectionProgressByPlayer(playerId: string) {
  const db = await openMojiBoukenDb();
  return db.getAllFromIndex('collectionProgress', 'by-player', playerId);
}

export async function discoverCollectionTarget(input: {
  playerId: string;
  category: CollectionProgress['category'];
  targetId: string;
  source: string;
  now?: string;
}) {
  const existing = await getCollectionProgress(
    input.playerId,
    input.category,
    input.targetId,
  );
  if (existing) {
    return { progress: existing, created: false };
  }

  const progress: CollectionProgress = {
    id: createCollectionProgressId(input),
    playerId: input.playerId,
    category: input.category,
    targetId: input.targetId,
    discoveredAt: input.now ?? new Date().toISOString(),
    source: input.source,
  };
  await saveCollectionProgress(progress);
  return { progress, created: true };
}

export async function saveAlbumEntry(entry: AlbumEntry) {
  const db = await openMojiBoukenDb();
  const existing = await db.get('albumEntries', entry.eventId);
  if (existing) {
    return { entry: existing, created: false };
  }
  await db.put('albumEntries', entry);
  return { entry, created: true };
}

export async function getAlbumEntries(playerId: string) {
  const db = await openMojiBoukenDb();
  const entries = await db.getAllFromIndex(
    'albumEntries',
    'by-player',
    playerId,
  );
  return entries.sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt));
}
