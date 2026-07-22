export type GameAssetType =
  'enemy' | 'companion' | 'background' | 'item' | 'ui';

export type GameAssetRarity =
  'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type GameAssetRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type GameAssetAnimationHint =
  'float' | 'bounce' | 'glow' | 'hit' | 'defeat' | 'shine' | 'still';

export type GameAssetBase = {
  assetId: string;
  type: GameAssetType;
  name: string;
  src: string;
  altText: string;
  fallbackEmoji: string;
  dominantColor: string;
  shadowColor: string;
  rarity: GameAssetRarity;
  animationHint: GameAssetAnimationHint;
  preload: boolean;
};

export type EnemyAsset = GameAssetBase & {
  type: 'enemy';
  sourceEnemyId: string;
  rank: GameAssetRank;
};

export type CompanionAsset = GameAssetBase & {
  type: 'companion';
  sourceCompanionId: string;
};

export type BackgroundAsset = GameAssetBase & {
  type: 'background';
  sourceAreaId: string;
};

export type ItemAsset = GameAssetBase & {
  type: 'item';
  sourceItemId: string;
  slot: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
};

export type UiAsset = GameAssetBase & {
  type: 'ui';
};

export type GameAsset =
  EnemyAsset | CompanionAsset | BackgroundAsset | ItemAsset | UiAsset;
