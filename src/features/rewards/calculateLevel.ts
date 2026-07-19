import { MAX_LEVEL } from './constants';

export function experienceRequiredForLevel(level: number) {
  if (level <= 1) return 0;
  if (level === 2) return 100;
  if (level === 3) return 250;
  if (level === 4) return 450;
  if (level === 5) return 700;
  return 700 + (level - 5) * 300;
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
