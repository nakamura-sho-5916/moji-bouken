import { STARTING_AREA_ID } from './constants';
import { openMojiBoukenDb } from './database';
import {
  ensureSaveSlots,
  getActivePlayerId,
} from './repositories/saveSlotRepository';
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
  await ensureSaveSlots();
  const now = new Date().toISOString();
  const playerId = getActivePlayerId();
  const player =
    (await getPlayerById(playerId)) ??
    (await createPlayerIfMissing(createInitialPlayer(now, playerId)));

  const worldProgress =
    (await getWorldProgress(playerId, STARTING_AREA_ID)) ??
    (await saveWorldProgress(createInitialWorldProgress(now, playerId)));

  const inventory =
    (await getInventory(playerId)) ??
    (await saveInventory(createInitialInventory(now, playerId)));

  const settings =
    (await getAppSettings(playerId)) ??
    (await saveAppSettings(createInitialAppSettings(now, playerId)));

  return { player, worldProgress, inventory, settings };
}
