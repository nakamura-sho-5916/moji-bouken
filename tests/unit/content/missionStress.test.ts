import { describe, expect, it } from 'vitest';
import { loadLearningContent } from '../../../src/content/loaders/contentLoader';
import { buildMissionViewModel } from '../../../src/features/missions';
import type {
  ContentMission,
  LoadedContent,
  MissionType,
} from '../../../src/types';

const missionTypes: MissionType[] = [
  'letter-introduction',
  'letter-search',
  'similar-letter-choice',
  'illustration-letter-choice',
  'illustration-word-choice',
  'word-completion',
  'word-ordering',
  'vertical-reading',
  'horizontal-reading',
  'text-search',
  'boss-mixed',
];

const fourChoiceMissionTypes = new Set<MissionType>([
  'letter-search',
  'similar-letter-choice',
  'illustration-letter-choice',
  'illustration-word-choice',
  'word-completion',
  'vertical-reading',
  'horizontal-reading',
]);

function assertFourChoiceMission(
  content: LoadedContent,
  mission: ContentMission,
  seed: number,
) {
  const viewModel = buildMissionViewModel({ content, mission, seed });
  const values = viewModel.choices.map((choice) => choice.value);

  expect(viewModel.prompt.trim()).not.toBe('');
  expect(mission.correctAnswer.trim()).not.toBe('');
  expect(viewModel.choices).toHaveLength(4);
  expect(new Set(values).size).toBe(4);
  expect(values).toContain(mission.correctAnswer);
  expect(viewModel.choices.filter((choice) => choice.correct)).toHaveLength(1);
  expect(
    viewModel.choices.filter(
      (choice) => choice.value === mission.correctAnswer,
    ),
  ).toHaveLength(1);
}

describe('mission content stress audit', () => {
  const content = loadLearningContent();

  it('covers every mission type in content', () => {
    for (const missionType of missionTypes) {
      expect(
        content.missions.some((mission) => mission.missionType === missionType),
      ).toBe(true);
    }
  });

  it('keeps four-choice invariants for every eligible mission over 1000 seeds', () => {
    const missions = content.missions.filter((mission) =>
      fourChoiceMissionTypes.has(mission.missionType),
    );

    for (let seed = 1; seed <= 1000; seed += 1) {
      for (const mission of missions) {
        assertFourChoiceMission(content, mission, seed);
      }
    }
  }, 15000);

  it('keeps the same result for the same seed', () => {
    for (const mission of content.missions) {
      const first = buildMissionViewModel({ content, mission, seed: 123 });
      const second = buildMissionViewModel({ content, mission, seed: 123 });

      expect(second.choices.map((choice) => choice.value)).toEqual(
        first.choices.map((choice) => choice.value),
      );
    }
  });

  it('changes at least some choice placement across different seeds', () => {
    const changed = content.missions
      .filter((mission) => fourChoiceMissionTypes.has(mission.missionType))
      .some((mission) => {
        const first = buildMissionViewModel({ content, mission, seed: 1 });
        const second = buildMissionViewModel({ content, mission, seed: 2 });
        return (
          first.choices.map((choice) => choice.value).join('|') !==
          second.choices.map((choice) => choice.value).join('|')
        );
      });

    expect(changed).toBe(true);
  });

  it('keeps non-four-choice mission formats answerable', () => {
    for (const mission of content.missions) {
      const viewModel = buildMissionViewModel({ content, mission, seed: 5916 });

      if (mission.missionType === 'letter-introduction') {
        expect(viewModel.targetText).toBe(mission.correctAnswer);
      }
      if (mission.missionType === 'word-ordering') {
        expect(viewModel.choices.map((choice) => choice.value).sort()).toEqual(
          Array.from(mission.correctAnswer).sort(),
        );
      }
      if (mission.missionType === 'text-search') {
        expect(viewModel.prompt).toContain(mission.correctAnswer);
        expect(
          viewModel.textSearchUnits?.some(
            (unit) => unit.value === mission.correctAnswer,
          ),
        ).toBe(true);
      }
      if (mission.missionType === 'boss-mixed') {
        expect(viewModel.unsupported).toBe(true);
      }
    }
  });
});
