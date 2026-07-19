import {
  COMBO_GAUGE_BONUS,
  CORRECT_GAUGE_GAIN,
  SPECIAL_GAUGE_MAX,
} from './constants';

export function calculateSpecialGauge(input: {
  currentGauge: number;
  correct: boolean;
  comboCount: number;
}) {
  if (!input.correct) {
    return input.currentGauge;
  }
  const comboBonus = input.comboCount > 1 ? COMBO_GAUGE_BONUS : 0;
  return Math.min(
    SPECIAL_GAUGE_MAX,
    input.currentGauge + CORRECT_GAUGE_GAIN + comboBonus,
  );
}
