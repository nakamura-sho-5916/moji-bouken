import type { EntityId, IsoDateString } from './common';

export type CollectionProgress = {
  id: EntityId;
  playerId: EntityId;
  category:
    | 'hiragana'
    | 'katakana'
    | 'word'
    | 'companion'
    | 'enemy'
    | 'selected-companion'
    | 'shop-purchase';
  targetId: EntityId;
  discoveredAt: IsoDateString;
  source: string;
};

export type AlbumEntry = {
  eventId: EntityId;
  playerId: EntityId;
  areaId: EntityId;
  title: string;
  description: string;
  beforeVisual: string;
  afterVisual: string;
  unlockedAt: IsoDateString;
  order: number;
  active: boolean;
};
