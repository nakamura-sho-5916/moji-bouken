import type { EntityId } from './common';

export type ScriptType = 'hiragana' | 'katakana';
export type MissionType =
  | 'letter-introduction'
  | 'letter-search'
  | 'similar-letter-choice'
  | 'illustration-letter-choice'
  | 'illustration-word-choice'
  | 'word-completion'
  | 'word-ordering'
  | 'vertical-reading'
  | 'horizontal-reading'
  | 'text-search'
  | 'boss-mixed';

export type MissionOrientation = 'horizontal' | 'vertical' | 'adaptive';

export type ContentLetter = {
  id: EntityId;
  character: string;
  scriptType: ScriptType;
  row: string;
  order: number;
  active: boolean;
  variants: string[];
  relatedLetterId: EntityId | null;
};

export type ContentWord = {
  id: EntityId;
  display: string;
  reading: string;
  scriptType: ScriptType;
  letterIds: EntityId[];
  category: string;
  difficulty: number;
  illustrationId: EntityId;
  verticalAllowed: boolean;
  horizontalAllowed: boolean;
  active: boolean;
};

export type IllustrationReference = {
  id: EntityId;
  assetPath: string;
  altText: string;
  category: string;
  fallbackText: string;
};

export type SimilarLetterGroup = {
  id: EntityId;
  scriptType: ScriptType;
  letterIds: EntityId[];
  difficulty: number;
  note: string;
};

export type MissionReward = {
  experience: number;
  gold: number;
};

export type ContentMission = {
  missionId: EntityId;
  missionType: MissionType;
  targetIds: EntityId[];
  prompt: string;
  choices: string[];
  correctAnswer: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  orientation: MissionOrientation;
  reward: MissionReward;
  unlockCondition: Record<string, unknown> | null;
  active: boolean;
};

export type ContentValidationIssue = {
  fileName: string;
  targetId: string;
  reason: string;
};

export type LoadedContent = {
  hiragana: ContentLetter[];
  katakana: ContentLetter[];
  words: ContentWord[];
  illustrations: IllustrationReference[];
  similarLetters: SimilarLetterGroup[];
  missions: ContentMission[];
  validationIssues: ContentValidationIssue[];
};
