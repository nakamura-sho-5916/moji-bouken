import type { ContentMission, LoadedContent, MissionType } from '../../types';
import type { RecordAnswerResult } from '../learning';

export type MissionStatus =
  'ready' | 'active' | 'saving' | 'completed' | 'error';

export type MissionAnswerState = 'unanswered' | 'correct' | 'incorrect';

export type MissionViewModel = {
  mission: ContentMission;
  title: string;
  prompt: string;
  targetText: string;
  choices: MissionChoice[];
  orientation: 'horizontal' | 'vertical';
  illustration?: MissionIllustration;
  word?: string;
  missingWord?: MissingWordViewModel;
  orderedSlots?: string[];
  textSearchUnits?: TextSearchUnit[];
  unsupported: boolean;
};

export type MissionChoice = {
  id: string;
  label: string;
  value: string;
};

export type MissionIllustration = {
  assetPath: string;
  altText: string;
  fallbackText: string;
};

export type MissingWordViewModel = {
  before: string;
  after: string;
  blankIndex: number;
};

export type TextSearchUnit = {
  id: string;
  label: string;
  value: string;
};

export type MissionResult = {
  missionId: string;
  missionType: MissionType;
  targetLetterIds: string[];
  selectedAnswer: string;
  correctAnswer: string;
  correct: boolean;
  responseTimeMs: number;
  saved: boolean;
  firstAttemptRecorded: boolean;
  learningResult: RecordAnswerResult | null;
};

export type MissionSessionState = {
  sessionId: string;
  missions: ContentMission[];
  currentIndex: number;
  results: MissionResult[];
  startedAt: string;
  completedAt: string | null;
  status: MissionStatus;
  seed: number;
};

export type MissionSessionSnapshot = {
  session: MissionSessionState;
  content: LoadedContent;
};

export type MissionSessionAction =
  | { type: 'start'; session: MissionSessionState }
  | { type: 'activate' }
  | { type: 'saving' }
  | { type: 'answer-saved'; result: MissionResult }
  | { type: 'retry-practice' }
  | { type: 'complete'; completedAt: string }
  | { type: 'error' };

export type MissionSubmitResult =
  | { status: 'saved'; result: MissionResult; completed: boolean }
  | { status: 'practice'; correct: boolean };
