import { DEFAULT_PLAYER_ATTACK, SPECIAL_GAUGE_MAX } from './constants';
import { getDefaultEnemy, getEnemy } from './enemies';
import type { BattleSession } from './types';

export function createBattleSession(input?: {
  sessionId?: string;
  enemyId?: string;
  playerLevel?: number;
  boss?: boolean;
  now?: string;
}): BattleSession {
  const enemy = input?.enemyId
    ? (getEnemy(input.enemyId) ?? getDefaultEnemy(input.boss))
    : getDefaultEnemy(input?.boss);
  const now = input?.now ?? new Date().toISOString();
  const sessionId = input?.sessionId ?? `battle-session-${Date.now()}`;

  return {
    battleId: `battle-${sessionId}-${enemy.id}`,
    sessionId,
    enemyId: enemy.id,
    enemyMaxHp: enemy.maxHp,
    enemyCurrentHp: enemy.maxHp,
    playerAttack: DEFAULT_PLAYER_ATTACK + ((input?.playerLevel ?? 1) - 1) * 2,
    comboCount: 0,
    maxCombo: 0,
    specialGauge: 0,
    specialGaugeMax: SPECIAL_GAUGE_MAX,
    totalDamage: 0,
    currentMissionIndex: 0,
    status: 'active',
    startedAt: now,
    completedAt: null,
    lastMessage: 'もじの ちからで すすもう',
  };
}
