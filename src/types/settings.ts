import type { EntityId, IsoDateString } from './common';

export type AppSettings = {
  playerId: EntityId;
  bgmEnabled: boolean;
  soundEffectsEnabled: boolean;
  reducedMotion: boolean;
  parentPinConfigured: boolean;
  updatedAt: IsoDateString;
};
