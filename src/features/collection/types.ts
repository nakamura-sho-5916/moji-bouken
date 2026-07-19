import type { MissionType } from '../../types';

export type CompanionUnlockCondition =
  | { type: 'area-stage'; areaId: string; stage: number }
  | { type: 'area-unlocked'; areaId: string }
  | { type: 'weak-mastered'; count: number }
  | { type: 'normal-victories'; count: number };

export type CompanionData = {
  id: string;
  name: string;
  species: string;
  description: string;
  skillId: CompanionSkillId;
  skillName: string;
  skillDescription: string;
  preferredMissionTypes: MissionType[];
  unlockCondition: CompanionUnlockCondition;
  imageId: string;
  active: boolean;
};

export type CompanionSkillId =
  | 'reduce-choice'
  | 'illustration-hint'
  | 'word-candidate-sort'
  | 'gentle-review'
  | 'bonus-gold';

export type CompanionSkillInput = {
  skillId: CompanionSkillId;
  missionType: MissionType;
  choices: string[];
  correctAnswer: string;
  usedCount: number;
  maxUses: number;
};

export type CompanionSkillResult = {
  activated: boolean;
  message: string;
  choices: string[];
  correctAnswer: string;
  usedCount: number;
};

export type EquipmentType = 'weapon' | 'armor' | 'accessory';

export type EquipmentUnlockCondition =
  | { type: 'always' }
  | { type: 'area-stage'; areaId: string; stage: number }
  | { type: 'area-unlocked'; areaId: string }
  | { type: 'companion-joined'; companionId: string }
  | { type: 'boss-defeated'; count: number };

export type EquipmentData = {
  id: string;
  name: string;
  type: EquipmentType;
  description: string;
  price: number;
  unlockCondition: EquipmentUnlockCondition;
  imageId: string;
  cosmeticStyle: string;
  attackBonus: number;
  rewardBonus: number;
  active: boolean;
};

export type ShopPurchaseResult =
  | { status: 'purchased'; message: string }
  | { status: 'already-owned'; message: string }
  | { status: 'not-open'; message: string }
  | { status: 'not-enough-gold'; message: string }
  | { status: 'missing-item'; message: string };
