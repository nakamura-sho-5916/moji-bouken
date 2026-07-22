import { useMemo, useState } from 'react';
import {
  gameAssets,
  GameAssetImage,
  type GameAssetType,
} from '../features/assets';
import { PageFrame } from './PageFrame';

const assetTypes: Array<GameAssetType | 'all'> = [
  'all',
  'enemy',
  'companion',
  'background',
  'item',
  'ui',
];

export function DebugAssetsPage() {
  const [filter, setFilter] = useState<GameAssetType | 'all'>('all');
  const filteredAssets = useMemo(
    () =>
      filter === 'all'
        ? gameAssets
        : gameAssets.filter((asset) => asset.type === filter),
    [filter],
  );
  const duplicateCount =
    gameAssets.length - new Set(gameAssets.map((asset) => asset.assetId)).size;

  if (!import.meta.env.DEV) {
    return (
      <PageFrame
        description="このページは つかえません"
        showBack={false}
        title="404"
      />
    );
  }

  return (
    <PageFrame
      description="ゲーム画像の読み込みを確認します"
      title="Debug Assets"
    >
      <section className="grid gap-4">
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 font-black">
          <p>assetCount: {gameAssets.length}</p>
          <p>duplicateAssetIds: {duplicateCount}</p>
          <p>filteredCount: {filteredAssets.length}</p>
        </div>
        <label className="grid gap-2 text-sm font-black">
          filter
          <select
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-3"
            onChange={(event) =>
              setFilter(event.currentTarget.value as GameAssetType | 'all')
            }
            value={filter}
          >
            {assetTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <div className="grid max-w-[320px] gap-3">
          {filteredAssets.map((asset) => (
            <article
              className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-3 shadow-sm"
              key={asset.assetId}
            >
              <div className="flex items-center gap-3">
                <GameAssetImage assetId={asset.assetId} size="md" />
                <div className="min-w-0">
                  <h2 className="break-words text-sm font-black text-[var(--color-primary-strong)]">
                    {asset.assetId}
                  </h2>
                  <p className="break-words text-xs font-bold text-[var(--color-text-muted)]">
                    {asset.type} / {asset.rarity}
                  </p>
                  <p className="break-words text-xs font-bold text-[var(--color-text-muted)]">
                    {asset.src}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
          <h2 className="text-lg font-black">fallback</h2>
          <GameAssetImage assetId="missing-debug-asset" size="md" />
        </div>
      </section>
    </PageFrame>
  );
}
