import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAYER_ID } from '../../../src/db/constants';
import { initializeAppData } from '../../../src/db/initializeAppData';
import {
  changeGold,
  getInventory,
} from '../../../src/db/repositories/inventoryRepository';
import {
  createWorldProgressId,
  saveWorldProgress,
} from '../../../src/db/repositories/worldProgressRepository';
import {
  companionData,
  applyCompanionSkill,
  clampEquipmentBonus,
  discoverLetterOrWord,
  equipmentData,
  equipItem,
  getCollectionState,
  isShopOpen,
  joinCompanion,
  purchaseEquipment,
  recordAlbumEvent,
  recordEnemyEncounter,
  selectCompanion,
} from '../../../src/features/collection';
import { enemies } from '../../../src/features/battle/enemies';
import { DB_VERSION, OBJECT_STORES } from '../../../src/db/constants';
import { getObjectStoreNames } from '../../../src/db/database';
import { resetIndexedDb } from '../dbTestUtils';

async function setVillageStage(stage: number) {
  await saveWorldProgress({
    id: createWorldProgressId(DEFAULT_PLAYER_ID, 'starting-village'),
    playerId: DEFAULT_PLAYER_ID,
    areaId: 'starting-village',
    unlocked: true,
    recoveryStage: stage,
    unlockedEvents: [],
    updatedAt: new Date().toISOString(),
  });
}

describe('collection phase', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetIndexedDb();
    await initializeAppData();
  });

  it('仲間データがデータ駆動で定義されている', () => {
    const ids = new Set(companionData.map((companion) => companion.id));

    expect(companionData.length).toBeGreaterThanOrEqual(5);
    expect(ids.size).toBe(companionData.length);
    expect(companionData.every((companion) => companion.skillId)).toBe(true);
    expect(
      companionData.every(
        (companion) => companion.preferredMissionTypes.length > 0,
      ),
    ).toBe(true);
    expect(companionData.every((companion) => companion.unlockCondition)).toBe(
      true,
    );
  });

  it('条件達成で仲間が加入し、重複加入と二重イベントを防ぐ', async () => {
    const locked = await joinCompanion('rabbit');
    await setVillageStage(1);
    const first = await joinCompanion('rabbit');
    const second = await joinCompanion('rabbit');
    const inventory = await getInventory(DEFAULT_PLAYER_ID);
    const state = await getCollectionState();

    expect(locked.joined).toBe(false);
    expect(first.joined).toBe(true);
    expect(first.eventShown).toBe(true);
    expect(second.eventShown).toBe(false);
    expect(
      inventory?.companions.filter((companion) => companion.id === 'rabbit'),
    ).toHaveLength(1);
    expect(
      state.progress.filter(
        (item) => item.category === 'companion' && item.targetId === 'rabbit',
      ),
    ).toHaveLength(1);
  });

  it('加入済み仲間だけを1体選択して保存する', async () => {
    expect(await selectCompanion('rabbit')).toBe(false);
    await setVillageStage(1);
    await joinCompanion('rabbit');
    expect(await selectCompanion('rabbit')).toBe(true);
    const state = await getCollectionState();

    expect(state.selectedCompanion?.id).toBe('rabbit');
  });

  it('仲間スキルは支援だけを行い、正解は書き換えず回数制限する', () => {
    const first = applyCompanionSkill({
      skillId: 'reduce-choice',
      missionType: 'letter-search',
      choices: ['あ', 'い', 'う'],
      correctAnswer: 'あ',
      usedCount: 0,
      maxUses: 1,
    });
    const second = applyCompanionSkill({
      skillId: 'reduce-choice',
      missionType: 'letter-search',
      choices: first.choices,
      correctAnswer: first.correctAnswer,
      usedCount: first.usedCount,
      maxUses: 1,
    });
    const unsupported = applyCompanionSkill({
      skillId: 'illustration-hint',
      missionType: 'text-search',
      choices: ['あ', 'い'],
      correctAnswer: 'あ',
      usedCount: 0,
      maxUses: 1,
    });

    expect(first.activated).toBe(true);
    expect(first.choices).toHaveLength(2);
    expect(first.correctAnswer).toBe('あ');
    expect(second.activated).toBe(false);
    expect(unsupported.activated).toBe(false);
  });

  it('装備データ、所持判定、装備保存、補正上限を確認する', async () => {
    const ids = new Set(equipmentData.map((equipment) => equipment.id));
    const byType = (type: string) =>
      equipmentData.filter((equipment) => equipment.type === type);
    const equipment = equipmentData[0];
    if (!equipment) {
      throw new Error('equipment data is empty');
    }

    expect(byType('weapon').length).toBeGreaterThanOrEqual(3);
    expect(byType('armor').length).toBeGreaterThanOrEqual(3);
    expect(byType('accessory').length).toBeGreaterThanOrEqual(3);
    expect(ids.size).toBe(equipmentData.length);
    expect(await equipItem(equipment.id)).toBe(false);
    await setVillageStage(3);
    await changeGold(DEFAULT_PLAYER_ID, 100);
    await purchaseEquipment(equipment.id);
    expect(await equipItem(equipment.id)).toBe(true);
    const inventory = await getInventory(DEFAULT_PLAYER_ID);

    expect(inventory?.equipment.some((item) => item.id === equipment.id)).toBe(
      true,
    );
    expect(clampEquipmentBonus(equipment).attackBonus).toBeLessThanOrEqual(5);
    expect(clampEquipmentBonus(equipment).rewardBonus).toBeLessThanOrEqual(3);
  });

  it('ショップ開店、購入、不足案内、二重購入防止を行う', async () => {
    const equipment = equipmentData[0];
    if (!equipment) {
      throw new Error('equipment data is empty');
    }

    expect(await isShopOpen()).toBe(false);
    expect((await purchaseEquipment(equipment.id)).status).toBe('not-open');
    await setVillageStage(3);
    expect(await isShopOpen()).toBe(true);
    expect((await purchaseEquipment(equipment.id)).status).toBe(
      'not-enough-gold',
    );
    await changeGold(DEFAULT_PLAYER_ID, equipment.price);
    expect((await purchaseEquipment(equipment.id)).status).toBe('purchased');
    expect((await purchaseEquipment(equipment.id)).status).toBe(
      'already-owned',
    );
    const inventory = await getInventory(DEFAULT_PLAYER_ID);

    expect(inventory?.gold).toBe(0);
    expect(
      inventory?.equipment.filter((item) => item.id === equipment.id),
    ).toHaveLength(1);
  });

  it('ことば、仲間、敵図鑑とアルバムは重複保存しない', async () => {
    await discoverLetterOrWord({
      category: 'hiragana',
      targetId: 'hiragana-a',
      source: 'test',
    });
    await discoverLetterOrWord({
      category: 'hiragana',
      targetId: 'hiragana-a',
      source: 'test',
    });
    await discoverLetterOrWord({
      category: 'katakana',
      targetId: 'katakana-a',
      source: 'test',
    });
    await discoverLetterOrWord({
      category: 'word',
      targetId: 'word-ari',
      source: 'test',
    });
    await recordEnemyEncounter({
      enemyId: enemies[0]?.id ?? 'enemy-moji-slime',
      source: 'encounter',
    });
    await recordEnemyEncounter({
      enemyId: enemies[0]?.id ?? 'enemy-moji-slime',
      source: 'encounter',
    });
    await recordAlbumEvent({
      eventId: 'bridge-repaired-test',
      areaId: 'starting-village',
      title: 'はしが なおった！',
      description: 'ことばの森へ いけるようになったよ',
      beforeVisual: '🪵',
      afterVisual: '🌉',
      order: 1,
      unlockedAt: '2026-01-02T00:00:00.000Z',
    });
    await recordAlbumEvent({
      eventId: 'bridge-repaired-test',
      areaId: 'starting-village',
      title: 'はしが なおった！',
      description: 'ことばの森へ いけるようになったよ',
      beforeVisual: '🪵',
      afterVisual: '🌉',
      order: 1,
      unlockedAt: '2026-01-03T00:00:00.000Z',
    });
    const state = await getCollectionState();

    expect(
      state.progress.filter((item) => item.category === 'hiragana'),
    ).toHaveLength(1);
    expect(
      state.progress.filter((item) => item.category === 'katakana'),
    ).toHaveLength(1);
    expect(
      state.progress.filter((item) => item.category === 'word'),
    ).toHaveLength(1);
    expect(
      state.progress.filter((item) => item.category === 'enemy'),
    ).toHaveLength(1);
    expect(state.albumEntries).toHaveLength(1);
    expect(state.albumEntries[0]?.beforeVisual).toBe('🪵');
    expect(state.albumEntries[0]?.afterVisual).toBe('🌉');
  });

  it('DB migration v2で新ストアが追加される', async () => {
    const stores = await getObjectStoreNames();

    expect(DB_VERSION).toBe(2);
    expect(stores.sort()).toEqual([...OBJECT_STORES].sort());
    expect(stores).toContain('collectionProgress');
    expect(stores).toContain('albumEntries');
  });
});
