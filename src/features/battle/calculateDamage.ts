import {
  BASE_ATTACK_DAMAGE,
  MIN_DAMAGE,
  SPECIAL_ATTACK_MULTIPLIER,
} from './constants';

export function calculateDamage(input: {
  playerAttack: number;
  enemyDefense: number;
  comboBonus: number;
  special?: boolean;
}) {
  const baseDamage =
    (BASE_ATTACK_DAMAGE + input.playerAttack) * (1 + input.comboBonus) -
    input.enemyDefense;
  const multiplier = input.special ? SPECIAL_ATTACK_MULTIPLIER : 1;
  return Math.max(MIN_DAMAGE, Math.round(baseDamage * multiplier));
}
