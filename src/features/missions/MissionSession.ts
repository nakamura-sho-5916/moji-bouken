import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { loadLearningContent } from '../../content/loaders/contentLoader';
import type { ContentMission, LoadedContent, MissionType } from '../../types';
import { LearningEngine } from '../../services/learningService';
import {
  buildMissionViewModel,
  getTargetLetterIds,
} from './utils/buildMissionViewModel';
import {
  createDynamicMission,
  createQuestionSignature,
} from './utils/dynamicMissionFactory';
import { validateMissionAnswer } from './utils/validateMissionAnswer';
import type {
  MissionResult,
  MissionSessionState,
  MissionSubmitResult,
} from './types';

export const STANDARD_SESSION_QUESTION_COUNT = 10;
export const MISSION_SESSION_STORAGE_KEY = 'moji-bouken:mission-session';
export const MISSION_RESULT_STORAGE_KEY = 'moji-bouken:last-mission-result';
export const MISSION_HISTORY_STORAGE_KEY =
  'moji-bouken:recent-question-history';
const RECENT_HISTORY_LIMIT = 20;

function makeSessionId(seed: number) {
  return `mission-session-${seed}-${Date.now()}`;
}

function missionMatchesCandidate(
  mission: ContentMission,
  candidate: { letterId: string; missionType: MissionType },
  content: LoadedContent,
) {
  if (mission.missionType !== candidate.missionType) {
    return false;
  }
  return getTargetLetterIds(content, mission).includes(candidate.letterId);
}

function fallbackMissionForCandidate(
  candidate: { letterId: string; missionType: MissionType },
  content: LoadedContent,
  index: number,
) {
  return (
    content.missions.find((mission) =>
      missionMatchesCandidate(mission, candidate, content),
    ) ??
    content.missions.find(
      (mission) => mission.missionType === candidate.missionType,
    ) ??
    content.missions[index % content.missions.length]
  );
}

function loadRecentQuestionHistory() {
  const raw = localStorage.getItem(MISSION_HISTORY_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as string[];
  } catch {
    localStorage.removeItem(MISSION_HISTORY_STORAGE_KEY);
    return [];
  }
}

function saveRecentQuestionHistory(signatures: string[]) {
  localStorage.setItem(
    MISSION_HISTORY_STORAGE_KEY,
    JSON.stringify(signatures.slice(-RECENT_HISTORY_LIMIT)),
  );
}

function isAnswerableMission(
  mission: ContentMission,
  content: LoadedContent,
  seed: number,
  index: number,
) {
  try {
    buildMissionViewModel({ content, mission, seed: seed + index });
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    return false;
  }
}

function canUseMission(input: {
  mission: ContentMission;
  selected: ContentMission[];
  recentHistory: string[];
}) {
  const signature = createQuestionSignature(input.mission);
  if (input.recentHistory.includes(signature)) {
    return false;
  }
  if (
    input.selected.some(
      (mission) => createQuestionSignature(mission) === signature,
    )
  ) {
    return false;
  }
  const targetKey = input.mission.targetIds.join('+');
  const sameTargetCount = input.selected.filter(
    (mission) => mission.targetIds.join('+') === targetKey,
  ).length;
  if (sameTargetCount >= 2) {
    return false;
  }
  if (targetKey.startsWith('word-') && sameTargetCount >= 1) {
    return false;
  }
  const sameAnswerCount = input.selected.filter(
    (mission) => mission.correctAnswer === input.mission.correctAnswer,
  ).length;
  if (sameAnswerCount >= 2) {
    return false;
  }
  const lastTwo = input.selected.slice(-2);
  if (
    lastTwo.length === 2 &&
    lastTwo.every(
      (mission) => mission.missionType === input.mission.missionType,
    )
  ) {
    return false;
  }
  return true;
}

function selectMissions(input: {
  dynamicMissions: ContentMission[];
  fallbackMissions: ContentMission[];
  content: LoadedContent;
  seed: number;
  count: number;
  recentHistory: string[];
}) {
  const selected: ContentMission[] = [];
  const pools = [
    input.dynamicMissions,
    input.dynamicMissions.filter(
      (mission) =>
        !input.recentHistory.includes(createQuestionSignature(mission)),
    ),
    input.fallbackMissions,
  ];

  for (const pool of pools) {
    for (const mission of pool) {
      if (selected.length >= input.count) {
        break;
      }
      if (
        !isAnswerableMission(
          mission,
          input.content,
          input.seed,
          selected.length,
        )
      ) {
        continue;
      }
      if (
        !canUseMission({
          mission,
          selected,
          recentHistory: input.recentHistory,
        })
      ) {
        continue;
      }
      selected.push(mission);
    }
  }

  if (selected.length < input.count) {
    for (const mission of [
      ...input.dynamicMissions,
      ...input.fallbackMissions,
    ]) {
      if (selected.length >= input.count) {
        break;
      }
      if (
        selected.some(
          (item) =>
            createQuestionSignature(item) === createQuestionSignature(mission),
        )
      ) {
        continue;
      }
      if (
        isAnswerableMission(mission, input.content, input.seed, selected.length)
      ) {
        selected.push(mission);
      }
    }
  }

  return selected.slice(0, input.count);
}

export async function createMissionSession(input?: {
  seed?: number;
  count?: number;
}): Promise<MissionSessionState> {
  const seed = input?.seed ?? Date.now();
  const count = input?.count ?? STANDARD_SESSION_QUESTION_COUNT;
  const content = loadLearningContent();
  const candidates = await LearningEngine.createQuestionCandidates({
    count,
    seed,
  });
  const activeMissions = content.missions.filter((mission) => mission.active);
  const dynamicMissions = candidates
    .map((candidate, index) =>
      createDynamicMission({ candidate, content, seed, index }),
    )
    .filter((mission): mission is ContentMission => Boolean(mission));
  const candidateFallbackMissions = candidates
    .map((candidate, index) =>
      fallbackMissionForCandidate(candidate, content, index),
    )
    .filter((mission): mission is ContentMission => Boolean(mission));
  const useRecentHistory = input?.seed === undefined;
  const recentHistory = useRecentHistory ? loadRecentQuestionHistory() : [];
  const missions = selectMissions({
    dynamicMissions,
    fallbackMissions: [...candidateFallbackMissions, ...activeMissions],
    content,
    seed,
    count,
    recentHistory,
  });
  if (useRecentHistory) {
    saveRecentQuestionHistory([
      ...recentHistory,
      ...missions.map((mission) => createQuestionSignature(mission)),
    ]);
  }

  return {
    sessionId: makeSessionId(seed),
    missions,
    currentIndex: 0,
    results: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'active',
    seed,
  };
}

export function saveMissionSession(session: MissionSessionState) {
  localStorage.setItem(MISSION_SESSION_STORAGE_KEY, JSON.stringify(session));
  if (session.status === 'completed') {
    localStorage.setItem(MISSION_RESULT_STORAGE_KEY, JSON.stringify(session));
  }
}

export function loadMissionSession() {
  const raw = localStorage.getItem(MISSION_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as MissionSessionState;
  } catch {
    localStorage.removeItem(MISSION_SESSION_STORAGE_KEY);
    return null;
  }
}

export function loadLastMissionResult() {
  const raw = localStorage.getItem(MISSION_RESULT_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as MissionSessionState;
  } catch {
    localStorage.removeItem(MISSION_RESULT_STORAGE_KEY);
    return null;
  }
}

export async function submitMissionAnswer(input: {
  session: MissionSessionState;
  answer: string;
  responseTimeMs: number;
  content: LoadedContent;
  firstAttemptRecorded: boolean;
}): Promise<MissionSubmitResult> {
  const mission = input.session.missions[input.session.currentIndex];
  if (!mission) {
    throw new Error('mission is not available');
  }
  const viewModel = buildMissionViewModel({
    content: input.content,
    mission,
    seed: input.session.seed + input.session.currentIndex,
  });
  if (viewModel.unsupported || mission.missionType === 'letter-introduction') {
    return {
      status: 'practice',
      correct: true,
    };
  }
  const correct = validateMissionAnswer(mission, input.answer);
  if (input.firstAttemptRecorded) {
    return {
      status: 'practice',
      correct,
    };
  }
  const targetLetterIds = getTargetLetterIds(input.content, mission);
  const answerId = `${input.session.sessionId}:${mission.missionId}:${input.session.currentIndex}`;
  const learningResult = await LearningEngine.recordAnswer({
    playerId: DEFAULT_PLAYER_ID,
    missionId: mission.missionId,
    targetLetterIds,
    correct,
    responseTimeMs: input.responseTimeMs,
    answeredAt: new Date().toISOString(),
    answerId,
  });
  const result: MissionResult = {
    missionId: mission.missionId,
    missionType: mission.missionType,
    targetLetterIds,
    selectedAnswer: input.answer,
    correctAnswer: mission.correctAnswer,
    correct,
    responseTimeMs: input.responseTimeMs,
    saved: true,
    firstAttemptRecorded: true,
    learningResult,
  };
  return {
    status: 'saved',
    result,
    completed: input.session.currentIndex + 1 >= input.session.missions.length,
  };
}
