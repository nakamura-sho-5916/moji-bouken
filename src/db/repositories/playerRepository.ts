import { DEFAULT_PLAYER_ID } from '../constants';
import { openMojiBoukenDb } from '../database';
import type { Player } from '../../types';

export function createInitialPlayer(now = new Date().toISOString()): Player {
  return {
    id: DEFAULT_PLAYER_ID,
    name: 'ぼうけんしゃ',
    level: 1,
    experience: 0,
    gold: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createPlayerIfMissing(player = createInitialPlayer()) {
  const db = await openMojiBoukenDb();
  const existing = await db.get('players', player.id);

  if (existing) {
    return existing;
  }

  await db.put('players', player);
  return player;
}

export async function getPlayerById(playerId: string) {
  const db = await openMojiBoukenDb();
  return db.get('players', playerId);
}

export async function updatePlayer(
  playerId: string,
  patch: Partial<Omit<Player, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const db = await openMojiBoukenDb();
  const player = await db.get('players', playerId);

  if (!player) {
    return undefined;
  }

  const updated: Player = {
    ...player,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await db.put('players', updated);
  return updated;
}
