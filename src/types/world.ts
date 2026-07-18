import type { EntityId, IsoDateString } from './common';

export type WorldProgress = {
  id: EntityId;
  playerId: EntityId;
  areaId: EntityId;
  unlocked: boolean;
  recoveryStage: number;
  unlockedEvents: EntityId[];
  updatedAt: IsoDateString;
};
