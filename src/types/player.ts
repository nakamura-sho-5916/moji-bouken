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

export type SaveSlot = {
  id: 'slot-1' | 'slot-2' | 'slot-3';
  playerId: EntityId;
  name: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  lastPlayedAt: IsoDateString | null;
  playTimeMs: number;
  migratedFromLegacy: boolean;
};
