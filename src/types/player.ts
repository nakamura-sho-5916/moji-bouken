import type { EntityId, IsoDateString } from './common';

export type Player = {
  id: EntityId;
  name: string;
  level: number;
  experience: number;
  gold: number;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};
