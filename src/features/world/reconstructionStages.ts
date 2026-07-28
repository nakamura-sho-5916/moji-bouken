export type TownReconstructionKind = 'nature' | 'building' | 'npc';

export type TownReconstructionStep = {
  stage: number;
  threshold: number;
  title: string;
  detail: string;
  kind: TownReconstructionKind;
  icon: string;
  residents: string[];
};

export const TOWN_RECONSTRUCTION_STEPS: TownReconstructionStep[] = [
  {
    stage: 0,
    threshold: 0,
    title: '草だけ',
    detail: 'まちに みどりが のこっているよ',
    kind: 'nature',
    icon: '草',
    residents: [],
  },
  {
    stage: 1,
    threshold: 5,
    title: '家の土台',
    detail: '小さな家の 土台ができた！',
    kind: 'building',
    icon: '土',
    residents: ['子ども'],
  },
  {
    stage: 2,
    threshold: 10,
    title: '家完成',
    detail: 'あたたかい家が 完成！',
    kind: 'building',
    icon: '家',
    residents: ['子ども'],
  },
  {
    stage: 3,
    threshold: 15,
    title: '木追加',
    detail: '広場に木が 生えた！',
    kind: 'nature',
    icon: '木',
    residents: ['子ども', '老人'],
  },
  {
    stage: 4,
    threshold: 20,
    title: '橋完成',
    detail: '橋が完成！',
    kind: 'building',
    icon: '橋',
    residents: ['子ども', '老人'],
  },
  {
    stage: 5,
    threshold: 25,
    title: '宿屋完成',
    detail: '宿屋が完成！',
    kind: 'building',
    icon: '宿',
    residents: ['子ども', '老人', '旅人'],
  },
  {
    stage: 6,
    threshold: 30,
    title: '住人追加',
    detail: '住人が増えた！',
    kind: 'npc',
    icon: '人',
    residents: ['子ども', '老人', '旅人', '犬'],
  },
  {
    stage: 7,
    threshold: 35,
    title: '市場完成',
    detail: '市場が完成！',
    kind: 'building',
    icon: '市',
    residents: ['子ども', '老人', '旅人', '犬', '商人'],
  },
  {
    stage: 8,
    threshold: 40,
    title: '噴水完成',
    detail: '噴水が完成！',
    kind: 'building',
    icon: '泉',
    residents: ['子ども', '老人', '旅人', '犬', '商人', '兵士'],
  },
  {
    stage: 9,
    threshold: 45,
    title: '教会完成',
    detail: '教会が完成！',
    kind: 'building',
    icon: '教',
    residents: ['子ども', '老人', '旅人', '犬', '商人', '兵士'],
  },
  {
    stage: 10,
    threshold: 50,
    title: '城完成',
    detail: '城が完成！',
    kind: 'building',
    icon: '城',
    residents: ['子ども', '老人', '旅人', '犬', '商人', '兵士', '王さま'],
  },
];

export const MAX_TOWN_RECONSTRUCTION_STAGE =
  TOWN_RECONSTRUCTION_STEPS.length - 1;

export const MAX_TOWN_RECONSTRUCTION_POINTS =
  TOWN_RECONSTRUCTION_STEPS[MAX_TOWN_RECONSTRUCTION_STAGE]?.threshold ?? 1;

export function getTownReconstructionStep(stage: number) {
  const index = Math.min(
    MAX_TOWN_RECONSTRUCTION_STAGE,
    Math.max(0, Math.floor(stage)),
  );
  return TOWN_RECONSTRUCTION_STEPS[index] ?? TOWN_RECONSTRUCTION_STEPS[0];
}

export function calculateTownReconstructionStage(points: number) {
  for (let stage = MAX_TOWN_RECONSTRUCTION_STAGE; stage >= 0; stage -= 1) {
    const step = TOWN_RECONSTRUCTION_STEPS[stage];
    if (step && points >= step.threshold) {
      return stage;
    }
  }
  return 0;
}

export function calculateTownReconstructionPercent(points: number) {
  return Math.min(
    100,
    Math.max(0, Math.round((points / MAX_TOWN_RECONSTRUCTION_POINTS) * 100)),
  );
}

export function getPointsToNextTownStage(points: number) {
  const currentStage = calculateTownReconstructionStage(points);
  const nextStep = TOWN_RECONSTRUCTION_STEPS[currentStage + 1];
  if (!nextStep) {
    return 0;
  }
  return Math.max(0, nextStep.threshold - points);
}
