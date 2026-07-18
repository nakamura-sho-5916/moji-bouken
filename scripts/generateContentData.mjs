import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ensure = (dirPath) => fs.mkdirSync(path.join(root, dirPath), { recursive: true });
const writeJson = (filePath, data) =>
  fs.writeFileSync(path.join(root, filePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');

ensure('src/content/missions');
ensure('src/content/schemas');
ensure('public/assets/illustrations/placeholders');

const rows = [
  ['a', ['あ', 'い', 'う', 'え', 'お'], ['ア', 'イ', 'ウ', 'エ', 'オ'], ['a', 'i', 'u', 'e', 'o']],
  ['ka', ['か', 'き', 'く', 'け', 'こ'], ['カ', 'キ', 'ク', 'ケ', 'コ'], ['ka', 'ki', 'ku', 'ke', 'ko']],
  ['sa', ['さ', 'し', 'す', 'せ', 'そ'], ['サ', 'シ', 'ス', 'セ', 'ソ'], ['sa', 'shi', 'su', 'se', 'so']],
  ['ta', ['た', 'ち', 'つ', 'て', 'と'], ['タ', 'チ', 'ツ', 'テ', 'ト'], ['ta', 'chi', 'tsu', 'te', 'to']],
  ['na', ['な', 'に', 'ぬ', 'ね', 'の'], ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'], ['na', 'ni', 'nu', 'ne', 'no']],
  ['ha', ['は', 'ひ', 'ふ', 'へ', 'ほ'], ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'], ['ha', 'hi', 'fu', 'he', 'ho']],
  ['ma', ['ま', 'み', 'む', 'め', 'も'], ['マ', 'ミ', 'ム', 'メ', 'モ'], ['ma', 'mi', 'mu', 'me', 'mo']],
  ['ya', ['や', 'ゆ', 'よ'], ['ヤ', 'ユ', 'ヨ'], ['ya', 'yu', 'yo']],
  ['ra', ['ら', 'り', 'る', 'れ', 'ろ'], ['ラ', 'リ', 'ル', 'レ', 'ロ'], ['ra', 'ri', 'ru', 're', 'ro']],
  ['wa', ['わ', 'を', 'ん'], ['ワ', 'ヲ', 'ン'], ['wa', 'wo', 'n']],
];

let order = 1;
const hiragana = [];
const katakana = [];

for (const [row, hira, kata, ids] of rows) {
  for (let index = 0; index < hira.length; index += 1) {
    const hId = `hiragana-${ids[index]}`;
    const kId = `katakana-${ids[index]}`;
    hiragana.push({
      id: hId,
      character: hira[index],
      scriptType: 'hiragana',
      row,
      order,
      active: true,
      variants: [],
      relatedLetterId: kId,
    });
    katakana.push({
      id: kId,
      character: kata[index],
      scriptType: 'katakana',
      row,
      order,
      active: true,
      variants: [],
      relatedLetterId: hId,
    });
    order += 1;
  }
}

for (const [id, character, row] of [
  ['katakana-ba', 'バ', 'ba'],
  ['katakana-pa', 'パ', 'pa'],
  ['katakana-ga', 'ガ', 'ga'],
  ['katakana-da', 'ダ', 'da'],
  ['katakana-bi', 'ビ', 'bi'],
  ['katakana-bo', 'ボ', 'bo'],
  ['katakana-pu', 'プ', 'pu'],
  ['katakana-small-tsu', 'ッ', 'small-tsu'],
  ['katakana-long-vowel', 'ー', 'long-vowel'],
]) {
  katakana.push({
    id,
    character,
    scriptType: 'katakana',
    row,
    order,
    active: false,
    variants: [],
    relatedLetterId: null,
  });
  order += 1;
}

writeJson('src/content/hiragana.json', hiragana);
writeJson('src/content/katakana.json', katakana);

const charToId = new Map([...hiragana, ...katakana].map((letter) => [letter.character, letter.id]));
const letterIdsFor = (text) => Array.from(text).map((character) => charToId.get(character)).filter(Boolean);

const wordSpecs = [
  ['word-cat', 'ねこ', 'ねこ', 'hiragana', 'animals', 'cat', '🐱'],
  ['word-dog', 'いぬ', 'いぬ', 'hiragana', 'animals', 'dog', '🐶'],
  ['word-bird', 'とり', 'とり', 'hiragana', 'animals', 'bird', '🐦'],
  ['word-fish', 'さかな', 'さかな', 'hiragana', 'animals', 'fish', '🐟'],
  ['word-bear', 'くま', 'くま', 'hiragana', 'animals', 'bear', '🐻'],
  ['word-rabbit', 'うさぎ', 'うさぎ', 'hiragana', 'animals', 'rabbit', '🐰'],
  ['word-horse', 'うま', 'うま', 'hiragana', 'animals', 'horse', '🐴'],
  ['word-cow', 'うし', 'うし', 'hiragana', 'animals', 'cow', '🐮'],
  ['word-pig', 'ぶた', 'ぶた', 'hiragana', 'animals', 'pig', '🐷'],
  ['word-turtle', 'かめ', 'かめ', 'hiragana', 'animals', 'turtle', '🐢'],
  ['word-rice', 'ごはん', 'はん', 'hiragana', 'foods', 'rice', '🍚'],
  ['word-bread', 'パン', 'パン', 'katakana', 'foods', 'bread', '🍞'],
  ['word-tomato', 'トマト', 'トマト', 'katakana', 'foods', 'tomato', '🍅'],
  ['word-apple', 'りんご', 'りんこ', 'hiragana', 'foods', 'apple', '🍎'],
  ['word-banana', 'バナナ', 'バナナ', 'katakana', 'foods', 'banana', '🍌'],
  ['word-milk', 'ミルク', 'ミルク', 'katakana', 'foods', 'milk', '🥛'],
  ['word-water', 'みず', 'みす', 'hiragana', 'foods', 'water', '💧'],
  ['word-egg', 'たまご', 'たまこ', 'hiragana', 'foods', 'egg', '🥚'],
  ['word-cake', 'ケーキ', 'ケーキ', 'katakana', 'foods', 'cake', '🍰'],
  ['word-cup', 'コップ', 'コップ', 'katakana', 'foods', 'cup', '🥤'],
  ['word-school', 'がっこう', 'こう', 'hiragana', 'school', 'school', '🏫'],
  ['word-desk', 'つくえ', 'つくえ', 'hiragana', 'school', 'desk', '▣'],
  ['word-chair', 'いす', 'いす', 'hiragana', 'school', 'chair', '🪑'],
  ['word-pencil', 'えんぴつ', 'えんひつ', 'hiragana', 'school', 'pencil', '✏️'],
  ['word-book', 'ほん', 'ほん', 'hiragana', 'school', 'book', '📖'],
  ['word-bag', 'かばん', 'かばん', 'hiragana', 'school', 'bag', '🎒'],
  ['word-clock', 'とけい', 'とけい', 'hiragana', 'school', 'clock', '🕒'],
  ['word-paper', 'かみ', 'かみ', 'hiragana', 'school', 'paper', '📄'],
  ['word-map', 'ちず', 'ちす', 'hiragana', 'school', 'map', '🗺️'],
  ['word-crayon', 'クレヨン', 'クレヨン', 'katakana', 'school', 'crayon', '🖍️'],
  ['word-house', 'いえ', 'いえ', 'hiragana', 'home', 'house', '🏠'],
  ['word-door', 'ドア', 'ドア', 'katakana', 'home', 'door', '🚪'],
  ['word-window', 'まど', 'まど', 'hiragana', 'home', 'window', '□'],
  ['word-bath', 'おふろ', 'おふろ', 'hiragana', 'home', 'bath', '🛁'],
  ['word-bed', 'ベッド', 'ベッド', 'katakana', 'home', 'bed', '🛏️'],
  ['word-tv', 'テレビ', 'テレビ', 'katakana', 'home', 'tv', '📺'],
  ['word-camera', 'カメラ', 'カメラ', 'katakana', 'home', 'camera', '📷'],
  ['word-phone', 'でんわ', 'でんわ', 'hiragana', 'home', 'phone', '☎️'],
  ['word-key', 'かぎ', 'かき', 'hiragana', 'home', 'key', '🔑'],
  ['word-box', 'はこ', 'はこ', 'hiragana', 'home', 'box', '📦'],
  ['word-mountain', 'やま', 'やま', 'hiragana', 'nature', 'mountain', '⛰️'],
  ['word-river', 'かわ', 'かわ', 'hiragana', 'nature', 'river', '〰'],
  ['word-sea', 'うみ', 'うみ', 'hiragana', 'nature', 'sea', '🌊'],
  ['word-sky', 'そら', 'そら', 'hiragana', 'nature', 'sky', '☁️'],
  ['word-star', 'ほし', 'ほし', 'hiragana', 'nature', 'star', '⭐'],
  ['word-flower', 'はな', 'はな', 'hiragana', 'nature', 'flower', '🌸'],
  ['word-tree', 'き', 'き', 'hiragana', 'nature', 'tree', '🌳'],
  ['word-rain', 'あめ', 'あめ', 'hiragana', 'nature', 'rain', '☔'],
  ['word-snow', 'ゆき', 'ゆき', 'hiragana', 'nature', 'snow', '❄️'],
  ['word-moon', 'つき', 'つき', 'hiragana', 'nature', 'moon', '🌙'],
  ['word-car', 'くるま', 'くるま', 'hiragana', 'vehicles', 'car', '🚗'],
  ['word-bus', 'バス', 'バス', 'katakana', 'vehicles', 'bus', '🚌'],
  ['word-train', 'でんしゃ', 'でんしゃ', 'hiragana', 'vehicles', 'train', '🚃'],
  ['word-ship', 'ふね', 'ふね', 'hiragana', 'vehicles', 'ship', '⛵'],
  ['word-plane', 'ひこうき', 'ひこうき', 'hiragana', 'vehicles', 'plane', '✈️'],
  ['word-bike', 'じてんしゃ', 'じてんしゃ', 'hiragana', 'vehicles', 'bike', '🚲'],
  ['word-taxi', 'タクシー', 'タクシー', 'katakana', 'vehicles', 'taxi', '🚕'],
  ['word-rocket', 'ロケット', 'ロケット', 'katakana', 'vehicles', 'rocket', '🚀'],
  ['word-road', 'みち', 'みち', 'hiragana', 'vehicles', 'road', '🛣️'],
  ['word-station', 'えき', 'えき', 'hiragana', 'vehicles', 'station', '🚉'],
  ['word-hand', 'て', 'て', 'hiragana', 'body', 'hand', '✋'],
  ['word-foot', 'あし', 'あし', 'hiragana', 'body', 'foot', '🦶'],
  ['word-eye', 'め', 'め', 'hiragana', 'body', 'eye', '👁️'],
  ['word-ear', 'みみ', 'みみ', 'hiragana', 'body', 'ear', '👂'],
  ['word-mouth', 'くち', 'くち', 'hiragana', 'body', 'mouth', '👄'],
  ['word-head', 'あたま', 'あたま', 'hiragana', 'body', 'head', '🙂'],
  ['word-red', 'あか', 'あか', 'hiragana', 'colors', 'red', '🔴'],
  ['word-blue', 'あお', 'あお', 'hiragana', 'colors', 'blue', '🔵'],
  ['word-white', 'しろ', 'しろ', 'hiragana', 'colors', 'white', '⚪'],
  ['word-black', 'くろ', 'くろ', 'hiragana', 'colors', 'black', '⚫'],
  ['word-park', 'こうえん', 'こうえん', 'hiragana', 'places', 'park', '🏞️'],
  ['word-room', 'へや', 'へや', 'hiragana', 'places', 'room', '▢'],
  ['word-shop', 'みせ', 'みせ', 'hiragana', 'places', 'shop', '🏪'],
  ['word-bridge', 'はし', 'はし', 'hiragana', 'places', 'bridge', '🌉'],
  ['word-gate', 'もん', 'もん', 'hiragana', 'places', 'gate', '⛩️'],
  ['word-lion', 'ライオン', 'ライオン', 'katakana', 'animals', 'lion', '🦁'],
  ['word-robot', 'ロボット', 'ロボット', 'katakana', 'home', 'robot', '🤖'],
  ['word-koala', 'コアラ', 'コアラ', 'katakana', 'animals', 'koala', '🐨'],
  ['word-panda', 'パンダ', 'パンダ', 'katakana', 'animals', 'panda', '🐼'],
  ['word-sofa', 'ソファ', 'ソファ', 'katakana', 'home', 'sofa', '🛋️'],
];

const illustrations = [];
const words = wordSpecs.map(([id, display, reading, scriptType, category, illustrationKey, fallbackText], index) => {
  const illustrationId = `illustration-${illustrationKey}`;
  if (!illustrations.some((illustration) => illustration.id === illustrationId)) {
    illustrations.push({
      id: illustrationId,
      assetPath: `/assets/illustrations/placeholders/${illustrationKey}.svg`,
      altText: display,
      category,
      fallbackText,
    });
  }

  return {
    id,
    display,
    reading,
    scriptType,
    letterIds: letterIdsFor(reading),
    category,
    difficulty: index < 50 ? 1 : 2,
    illustrationId,
    verticalAllowed: true,
    horizontalAllowed: true,
    active: true,
  };
});

writeJson('src/content/words.json', words);
writeJson('src/content/illustrations.json', illustrations);

for (const illustration of illustrations) {
  const label = illustration.fallbackText || illustration.altText.slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="${illustration.altText}"><rect width="160" height="160" rx="24" fill="#fffbeb"/><circle cx="80" cy="72" r="48" fill="#fed7aa"/><text x="80" y="94" text-anchor="middle" font-size="42">${label}</text></svg>\n`;
  fs.writeFileSync(
    path.join(root, 'public/assets/illustrations/placeholders', `${illustration.id.replace('illustration-', '')}.svg`),
    svg,
    'utf8',
  );
}

writeJson(
  'src/content/similarLetters.json',
  [
    ['similar-h-a-o', 'hiragana', ['hiragana-a', 'hiragana-o'], 1, '丸みと内側の形を見比べる'],
    ['similar-h-i-ri', 'hiragana', ['hiragana-i', 'hiragana-ri'], 1, '縦線の向きを見比べる'],
    ['similar-h-ki-sa', 'hiragana', ['hiragana-ki', 'hiragana-sa'], 2, '線の数と曲がりを見比べる'],
    ['similar-h-shi-tsu', 'hiragana', ['hiragana-shi', 'hiragana-tsu'], 2, '書き出しの向きを見比べる'],
    ['similar-h-nu-me', 'hiragana', ['hiragana-nu', 'hiragana-me'], 2, '結びの有無を見比べる'],
    ['similar-h-ne-re-wa', 'hiragana', ['hiragana-ne', 'hiragana-re', 'hiragana-wa'], 3, '右側の形を見比べる'],
    ['similar-h-ru-ro', 'hiragana', ['hiragana-ru', 'hiragana-ro'], 1, '下の丸みを見比べる'],
    ['similar-k-shi-tsu', 'katakana', ['katakana-shi', 'katakana-tsu'], 2, '点と線の向きを見比べる'],
    ['similar-k-so-n', 'katakana', ['katakana-so', 'katakana-n'], 2, '払いの向きを見比べる'],
    ['similar-k-ku-ke', 'katakana', ['katakana-ku', 'katakana-ke'], 1, '線の本数を見比べる'],
    ['similar-k-na-me', 'katakana', ['katakana-na', 'katakana-me'], 2, '斜め線の形を見比べる'],
    ['similar-k-chi-te', 'katakana', ['katakana-chi', 'katakana-te'], 2, '横線と下の形を見比べる'],
  ].map(([id, scriptType, letterIds, difficulty, note]) => ({ id, scriptType, letterIds, difficulty, note })),
);

const missionTypes = [
  'letter-introduction',
  'letter-search',
  'similar-letter-choice',
  'illustration-letter-choice',
  'illustration-word-choice',
  'word-completion',
  'word-ordering',
  'vertical-reading',
  'horizontal-reading',
  'text-search',
  'boss-mixed',
];
const mission = (missionType, number, extra = {}) => ({
  missionId: `mission-${missionType}-${String(number).padStart(3, '0')}`,
  missionType,
  targetIds: ['hiragana-a'],
  prompt: '「あ」を みつけよう',
  choices: ['あ', 'い', 'う', 'え'],
  correctAnswer: 'あ',
  difficulty: number % 2 === 0 ? 2 : 1,
  orientation: 'horizontal',
  reward: { experience: 10, gold: 5 },
  unlockCondition: null,
  active: true,
  ...extra,
});
const missionFiles = {
  introduction: [
    mission('letter-introduction', 1, { prompt: '「あ」を みよう', choices: ['あ', 'お'], correctAnswer: 'あ' }),
    mission('letter-introduction', 2, { targetIds: ['katakana-a'], prompt: '「ア」を みよう', choices: ['ア', 'オ'], correctAnswer: 'ア' }),
  ],
  letterSearch: [
    mission('letter-search', 1),
    mission('letter-search', 2, { targetIds: ['hiragana-ne'], prompt: '「ね」を みつけよう', choices: ['ね', 'れ', 'わ', 'め'], correctAnswer: 'ね' }),
  ],
  similarLetter: [
    mission('similar-letter-choice', 1, { prompt: '「し」は どれかな', choices: ['し', 'つ', 'く', 'へ'], correctAnswer: 'し' }),
    mission('similar-letter-choice', 2, { targetIds: ['katakana-shi'], prompt: '「シ」は どれかな', choices: ['シ', 'ツ', 'ソ', 'ン'], correctAnswer: 'シ' }),
  ],
  illustrationChoice: [
    mission('illustration-letter-choice', 1, { targetIds: ['hiragana-ne'], prompt: 'ねこ の はじめの もじ', choices: ['ね', 'め', 'ぬ', 'れ'], correctAnswer: 'ね' }),
    mission('illustration-letter-choice', 2, { targetIds: ['katakana-pa'], prompt: 'パン の はじめの もじ', choices: ['パ', 'バ', 'ハ', 'カ'], correctAnswer: 'パ' }),
  ],
  illustrationWord: [
    mission('illustration-word-choice', 1, { targetIds: ['word-cat'], prompt: 'ねこの ことばを えらぼう', choices: ['ねこ', 'いぬ', 'とり', 'くま'], correctAnswer: 'ねこ' }),
    mission('illustration-word-choice', 2, { targetIds: ['word-bus'], prompt: 'バスの ことばを えらぼう', choices: ['バス', 'パン', 'テレビ', 'カメラ'], correctAnswer: 'バス' }),
  ],
  wordCompletion: [
    mission('word-completion', 1, { targetIds: ['word-cat'], prompt: 'ね□ に 入る もじ', choices: ['こ', 'け', 'に', 'た'], correctAnswer: 'こ' }),
    mission('word-completion', 2, { targetIds: ['word-flower'], prompt: 'は□ に 入る もじ', choices: ['な', 'ま', 'ほ', 'ね'], correctAnswer: 'な' }),
  ],
  wordOrdering: [
    mission('word-ordering', 1, { targetIds: ['word-dog'], prompt: 'ならべて「いぬ」を つくろう', choices: ['いぬ', 'ぬい', 'い'], correctAnswer: 'いぬ' }),
    mission('word-ordering', 2, { targetIds: ['word-bus'], prompt: 'ならべて「バス」を つくろう', choices: ['バス', 'スバ', 'バ'], correctAnswer: 'バス' }),
  ],
  verticalReading: [
    mission('vertical-reading', 1, { targetIds: ['word-cat'], prompt: 'たてに よんで「ねこ」を さがそう', choices: ['ねこ', 'いぬ', 'くま'], correctAnswer: 'ねこ', orientation: 'vertical' }),
    mission('vertical-reading', 2, { targetIds: ['word-moon'], prompt: 'たてに よんで「つき」を さがそう', choices: ['つき', 'ゆき', 'ほし'], correctAnswer: 'つき', orientation: 'vertical' }),
  ],
  horizontalReading: [
    mission('horizontal-reading', 1, { targetIds: ['word-sea'], prompt: 'よこに よんで「うみ」を さがそう', choices: ['うみ', 'やま', 'かわ'], correctAnswer: 'うみ' }),
    mission('horizontal-reading', 2, { targetIds: ['word-sky'], prompt: 'よこに よんで「そら」を さがそう', choices: ['そら', 'ほし', 'あめ'], correctAnswer: 'そら' }),
  ],
  textSearch: [
    mission('text-search', 1, { targetIds: ['word-cat'], prompt: 'ねこが いすの したに いる。 「ねこ」は どれ', choices: ['ねこ', 'いす', 'した'], correctAnswer: 'ねこ' }),
    mission('text-search', 2, { targetIds: ['word-flower'], prompt: 'こうえんで はなを みた。 「はな」は どれ', choices: ['こうえん', 'はな', 'みた'], correctAnswer: 'はな' }),
  ],
  boss: [
    mission('boss-mixed', 1, { targetIds: ['hiragana-a', 'word-cat'], prompt: 'まとめて ちょうせん 1', choices: ['あ', 'ねこ', 'つき'], correctAnswer: 'あ', difficulty: 3, orientation: 'adaptive' }),
    mission('boss-mixed', 2, { targetIds: ['katakana-ba', 'word-bus'], prompt: 'まとめて ちょうせん 2', choices: ['バ', 'バス', 'パン'], correctAnswer: 'バス', difficulty: 3, orientation: 'adaptive' }),
  ],
};
for (const [fileName, missions] of Object.entries(missionFiles)) {
  writeJson(`src/content/missions/${fileName}.json`, missions);
}

writeJson('src/content/schemas/mission.schema.json', {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'MojiBoukenMission',
  type: 'object',
  required: [
    'missionId',
    'missionType',
    'targetIds',
    'prompt',
    'choices',
    'correctAnswer',
    'difficulty',
    'orientation',
    'reward',
    'unlockCondition',
    'active',
  ],
  additionalProperties: false,
  properties: {
    missionId: { type: 'string', minLength: 1 },
    missionType: { type: 'string', enum: missionTypes },
    targetIds: { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1 },
    prompt: { type: 'string', minLength: 1 },
    choices: { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1 },
    correctAnswer: { type: 'string', minLength: 1 },
    difficulty: { type: 'integer', minimum: 1, maximum: 5 },
    orientation: { type: 'string', enum: ['horizontal', 'vertical', 'adaptive'] },
    reward: {
      type: 'object',
      required: ['experience', 'gold'],
      additionalProperties: false,
      properties: {
        experience: { type: 'integer', minimum: 0 },
        gold: { type: 'integer', minimum: 0 },
      },
    },
    unlockCondition: { type: ['object', 'null'], additionalProperties: true },
    active: { type: 'boolean' },
  },
});
