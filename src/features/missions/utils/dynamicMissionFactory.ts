import type {
  ContentLetter,
  ContentMission,
  ContentWord,
  LoadedContent,
  MissionType,
} from '../../../types';
import type { QuestionCandidate } from '../../learning';
import { shuffleChoices } from './shuffleChoices';

const generatedReward = {
  experience: 10,
  gold: 5,
};

const wordMissionTypes = new Set<MissionType>([
  'illustration-letter-choice',
  'illustration-word-choice',
  'word-completion',
  'word-ordering',
  'vertical-reading',
  'horizontal-reading',
  'text-search',
]);

function findLetter(content: LoadedContent, letterId: string) {
  return [...content.hiragana, ...content.katakana].find(
    (letter) => letter.id === letterId,
  );
}

function findWord(content: LoadedContent, wordId: string) {
  return content.words.find((word) => word.id === wordId);
}

function wordsForLetter(content: LoadedContent, letterId: string) {
  return content.words.filter(
    (word) => word.active && word.letterIds.includes(letterId),
  );
}

function similarLettersFor(
  content: LoadedContent,
  letter: ContentLetter,
): ContentLetter[] {
  const group = content.similarLetters.find((item) =>
    item.letterIds.includes(letter.id),
  );
  const letters = [...content.hiragana, ...content.katakana];
  if (!group) {
    return letters.filter((item) => item.scriptType === letter.scriptType);
  }
  return group.letterIds
    .map((letterId) => findLetter(content, letterId))
    .filter((item): item is ContentLetter => Boolean(item));
}

function choiceCharacters(content: LoadedContent, letter: ContentLetter) {
  return [
    ...new Set(
      [
        letter.character,
        ...similarLettersFor(content, letter).map((item) => item.character),
        ...[...content.hiragana, ...content.katakana]
          .filter((item) => item.scriptType === letter.scriptType)
          .map((item) => item.character),
      ].filter((value) => value.length > 0),
    ),
  ];
}

function wordChoices(content: LoadedContent, word: ContentWord) {
  return [
    ...new Set(
      [
        word.display,
        ...content.words
          .filter(
            (item) =>
              item.active &&
              item.scriptType === word.scriptType &&
              item.id !== word.id,
          )
          .map((item) => item.display),
      ].filter((value) => value.length > 0),
    ),
  ];
}

function chooseWord(
  content: LoadedContent,
  candidate: QuestionCandidate,
  seed: number,
  index: number,
) {
  const direct = findWord(content, candidate.sourceContentId);
  if (direct?.letterIds.includes(candidate.letterId)) {
    return direct;
  }
  const words = wordsForLetter(content, candidate.letterId);
  return shuffleChoices(words, seed + index * 17)[0];
}

function promptForMission(input: {
  missionType: MissionType;
  letter: ContentLetter;
  word: ContentWord | null;
}) {
  const { missionType, letter, word } = input;
  const letterText = letter.character;
  const wordText = word?.display ?? letterText;
  const prompts: Record<MissionType, string> = {
    'letter-introduction': `${letterText} を おぼえよう`,
    'letter-search': `${letterText} を みつけよう`,
    'similar-letter-choice': `${letterText} に にている もじから えらぼう`,
    'illustration-letter-choice': `${wordText} の なかの ${letterText}`,
    'illustration-word-choice': `${wordText} の ことばを えらぼう`,
    'word-completion': `${wordText} に はいる もじ`,
    'word-ordering': `${wordText} を ならべよう`,
    'vertical-reading': `${wordText} を たてに よもう`,
    'horizontal-reading': `${wordText} を よこに よもう`,
    'text-search': `${wordText} から ${letterText} を さがそう`,
    'boss-mixed': `${letterText} の ちからだめし`,
  };
  return prompts[missionType];
}

function correctAnswerFor(
  missionType: MissionType,
  letter: ContentLetter,
  word: ContentWord | null,
) {
  if (
    missionType === 'illustration-word-choice' ||
    missionType === 'word-ordering' ||
    missionType === 'vertical-reading' ||
    missionType === 'horizontal-reading'
  ) {
    return word?.display ?? letter.character;
  }
  return letter.character;
}

function targetIdsFor(
  missionType: MissionType,
  letter: ContentLetter,
  word: ContentWord | null,
) {
  return wordMissionTypes.has(missionType) && word ? [word.id] : [letter.id];
}

function choicesFor(input: {
  content: LoadedContent;
  missionType: MissionType;
  letter: ContentLetter;
  word: ContentWord | null;
}) {
  const { content, missionType, letter, word } = input;
  if (
    missionType === 'illustration-word-choice' ||
    missionType === 'word-ordering' ||
    missionType === 'vertical-reading' ||
    missionType === 'horizontal-reading'
  ) {
    return word ? wordChoices(content, word).slice(0, 8) : [letter.character];
  }
  if (missionType === 'text-search' && word) {
    return [...new Set(Array.from(word.display))];
  }
  return choiceCharacters(content, letter).slice(0, 8);
}

function orientationFor(missionType: MissionType) {
  if (missionType === 'vertical-reading') {
    return 'vertical' as const;
  }
  return 'horizontal' as const;
}

export function createQuestionSignature(mission: ContentMission) {
  const choiceSet = [...new Set(mission.choices)].sort().join('|');
  return [
    mission.missionType,
    mission.targetIds.join('+'),
    mission.correctAnswer,
    choiceSet,
  ].join('::');
}

export function createDynamicMission(input: {
  candidate: QuestionCandidate;
  content: LoadedContent;
  seed: number;
  index: number;
}): ContentMission | null {
  const { candidate, content, seed, index } = input;
  const letter = findLetter(content, candidate.letterId);
  if (!letter) {
    return null;
  }
  const word = wordMissionTypes.has(candidate.missionType)
    ? (chooseWord(content, candidate, seed, index) ?? null)
    : null;
  if (wordMissionTypes.has(candidate.missionType) && !word) {
    return null;
  }
  const correctAnswer = correctAnswerFor(candidate.missionType, letter, word);

  return {
    missionId: `generated-${candidate.category}-${candidate.missionType}-${candidate.letterId}-${candidate.sourceContentId}-${seed}-${index}`,
    missionType: candidate.missionType,
    targetIds: targetIdsFor(candidate.missionType, letter, word),
    prompt: promptForMission({
      missionType: candidate.missionType,
      letter,
      word,
    }),
    choices: choicesFor({
      content,
      missionType: candidate.missionType,
      letter,
      word,
    }),
    correctAnswer,
    difficulty: candidate.easy ? 1 : 2,
    orientation: orientationFor(candidate.missionType),
    reward: generatedReward,
    unlockCondition: null,
    active: true,
  };
}
