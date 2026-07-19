import type { EntityId, IsoDateString } from './common';

export type AppSettings = {
  playerId: EntityId;
  bgmEnabled: boolean;
  soundEffectsEnabled: boolean;
  volume: number;
  reducedMotion: boolean;
  fontSize: 'standard' | 'large' | 'extra-large';
  standardQuestionCount: 5 | 10 | 15;
  parentPinConfigured: boolean;
  parentPinHash: string | null;
  parentPinSalt: string | null;
  parentPinFailedAttempts: number;
  parentPinLockUntil: IsoDateString | null;
  updatedAt: IsoDateString;
};
