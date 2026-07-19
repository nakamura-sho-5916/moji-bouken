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

function toChoices(mission: ContentMission, seed: number): MissionChoice[] {
  return shuffleChoices([...new Set(mission.choices)], seed).map(
    (choice, index) => ({
      id: `${mission.missionId}:choice:${index}:${choice}`,
      label: choice,
      value: choice,
    }),
  );
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

function buildMissingWord(answer: string) {
  const characters = Array.from(answer);
  const blankIndex = Math.min(1, Math.max(0, characters.length - 1));
  return {
    before: characters.slice(0, blankIndex).join(''),
    after: characters.slice(blankIndex + 1).join(''),
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
    choices: toChoices(mission, seed),
    orientation: mission.orientation === 'vertical' ? 'vertical' : 'horizontal',
    illustration: findIllustration(content, mission),
    word: wordTarget?.display,
    missingWord:
      mission.missionType === 'word-completion'
        ? buildMissingWord(mission.correctAnswer)
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
