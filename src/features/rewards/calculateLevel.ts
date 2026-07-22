import { MAX_LEVEL } from './constants';

export function experienceRequiredForLevel(level: number) {
  if (level <= 1) return 0;
  if (level <= 5) {
    return [0, 0, 100, 250, 450, 720][level] ?? 720;
  }
  if (level <= 20) {
    return 720 + (level - 5) * 260 + Math.max(0, level - 10) * 60;
  }
  return 6120 + (level - 20) * 420;
}

export function calculateLevel(experience: number) {
  let level = 1;
  while (
    level < MAX_LEVEL &&
    experience >= experienceRequiredForLevel(level + 1)
  ) {
    level += 1;
  }
  return level;
}
