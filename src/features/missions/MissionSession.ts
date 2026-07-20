import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { loadLearningContent } from '../../content/loaders/contentLoader';
import type { ContentMission, LoadedContent, MissionType } from '../../types';
import { LearningEngine } from '../../services/learningService';
import {
  buildMissionViewModel,
  getTargetLetterIds,
} from './utils/buildMissionViewModel';
import { validateMissionAnswer } from './utils/validateMissionAnswer';
import type {
  MissionResult,
  MissionSessionState,
  MissionSubmitResult,
} from './types';

export const STANDARD_SESSION_QUESTION_COUNT = 10;
export const MISSION_SESSION_STORAGE_KEY = 'moji-bouken:mission-session';
export const MISSION_RESULT_STORAGE_KEY = 'moji-bouken:last-mission-result';

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
  const selected = candidates.map((candidate, index) =>
    fallbackMissionForCandidate(candidate, content, index),
  );
  const missions = [...selected, ...activeMissions]
    .filter((mission): mission is ContentMission => Boolean(mission))
    .filter((mission, index) =>
      isAnswerableMission(mission, content, seed, index),
    )
    .filter((mission, index, all) => {
      const firstIndex = all.findIndex(
        (item) => item.missionId === mission.missionId,
      );
      return firstIndex === index || selected.length < count;
    })
    .slice(0, count);

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
