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

const fourChoiceMissionTypes = new Set([
  'letter-search',
  'similar-letter-choice',
  'illustration-letter-choice',
  'illustration-word-choice',
  'word-completion',
  'vertical-reading',
  'horizontal-reading',
]);

function getCorrectPosition(input: {
  choices: { value: string }[];
  correctAnswer: string;
}) {
  return input.choices.findIndex(
    (choice) =>
      choice.value.normalize('NFC') === input.correctAnswer.normalize('NFC'),
  );
}

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

    for (const mission of content.missions.filter((item) =>
      fourChoiceMissionTypes.has(item.missionType),
    )) {
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
    const positionCounts = [0, 0, 0, 0];
    let unavailableCount = 0;
    let zeroCorrectCount = 0;
    let multipleCorrectCount = 0;
    let duplicateChoiceCount = 0;

    for (let seed = 1; seed <= 1000; seed += 1) {
      for (const mission of content.missions.filter((item) =>
        fourChoiceMissionTypes.has(item.missionType),
      )) {
        const viewModel = buildMissionViewModel({ content, mission, seed });
        const values = viewModel.choices.map((choice) => choice.value);
        const correctValueCount = values.filter(
          (value) =>
            value.normalize('NFC') === mission.correctAnswer.normalize('NFC'),
        ).length;
        const position = getCorrectPosition({
          choices: viewModel.choices,
          correctAnswer: mission.correctAnswer,
        });

        unavailableCount += position < 0 ? 1 : 0;
        zeroCorrectCount += correctValueCount === 0 ? 1 : 0;
        multipleCorrectCount += correctValueCount > 1 ? 1 : 0;
        duplicateChoiceCount += new Set(values).size !== values.length ? 1 : 0;
        if (position >= 0) {
          positionCounts[position] += 1;
        }
      }
    }

    const total = positionCounts.reduce((sum, count) => sum + count, 0);
    expect(unavailableCount).toBe(0);
    expect(zeroCorrectCount).toBe(0);
    expect(multipleCorrectCount).toBe(0);
    expect(duplicateChoiceCount).toBe(0);
    expect(positionCounts.every((count) => count > 0)).toBe(true);
    for (const count of positionCounts) {
      const ratio = count / total;
      expect(ratio).toBeGreaterThanOrEqual(0.2);
      expect(ratio).toBeLessThanOrEqual(0.3);
    }
  });

  it('creates the same order for the same seed and multiple orders for different seeds', () => {
    const content = loadLearningContent();
    const mission = content.missions.find((item) =>
      fourChoiceMissionTypes.has(item.missionType),
    );

    expect(mission).toBeDefined();
    if (!mission) {
      return;
    }

    const first = buildMissionViewModel({ content, mission, seed: 123 });
    const second = buildMissionViewModel({ content, mission, seed: 123 });
    const orders = new Set(
      Array.from({ length: 30 }, (_, index) =>
        buildMissionViewModel({ content, mission, seed: index + 1 })
          .choices.map((choice) => choice.value)
          .join('|'),
      ),
    );

    expect(second.choices.map((choice) => choice.value)).toEqual(
      first.choices.map((choice) => choice.value),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  it('detects mismatched letter target IDs before rendering', () => {
    const content = loadLearningContent();
    const mission = content.missions.find(
      (item) => item.missionType === 'similar-letter-choice',
    );

    expect(mission).toBeDefined();
    if (!mission) {
      return;
    }

    expect(() =>
      buildMissionViewModel({
        content,
        mission: {
          ...mission,
          missionId: 'invalid-target-id',
          targetIds: ['hiragana-a'],
        },
        seed: 1,
      }),
    ).toThrow(/targetText does not match correctAnswer/);
  });

  it('normalizes unicode before validating answers', () => {
    const content = loadLearningContent();
    const mission = content.missions.find(
      (item) => item.missionType === 'letter-search',
    );

    expect(mission).toBeDefined();
    if (!mission) {
      return;
    }

    expect(
      validateMissionAnswer(mission, mission.correctAnswer.normalize('NFD')),
    ).toBe(true);
  });

  it('word-completion rebuilds the target word around the blank', () => {
    const content = loadLearningContent();

    for (const mission of content.missions.filter(
      (item) => item.missionType === 'word-completion',
    )) {
      const viewModel = buildMissionViewModel({ content, mission, seed: 1 });
      const missing = viewModel.missingWord;

      expect(missing).toBeDefined();
      expect(
        `${missing?.before}${mission.correctAnswer}${missing?.after}`,
      ).toBe(viewModel.word);
    }
  });

  it('word-ordering exposes every character card and can rebuild the answer', () => {
    const content = loadLearningContent();

    for (let seed = 1; seed <= 1000; seed += 1) {
      for (const mission of content.missions.filter(
        (item) => item.missionType === 'word-ordering',
      )) {
        const viewModel = buildMissionViewModel({ content, mission, seed });
        const expectedCharacters = Array.from(mission.correctAnswer).sort();
        const choiceCharacters = viewModel.choices
          .map((choice) => choice.value)
          .sort();

        expect(viewModel.choices).toHaveLength(expectedCharacters.length);
        expect(new Set(viewModel.choices.map((choice) => choice.id)).size).toBe(
          viewModel.choices.length,
        );
        expect(choiceCharacters).toEqual(expectedCharacters);
        expect(viewModel.orderedSlots).toEqual(
          Array.from(mission.correctAnswer),
        );
      }
    }
  });

  it('text-search targets exist in the displayed text', () => {
    const content = loadLearningContent();

    for (const mission of content.missions.filter(
      (item) => item.missionType === 'text-search',
    )) {
      const viewModel = buildMissionViewModel({ content, mission, seed: 1 });

      expect(viewModel.prompt).toContain(mission.correctAnswer);
      expect(
        viewModel.textSearchUnits?.some(
          (unit) => unit.value === mission.correctAnswer,
        ),
      ).toBe(true);
    }
  });
});
