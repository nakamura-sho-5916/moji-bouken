import { beforeEach, describe, expect, it } from 'vitest';
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

describe('saveSlotRepository', () => {
  beforeEach(() => {
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
});
