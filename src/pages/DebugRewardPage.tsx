import { useState } from 'react';
import type { GameAssetRarity } from '../features/assets';
import { useAudio } from '../features/audio';
import { RewardChestPresentation } from '../features/rewards/components/RewardChestPresentation';
import {
  getRewardChestKind,
  rewardRarityLabels,
} from '../features/rewards/rewardPresentation';

const rarityOptions: GameAssetRarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
];

export function DebugRewardPage() {
  const [rarity, setRarity] = useState<GameAssetRarity>('common');
  const audio = useAudio();
  const chestKind = getRewardChestKind(rarity);

  if (!import.meta.env.DEV) {
    return <p>404</p>;
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Reward
        </h1>
        <p className="mt-2 font-bold">rarity: {rewardRarityLabels[rarity]}</p>
        <p className="font-bold">chest: {chestKind}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {rarityOptions.map((item) => (
          <button
            className={[
              'min-h-12 rounded-[var(--radius-medium)] px-3 text-sm font-black',
              item === rarity
                ? 'bg-[var(--color-primary)] text-white'
                : 'border border-[var(--color-border)] bg-white text-[var(--color-text)]',
            ].join(' ')}
            key={item}
            onClick={() => setRarity(item)}
            type="button"
          >
            {rewardRarityLabels[item]}
          </button>
        ))}
      </div>
      <RewardChestPresentation items={[]} previewRarity={rarity} />
      <div className="grid gap-2 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
        <h2 className="font-black">SFX</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="min-h-11 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-2 text-sm font-black text-white"
            onClick={() => audio.playSoundEffect('chest-drop')}
            type="button"
          >
            chest-drop
          </button>
          <button
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-2 text-sm font-black"
            onClick={() => audio.playSoundEffect('rare-drop')}
            type="button"
          >
            rare-drop
          </button>
          <button
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-2 text-sm font-black"
            onClick={() => audio.playSoundEffect('legendary-drop')}
            type="button"
          >
            legendary-drop
          </button>
          <button
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-2 text-sm font-black"
            onClick={() => {
              audio.playSoundEffect('reward');
              window.setTimeout(() => audio.playSoundEffect('chest-drop'), 90);
              window.setTimeout(() => audio.playSoundEffect('exp-gain'), 180);
              window.setTimeout(
                () =>
                  audio.playSoundEffect(
                    rarity === 'legendary' ? 'legendary-drop' : 'rare-drop',
                  ),
                320,
              );
            }}
            type="button"
          >
            result sequence
          </button>
        </div>
      </div>
    </section>
  );
}
