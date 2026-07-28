import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { getActivePlayerId } from '../../db/repositories/saveSlotRepository';

export const BOSS_BATTLE_STATS_STORAGE_KEY = 'moji-bouken:boss-battle-stats';

export type BossBattleStat = {
  enemyId: string;
  defeatCount: number;
  firstDefeatedAt: string;
  lastDefeatedAt: string;
};

export type BossBattleStatsState = {
  stats: BossBattleStat[];
};

function emptyState(): BossBattleStatsState {
  return { stats: [] };
}

function storageKey() {
  const playerId = getActivePlayerId();
  return playerId === DEFAULT_PLAYER_ID
    ? BOSS_BATTLE_STATS_STORAGE_KEY
    : `${BOSS_BATTLE_STATS_STORAGE_KEY}:${playerId}`;
}

export function loadBossBattleStats(): BossBattleStatsState {
  const raw = localStorage.getItem(storageKey());
  if (!raw) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(raw) as BossBattleStatsState;
    return {
      stats: Array.isArray(parsed.stats) ? parsed.stats : [],
    };
  } catch {
    localStorage.removeItem(storageKey());
    return emptyState();
  }
}

export function getBossBattleStat(enemyId: string) {
  return loadBossBattleStats().stats.find((stat) => stat.enemyId === enemyId);
}

export function saveBossBattleStats(state: BossBattleStatsState) {
  localStorage.setItem(storageKey(), JSON.stringify(state));
}

export function recordBossDefeat(enemyId: string, defeatedAt = new Date()) {
  const defeatedAtIso = defeatedAt.toISOString();
  const state = loadBossBattleStats();
  const current = state.stats.find((stat) => stat.enemyId === enemyId);
  const nextStat: BossBattleStat = current
    ? {
        ...current,
        defeatCount: current.defeatCount + 1,
        lastDefeatedAt: defeatedAtIso,
      }
    : {
        enemyId,
        defeatCount: 1,
        firstDefeatedAt: defeatedAtIso,
        lastDefeatedAt: defeatedAtIso,
      };

  saveBossBattleStats({
    stats: [
      ...state.stats.filter((stat) => stat.enemyId !== enemyId),
      nextStat,
    ],
  });
  return nextStat;
}

export function resetBossBattleStats() {
  localStorage.removeItem(storageKey());
}
