import type { NpcData } from './types';

export const worldNpcs: NpcData[] = [
  {
    id: 'npc-letter-guide',
    name: 'モジじい',
    areaId: 'starting-village',
    requiredRecoveryStage: 1,
    message: 'あかりが もどってきたのう',
  },
  {
    id: 'npc-bridge-builder',
    name: 'はしやさん',
    areaId: 'starting-village',
    requiredRecoveryStage: 3,
    message: 'つぎの みちを なおしたよ',
  },
  {
    id: 'npc-forest-friend',
    name: 'ことは',
    areaId: 'word-forest',
    requiredRecoveryStage: 1,
    message: 'はっぱが そよそよ しているね',
  },
  {
    id: 'npc-shopkeeper',
    name: 'みせばん',
    areaId: 'picture-hill',
    requiredRecoveryStage: 2,
    message: 'おみせを あけられそうだよ',
  },
  {
    id: 'npc-castle-sage',
    name: 'しろの せんせい',
    areaId: 'word-castle',
    requiredRecoveryStage: 1,
    message: 'もじの ちからが あつまっているよ',
  },
];
