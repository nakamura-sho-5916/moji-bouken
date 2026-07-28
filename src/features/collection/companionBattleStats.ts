import type { CompanionSupportEvent } from './companionBattleSupport';
import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { getActivePlayerId } from '../../db/repositories/saveSlotRepository';

export const COMPANION_BATTLE_STATS_STORAGE_KEY =
  'moji-bouken:companion-battle-stats';

export type CompanionBattleStat = {
  companionId: string;
  activationCount: number;
  cheerCount: number;
  extraDamageTotal: number;
  experienceBonusTotal: number;
  goldBonusTotal: number;
};

export type CompanionBattleStatsState = {
  lastCompanionId: string | null;
  stats: CompanionBattleStat[];
};

function emptyState(): CompanionBattleStatsState {
  return {
    lastCompanionId: null,
    stats: [],
  };
}

function storageKey() {
  const playerId = getActivePlayerId();
  return playerId === DEFAULT_PLAYER_ID
    ? COMPANION_BATTLE_STATS_STORAGE_KEY
    : `${COMPANION_BATTLE_STATS_STORAGE_KEY}:${playerId}`;
}

export function loadCompanionBattleStats(): CompanionBattleStatsState {
  const raw = localStorage.getItem(storageKey());
  if (!raw) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(raw) as CompanionBattleStatsState;
    return {
      lastCompanionId: parsed.lastCompanionId ?? null,
      stats: Array.isArray(parsed.stats) ? parsed.stats : [],
    };
  } catch {
    localStorage.removeItem(storageKey());
    return emptyState();
  }
}

export function getCompanionBattleStat(companionId: string) {
  return (
    loadCompanionBattleStats().stats.find(
      (stat) => stat.companionId === companionId,
    ) ?? {
      companionId,
      activationCount: 0,
      cheerCount: 0,
      extraDamageTotal: 0,
      experienceBonusTotal: 0,
      goldBonusTotal: 0,
    }
  );
}

export function saveCompanionBattleStats(state: CompanionBattleStatsState) {
  localStorage.setItem(storageKey(), JSON.stringify(state));
}

export function recordCompanionSupportEvent(event: CompanionSupportEvent) {
  const state = loadCompanionBattleStats();
  const current = getCompanionBattleStat(event.companionId);
  const nextStat: CompanionBattleStat = {
    ...current,
    activationCount: current.activationCount + 1,
    cheerCount:
      event.skill === 'cheer' ? current.cheerCount + 1 : current.cheerCount,
    extraDamageTotal: current.extraDamageTotal + event.damageBonus,
    experienceBonusTotal: current.experienceBonusTotal + event.experienceBonus,
    goldBonusTotal: current.goldBonusTotal + event.goldBonus,
  };
  const nextState: CompanionBattleStatsState = {
    lastCompanionId: event.companionId,
    stats: [
      ...state.stats.filter((stat) => stat.companionId !== event.companionId),
      nextStat,
    ],
  };
  saveCompanionBattleStats(nextState);
  return nextStat;
}

export function resetCompanionBattleStats() {
  localStorage.removeItem(storageKey());
}
