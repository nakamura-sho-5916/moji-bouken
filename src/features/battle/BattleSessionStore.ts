import { ACTIVE_BATTLE_SESSION_STORAGE_KEY } from './constants';
import type { BattleSession } from './types';

export function saveActiveBattleSession(battle: BattleSession) {
  localStorage.setItem(
    ACTIVE_BATTLE_SESSION_STORAGE_KEY,
    JSON.stringify(battle),
  );
}

export function loadActiveBattleSession() {
  const raw = localStorage.getItem(ACTIVE_BATTLE_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as BattleSession;
  } catch {
    localStorage.removeItem(ACTIVE_BATTLE_SESSION_STORAGE_KEY);
    return null;
  }
}

export function clearActiveBattleSession() {
  localStorage.removeItem(ACTIVE_BATTLE_SESSION_STORAGE_KEY);
}
