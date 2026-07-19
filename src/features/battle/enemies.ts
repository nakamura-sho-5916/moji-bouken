import type { Enemy } from './types';

export const enemies: Enemy[] = [
  {
    id: 'enemy-moji-slime',
    name: 'もじスライム',
    type: 'normal',
    maxHp: 140,
    defense: 2,
    rewardExperience: 20,
    rewardGold: 8,
    imageId: 'slime',
    areaId: 'starting-village',
    active: true,
  },
  {
    id: 'enemy-moya-ghost',
    name: 'もやもやゴースト',
    type: 'normal',
    maxHp: 150,
    defense: 3,
    rewardExperience: 25,
    rewardGold: 10,
    imageId: 'ghost',
    areaId: 'starting-village',
    active: true,
  },
  {
    id: 'boss-mojinexus',
    name: 'モジナクス',
    type: 'boss',
    maxHp: 180,
    defense: 4,
    rewardExperience: 120,
    rewardGold: 60,
    imageId: 'boss',
    areaId: 'starting-village',
    active: true,
  },
];

export function getEnemy(enemyId: string) {
  return enemies.find((enemy) => enemy.id === enemyId);
}

export function getDefaultEnemy(boss = false) {
  const enemy =
    enemies.find((item) => item.type === (boss ? 'boss' : 'normal')) ??
    enemies[0];
  if (!enemy) {
    throw new Error('enemy data is empty');
  }
  return enemy;
}
