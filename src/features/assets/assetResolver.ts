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
  return (
    enemyAssets.find((asset) => asset.sourceEnemyId === enemyId) ??
    enemyAssets[0]
  );
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
