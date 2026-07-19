import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { initializeAppData } from '../../db/initializeAppData';
import {
  addCompanion,
  addEquipment,
  changeGold,
  getInventory,
  saveInventory,
  updateEquipment,
} from '../../db/repositories/inventoryRepository';
import { getMasteredLetterProgress } from '../../db/repositories/letterProgressRepository';
import { getWorldProgress } from '../../db/repositories/worldProgressRepository';
import {
  discoverCollectionTarget,
  getAlbumEntries,
  getCollectionProgress,
  getCollectionProgressByPlayer,
  saveAlbumEntry,
  saveCollectionProgress,
} from '../../db/repositories/collectionRepository';
import type { AlbumEntry, CollectionProgress } from '../../types';
import { enemies } from '../battle/enemies';
import { companionData } from './companionData';
import { equipmentData, EQUIPMENT_BONUS_LIMITS } from './equipmentData';
import type {
  CompanionData,
  EquipmentData,
  EquipmentType,
  ShopPurchaseResult,
} from './types';

export const SELECTED_COMPANION_TARGET_ID = 'active';
export const SHOP_AREA_ID = 'starting-village';
export const SHOP_OPEN_STAGE = 3;

function nowIso() {
  return new Date().toISOString();
}

function isEquipmentSlot(slot: string): slot is EquipmentType {
  return slot === 'weapon' || slot === 'armor' || slot === 'accessory';
}

async function hasCompanion(playerId: string, companionId: string) {
  const inventory = await getInventory(playerId);
  return Boolean(
    inventory?.companions.some((companion) => companion.id === companionId),
  );
}

export async function isCompanionUnlocked(
  companion: CompanionData,
  playerId = DEFAULT_PLAYER_ID,
) {
  const condition = companion.unlockCondition;
  if (condition.type === 'area-stage') {
    const progress = await getWorldProgress(playerId, condition.areaId);
    return (progress?.recoveryStage ?? 0) >= condition.stage;
  }
  if (condition.type === 'area-unlocked') {
    const progress = await getWorldProgress(playerId, condition.areaId);
    return Boolean(progress?.unlocked);
  }
  if (condition.type === 'weak-mastered') {
    const progress = await getMasteredLetterProgress();
    return (
      progress.filter((letter) => letter.playerId === playerId).length >=
      condition.count
    );
  }
  const progress = await getCollectionProgressByPlayer(playerId);
  return (
    progress.filter(
      (item) => item.category === 'enemy' && item.source === 'normal-victory',
    ).length >= condition.count
  );
}

export async function joinCompanion(
  companionId: string,
  playerId = DEFAULT_PLAYER_ID,
) {
  await initializeAppData();
  const companion = companionData.find((item) => item.id === companionId);
  if (!companion || !(await isCompanionUnlocked(companion, playerId))) {
    return { joined: false, eventShown: false, companion: companion ?? null };
  }

  const alreadyJoined = await hasCompanion(playerId, companionId);
  await addCompanion(playerId, { id: companionId, joinedAt: nowIso() });
  const event = await discoverCollectionTarget({
    playerId,
    category: 'companion',
    targetId: companionId,
    source: 'companion-joined',
  });
  return {
    joined: true,
    eventShown: !alreadyJoined && event.created,
    companion,
  };
}

export async function joinEligibleCompanions(playerId = DEFAULT_PLAYER_ID) {
  const results = [];
  for (const companion of companionData) {
    if (await isCompanionUnlocked(companion, playerId)) {
      results.push(await joinCompanion(companion.id, playerId));
    }
  }
  return results;
}

export async function selectCompanion(
  companionId: string,
  playerId = DEFAULT_PLAYER_ID,
) {
  const inventory = await getInventory(playerId);
  const joined = inventory?.companions.some(
    (companion) => companion.id === companionId,
  );
  if (!joined) {
    return false;
  }
  await discoverCollectionTarget({
    playerId,
    category: 'selected-companion',
    targetId: SELECTED_COMPANION_TARGET_ID,
    source: companionId,
  });
  const progress = await getCollectionProgress(
    playerId,
    'selected-companion',
    SELECTED_COMPANION_TARGET_ID,
  );
  if (progress) {
    await saveCollectionProgress({ ...progress, source: companionId });
  }
  return true;
}

export async function getSelectedCompanion(playerId = DEFAULT_PLAYER_ID) {
  const progress = await getCollectionProgress(
    playerId,
    'selected-companion',
    SELECTED_COMPANION_TARGET_ID,
  );
  return (
    companionData.find((companion) => companion.id === progress?.source) ?? null
  );
}

export async function isEquipmentUnlocked(
  equipment: EquipmentData,
  playerId = DEFAULT_PLAYER_ID,
) {
  const condition = equipment.unlockCondition;
  if (condition.type === 'always') {
    return true;
  }
  if (condition.type === 'area-stage') {
    const progress = await getWorldProgress(playerId, condition.areaId);
    return (progress?.recoveryStage ?? 0) >= condition.stage;
  }
  if (condition.type === 'area-unlocked') {
    const progress = await getWorldProgress(playerId, condition.areaId);
    return Boolean(progress?.unlocked);
  }
  if (condition.type === 'companion-joined') {
    return hasCompanion(playerId, condition.companionId);
  }
  const progress = await getCollectionProgressByPlayer(playerId);
  return (
    progress.filter(
      (item) => item.category === 'enemy' && item.source === 'boss',
    ).length >= condition.count
  );
}

export async function isShopOpen(playerId = DEFAULT_PLAYER_ID) {
  const progress = await getWorldProgress(playerId, SHOP_AREA_ID);
  return (progress?.recoveryStage ?? 0) >= SHOP_OPEN_STAGE;
}

export async function purchaseEquipment(
  equipmentId: string,
  playerId = DEFAULT_PLAYER_ID,
): Promise<ShopPurchaseResult> {
  await initializeAppData();
  if (!(await isShopOpen(playerId))) {
    return { status: 'not-open', message: 'おみせは まだ じゅんびちゅうだよ' };
  }

  const equipment = equipmentData.find((item) => item.id === equipmentId);
  if (!equipment) {
    return { status: 'missing-item', message: 'みつけられなかったよ' };
  }
  const inventory = await getInventory(playerId);
  if (!inventory) {
    return { status: 'missing-item', message: 'もちものを よめなかったよ' };
  }
  if (inventory.equipment.some((item) => item.id === equipment.id)) {
    return { status: 'already-owned', message: 'もう もっているよ' };
  }
  if (inventory.gold < equipment.price) {
    return {
      status: 'not-enough-gold',
      message: 'もうすこし ぼうけんすると てにいれられるよ',
    };
  }

  await changeGold(playerId, -equipment.price);
  await addEquipment(playerId, { id: equipment.id, slot: equipment.type });
  await discoverCollectionTarget({
    playerId,
    category: 'shop-purchase',
    targetId: equipment.id,
    source: 'shop',
  });
  return { status: 'purchased', message: 'てにいれたよ' };
}

export async function equipItem(
  equipmentId: string,
  playerId = DEFAULT_PLAYER_ID,
) {
  const equipment = equipmentData.find((item) => item.id === equipmentId);
  const inventory = await getInventory(playerId);
  if (!equipment || !inventory) {
    return false;
  }
  const owned = inventory.equipment.some((item) => item.id === equipmentId);
  if (!owned) {
    return false;
  }
  const next = [
    ...inventory.equipment.filter(
      (item) => !isEquipmentSlot(item.slot) || item.slot !== equipment.type,
    ),
    { id: equipment.id, slot: equipment.type },
  ];
  await updateEquipment(playerId, next);
  return true;
}

export function clampEquipmentBonus(equipment: EquipmentData) {
  return {
    attackBonus: Math.min(
      equipment.attackBonus,
      EQUIPMENT_BONUS_LIMITS.attackBonus,
    ),
    rewardBonus: Math.min(
      equipment.rewardBonus,
      EQUIPMENT_BONUS_LIMITS.rewardBonus,
    ),
  };
}

export async function discoverLetterOrWord(input: {
  category: Extract<
    CollectionProgress['category'],
    'hiragana' | 'katakana' | 'word'
  >;
  targetId: string;
  source: string;
  playerId?: string;
}) {
  return discoverCollectionTarget({
    playerId: input.playerId ?? DEFAULT_PLAYER_ID,
    category: input.category,
    targetId: input.targetId,
    source: input.source,
  });
}

export async function recordEnemyEncounter(input: {
  enemyId: string;
  source: 'encounter' | 'normal-victory' | 'boss';
  playerId?: string;
}) {
  return discoverCollectionTarget({
    playerId: input.playerId ?? DEFAULT_PLAYER_ID,
    category: 'enemy',
    targetId: input.enemyId,
    source: input.source,
  });
}

export async function recordAlbumEvent(
  entry: Omit<AlbumEntry, 'playerId' | 'unlockedAt' | 'active'> & {
    playerId?: string;
    unlockedAt?: string;
  },
) {
  return saveAlbumEntry({
    ...entry,
    playerId: entry.playerId ?? DEFAULT_PLAYER_ID,
    unlockedAt: entry.unlockedAt ?? nowIso(),
    active: true,
  });
}

export async function getCollectionState(playerId = DEFAULT_PLAYER_ID) {
  await initializeAppData();
  const [inventory, progress, albumEntries, selectedCompanion] =
    await Promise.all([
      getInventory(playerId),
      getCollectionProgressByPlayer(playerId),
      getAlbumEntries(playerId),
      getSelectedCompanion(playerId),
    ]);
  return {
    inventory,
    progress,
    albumEntries,
    selectedCompanion,
    companions: companionData,
    equipment: equipmentData,
    enemies,
  };
}

export async function addDebugGold(
  amount: number,
  playerId = DEFAULT_PLAYER_ID,
) {
  await initializeAppData();
  return changeGold(playerId, amount);
}

export async function resetDebugCollectionData(playerId = DEFAULT_PLAYER_ID) {
  const inventory = await getInventory(playerId);
  if (inventory) {
    await saveInventory({
      ...inventory,
      gold: 0,
      equipment: [],
      companions: [],
      updatedAt: nowIso(),
    });
  }
}
