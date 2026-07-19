import type { EntityId, IsoDateString } from './common';

export type InventoryItem = {
  id: EntityId;
  count: number;
};

export type Equipment = {
  id: EntityId;
  slot: 'weapon' | 'armor' | 'accessory' | 'tool' | 'badge' | 'companion-item';
};

export type Companion = {
  id: EntityId;
  joinedAt: IsoDateString;
};

export type Inventory = {
  playerId: EntityId;
  gold: number;
  items: InventoryItem[];
  equipment: Equipment[];
  companions: Companion[];
  updatedAt: IsoDateString;
};
