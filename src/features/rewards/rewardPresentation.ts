import type { GameAssetRarity } from '../assets';
import type { RewardDropItem } from './types';

export type RewardChestKind = 'wood' | 'silver' | 'gold';

export const rewardRarityOrder: Record<GameAssetRarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export const rewardRarityLabels: Record<GameAssetRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const rewardRarityTone: Record<
  GameAssetRarity,
  {
    badgeClassName: string;
    cardClassName: string;
    glowClassName: string;
  }
> = {
  common: {
    badgeClassName: 'bg-white text-slate-700 ring-slate-200',
    cardClassName: 'border-slate-200 bg-white',
    glowClassName: 'bg-white/70',
  },
  uncommon: {
    badgeClassName: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
    cardClassName: 'border-emerald-200 bg-emerald-50',
    glowClassName: 'bg-emerald-200/70',
  },
  rare: {
    badgeClassName: 'bg-sky-100 text-sky-800 ring-sky-300',
    cardClassName: 'border-sky-200 bg-sky-50',
    glowClassName: 'bg-sky-200/70',
  },
  epic: {
    badgeClassName: 'bg-violet-100 text-violet-800 ring-violet-300',
    cardClassName: 'border-violet-200 bg-violet-50',
    glowClassName: 'bg-violet-200/70',
  },
  legendary: {
    badgeClassName: 'bg-amber-100 text-amber-900 ring-amber-300',
    cardClassName: 'border-amber-300 bg-amber-50',
    glowClassName: 'bg-amber-200/80',
  },
};

export function getHighestRewardRarity(
  items: RewardDropItem[],
): GameAssetRarity {
  return items.reduce<GameAssetRarity>(
    (highest, item) =>
      rewardRarityOrder[item.rarity] > rewardRarityOrder[highest]
        ? item.rarity
        : highest,
    'common',
  );
}

export function getRewardChestKind(rarity: GameAssetRarity): RewardChestKind {
  if (rarity === 'legendary') {
    return 'gold';
  }
  if (rarity === 'rare' || rarity === 'epic') {
    return 'silver';
  }
  return 'wood';
}

export function hasRareReward(items: RewardDropItem[]) {
  return items.some((item) => rewardRarityOrder[item.rarity] >= 2);
}

export function sortRewardDrops(items: RewardDropItem[]) {
  return [...items].sort((a, b) => {
    const rarityDiff =
      rewardRarityOrder[b.rarity] - rewardRarityOrder[a.rarity];
    if (rarityDiff !== 0) {
      return rarityDiff;
    }
    return a.name.localeCompare(b.name, 'ja');
  });
}
