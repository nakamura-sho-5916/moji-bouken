import type { AreaUnlockResult, AreaViewModel, WorldArea } from './types';

export function evaluateAreaUnlock(
  area: WorldArea,
  progressByAreaId: Map<
    string,
    Pick<AreaViewModel, 'unlocked' | 'recoveryStage'>
  >,
): AreaUnlockResult {
  if (area.initiallyUnlocked) {
    return {
      areaId: area.id,
      unlocked: true,
      reason: 'はじめから いけるよ',
    };
  }

  const previous = area.requiredPreviousAreaId
    ? progressByAreaId.get(area.requiredPreviousAreaId)
    : null;
  const unlocked = Boolean(
    previous?.unlocked && previous.recoveryStage >= area.requiredRecoveryStage,
  );

  return {
    areaId: area.id,
    unlocked,
    reason: unlocked ? 'みちが つながったよ' : 'まえの ばしょを げんきにしよう',
  };
}
