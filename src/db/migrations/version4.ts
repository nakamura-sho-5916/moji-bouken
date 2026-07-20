import type { IDBPTransaction } from 'idb';
import type { MojiBoukenDbSchema } from '../schema';

export function migrateToVersion4(
  transaction: IDBPTransaction<
    MojiBoukenDbSchema,
    ['settings'],
    'versionchange'
  >,
) {
  void updateSettingsStore(transaction);
}

async function updateSettingsStore(
  transaction: IDBPTransaction<
    MojiBoukenDbSchema,
    ['settings'],
    'versionchange'
  >,
) {
  const store = transaction.objectStore('settings');
  let cursor = await store.openCursor();

  while (cursor) {
    const settings = cursor.value;
    await cursor.update({
      ...settings,
      masterVolume: settings.masterVolume ?? settings.volume ?? 70,
      bgmVolume: settings.bgmVolume ?? 45,
      soundEffectVolume: settings.soundEffectVolume ?? settings.volume ?? 70,
      muteAll: settings.muteAll ?? false,
      lastAudioEnabledAt: settings.lastAudioEnabledAt ?? null,
    });
    cursor = await cursor.continue();
  }
}
