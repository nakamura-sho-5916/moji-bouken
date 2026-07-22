import type {
  BackgroundAsset,
  CompanionAsset,
  EnemyAsset,
  GameAsset,
  GameAssetRarity,
  ItemAsset,
} from './assetTypes';

const enemyAssetData = [
  [
    'enemy-moji-slime',
    'enemy-moji-slime',
    'モジスライム',
    'E',
    '#60a5fa',
    '#2563eb',
  ],
  [
    'enemy-ink-slime',
    'enemy-moya-ghost',
    'インクスライム',
    'E',
    '#4c1d95',
    '#312e81',
  ],
  [
    'enemy-paper-slime',
    'enemy-hidden-moji',
    'ペラペラスライム',
    'E',
    '#f59e0b',
    '#b45309',
  ],
  [
    'enemy-moji-bat',
    'enemy-guruguru-bat',
    'モジコウモリ',
    'E',
    '#8b5cf6',
    '#6d28d9',
  ],
  [
    'enemy-ink-bat',
    'enemy-guruguru-bat',
    'インクコウモリ',
    'D',
    '#312e81',
    '#1e1b4b',
  ],
  [
    'enemy-moji-wolf',
    'enemy-magic-kinoko',
    'モジオオカミ',
    'D',
    '#93c5fd',
    '#1d4ed8',
  ],
  [
    'enemy-paper-goblin',
    'enemy-hidden-moji',
    'ペーパーゴブリン',
    'D',
    '#84cc16',
    '#4d7c0f',
  ],
  [
    'enemy-ink-goblin',
    'enemy-magic-kinoko',
    'インクゴブリン',
    'C',
    '#5b21b6',
    '#312e81',
  ],
  [
    'enemy-dakuten-ghost',
    'enemy-moya-ghost',
    'ダクテンゴースト',
    'D',
    '#a78bfa',
    '#6d28d9',
  ],
  [
    'enemy-question-ghost',
    'boss-mojinexus',
    'ハテナゴースト',
    'D',
    '#06b6d4',
    '#0e7490',
  ],
] as const;

const companionAssetData = [
  ['companion-rabbit', 'rabbit', 'うさぎ', '#f9fafb', '#fb923c'],
  ['companion-fox', 'fox', 'きつね', '#fb923c', '#ea580c'],
  ['companion-bear', 'bear', 'くま', '#a16207', '#713f12'],
  ['companion-owl', 'owl', 'ふくろう', '#92400e', '#451a03'],
  ['companion-squirrel', 'squirrel', 'りす', '#b45309', '#78350f'],
] as const;

const backgroundAssetData = [
  [
    'background-starting-grassland',
    'starting-village',
    'はじまりの草原',
    '#86efac',
    '#16a34a',
  ],
  [
    'background-mysterious-forest',
    'word-forest',
    'ふしぎな森',
    '#22c55e',
    '#166534',
  ],
  [
    'background-picture-hill',
    'picture-hill',
    'えほんの丘',
    '#fde68a',
    '#f59e0b',
  ],
  [
    'background-ordering-cave',
    'ordering-cave',
    'ならべかえ洞窟',
    '#a8a29e',
    '#57534e',
  ],
  ['background-word-castle', 'word-castle', 'ことばの城', '#c084fc', '#7e22ce'],
  [
    'background-word-sanctuary',
    'word-sanctuary',
    'ことばの聖域',
    '#67e8f9',
    '#0891b2',
  ],
] as const;

const itemAssetData = [
  ['moji-staff', 'weapon', 'もじのつえ', 'common'],
  ['light-pencil', 'weapon', 'ひかりのえんぴつ', 'uncommon'],
  ['word-sword', 'weapon', 'ことばのけん', 'rare'],
  ['bronze-sword', 'weapon', 'ブロンズソード', 'common'],
  ['silver-sword', 'weapon', 'シルバーソード', 'rare'],
  ['gold-sword', 'weapon', 'ゴールドソード', 'legendary'],
  ['adventure-cloak', 'armor', 'ぼうけんマント', 'common'],
  ['forest-hat', 'armor', 'もりのぼうし', 'uncommon'],
  ['star-armor', 'armor', 'ほしのよろい', 'rare'],
  ['leather-helm', 'armor', 'レザーヘルム', 'common'],
  ['silver-helm', 'armor', 'シルバーヘルム', 'rare'],
  ['night-shield', 'armor', 'ナイトシールド', 'epic'],
  ['flower-badge', 'accessory', 'はなのバッジ', 'common'],
  ['word-ring', 'accessory', 'ことばのゆびわ', 'uncommon'],
  ['rainbow-medal', 'accessory', 'にじのメダル', 'legendary'],
  ['protect-pendant', 'accessory', 'まもりのペンダント', 'rare'],
  ['wisdom-pendant', 'accessory', 'ちえのペンダント', 'rare'],
  ['star-brooch', 'accessory', 'ほしのブローチ', 'epic'],
  ['healing-herb', 'consumable', 'やくそう', 'common'],
  ['special-herb', 'consumable', 'とくせいやくそう', 'uncommon'],
  ['scratch-bandage', 'consumable', 'キズぐすり', 'common'],
  ['magic-scroll', 'consumable', 'まりょくのびん', 'rare'],
  ['speed-seed', 'consumable', 'すばやさのたね', 'uncommon'],
  ['guard-seed', 'consumable', 'まもりのたね', 'uncommon'],
  ['hiragana-fragment', 'material', 'ひらがなのかけら', 'common'],
  ['katakana-fragment', 'material', 'カタカナのかけら', 'common'],
  ['kanji-fragment', 'material', '漢字のかけら', 'rare'],
  ['moji-crystal', 'material', 'もじの結晶', 'epic'],
  ['ink-drop', 'material', 'インクのしずく', 'uncommon'],
  ['word-crown', 'material', 'ことばの王冠', 'legendary'],
] as const;

const itemColorByRarity: Record<GameAssetRarity, [string, string]> = {
  common: ['#f8fafc', '#94a3b8'],
  uncommon: ['#dcfce7', '#22c55e'],
  rare: ['#dbeafe', '#3b82f6'],
  epic: ['#f3e8ff', '#a855f7'],
  legendary: ['#fef3c7', '#f59e0b'],
};

const itemFolderBySlot: Record<ItemAsset['slot'], string> = {
  weapon: 'weapons',
  armor: 'armor',
  accessory: 'accessories',
  consumable: 'consumables',
  material: 'materials',
};

export const enemyAssets: EnemyAsset[] = enemyAssetData.map(
  ([assetId, sourceEnemyId, name, rank, dominantColor, shadowColor]) => ({
    assetId,
    type: 'enemy',
    sourceEnemyId,
    name,
    src: `/assets/game/enemies/${assetId}.svg`,
    altText: `${name}の絵`,
    fallbackEmoji: rank === 'C' ? '◆' : '●',
    dominantColor,
    shadowColor,
    rank,
    rarity: rank === 'C' ? 'rare' : rank === 'D' ? 'uncommon' : 'common',
    animationHint: 'float',
    preload: rank === 'E',
  }),
);

export const companionAssets: CompanionAsset[] = companionAssetData.map(
  ([assetId, sourceCompanionId, name, dominantColor, shadowColor]) => ({
    assetId,
    type: 'companion',
    sourceCompanionId,
    name,
    src: `/assets/game/companions/${assetId}.svg`,
    altText: `${name}の絵`,
    fallbackEmoji: '☆',
    dominantColor,
    shadowColor,
    rarity: 'uncommon',
    animationHint: 'glow',
    preload: true,
  }),
);

export const backgroundAssets: BackgroundAsset[] = backgroundAssetData.map(
  ([assetId, sourceAreaId, name, dominantColor, shadowColor]) => ({
    assetId,
    type: 'background',
    sourceAreaId,
    name,
    src: `/assets/game/backgrounds/${assetId}.svg`,
    altText: `${name}の背景`,
    fallbackEmoji: '◇',
    dominantColor,
    shadowColor,
    rarity: 'common',
    animationHint: 'still',
    preload: sourceAreaId === 'starting-village',
  }),
);

export const itemAssets: ItemAsset[] = itemAssetData.map(
  ([sourceItemId, slot, name, rarity]) => {
    const [dominantColor, shadowColor] = itemColorByRarity[rarity];
    return {
      assetId: `item-${sourceItemId}`,
      type: 'item',
      sourceItemId,
      slot,
      name,
      src: `/assets/game/items/${itemFolderBySlot[slot]}/${sourceItemId}.svg`,
      altText: `${name}の絵`,
      fallbackEmoji: '□',
      dominantColor,
      shadowColor,
      rarity,
      animationHint:
        rarity === 'rare' || rarity === 'epic' || rarity === 'legendary'
          ? 'shine'
          : 'still',
      preload: false,
    };
  },
);

export const gameAssets: GameAsset[] = [
  ...enemyAssets,
  ...companionAssets,
  ...backgroundAssets,
  ...itemAssets,
];

export const assetRegistry = new Map(
  gameAssets.map((asset) => [asset.assetId, asset]),
);
