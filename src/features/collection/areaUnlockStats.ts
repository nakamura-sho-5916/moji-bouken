export const AREA_UNLOCK_STATS_STORAGE_KEY = 'moji-bouken:area-unlock-stats';

export type AreaUnlockStat = {
  areaId: string;
  unlockedAt: string;
};

export type AreaUnlockStatsState = {
  stats: AreaUnlockStat[];
};

function emptyState(): AreaUnlockStatsState {
  return { stats: [] };
}

export function loadAreaUnlockStats(): AreaUnlockStatsState {
  const raw = localStorage.getItem(AREA_UNLOCK_STATS_STORAGE_KEY);
  if (!raw) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(raw) as AreaUnlockStatsState;
    return {
      stats: Array.isArray(parsed.stats) ? parsed.stats : [],
    };
  } catch {
    localStorage.removeItem(AREA_UNLOCK_STATS_STORAGE_KEY);
    return emptyState();
  }
}

export function recordAreaUnlock(areaId: string, unlockedAt = new Date()) {
  const state = loadAreaUnlockStats();
  const current = state.stats.find((stat) => stat.areaId === areaId);
  if (current) {
    return current;
  }

  const nextStat: AreaUnlockStat = {
    areaId,
    unlockedAt: unlockedAt.toISOString(),
  };
  localStorage.setItem(
    AREA_UNLOCK_STATS_STORAGE_KEY,
    JSON.stringify({
      stats: [...state.stats, nextStat],
    }),
  );
  return nextStat;
}

export function resetAreaUnlockStats() {
  localStorage.removeItem(AREA_UNLOCK_STATS_STORAGE_KEY);
}
