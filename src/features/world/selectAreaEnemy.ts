import { enemies, getEnemy } from '../battle/enemies';
import type { Enemy } from '../battle/types';
import type { AreaViewModel } from './types';

function seededIndex(seed: string, max: number) {
  let value = 0;
  for (const char of seed) {
    value = (value * 31 + char.charCodeAt(0)) % 9973;
  }
  return value % max;
}

export function selectAreaEnemy(input: {
  area: AreaViewModel;
  seed: string;
  preferBoss?: boolean;
  previousEnemyId?: string | null;
}): Enemy | null {
  if (!input.area.unlocked) {
    return null;
  }

  if (input.preferBoss && input.area.area.bossEnemyId) {
    return getEnemy(input.area.area.bossEnemyId) ?? null;
  }

  const bossEnemyId = input.area.area.bossEnemyId;
  const bossAvailable = bossEnemyId && input.area.recoveryStage >= 3;
  if (bossAvailable && seededIndex(`${input.seed}-boss`, 5) === 0) {
    return getEnemy(bossEnemyId) ?? null;
  }

  const candidates = input.area.area.enemyIds
    .map((enemyId) => getEnemy(enemyId))
    .filter((enemy): enemy is Enemy => Boolean(enemy?.active));
  if (candidates.length === 0) {
    return (
      enemies.find((enemy) => enemy.type === 'normal' && enemy.active) ?? null
    );
  }

  const rotated = candidates.filter(
    (enemy) => enemy.id !== input.previousEnemyId,
  );
  const pool = rotated.length > 0 ? rotated : candidates;
  return pool[seededIndex(input.seed, pool.length)] ?? null;
}
