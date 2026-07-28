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

export function loadBossBattleStats(): BossBattleStatsState {
  const raw = localStorage.getItem(BOSS_BATTLE_STATS_STORAGE_KEY);
  if (!raw) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(raw) as BossBattleStatsState;
    return {
      stats: Array.isArray(parsed.stats) ? parsed.stats : [],
    };
  } catch {
    localStorage.removeItem(BOSS_BATTLE_STATS_STORAGE_KEY);
    return emptyState();
  }
}

export function getBossBattleStat(enemyId: string) {
  return loadBossBattleStats().stats.find((stat) => stat.enemyId === enemyId);
}

export function saveBossBattleStats(state: BossBattleStatsState) {
  localStorage.setItem(BOSS_BATTLE_STATS_STORAGE_KEY, JSON.stringify(state));
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
  localStorage.removeItem(BOSS_BATTLE_STATS_STORAGE_KEY);
}
