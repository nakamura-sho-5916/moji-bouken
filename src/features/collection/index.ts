export { companionData } from './companionData';
export {
  COMPANION_SUPPORT_MAX_PER_BATTLE,
  COMPANION_SUPPORT_RATE,
  evaluateCompanionBattleSupport,
  getCompanionSupportDefinition,
  type CompanionSupportEvent,
  type CompanionSupportSkill,
} from './companionBattleSupport';
export {
  getCompanionBattleStat,
  loadCompanionBattleStats,
  recordCompanionSupportEvent,
  resetCompanionBattleStats,
  type CompanionBattleStat,
} from './companionBattleStats';
export { applyCompanionSkill } from './companionSkills';
export { equipmentData, EQUIPMENT_BONUS_LIMITS } from './equipmentData';
export {
  addDebugGold,
  clampEquipmentBonus,
  discoverLetterOrWord,
  equipItem,
  getCollectionState,
  getSelectedCompanion,
  isCompanionUnlocked,
  isEquipmentUnlocked,
  isShopOpen,
  joinCompanion,
  joinEligibleCompanions,
  purchaseEquipment,
  recordAlbumEvent,
  recordEnemyEncounter,
  resetDebugCollectionData,
  selectCompanion,
  SHOP_AREA_ID,
  SHOP_OPEN_STAGE,
} from './CollectionEngine';
export type {
  CompanionData,
  CompanionSkillId,
  CompanionSkillInput,
  CompanionSkillResult,
  CompanionUnlockCondition,
  EquipmentData,
  EquipmentType,
  EquipmentUnlockCondition,
  ShopPurchaseResult,
} from './types';
