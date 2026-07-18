import { DEFAULT_PLAYER_ID } from '../constants';
import { openMojiBoukenDb } from '../database';
import type {
  Companion,
  Equipment,
  Inventory,
  InventoryItem,
} from '../../types';

export function createInitialInventory(
  now = new Date().toISOString(),
): Inventory {
  return {
    playerId: DEFAULT_PLAYER_ID,
    gold: 0,
    items: [],
    equipment: [],
    companions: [],
    updatedAt: now,
  };
}

export async function saveInventory(inventory: Inventory) {
  const db = await openMojiBoukenDb();
  await db.put('inventories', inventory);
  return inventory;
}

export async function getInventory(playerId: string) {
  const db = await openMojiBoukenDb();
  return db.get('inventories', playerId);
}

export async function changeGold(playerId: string, amount: number) {
  const inventory = await getInventory(playerId);

  if (!inventory) {
    return undefined;
  }

  const nextGold = inventory.gold + amount;

  if (nextGold < 0) {
    throw new Error('所持金が不足しています。');
  }

  return saveInventory({
    ...inventory,
    gold: nextGold,
    updatedAt: new Date().toISOString(),
  });
}

export async function addItem(playerId: string, item: InventoryItem) {
  const inventory = await getInventory(playerId);

  if (!inventory) {
    return undefined;
  }

  const existing = inventory.items.find((current) => current.id === item.id);
  const items = existing
    ? inventory.items.map((current) =>
        current.id === item.id
          ? { ...current, count: current.count + item.count }
          : current,
      )
    : [...inventory.items, item];

  return saveInventory({
    ...inventory,
    items,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateEquipment(
  playerId: string,
  equipment: Equipment[],
) {
  const inventory = await getInventory(playerId);

  if (!inventory) {
    return undefined;
  }

  return saveInventory({
    ...inventory,
    equipment,
    updatedAt: new Date().toISOString(),
  });
}

export async function addCompanion(playerId: string, companion: Companion) {
  const inventory = await getInventory(playerId);

  if (!inventory) {
    return undefined;
  }

  const companions = inventory.companions.some(
    (current) => current.id === companion.id,
  )
    ? inventory.companions
    : [...inventory.companions, companion];

  return saveInventory({
    ...inventory,
    companions,
    updatedAt: new Date().toISOString(),
  });
}
