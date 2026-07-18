import type { EntityId, IsoDateString, KanaKind } from './common';

export type Letter = {
  id: EntityId;
  character: string;
  kind: KanaKind;
  reading: string;
};

export type Word = {
  id: EntityId;
  text: string;
  reading: string;
  letters: EntityId[];
  meaning: string;
};

export type Mission = {
  id: EntityId;
  title: string;
  targetLetters: EntityId[];
  kind: 'find-shape' | 'match-meaning' | 'combine' | 'express';
};

export type LearningLog = {
  id: EntityId;
  playerId: EntityId;
  missionId: EntityId;
  targetLetter: EntityId;
  correct: boolean;
  responseTimeMs: number;
  answeredAt: IsoDateString;
};

export type LetterProgress = {
  id: EntityId;
  playerId: EntityId;
  letterId: EntityId;
  attempts: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  averageResponseTimeMs: number;
  lastResponseTimeMs: number;
  consecutiveCorrect: number;
  weakFlag: boolean;
  weakFlagIndex?: 0 | 1;
  masteredFlag: boolean;
  masteredFlagIndex?: 0 | 1;
  lastAnsweredAt: IsoDateString | null;
  updatedAt: IsoDateString;
};

export type ReviewStage = 'next-day' | 'three-days' | 'seven-days';

export type ReviewSchedule = {
  id: EntityId;
  playerId: EntityId;
  letterId: EntityId;
  reviewStage: ReviewStage;
  scheduledDate: IsoDateString;
  completed: boolean;
  completedAt: IsoDateString | null;
  updatedAt: IsoDateString;
};
