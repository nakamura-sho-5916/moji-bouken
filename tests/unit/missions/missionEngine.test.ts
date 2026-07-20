import { beforeEach, describe, expect, it } from 'vitest';
import { loadLearningContent } from '../../../src/content/loaders/contentLoader';
import { DEFAULT_PLAYER_ID } from '../../../src/db/constants';
import { initializeAppData } from '../../../src/db/initializeAppData';
import { LearningEngine } from '../../../src/features/learning';
import {
  buildMissionViewModel,
  createMissionSession,
  submitMissionAnswer,
  validateMissionAnswer,
} from '../../../src/features/missions';
import { resetIndexedDb } from '../dbTestUtils';

describe('mission engine', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetIndexedDb();
    await initializeAppData();
  });

  it('builds a view model for every mission type', () => {
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

  it('shows a safe fallback for unsupported boss-mixed missions', () => {
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
    expect(viewModel.prompt).not.toHaveLength(0);
  });

  it('validates mission answers', () => {
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

  it('stores only the first answer attempt in learning logs', async () => {
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

  it('creates deterministic 10-mission sessions with a seed', async () => {
    const session1 = await createMissionSession({ seed: 123, count: 10 });
    const session2 = await createMissionSession({ seed: 123, count: 10 });

    expect(session1.missions).toHaveLength(10);
    expect(session2.missions.map((mission) => mission.missionId)).toEqual(
      session1.missions.map((mission) => mission.missionId),
    );
  });

  it('choice missions always include exactly one correct answer', () => {
    const content = loadLearningContent();

    for (const mission of content.missions) {
      const viewModel = buildMissionViewModel({ content, mission, seed: 5916 });
      const values = viewModel.choices.map((choice) => choice.value);

      expect(viewModel.choices).toHaveLength(4);
      expect(new Set(values).size).toBe(4);
      expect(values).toContain(mission.correctAnswer);
      expect(viewModel.choices.filter((choice) => choice.correct)).toHaveLength(
        1,
      );
    }
  });

  it('choice generation keeps the correct answer invariant for 1000 seeds', () => {
    const content = loadLearningContent();

    for (let seed = 1; seed <= 1000; seed += 1) {
      for (const mission of content.missions) {
        const viewModel = buildMissionViewModel({ content, mission, seed });
        const values = viewModel.choices.map((choice) => choice.value);

        expect(viewModel.choices).toHaveLength(4);
        expect(new Set(values).size).toBe(4);
        expect(values).toContain(mission.correctAnswer);
        expect(
          viewModel.choices.filter((choice) => choice.correct),
        ).toHaveLength(1);
      }
    }
  });
});
