import { COMBO_BONUS_PER_STEP, MAX_COMBO_DAMAGE_BONUS } from './constants';

export function calculateComboBonus(comboCount: number) {
  if (comboCount <= 1) {
    return 0;
  }
  return Math.min(
    (comboCount - 1) * COMBO_BONUS_PER_STEP,
    MAX_COMBO_DAMAGE_BONUS,
  );
}
