export type StoryEventKind =
  | 'opening'
  | 'area-start'
  | 'boss-before'
  | 'boss-after'
  | 'area-clear'
  | 'final-boss-before'
  | 'ending';

export type StorySpeaker = 'narrator' | 'mayor' | 'resident' | 'companion';

export type StoryScene = {
  speaker: StorySpeaker;
  name: string;
  lines: string[];
  portrait: string;
};

export type StoryEvent = {
  id: string;
  kind: StoryEventKind;
  title: string;
  areaId?: string;
  bossEnemyId?: string;
  scenes: StoryScene[];
};

export const STORY_AREA_NAMES: Record<string, string> = {
  'starting-village': 'はじまりの まち',
  'word-forest': 'ことばの もり',
  'picture-hill': 'えあわせの おか',
  'ordering-cave': 'ならべの どうくつ',
  'word-castle': 'もじの おしろ',
};

const portraits: Record<StorySpeaker, string> = {
  narrator: '/assets/illustrations/placeholders/book.svg',
  mayor: '/assets/illustrations/placeholders/house.svg',
  resident: '/assets/illustrations/placeholders/rabbit.svg',
  companion: '/assets/game/companions/companion-rabbit.svg',
};

export const storyEvents: StoryEvent[] = [
  {
    id: 'opening',
    kind: 'opening',
    title: 'オープニング',
    scenes: [
      {
        speaker: 'narrator',
        name: 'ものがたり',
        portrait: portraits.narrator,
        lines: ['もじの ひかりが', 'まちから きえてしまいました。'],
      },
      {
        speaker: 'mayor',
        name: 'そんちょう',
        portrait: portraits.mayor,
        lines: ['きみの こたえが', 'まちを てらす ちからに なる。'],
      },
      {
        speaker: 'companion',
        name: 'なかま',
        portrait: portraits.companion,
        lines: ['いっしょに いこう。', 'もじの ぼうけんへ！'],
      },
    ],
  },
  {
    id: 'area-start-starting-village',
    kind: 'area-start',
    title: 'はじまりの まち',
    areaId: 'starting-village',
    scenes: [
      {
        speaker: 'mayor',
        name: 'そんちょう',
        portrait: portraits.mayor,
        lines: [
          'ここが はじまりの まち。',
          'くさの なかに もじが ねむっているよ。',
        ],
      },
      {
        speaker: 'resident',
        name: 'すむひと',
        portrait: portraits.resident,
        lines: ['こまった ときは', 'ゆっくり よんで だいじょうぶ。'],
      },
    ],
  },
  {
    id: 'area-start-word-forest',
    kind: 'area-start',
    title: 'ことばの もり',
    areaId: 'word-forest',
    scenes: [
      {
        speaker: 'resident',
        name: 'すむひと',
        portrait: portraits.resident,
        lines: ['もりには ことばが いっぱい。', 'みつけた もじを つなげよう。'],
      },
      {
        speaker: 'companion',
        name: 'なかま',
        portrait: portraits.companion,
        lines: ['みどりの みちを', 'いっしょに すすもう。'],
      },
    ],
  },
  {
    id: 'area-start-picture-hill',
    kind: 'area-start',
    title: 'えあわせの おか',
    areaId: 'picture-hill',
    scenes: [
      {
        speaker: 'resident',
        name: 'すむひと',
        portrait: portraits.resident,
        lines: ['えと ことばを', 'ぴったり あわせてみよう。'],
      },
    ],
  },
  {
    id: 'area-start-ordering-cave',
    kind: 'area-start',
    title: 'ならべの どうくつ',
    areaId: 'ordering-cave',
    scenes: [
      {
        speaker: 'mayor',
        name: 'そんちょう',
        portrait: portraits.mayor,
        lines: ['ならべかたで', 'ことばの ちからが かわるぞ。'],
      },
    ],
  },
  {
    id: 'area-start-word-castle',
    kind: 'area-start',
    title: 'もじの おしろ',
    areaId: 'word-castle',
    scenes: [
      {
        speaker: 'companion',
        name: 'なかま',
        portrait: portraits.companion,
        lines: ['ここが さいごの おしろ。', 'さいごまで いっしょだよ。'],
      },
    ],
  },
  {
    id: 'boss-before-default',
    kind: 'boss-before',
    title: 'ボスの まえ',
    scenes: [
      {
        speaker: 'narrator',
        name: 'ものがたり',
        portrait: portraits.narrator,
        lines: ['おおきな かげが', 'もじの みちを ふさいでいる。'],
      },
      {
        speaker: 'companion',
        name: 'なかま',
        portrait: portraits.companion,
        lines: ['だいじょうぶ。', 'おちついて こたえよう。'],
      },
    ],
  },
  {
    id: 'boss-after-default',
    kind: 'boss-after',
    title: 'ボスげきは',
    scenes: [
      {
        speaker: 'mayor',
        name: 'そんちょう',
        portrait: portraits.mayor,
        lines: ['やったぞ！', 'もじの ひかりが もどってきた！'],
      },
      {
        speaker: 'resident',
        name: 'すむひと',
        portrait: portraits.resident,
        lines: ['まちが また', 'すこし にぎやかに なるね。'],
      },
    ],
  },
  {
    id: 'area-clear-default',
    kind: 'area-clear',
    title: 'エリアクリア',
    scenes: [
      {
        speaker: 'narrator',
        name: 'ものがたり',
        portrait: portraits.narrator,
        lines: ['あたらしい みちが', 'ひかりはじめました。'],
      },
      {
        speaker: 'mayor',
        name: 'そんちょう',
        portrait: portraits.mayor,
        lines: ['つぎの まちでも', 'きみの ちからが ひつようだ。'],
      },
    ],
  },
  {
    id: 'final-boss-before',
    kind: 'final-boss-before',
    title: 'ラスボスの まえ',
    bossEnemyId: 'boss-mojinexus',
    scenes: [
      {
        speaker: 'narrator',
        name: 'ものがたり',
        portrait: portraits.narrator,
        lines: ['さいごの とびらが', 'しずかに ひらきます。'],
      },
      {
        speaker: 'companion',
        name: 'なかま',
        portrait: portraits.companion,
        lines: ['いままでの もじが', 'ぜんぶ きみを まもっているよ。'],
      },
    ],
  },
  {
    id: 'ending',
    kind: 'ending',
    title: 'エンディング',
    bossEnemyId: 'boss-mojinexus',
    scenes: [
      {
        speaker: 'narrator',
        name: 'ものがたり',
        portrait: portraits.narrator,
        lines: ['もじの ひかりは', 'まちじゅうに もどりました。'],
      },
      {
        speaker: 'mayor',
        name: 'そんちょう',
        portrait: portraits.mayor,
        lines: ['ありがとう！', 'きみは まちの ゆうしゃだ。'],
      },
      {
        speaker: 'companion',
        name: 'なかま',
        portrait: portraits.companion,
        lines: ['また あしたも', 'いっしょに ぼうけんしよう。'],
      },
    ],
  },
];

export function getStoryEvent(eventId: string) {
  return storyEvents.find((event) => event.id === eventId) ?? null;
}

export function getAreaStartStoryEvent(areaId: string) {
  return (
    storyEvents.find(
      (event) => event.kind === 'area-start' && event.areaId === areaId,
    ) ?? null
  );
}

export function getBossBeforeStoryEvent(enemyId: string) {
  return enemyId === 'boss-mojinexus'
    ? getStoryEvent('final-boss-before')
    : getStoryEvent('boss-before-default');
}
