import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { initializeAppData } from '../../db/initializeAppData';
import {
  createWorldProgressId,
  getWorldProgress,
  getWorldProgressList,
  saveWorldProgress,
} from '../../db/repositories/worldProgressRepository';
import type { WorldProgress } from '../../types';
import { worldAreas } from './areaData';
import { calculateRecoveryPoints } from './calculateRecoveryPoints';
import { calculateRecoveryStage } from './calculateRecoveryStage';
import { WORLD_EVENT_IDS, WORLD_RECOVERY_STORAGE_KEY } from './constants';
import { evaluateAreaUnlock } from './evaluateAreaUnlock';
import { worldNpcs } from './npcData';
import type {
  AreaViewModel,
  RecoveryEvent,
  WorldAreaId,
  WorldRecoveryInput,
  WorldRecoveryResult,
} from './types';

type RecoveryPointStore = Record<string, number>;

function readRecoveryPointStore(): RecoveryPointStore {
  const raw = localStorage.getItem(WORLD_RECOVERY_STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as RecoveryPointStore;
  } catch {
    localStorage.removeItem(WORLD_RECOVERY_STORAGE_KEY);
    return {};
  }
}

function writeRecoveryPointStore(store: RecoveryPointStore) {
  localStorage.setItem(WORLD_RECOVERY_STORAGE_KEY, JSON.stringify(store));
}

function createProgress(input: {
  playerId: string;
  areaId: WorldAreaId;
  unlocked: boolean;
}): WorldProgress {
  const now = new Date().toISOString();
  return {
    id: createWorldProgressId(input.playerId, input.areaId),
    playerId: input.playerId,
    areaId: input.areaId,
    unlocked: input.unlocked,
    recoveryStage: 0,
    unlockedEvents: [],
    updatedAt: now,
  };
}

async function ensureAreaProgress(playerId: string) {
  await initializeAppData();
  const existing = await getWorldProgressList(playerId);
  const byAreaId = new Map(
    existing.map((progress) => [progress.areaId, progress]),
  );
  const ensured: WorldProgress[] = [];

  for (const area of worldAreas) {
    const current = byAreaId.get(area.id);
    if (current) {
      ensured.push(current);
      continue;
    }
    const progress = await saveWorldProgress(
      createProgress({
        playerId,
        areaId: area.id,
        unlocked: area.initiallyUnlocked,
      }),
    );
    ensured.push(progress);
  }

  return ensured;
}

function buildViewModels(
  playerId: string,
  progressList: WorldProgress[],
): AreaViewModel[] {
  const pointStore = readRecoveryPointStore();
  const progressByAreaId = new Map(
    progressList.map((progress) => [
      progress.areaId,
      {
        unlocked: progress.unlocked,
        recoveryStage: progress.recoveryStage,
      },
    ]),
  );

  return worldAreas.map((area) => {
    const progress =
      progressList.find((item) => item.areaId === area.id) ??
      createProgress({
        playerId,
        areaId: area.id,
        unlocked: area.initiallyUnlocked,
      });
    const unlock = evaluateAreaUnlock(area, progressByAreaId);
    const recoveryPoints = pointStore[area.id] ?? 0;
    const recoveryStage = Math.max(
      progress.recoveryStage,
      calculateRecoveryStage(recoveryPoints),
    );
    return {
      area,
      unlocked: progress.unlocked || unlock.unlocked,
      recoveryStage,
      recoveryPoints,
      unlockedEvents: progress.unlockedEvents,
      availableNpc: worldNpcs.filter(
        (npc) =>
          npc.areaId === area.id && recoveryStage >= npc.requiredRecoveryStage,
      ),
    };
  });
}

function createRecoveryEvents(input: {
  areaId: WorldAreaId;
  previousStage: number;
  nextStage: number;
  unlockedEvents: string[];
}): RecoveryEvent[] {
  if (input.nextStage <= input.previousStage) {
    return [];
  }

  const events: RecoveryEvent[] = [];
  if (
    input.nextStage >= 1 &&
    !input.unlockedEvents.includes(WORLD_EVENT_IDS.natureReturned)
  ) {
    events.push({
      id: WORLD_EVENT_IDS.natureReturned,
      areaId: input.areaId,
      title: 'いろが もどったよ',
      message: 'くさや きが すこし げんきに なったよ',
    });
  }
  if (
    input.nextStage >= 2 &&
    !input.unlockedEvents.includes(WORLD_EVENT_IDS.shopOpened)
  ) {
    events.push({
      id: WORLD_EVENT_IDS.shopOpened,
      areaId: input.areaId,
      title: 'おみせが ひらいたよ',
      message: 'まちの ひとが あつまってきたよ',
    });
  }
  if (
    input.nextStage >= 3 &&
    !input.unlockedEvents.includes(WORLD_EVENT_IDS.bridgeRepaired)
  ) {
    events.push({
      id: WORLD_EVENT_IDS.bridgeRepaired,
      areaId: input.areaId,
      title: 'はしが なおったよ',
      message: 'あたらしい ばしょへ すすめるよ',
    });
  }
  if (
    input.nextStage >= 4 &&
    !input.unlockedEvents.includes(WORLD_EVENT_IDS.npcJoined)
  ) {
    events.push({
      id: WORLD_EVENT_IDS.npcJoined,
      areaId: input.areaId,
      title: 'なかまが ふえたよ',
      message: 'いっしょに ぼうけんする こえが きこえるよ',
    });
  }
  return events;
}

async function unlockEligibleAreas(
  playerId: string,
  progressList: WorldProgress[],
) {
  const viewModels = buildViewModels(playerId, progressList);
  const byAreaId = new Map(
    viewModels.map((area) => [
      area.area.id,
      { unlocked: area.unlocked, recoveryStage: area.recoveryStage },
    ]),
  );
  const unlockedAreaIds: WorldAreaId[] = [];

  for (const area of worldAreas) {
    const result = evaluateAreaUnlock(area, byAreaId);
    const progress = progressList.find((item) => item.areaId === area.id);
    if (result.unlocked && progress && !progress.unlocked) {
      await saveWorldProgress({
        ...progress,
        unlocked: true,
        updatedAt: new Date().toISOString(),
      });
      unlockedAreaIds.push(area.id);
    }
  }

  return unlockedAreaIds;
}

export const WorldRecoveryEngine = {
  async getWorldState(playerId = DEFAULT_PLAYER_ID) {
    const progressList = await ensureAreaProgress(playerId);
    await unlockEligibleAreas(playerId, progressList);
    const refreshed = await getWorldProgressList(playerId);
    return buildViewModels(playerId, refreshed).sort(
      (a, b) => a.area.order - b.area.order,
    );
  },

  async applyRecovery(
    input: WorldRecoveryInput,
    playerId = DEFAULT_PLAYER_ID,
  ): Promise<WorldRecoveryResult | null> {
    const area = worldAreas.find((item) => item.id === input.areaId);
    if (!area) {
      return null;
    }

    await ensureAreaProgress(playerId);
    const progress = await getWorldProgress(playerId, area.id);
    if (!progress) {
      return null;
    }

    const rewardEventId = `reward:${input.battleId}`;
    const alreadyApplied = progress.unlockedEvents.includes(rewardEventId);
    if (alreadyApplied) {
      const store = readRecoveryPointStore();
      return {
        areaId: area.id,
        pointsAdded: 0,
        totalPoints: store[area.id] ?? 0,
        previousStage: progress.recoveryStage,
        nextStage: progress.recoveryStage,
        triggeredEvents: [],
        unlockedAreaIds: [],
        alreadyApplied: true,
      };
    }

    const store = readRecoveryPointStore();
    const previousPoints = store[area.id] ?? 0;
    const pointsAdded = calculateRecoveryPoints(input);
    const totalPoints = previousPoints + pointsAdded;
    const nextStage = calculateRecoveryStage(totalPoints);
    const previousStage = progress.recoveryStage;
    const triggeredEvents = createRecoveryEvents({
      areaId: area.id,
      previousStage,
      nextStage,
      unlockedEvents: progress.unlockedEvents,
    });
    const unlockedEvents = [
      ...new Set([
        ...progress.unlockedEvents,
        rewardEventId,
        ...triggeredEvents.map((event) => event.id),
      ]),
    ];

    store[area.id] = totalPoints;
    writeRecoveryPointStore(store);
    await saveWorldProgress({
      ...progress,
      recoveryStage: Math.max(progress.recoveryStage, nextStage),
      unlockedEvents,
      updatedAt: new Date().toISOString(),
    });

    const refreshedProgressList = await getWorldProgressList(playerId);
    const unlockedAreaIds = await unlockEligibleAreas(
      playerId,
      refreshedProgressList,
    );
    return {
      areaId: area.id,
      pointsAdded,
      totalPoints,
      previousStage,
      nextStage,
      triggeredEvents,
      unlockedAreaIds,
      alreadyApplied: false,
    };
  },
};
