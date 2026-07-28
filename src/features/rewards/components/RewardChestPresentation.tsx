import type { GameAssetRarity } from '../../assets';
import { ItemArtwork } from '../../assets';
import { TreasureChestEffect } from '../../effects';
import {
  getHighestRewardRarity,
  getRewardChestKind,
  rewardRarityLabels,
  rewardRarityOrder,
  rewardRarityTone,
  sortRewardDrops,
} from '../rewardPresentation';
import type { RewardDropItem } from '../types';

type RewardChestPresentationProps = {
  items: RewardDropItem[];
  previewRarity?: GameAssetRarity;
};

const previewItemByRarity: Record<GameAssetRarity, RewardDropItem> = {
  common: {
    itemId: 'hiragana-fragment',
    name: 'ひらがなの かけら',
    kind: 'item',
    count: 1,
    rarity: 'common',
    newToCollection: true,
  },
  uncommon: {
    itemId: 'ink-drop',
    name: 'インクの しずく',
    kind: 'item',
    count: 1,
    rarity: 'uncommon',
    newToCollection: true,
  },
  rare: {
    itemId: 'word-ring',
    name: 'ことばの ゆびわ',
    kind: 'equipment',
    count: 1,
    rarity: 'rare',
    newToCollection: true,
  },
  epic: {
    itemId: 'moji-crystal',
    name: 'もじの 結晶',
    kind: 'item',
    count: 1,
    rarity: 'epic',
    newToCollection: true,
  },
  legendary: {
    itemId: 'gold-sword',
    name: 'ゴールドソード',
    kind: 'equipment',
    count: 1,
    rarity: 'legendary',
    newToCollection: true,
  },
};

function RewardParticles({ rarity }: { rarity: GameAssetRarity }) {
  if (rewardRarityOrder[rarity] < rewardRarityOrder.rare) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-testid="reward-rare-particles"
    >
      {Array.from({ length: rarity === 'legendary' ? 14 : 8 }, (_, index) => (
        <span
          className={[
            'absolute size-2 rounded-full motion-safe:animate-[game-sparkle-rise_1.2s_ease-out_infinite]',
            rarity === 'legendary' ? 'bg-amber-300' : 'bg-white',
          ].join(' ')}
          key={index}
          style={{
            left: `${12 + ((index * 17) % 76)}%`,
            top: `${18 + ((index * 29) % 58)}%`,
            animationDelay: `${index * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}

function EmptyReward() {
  return (
    <div className="rounded-[var(--radius-medium)] border border-dashed border-[var(--color-border)] bg-orange-50 p-4 text-center font-black text-[var(--color-text-muted)]">
      宝箱は からっぽだったよ
    </div>
  );
}

export function RewardChestPresentation({
  items,
  previewRarity,
}: RewardChestPresentationProps) {
  const displayItems =
    items.length > 0 || !previewRarity
      ? items
      : [previewItemByRarity[previewRarity]];
  const highestRarity = previewRarity ?? getHighestRewardRarity(displayItems);
  const sortedItems = sortRewardDrops(displayItems);
  const chestKind = getRewardChestKind(highestRarity);
  const legendary = highestRarity === 'legendary';

  return (
    <div
      className={[
        'relative overflow-hidden rounded-[var(--radius-large)] border p-4',
        legendary
          ? 'border-amber-300 bg-slate-900 text-white'
          : 'border-[var(--color-border)] bg-orange-50',
      ].join(' ')}
      data-testid="reward-chest-presentation"
    >
      {legendary ? (
        <div className="absolute inset-0 bg-black/35 motion-safe:animate-[game-legend-flash_1.15s_ease-out_1]" />
      ) : null}
      <RewardParticles rarity={highestRarity} />
      <div className="relative grid gap-4 text-center">
        {legendary ? (
          <p
            className="text-3xl font-black tracking-normal text-amber-200 motion-safe:animate-[game-legend-flash_1.15s_ease-out_1]"
            data-testid="reward-legend"
          >
            LEGEND
          </p>
        ) : null}
        <div className="mx-auto motion-safe:animate-[game-chest-shake_.95s_ease-out_1]">
          <TreasureChestEffect
            label={`${rewardRarityLabels[highestRarity]} chest`}
            open
            rarity={highestRarity}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-black">
          <span className="rounded-[var(--radius-pill)] bg-white/90 px-3 py-1 text-slate-800 ring-2 ring-white">
            {chestKind === 'wood'
              ? '木箱'
              : chestKind === 'silver'
                ? '銀箱'
                : '金箱'}
          </span>
          <span
            className={[
              'rounded-[var(--radius-pill)] px-3 py-1 ring-2',
              rewardRarityTone[highestRarity].badgeClassName,
            ].join(' ')}
          >
            {rewardRarityLabels[highestRarity]}
          </span>
        </div>
        {sortedItems.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {sortedItems.map((item) => (
              <div
                className={[
                  'relative grid grid-cols-[64px_1fr] items-center gap-3 rounded-[var(--radius-medium)] border p-3 text-left shadow-sm motion-safe:animate-[game-item-float_1.9s_ease-in-out_infinite]',
                  rewardRarityTone[item.rarity].cardClassName,
                ].join(' ')}
                data-testid="reward-item-card"
                key={`${item.itemId}-${item.kind}`}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'absolute -right-4 -top-4 size-16 rounded-full blur-xl',
                    rewardRarityTone[item.rarity].glowClassName,
                  ].join(' ')}
                />
                <ItemArtwork
                  className="relative size-16"
                  itemId={item.itemId}
                />
                <div className="relative min-w-0">
                  {item.newToCollection ? (
                    <span className="mb-1 inline-flex rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-2 py-0.5 text-xs font-black text-white">
                      NEW
                    </span>
                  ) : null}
                  <p className="break-words text-base font-black text-[var(--color-text)]">
                    {item.name}
                  </p>
                  <p className="text-sm font-black text-[var(--color-text-muted)]">
                    {rewardRarityLabels[item.rarity]}
                    {item.count > 1 ? ` x${item.count}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyReward />
        )}
      </div>
    </div>
  );
}
