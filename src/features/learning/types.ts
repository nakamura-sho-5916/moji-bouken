import type {
  ContentMission,
  LearningLog,
  LetterProgress,
  ReviewSchedule,
} from '../../types';

export type ReviewStageNumber = 1 | 2 | 3;

export type RewardBonusReason =
  | 'normal-correct'
  | 'speed-improvement'
  | 'weak-letter-progress'
  | 'weak-letter-mastered'
  | 'final-review-completed';

export type RecordAnswerInput = {
  playerId: string;
  missionId: string;
  targetLetterIds: string[];
  correct: boolean;
  responseTimeMs: number;
  answeredAt: string;
  answerId: string;
  completedReviewScheduleId?: string;
};

export type WeakEvaluation = {
  weak: boolean;
  reason: string;
  attempts: number;
  accuracy: number;
};

export type MasteryEvaluation = {
  mastered: boolean;
  weakCleared: boolean;
  reason: string;
};

export type SpeedImprovement = {
  improved: boolean;
  previousTimeMs: number | null;
  currentTimeMs: number;
  improvementMs: number;
  improvementRatio: number;
};

export type RecordAnswerResult = {
  learningLogs: LearningLog[];
  updatedProgress: LetterProgress[];
  weakStatusChanged: boolean;
  masteryStatusChanged: boolean;
  createdReviewSchedules: ReviewSchedule[];
  speedImprovement: SpeedImprovement;
  rewardBonusReasons: RewardBonusReason[];
};

export type QuestionCategory = 'due-review' | 'weak' | 'normal' | 'new';

export type QuestionCandidate = {
  id: string;
  letterId: string;
  sourceContentId: string;
  correctAnswer: string;
  missionType: ContentMission['missionType'];
  category: QuestionCategory;
  easy: boolean;
};

export type QuestionPriorityInput = {
  dueReview: QuestionCandidate[];
  weak: QuestionCandidate[];
  normal: QuestionCandidate[];
  new: QuestionCandidate[];
  count?: number;
  seed?: number;
};
