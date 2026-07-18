import { DEFAULT_PLAYER_ID, STARTING_AREA_ID } from './constants';
import { openMojiBoukenDb } from './database';
import {
  createInitialPlayer,
  createPlayerIfMissing,
  getPlayerById,
} from './repositories/playerRepository';
import {
  createInitialWorldProgress,
  getWorldProgress,
  saveWorldProgress,
} from './repositories/worldProgressRepository';
import {
  createInitialInventory,
  getInventory,
  saveInventory,
} from './repositories/inventoryRepository';
import {
  createInitialAppSettings,
  getAppSettings,
  saveAppSettings,
} from './repositories/settingsRepository';

export type InitialAppData = {
  player: Awaited<ReturnType<typeof createPlayerIfMissing>>;
  worldProgress: NonNullable<Awaited<ReturnType<typeof getWorldProgress>>>;
  inventory: NonNullable<Awaited<ReturnType<typeof getInventory>>>;
  settings: NonNullable<Awaited<ReturnType<typeof getAppSettings>>>;
};

export async function initializeAppData(): Promise<InitialAppData> {
  await openMojiBoukenDb();
  const now = new Date().toISOString();
  const player =
    (await getPlayerById(DEFAULT_PLAYER_ID)) ??
    (await createPlayerIfMissing(createInitialPlayer(now)));

  const worldProgress =
    (await getWorldProgress(DEFAULT_PLAYER_ID, STARTING_AREA_ID)) ??
    (await saveWorldProgress(createInitialWorldProgress(now)));

  const inventory =
    (await getInventory(DEFAULT_PLAYER_ID)) ??
    (await saveInventory(createInitialInventory(now)));

  const settings =
    (await getAppSettings(DEFAULT_PLAYER_ID)) ??
    (await saveAppSettings(createInitialAppSettings(now)));

  return { player, worldProgress, inventory, settings };
}
