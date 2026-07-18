import { DEFAULT_PLAYER_ID } from '../constants';
import { openMojiBoukenDb } from '../database';
import type { AppSettings } from '../../types';

export function createInitialAppSettings(
  now = new Date().toISOString(),
): AppSettings {
  return {
    playerId: DEFAULT_PLAYER_ID,
    bgmEnabled: true,
    soundEffectsEnabled: true,
    reducedMotion: false,
    parentPinConfigured: false,
    updatedAt: now,
  };
}

export async function saveAppSettings(settings: AppSettings) {
  const db = await openMojiBoukenDb();
  await db.put('settings', settings);
  return settings;
}

export async function getAppSettings(playerId: string) {
  const db = await openMojiBoukenDb();
  return db.get('settings', playerId);
}

export async function updateAppSettings(
  playerId: string,
  patch: Partial<Omit<AppSettings, 'playerId' | 'updatedAt'>>,
) {
  const settings = await getAppSettings(playerId);

  if (!settings) {
    return undefined;
  }

  return saveAppSettings({
    ...settings,
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}
