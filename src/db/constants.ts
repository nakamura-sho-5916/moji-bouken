export const DB_NAME = 'moji-bouken-db';
export const DB_VERSION = 5;
export const DEFAULT_PLAYER_ID = 'save-slot-1';
export const LEGACY_PLAYER_ID = 'default-player';
export const STARTING_AREA_ID = 'starting-village';

export const OBJECT_STORES = [
  'players',
  'learningLogs',
  'letterProgress',
  'reviewSchedules',
  'worldProgress',
  'inventories',
  'settings',
  'collectionProgress',
  'albumEntries',
  'saveSlots',
] as const;
