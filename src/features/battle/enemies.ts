import type { Enemy, EnemyDropItem, EnemyRarity, EnemyType } from './types';

type EnemySeed = {
  id: string;
  name: string;
  areaId: string;
  type: EnemyType;
  rarity: EnemyRarity;
  maxHp: number;
  defense: number;
  rewardExperience: number;
  rewardGold: number;
  imageId: string;
};

const materialDrops: Record<string, EnemyDropItem[]> = {
  starting: [
    {
      itemId: 'hiragana-fragment',
      kind: 'item',
      chance: 0.45,
      minCount: 1,
      maxCount: 2,
    },
    {
      itemId: 'healing-herb',
      kind: 'item',
      chance: 0.25,
      minCount: 1,
      maxCount: 1,
    },
  ],
  forest: [
    {
      itemId: 'katakana-fragment',
      kind: 'item',
      chance: 0.38,
      minCount: 1,
      maxCount: 2,
    },
    {
      itemId: 'ink-drop',
      kind: 'item',
      chance: 0.22,
      minCount: 1,
      maxCount: 1,
    },
  ],
  hill: [
    {
      itemId: 'moji-crystal',
      kind: 'item',
      chance: 0.24,
      minCount: 1,
      maxCount: 1,
    },
    {
      itemId: 'scratch-bandage',
      kind: 'item',
      chance: 0.28,
      minCount: 1,
      maxCount: 1,
    },
  ],
  cave: [
    {
      itemId: 'kanji-fragment',
      kind: 'item',
      chance: 0.28,
      minCount: 1,
      maxCount: 2,
    },
    {
      itemId: 'guard-seed',
      kind: 'item',
      chance: 0.18,
      minCount: 1,
      maxCount: 1,
    },
  ],
  castle: [
    {
      itemId: 'word-crown',
      kind: 'collection',
      chance: 0.2,
      minCount: 1,
      maxCount: 1,
    },
    {
      itemId: 'magic-scroll',
      kind: 'item',
      chance: 0.22,
      minCount: 1,
      maxCount: 1,
    },
  ],
};

const rareDrops: Partial<Record<EnemyRarity, EnemyDropItem[]>> = {
  rare: [
    {
      itemId: 'word-ring',
      kind: 'equipment',
      chance: 0.1,
      minCount: 1,
      maxCount: 1,
    },
  ],
  epic: [
    {
      itemId: 'star-armor',
      kind: 'equipment',
      chance: 0.12,
      minCount: 1,
      maxCount: 1,
    },
    {
      itemId: 'rainbow-medal',
      kind: 'equipment',
      chance: 0.08,
      minCount: 1,
      maxCount: 1,
    },
  ],
  legendary: [
    {
      itemId: 'gold-sword',
      kind: 'equipment',
      chance: 0.16,
      minCount: 1,
      maxCount: 1,
    },
    {
      itemId: 'word-crown',
      kind: 'collection',
      chance: 0.35,
      minCount: 1,
      maxCount: 1,
    },
  ],
};

const enemySeeds: EnemySeed[] = [
  ...areaEnemies('starting-village', 'village', 1, [
    ['enemy-moji-slime', 'もじスライム', 'common'],
    ['enemy-kotoba-puni', 'ことばぷに', 'common'],
    ['enemy-pencil-sprout', 'えんぴつめ', 'common'],
    ['enemy-erasing-dust', 'けしごむダスト', 'common'],
    ['enemy-card-mimic', 'カードミミック', 'uncommon'],
    ['enemy-ink-hop', 'インクホップ', 'uncommon'],
    ['enemy-note-bird', 'ノートバード', 'rare'],
    ['enemy-hira-wisp', 'ひらがなウィスプ', 'rare'],
    ['enemy-star-syllable', 'ほしのシラブル', 'epic'],
  ]),
  boss('boss-village-kana-guardian', 'かなのまもりて', 'starting-village', 1),
  ...areaEnemies('word-forest', 'forest', 2, [
    ['enemy-hidden-moji', 'かくれモジ', 'common'],
    ['enemy-leaf-letter', 'はっぱレター', 'common'],
    ['enemy-moss-kana', 'こけカナ', 'common'],
    ['enemy-seed-scribe', 'たねスクライブ', 'common'],
    ['enemy-guruguru-bat', 'ぐるぐるバット', 'uncommon'],
    ['enemy-branch-riddle', 'えだなぞり', 'uncommon'],
    ['enemy-forest-echo', 'もりのこだま', 'rare'],
    ['enemy-vine-word', 'つることば', 'rare'],
    ['enemy-green-orthos', 'みどりオルトス', 'epic'],
  ]),
  boss('boss-forest-kotodama', 'ことだまウッド', 'word-forest', 2),
  ...areaEnemies('picture-hill', 'hill', 3, [
    ['enemy-moya-ghost', 'もやもやゴースト', 'common'],
    ['enemy-picture-puff', 'えあわせパフ', 'common'],
    ['enemy-color-kana', 'いろカナ', 'common'],
    ['enemy-shape-moth', 'かたちモス', 'common'],
    ['enemy-frame-fairy', 'フレームフェアリ', 'uncommon'],
    ['enemy-cloud-letter', 'くもレター', 'uncommon'],
    ['enemy-rainbow-smudge', 'にじスミア', 'rare'],
    ['enemy-sketched-wolf', 'ラフウルフ', 'rare'],
    ['enemy-gallery-dragon', 'ギャラリードラゴン', 'epic'],
  ]),
  boss('boss-hill-picturephinx', 'えあわせスフィンクス', 'picture-hill', 3),
  ...areaEnemies('ordering-cave', 'cave', 4, [
    ['enemy-magic-kinoko', 'まよいキノコ', 'common'],
    ['enemy-order-pebble', 'ならべいし', 'common'],
    ['enemy-echo-kana', 'こだまカナ', 'common'],
    ['enemy-cave-scroll', 'どうくつスクロール', 'common'],
    ['enemy-ink-golem', 'インクゴーレム', 'uncommon'],
    ['enemy-flip-bat', 'さかさバット', 'uncommon'],
    ['enemy-grammar-geode', 'ぶんしょうジオード', 'rare'],
    ['enemy-rune-mole', 'ルーンモール', 'rare'],
    ['enemy-crystal-syntax', 'クリスタルシンタックス', 'epic'],
  ]),
  boss('boss-cave-order-king', 'ならべキング', 'ordering-cave', 4),
  ...areaEnemies('word-castle', 'castle', 5, [
    ['enemy-castle-scribe', 'おしろスクライブ', 'common'],
    ['enemy-armor-kana', 'よろいカナ', 'common'],
    ['enemy-banner-bat', 'バナーバット', 'common'],
    ['enemy-tower-wisp', 'とうのウィスプ', 'common'],
    ['enemy-dakuten-ghost', 'だくてんゴースト', 'uncommon'],
    ['enemy-question-ghost', 'はてなゴースト', 'uncommon'],
    ['enemy-silver-syllable', 'ぎんのシラブル', 'rare'],
    ['enemy-royal-moji', 'ロイヤルモジ', 'rare'],
    ['enemy-legend-lexicon', 'レジェンドレキシコン', 'legendary'],
  ]),
  boss('boss-mojinexus', 'モジネクス', 'word-castle', 5),
];

function areaEnemies(
  areaId: string,
  dropKey: keyof typeof materialDrops,
  tier: number,
  rows: [string, string, EnemyRarity][],
): EnemySeed[] {
  return rows.map(([id, name, rarity], index) => {
    const rarityOffset = rarityScore(rarity);
    return {
      id,
      name,
      areaId,
      type: 'normal',
      rarity,
      maxHp: 85 + tier * 22 + index * 6 + rarityOffset * 12,
      defense: 1 + tier + Math.floor(rarityOffset / 2),
      rewardExperience: 14 + tier * 7 + rarityOffset * 8,
      rewardGold: 5 + tier * 3 + rarityOffset * 4,
      imageId: `${dropKey}-${index}`,
    };
  });
}

function boss(
  id: string,
  name: string,
  areaId: string,
  tier: number,
): EnemySeed {
  return {
    id,
    name,
    areaId,
    type: 'boss',
    rarity: tier >= 5 ? 'legendary' : 'epic',
    maxHp: 190 + tier * 48,
    defense: 5 + tier,
    rewardExperience: 120 + tier * 45,
    rewardGold: 45 + tier * 20,
    imageId: `boss-${tier}`,
  };
}

function rarityScore(rarity: EnemyRarity) {
  const scores: Record<EnemyRarity, number> = {
    common: 0,
    uncommon: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
  };
  return scores[rarity];
}

function dropsFor(seed: EnemySeed): EnemyDropItem[] {
  const baseKey =
    seed.areaId === 'starting-village'
      ? 'starting'
      : seed.areaId === 'word-forest'
        ? 'forest'
        : seed.areaId === 'picture-hill'
          ? 'hill'
          : seed.areaId === 'ordering-cave'
            ? 'cave'
            : 'castle';
  return [
    ...materialDrops[baseKey],
    ...(rareDrops[seed.rarity] ?? []),
    ...(seed.type === 'boss'
      ? [
          {
            itemId: 'moji-crystal',
            kind: 'item' as const,
            chance: 1,
            minCount: 2,
            maxCount: 4,
          },
        ]
      : []),
  ];
}

export const enemies: Enemy[] = enemySeeds.map((seed) => ({
  ...seed,
  drops: dropsFor(seed),
  battleLine:
    seed.type === 'boss'
      ? `${seed.name}が ことばのちからを ためている`
      : `${seed.name}: てきが あらわれた`,
  attackLine:
    seed.type === 'boss'
      ? `${seed.name}の もじのあらし`
      : `${seed.name}が ふしぎなもじを とばした`,
  defeatLine:
    seed.type === 'boss'
      ? `${seed.name}を しずめた`
      : `${seed.name}が きらきらに もどった`,
  active: true,
}));

export function getEnemy(enemyId: string) {
  return enemies.find((enemy) => enemy.id === enemyId);
}

export function getDefaultEnemy(bossEnemy = false) {
  const enemy =
    enemies.find((item) => item.type === (bossEnemy ? 'boss' : 'normal')) ??
    enemies[0];
  if (!enemy) {
    throw new Error('enemy data is empty');
  }
  return enemy;
}
