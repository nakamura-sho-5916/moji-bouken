import type { WorldArea } from './types';

export const worldAreas: WorldArea[] = [
  {
    id: 'starting-village',
    name: 'はじまりの まち',
    shortName: 'まち',
    theme: 'village',
    order: 1,
    initiallyUnlocked: true,
    requiredPreviousAreaId: null,
    requiredRecoveryStage: 0,
    enemyIds: ['enemy-moji-slime', 'enemy-magic-kinoko'],
    bossEnemyId: null,
  },
  {
    id: 'word-forest',
    name: 'ことばの もり',
    shortName: 'もり',
    theme: 'forest',
    order: 2,
    initiallyUnlocked: false,
    requiredPreviousAreaId: 'starting-village',
    requiredRecoveryStage: 3,
    enemyIds: ['enemy-hidden-moji', 'enemy-guruguru-bat'],
    bossEnemyId: null,
  },
  {
    id: 'picture-hill',
    name: 'えあわせの おか',
    shortName: 'おか',
    theme: 'hill',
    order: 3,
    initiallyUnlocked: false,
    requiredPreviousAreaId: 'word-forest',
    requiredRecoveryStage: 2,
    enemyIds: ['enemy-moya-ghost', 'enemy-hidden-moji'],
    bossEnemyId: null,
  },
  {
    id: 'ordering-cave',
    name: 'ならべの どうくつ',
    shortName: 'どうくつ',
    theme: 'cave',
    order: 4,
    initiallyUnlocked: false,
    requiredPreviousAreaId: 'picture-hill',
    requiredRecoveryStage: 2,
    enemyIds: ['enemy-magic-kinoko', 'enemy-guruguru-bat'],
    bossEnemyId: null,
  },
  {
    id: 'word-castle',
    name: 'もじの おしろ',
    shortName: 'おしろ',
    theme: 'castle',
    order: 5,
    initiallyUnlocked: false,
    requiredPreviousAreaId: 'ordering-cave',
    requiredRecoveryStage: 3,
    enemyIds: ['enemy-moji-slime', 'enemy-moya-ghost', 'enemy-hidden-moji'],
    bossEnemyId: 'boss-mojinexus',
  },
];

export function getWorldArea(areaId: string) {
  return worldAreas.find((area) => area.id === areaId);
}
