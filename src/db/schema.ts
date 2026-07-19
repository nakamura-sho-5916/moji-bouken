import type { DBSchema } from 'idb';
import type {
  AppSettings,
  AlbumEntry,
  CollectionProgress,
  Inventory,
  LearningLog,
  LetterProgress,
  Player,
  ReviewSchedule,
  WorldProgress,
} from '../types';

export type MojiBoukenDbSchema = DBSchema & {
  players: {
    key: string;
    value: Player;
  };
  learningLogs: {
    key: string;
    value: LearningLog;
    indexes: {
      'by-player': string;
      'by-letter': string;
      'by-mission': string;
      'by-answered-at': string;
    };
  };
  letterProgress: {
    key: string;
    value: LetterProgress;
    indexes: {
      'by-player': string;
      'by-letter': string;
      'by-weak-flag': number;
      'by-mastered-flag': number;
    };
  };
  reviewSchedules: {
    key: string;
    value: ReviewSchedule;
    indexes: {
      'by-player': string;
      'by-letter': string;
      'by-scheduled-date': string;
      'by-completed': boolean;
    };
  };
  worldProgress: {
    key: string;
    value: WorldProgress;
    indexes: {
      'by-player': string;
      'by-area': string;
    };
  };
  inventories: {
    key: string;
    value: Inventory;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  collectionProgress: {
    key: string;
    value: CollectionProgress;
    indexes: {
      'by-player': string;
      'by-category': string;
      'by-target': string;
    };
  };
  albumEntries: {
    key: string;
    value: AlbumEntry;
    indexes: {
      'by-player': string;
      'by-area': string;
      'by-unlocked-at': string;
    };
  };
};
