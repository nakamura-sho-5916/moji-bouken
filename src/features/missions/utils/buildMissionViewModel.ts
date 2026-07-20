import type {
  ContentLetter,
  ContentMission,
  ContentWord,
  LoadedContent,
} from '../../../types';
import type {
  MissionChoice,
  MissionIllustration,
  MissionViewModel,
  TextSearchUnit,
} from '../types';
import { shuffleChoices } from './shuffleChoices';

function findLetter(content: LoadedContent, id: string) {
  return [...content.hiragana, ...content.katakana].find(
    (letter) => letter.id === id,
  );
}

function findWord(content: LoadedContent, id: string) {
  return content.words.find((word) => word.id === id);
}

function getPrimaryTarget(
  content: LoadedContent,
  mission: ContentMission,
): ContentLetter | ContentWord | undefined {
  const targetId = mission.targetIds[0] ?? '';
  return findLetter(content, targetId) ?? findWord(content, targetId);
}

function getTextTarget(
  content: LoadedContent,
  mission: ContentMission,
): string {
  const target = getPrimaryTarget(content, mission);
  if (!target) {
    return mission.correctAnswer;
  }
  return 'character' in target ? target.character : target.display;
}

function uniqueValues(values: string[]) {
  return [...new Set(values.filter((value) => value.length > 0))];
}

function getChoicePool(content: LoadedContent, mission: ContentMission) {
  const answerLength = Array.from(mission.correctAnswer).length;
  if (answerLength === 1) {
    const allLetters = [...content.hiragana, ...content.katakana];
    const answerLetter = allLetters.find(
      (letter) => letter.character === mission.correctAnswer,
    );
    const scriptLetters = answerLetter
      ? allLetters.filter(
          (letter) => letter.scriptType === answerLetter.scriptType,
        )
      : allLetters;
    return uniqueValues([
      ...scriptLetters.map((letter) => letter.character),
      ...mission.choices,
    ]);
  }

  return uniqueValues([
    ...content.words.map((word) => word.display),
    ...mission.choices,
  ]);
}

function assertGeneratedChoices(choices: MissionChoice[]) {
  const values = choices.map((choice) => choice.value);
  const uniqueCount = new Set(values).size;
  const correctCount = choices.filter((choice) => choice.correct).length;
  if (choices.length !== 4 || uniqueCount !== 4 || correctCount !== 1) {
    throw new Error(
      `Invalid mission choices: length=${choices.length}, unique=${uniqueCount}, correct=${correctCount}`,
    );
  }
}

function toChoices(
  content: LoadedContent,
  mission: ContentMission,
  seed: number,
): MissionChoice[] {
  if (mission.missionType === 'word-ordering') {
    return shuffleChoices(Array.from(mission.correctAnswer), seed).map(
      (choice, index) => ({
        id: `${mission.missionId}:ordering:${index}:${choice}`,
        label: choice,
        value: choice,
        correct: false,
      }),
    );
  }

  const wrongChoices = shuffleChoices(
    getChoicePool(content, mission).filter(
      (choice) => choice !== mission.correctAnswer,
    ),
    seed + 101,
  ).slice(0, 3);

  if (wrongChoices.length !== 3) {
    throw new Error(
      `Mission ${mission.missionId} does not have enough wrong choices.`,
    );
  }

  const choiceValues = shuffleChoices(
    [mission.correctAnswer, ...wrongChoices],
    seed,
  );
  const choices = choiceValues.map((choice, index) => ({
    id: `${mission.missionId}:choice:${index}:${choice}`,
    label: choice,
    value: choice,
    correct: choice === mission.correctAnswer,
  }));

  assertGeneratedChoices(choices);
  return choices;
}

function findIllustration(
  content: LoadedContent,
  mission: ContentMission,
): MissionIllustration | undefined {
  const word = mission.targetIds
    .map((targetId) => findWord(content, targetId))
    .find((item): item is ContentWord => Boolean(item));
  const illustration = content.illustrations.find(
    (item) => item.id === word?.illustrationId,
  );
  if (!illustration) {
    return undefined;
  }
  return {
    assetPath: illustration.assetPath,
    altText: illustration.altText,
    fallbackText: illustration.fallbackText,
  };
}

function findAnswerIndex(word: string[], answer: string[]) {
  return word.findIndex((_, index) =>
    answer.every((character, offset) => word[index + offset] === character),
  );
}

function buildMissingWord(answer: string, word: string | undefined) {
  const characters = Array.from(word ?? answer);
  const answerCharacters = Array.from(answer);
  const blankIndex = findAnswerIndex(characters, answerCharacters);
  if (blankIndex < 0) {
    throw new Error(`Cannot build missing word for answer: ${answer}`);
  }

  return {
    before: characters.slice(0, blankIndex).join(''),
    after: characters.slice(blankIndex + answerCharacters.length).join(''),
    blankIndex,
  };
}

function buildTextSearchUnits(mission: ContentMission): TextSearchUnit[] {
  const units =
    mission.choices.length > 0 ? mission.choices : [mission.correctAnswer];
  return units.map((unit, index) => ({
    id: `${mission.missionId}:text:${index}`,
    label: unit,
    value: unit,
  }));
}

function titleForMission(mission: ContentMission) {
  const titles: Record<ContentMission['missionType'], string> = {
    'letter-introduction': 'もじをみよう',
    'letter-search': 'もじをさがそう',
    'similar-letter-choice': 'にているもじ',
    'illustration-letter-choice': 'えからもじ',
    'illustration-word-choice': 'えからことば',
    'word-completion': 'ことばをつくろう',
    'word-ordering': 'ならべてつくろう',
    'vertical-reading': 'たてによもう',
    'horizontal-reading': 'よこによもう',
    'text-search': 'ぶんからさがそう',
    'boss-mixed': 'じゅんびちゅう',
  };
  return titles[mission.missionType];
}

export function getTargetLetterIds(
  content: LoadedContent,
  mission: ContentMission,
) {
  return [
    ...new Set(
      mission.targetIds.flatMap((targetId) => {
        const letter = findLetter(content, targetId);
        if (letter) {
          return [letter.id];
        }
        return findWord(content, targetId)?.letterIds ?? [];
      }),
    ),
  ];
}

export function buildMissionViewModel(input: {
  content: LoadedContent;
  mission: ContentMission;
  seed?: number;
}): MissionViewModel {
  const { content, mission } = input;
  const seed = input.seed ?? 1;
  const targetText = getTextTarget(content, mission);
  const wordTarget = mission.targetIds
    .map((targetId) => findWord(content, targetId))
    .find((item): item is ContentWord => Boolean(item));
  const unsupported = mission.missionType === 'boss-mixed';

  return {
    mission,
    title: titleForMission(mission),
    prompt: unsupported
      ? 'この ミッションは じゅんびちゅうだよ。'
      : mission.prompt,
    targetText,
    choices: toChoices(content, mission, seed),
    orientation: mission.orientation === 'vertical' ? 'vertical' : 'horizontal',
    illustration: findIllustration(content, mission),
    word: wordTarget?.display,
    missingWord:
      mission.missionType === 'word-completion'
        ? buildMissingWord(mission.correctAnswer, wordTarget?.display)
        : undefined,
    orderedSlots:
      mission.missionType === 'word-ordering'
        ? Array.from(mission.correctAnswer)
        : undefined,
    textSearchUnits:
      mission.missionType === 'text-search'
        ? buildTextSearchUnits(mission)
        : undefined,
    unsupported,
  };
}
