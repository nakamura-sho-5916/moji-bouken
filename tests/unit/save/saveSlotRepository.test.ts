import { beforeEach, describe, expect, it } from 'vitest';
import { initializeAppData } from '../../../src/db/initializeAppData';
import { openMojiBoukenDb } from '../../../src/db/database';
import {
  addDebugGold,
  getCollectionState,
} from '../../../src/features/collection';
import {
  copySaveSlot,
  deleteSaveSlot,
  getActivePlayerId,
  listSaveSlotSummaries,
  renameSaveSlot,
  setActiveSaveSlot,
  startSaveSlot,
} from '../../../src/db/repositories/saveSlotRepository';
import { getInventory } from '../../../src/db/repositories/inventoryRepository';
import {
  getPlayerById,
  updatePlayer,
} from '../../../src/db/repositories/playerRepository';
import {
  createInitialWorldProgress,
  createWorldProgressId,
  saveWorldProgress,
} from '../../../src/db/repositories/worldProgressRepository';
import { resetIndexedDb } from '../dbTestUtils';

async function readStoreCounts(playerId: string) {
  const db = await openMojiBoukenDb();
  const [
    player,
    inventory,
    settings,
    learningLogs,
    letterProgress,
    reviewSchedules,
    worldProgress,
    collectionProgress,
    albumEntries,
  ] = await Promise.all([
    db.get('players', playerId),
    db.get('inventories', playerId),
    db.get('settings', playerId),
    db.getAllFromIndex('learningLogs', 'by-player', playerId),
    db.getAllFromIndex('letterProgress', 'by-player', playerId),
    db.getAllFromIndex('reviewSchedules', 'by-player', playerId),
    db.getAllFromIndex('worldProgress', 'by-player', playerId),
    db.getAllFromIndex('collectionProgress', 'by-player', playerId),
    db.getAllFromIndex('albumEntries', 'by-player', playerId),
  ]);
  return {
    players: player ? 1 : 0,
    inventories: inventory ? 1 : 0,
    settings: settings ? 1 : 0,
    learningLogs: learningLogs.length,
    letterProgress: letterProgress.length,
    reviewSchedules: reviewSchedules.length,
    worldProgress: worldProgress.length,
    collectionProgress: collectionProgress.length,
    albumEntries: albumEntries.length,
  };
}

describe('saveSlotRepository', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetIndexedDb();
    await initializeAppData();
    setActiveSaveSlot('slot-1');
  });

  it('creates three save slots and starts slot data', async () => {
    const slots = await listSaveSlotSummaries();
    expect(slots).toHaveLength(3);

    await startSaveSlot('slot-2');

    expect(getActivePlayerId()).toBe('save-slot-2');
    expect(await getInventory('save-slot-2')).toMatchObject({
      playerId: 'save-slot-2',
    });
  });

  it('renames, copies, and deletes a save slot', async () => {
    await startSaveSlot('slot-1');
    await addDebugGold(77);
    await renameSaveSlot('slot-1', 'テストぼうけん');
    await copySaveSlot('slot-1', 'slot-2');

    expect((await getInventory('save-slot-2'))?.gold).toBe(77);
    expect(
      (await listSaveSlotSummaries()).find((slot) => slot.id === 'slot-2')
        ?.name,
    ).toContain('コピー');

    await deleteSaveSlot('slot-2');
    expect(await getInventory('save-slot-2')).toBeUndefined();
    expect(
      (await listSaveSlotSummaries()).find((slot) => slot.id === 'slot-2')
        ?.empty,
    ).toBe(true);
  });

  it('keeps collection state scoped to the selected slot', async () => {
    await startSaveSlot('slot-1');
    await addDebugGold(12);
    await startSaveSlot('slot-3');

    const state = await getCollectionState();
    expect(state.inventory?.playerId).toBe('save-slot-3');
    expect(state.inventory?.gold).toBe(0);
  });

  it('keeps EXP, Gold, world, and collection data separated by slot', async () => {
    await startSaveSlot('slot-1');
    await updatePlayer('save-slot-1', { experience: 90, level: 4 });
    await addDebugGold(33);

    await startSaveSlot('slot-2');
    const now = new Date().toISOString();
    await saveWorldProgress({
      ...createInitialWorldProgress(now, 'save-slot-2'),
      id: createWorldProgressId('save-slot-2', 'starting-village'),
      recoveryStage: 5,
    });

    expect((await getPlayerById('save-slot-2'))?.experience).toBe(0);
    expect((await getInventory('save-slot-2'))?.gold).toBe(0);
    expect((await getPlayerById('save-slot-1'))?.experience).toBe(90);
    expect((await getInventory('save-slot-1'))?.gold).toBe(33);

    await startSaveSlot('slot-1');
    const db = await openMojiBoukenDb();
    const slotOneWorld = await db.get(
      'worldProgress',
      createWorldProgressId('save-slot-1', 'starting-village'),
    );
    const slotTwoWorld = await db.get(
      'worldProgress',
      createWorldProgressId('save-slot-2', 'starting-village'),
    );
    expect(slotOneWorld?.recoveryStage).toBe(0);
    expect(slotTwoWorld?.recoveryStage).toBe(5);
  });

  it('lets copied slots diverge without changing the source', async () => {
    await startSaveSlot('slot-1');
    await updatePlayer('save-slot-1', { experience: 40, level: 2 });
    await addDebugGold(20);
    await copySaveSlot('slot-1', 'slot-2');

    await startSaveSlot('slot-2');
    await updatePlayer('save-slot-2', { experience: 120, level: 5 });
    await addDebugGold(10);

    expect((await getPlayerById('save-slot-1'))?.experience).toBe(40);
    expect((await getPlayerById('save-slot-2'))?.experience).toBe(120);
    expect((await getInventory('save-slot-1'))?.gold).toBe(20);
    expect((await getInventory('save-slot-2'))?.gold).toBe(30);
  });

  it('deletes only the target slot and keeps other store counts intact', async () => {
    await startSaveSlot('slot-1');
    await startSaveSlot('slot-2');
    await startSaveSlot('slot-3');
    const beforeSlotOne = await readStoreCounts('save-slot-1');
    const beforeSlotThree = await readStoreCounts('save-slot-3');

    await deleteSaveSlot('slot-2');
    await deleteSaveSlot('slot-2');

    expect(await getInventory('save-slot-2')).toBeUndefined();
    expect(await readStoreCounts('save-slot-1')).toEqual(beforeSlotOne);
    expect(await readStoreCounts('save-slot-3')).toEqual(beforeSlotThree);

    await deleteSaveSlot('slot-1');
    await deleteSaveSlot('slot-3');
    await startSaveSlot('slot-1');
    expect(await getInventory('save-slot-1')).toMatchObject({
      playerId: 'save-slot-1',
    });
  });
});
