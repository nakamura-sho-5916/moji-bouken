import {
  assetRegistry,
  backgroundAssets,
  companionAssets,
  enemyAssets,
  itemAssets,
} from './assetRegistry';
import type {
  BackgroundAsset,
  CompanionAsset,
  EnemyAsset,
  GameAsset,
  ItemAsset,
} from './assetTypes';

export function resolveAsset(assetId: string): GameAsset | null {
  return assetRegistry.get(assetId) ?? null;
}

export function getAssetOrFallback(assetId: string): GameAsset {
  return (
    resolveAsset(assetId) ?? {
      assetId: 'missing-asset',
      type: 'ui',
      name: 'missing asset',
      src: '',
      altText: '画像を読み込めません',
      fallbackEmoji: '□',
      dominantColor: '#e5e7eb',
      shadowColor: '#9ca3af',
      rarity: 'common',
      animationHint: 'still',
      preload: false,
    }
  );
}

export function resolveEnemyAsset(enemyId: string): EnemyAsset {
  const exact = enemyAssets.find((asset) => asset.sourceEnemyId === enemyId);
  if (exact) {
    return exact;
  }
  const index = Array.from(enemyId).reduce(
    (total, char) => (total + char.charCodeAt(0)) % enemyAssets.length,
    0,
  );
  const fallback = enemyAssets[index] ?? enemyAssets[0];
  if (!fallback) {
    throw new Error('enemy assets are empty');
  }
  return fallback;
}

export function resolveCompanionAsset(companionId: string): CompanionAsset {
  return (
    companionAssets.find((asset) => asset.sourceCompanionId === companionId) ??
    companionAssets[0]
  );
}

export function resolveBackgroundAsset(areaId: string): BackgroundAsset {
  return (
    backgroundAssets.find((asset) => asset.sourceAreaId === areaId) ??
    backgroundAssets[0]
  );
}

export function resolveItemAsset(itemId: string): ItemAsset {
  return (
    itemAssets.find((asset) => asset.sourceItemId === itemId) ?? itemAssets[0]
  );
}
