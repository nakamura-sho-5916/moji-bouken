import type { Enemy } from './types';

export const BOSS_INTRO_DURATION_MS = 2200;
export const BOSS_DEFEAT_RECOVERY_DELAY_MS = 1300;

export type BossBattleMomentKind = 'anger' | 'charge' | 'line';

export type BossBattleMoment = {
  id: string;
  kind: BossBattleMomentKind;
  title: string;
  message: string;
};

const bossBattleMoments: BossBattleMoment[] = [
  {
    id: 'boss-anger',
    kind: 'anger',
    title: '怒り',
    message: 'ボスの ちからが ゆれている！',
  },
  {
    id: 'boss-charge',
    kind: 'charge',
    title: 'チャージ',
    message: 'つぎの もじに そなえよう！',
  },
  {
    id: 'boss-line',
    kind: 'line',
    title: 'セリフ',
    message: 'ここからが ほんばんだ！',
  },
];

function hashSeed(seed: string) {
  let hash = 0;
  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function isBossEnemy(enemy: Enemy | null | undefined) {
  return enemy?.type === 'boss';
}

export function getBossBattleMoments() {
  return bossBattleMoments;
}

export function selectBossBattleMoment({
  battleId,
  enemy,
  missionIndex,
}: {
  battleId: string;
  enemy: Enemy | null | undefined;
  missionIndex: number;
}): BossBattleMoment | null {
  if (!isBossEnemy(enemy) || missionIndex <= 0 || missionIndex % 3 !== 0) {
    return null;
  }

  const index =
    hashSeed(`${battleId}:${missionIndex}`) % bossBattleMoments.length;
  return bossBattleMoments[index] ?? null;
}
