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
    areaId: 'picture-hill',
    active: true,
  },
  {
    id: 'enemy-hidden-moji',
    name: 'かくれモジ',
    type: 'normal',
    maxHp: 155,
    defense: 3,
    rewardExperience: 28,
    rewardGold: 12,
    imageId: 'hidden-moji',
    areaId: 'word-forest',
    active: true,
  },
  {
    id: 'enemy-magic-kinoko',
    name: 'まよいキノコ',
    type: 'normal',
    maxHp: 160,
    defense: 3,
    rewardExperience: 30,
    rewardGold: 12,
    imageId: 'kinoko',
    areaId: 'ordering-cave',
    active: true,
  },
  {
    id: 'enemy-guruguru-bat',
    name: 'ぐるぐるバット',
    type: 'normal',
    maxHp: 165,
    defense: 4,
    rewardExperience: 32,
    rewardGold: 14,
    imageId: 'bat',
    areaId: 'word-forest',
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
    areaId: 'word-castle',
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
