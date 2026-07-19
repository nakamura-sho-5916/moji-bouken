import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAYER_ID } from '../../../src/db/constants';
import { initializeAppData } from '../../../src/db/initializeAppData';
import { loadLearningContent } from '../../../src/content/loaders/contentLoader';
import {
  buildMissionViewModel,
  createMissionSession,
  submitMissionAnswer,
  validateMissionAnswer,
} from '../../../src/features/missions';
import { LearningEngine } from '../../../src/features/learning';
import { resetIndexedDb } from '../dbTestUtils';

describe('mission engine', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetIndexedDb();
    await initializeAppData();
  });

  it('missionTypeに応じた表示モデルを作る', () => {
    const content = loadLearningContent();

    for (const mission of content.missions) {
      const viewModel = buildMissionViewModel({ content, mission, seed: 1 });

      expect(viewModel.title).not.toHaveLength(0);
      expect(viewModel.prompt).not.toHaveLength(0);
      if (mission.missionType !== 'letter-introduction') {
        expect(viewModel.choices.length).toBeGreaterThan(0);
      }
    }
  });

  it('未知扱いのboss-mixedは安全な代替表示になる', () => {
    const content = loadLearningContent();
    const mission = content.missions.find(
      (item) => item.missionType === 'boss-mixed',
    );

    expect(mission).toBeDefined();
    if (!mission) {
      return;
    }

    const viewModel = buildMissionViewModel({ content, mission, seed: 1 });

    expect(viewModel.unsupported).toBe(true);
    expect(viewModel.prompt).toContain('じゅんびちゅう');
  });

  it('回答を判定できる', () => {
    const content = loadLearningContent();
    const mission = content.missions.find(
      (item) => item.missionType === 'letter-search',
    );

    expect(mission).toBeDefined();
    if (!mission) {
      return;
    }

    expect(validateMissionAnswer(mission, mission.correctAnswer)).toBe(true);
    expect(validateMissionAnswer(mission, 'not-correct')).toBe(false);
  });

  it('初回回答だけをLearningLogへ保存し、再挑戦は練習扱いにする', async () => {
    const content = loadLearningContent();
    const mission = content.missions.find(
      (item) => item.missionType === 'letter-search',
    );

    expect(mission).toBeDefined();
    if (!mission) {
      return;
    }

    const session = {
      sessionId: 'test-session',
      missions: [mission],
      currentIndex: 0,
      results: [],
      startedAt: '2026-07-19T10:00:00.000Z',
      completedAt: null,
      status: 'active' as const,
      seed: 1,
    };
    const first = await submitMissionAnswer({
      session,
      answer: 'not-correct',
      responseTimeMs: 1200,
      content,
      firstAttemptRecorded: false,
    });
    const second = await submitMissionAnswer({
      session,
      answer: mission.correctAnswer,
      responseTimeMs: 800,
      content,
      firstAttemptRecorded: true,
    });
    const state = await LearningEngine.getLearningDebugState();

    expect(first.status).toBe('saved');
    expect(second.status).toBe('practice');
    expect(state.learningLogs).toHaveLength(1);
    expect(state.learningLogs[0]?.playerId).toBe(DEFAULT_PLAYER_ID);
  });

  it('標準10問セッションをseed付きで生成する', async () => {
    const session1 = await createMissionSession({ seed: 123, count: 10 });
    const session2 = await createMissionSession({ seed: 123, count: 10 });

    expect(session1.missions).toHaveLength(10);
    expect(session2.missions.map((mission) => mission.missionId)).toEqual(
      session1.missions.map((mission) => mission.missionId),
    );
  });
});
