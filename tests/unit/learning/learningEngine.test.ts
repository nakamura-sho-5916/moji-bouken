import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAYER_ID } from '../../../src/db/constants';
import { openMojiBoukenDb } from '../../../src/db/database';
import { initializeAppData } from '../../../src/db/initializeAppData';
import { getDueReviewSchedules } from '../../../src/db/repositories/reviewScheduleRepository';
import {
  calculateAccuracy,
  calculateAverageResponseTime,
  calculateQuestionPriority,
  createReviewScheduleDates,
  evaluateMastery,
  evaluateSpeedImprovement,
  evaluateWeakLetter,
  LearningEngine,
  normalizeResponseTime,
} from '../../../src/features/learning';
import type {
  QuestionCandidate,
  RecordAnswerInput,
} from '../../../src/features/learning';
import { resetIndexedDb } from '../dbTestUtils';

const baseAnsweredAt = '2026-07-19T10:00:00.000Z';

function input(overrides: Partial<RecordAnswerInput> = {}): RecordAnswerInput {
  return {
    playerId: DEFAULT_PLAYER_ID,
    missionId: 'mission-letter-search-001',
    targetLetterIds: ['hiragana-a'],
    correct: true,
    responseTimeMs: 1000,
    answeredAt: baseAnsweredAt,
    answerId: `answer-${Math.random()}`,
    ...overrides,
  };
}

function candidate(
  id: string,
  category: QuestionCandidate['category'],
  letterId = id,
  missionType: QuestionCandidate['missionType'] = 'letter-search',
  easy = true,
): QuestionCandidate {
  return {
    id,
    category,
    letterId,
    sourceContentId: letterId,
    correctAnswer: letterId,
    missionType,
    easy,
  };
}

describe('learning calculations', () => {
  it('正答率を0除算なしで計算する', () => {
    expect(calculateAccuracy(1, 1)).toBe(1);
    expect(calculateAccuracy(0, 1)).toBe(0);
    expect(calculateAccuracy(1, 2)).toBe(0.5);
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it('苦手文字を境界値込みで判定する', () => {
    expect(evaluateWeakLetter({ attempts: 2, accuracy: 0 }).weak).toBe(false);
    expect(evaluateWeakLetter({ attempts: 3, accuracy: 0.7 }).weak).toBe(true);
    expect(evaluateWeakLetter({ attempts: 3, accuracy: 0.7001 }).weak).toBe(
      false,
    );
    expect(evaluateWeakLetter({ attempts: 3, accuracy: 0.7 }).reason).toBe(
      'accuracy-threshold',
    );
  });

  it('回答時間を補正し、平均を更新する', () => {
    expect(normalizeResponseTime(0)).toBe(100);
    expect(normalizeResponseTime(400000)).toBe(300000);
    expect(
      calculateAverageResponseTime({
        previousAverageMs: 1000,
        previousAttempts: 1,
        currentResponseTimeMs: 2000,
      }),
    ).toBe(1500);
  });

  it('速度改善を判定する', () => {
    expect(
      evaluateSpeedImprovement({
        correct: true,
        previousTimeMs: 1000,
        currentTimeMs: 900,
      }).improved,
    ).toBe(true);
    expect(
      evaluateSpeedImprovement({
        correct: true,
        previousTimeMs: 1000,
        currentTimeMs: 960,
      }).improved,
    ).toBe(false);
    expect(
      evaluateSpeedImprovement({
        correct: false,
        previousTimeMs: 1000,
        currentTimeMs: 800,
      }).improved,
    ).toBe(false);
    expect(
      evaluateSpeedImprovement({
        correct: true,
        previousTimeMs: null,
        currentTimeMs: 800,
      }).improved,
    ).toBe(false);
  });

  it('復習日程を翌日・3日後・7日後で生成する', () => {
    expect(createReviewScheduleDates(new Date('2026-07-19T10:00:00'))).toEqual([
      { stage: 1, scheduledDate: '2026-07-20' },
      { stage: 2, scheduledDate: '2026-07-22' },
      { stage: 3, scheduledDate: '2026-07-26' },
    ]);
  });

  it('習得条件を判定する', () => {
    expect(
      evaluateMastery({
        recentCorrect: [true, true, true, true, false],
        accuracy: 0.8,
        finalReviewCompletedCorrect: false,
      }).mastered,
    ).toBe(false);
    const mastered = evaluateMastery({
      recentCorrect: [true, true, true, true, false],
      accuracy: 0.8,
      finalReviewCompletedCorrect: true,
    });
    expect(mastered.mastered).toBe(true);
    expect(mastered.weakCleared).toBe(true);
  });

  it('出題優先度をseedで再現し制約を守る', () => {
    const result1 = calculateQuestionPriority({
      dueReview: [candidate('r1', 'due-review'), candidate('r2', 'due-review')],
      weak: [
        candidate('w1', 'weak', 'w1', 'similar-letter-choice'),
        candidate('w2', 'weak', 'w2', 'word-completion'),
      ],
      normal: [
        candidate('n1', 'normal', 'n1', 'letter-introduction'),
        candidate('n2', 'normal', 'n2', 'word-ordering'),
        candidate('n3', 'normal', 'n3', 'text-search'),
      ],
      new: [
        candidate('new1', 'new', 'new1', 'vertical-reading'),
        candidate('new2', 'new', 'new2', 'horizontal-reading'),
        candidate('new3', 'new', 'new3', 'boss-mixed'),
      ],
      seed: 123,
      count: 10,
    });
    const result2 = calculateQuestionPriority({
      dueReview: [candidate('r1', 'due-review'), candidate('r2', 'due-review')],
      weak: [
        candidate('w1', 'weak', 'w1', 'similar-letter-choice'),
        candidate('w2', 'weak', 'w2', 'word-completion'),
      ],
      normal: [
        candidate('n1', 'normal', 'n1', 'letter-introduction'),
        candidate('n2', 'normal', 'n2', 'word-ordering'),
        candidate('n3', 'normal', 'n3', 'text-search'),
      ],
      new: [
        candidate('new1', 'new', 'new1', 'vertical-reading'),
        candidate('new2', 'new', 'new2', 'horizontal-reading'),
        candidate('new3', 'new', 'new3', 'boss-mixed'),
      ],
      seed: 123,
      count: 10,
    });

    expect(result1).toEqual(result2);
    expect(
      new Set(
        result1
          .filter((item) => item.category === 'new')
          .map((item) => item.letterId),
      ).size,
    ).toBeLessThanOrEqual(5);
    for (const letterId of new Set(result1.map((item) => item.letterId))) {
      expect(result1.filter((item) => item.letterId === letterId)).toHaveLength(
        Math.min(
          2,
          result1.filter((item) => item.letterId === letterId).length,
        ),
      );
    }
    expect(result1.filter((item) => item.easy).length).toBeGreaterThanOrEqual(
      3,
    );
    for (let index = 2; index < result1.length; index += 1) {
      expect(
        result1[index]?.missionType === result1[index - 1]?.missionType &&
          result1[index]?.missionType === result1[index - 2]?.missionType,
      ).toBe(false);
    }
  });
});

describe('LearningEngine integration', () => {
  beforeEach(async () => {
    await resetIndexedDb();
    await initializeAppData();
  });

  it('正解ログと不正解ログを保存し、同一answerIdを二重保存しない', async () => {
    await LearningEngine.recordAnswer(
      input({ answerId: 'same-id', correct: true }),
    );
    const duplicate = await LearningEngine.recordAnswer(
      input({ answerId: 'same-id', correct: true }),
    );
    await LearningEngine.recordAnswer(
      input({ answerId: 'wrong-id', correct: false }),
    );
    const db = await openMojiBoukenDb();

    expect(await db.count('learningLogs')).toBe(2);
    expect(duplicate.learningLogs).toHaveLength(1);
  });

  it('複数対象文字を更新でき、空入力では不完全な更新を残さない', async () => {
    await expect(
      LearningEngine.recordAnswer(
        input({ answerId: 'empty', targetLetterIds: [] }),
      ),
    ).rejects.toThrow();
    await LearningEngine.recordAnswer(
      input({
        answerId: 'multi',
        targetLetterIds: ['hiragana-a', 'hiragana-i'],
      }),
    );
    const db = await openMojiBoukenDb();

    expect(await db.count('learningLogs')).toBe(2);
    expect(await db.count('letterProgress')).toBe(2);
  });

  it('回答記録から苦手判定と復習予定生成まで一連で動く', async () => {
    for (let index = 0; index < 3; index += 1) {
      await LearningEngine.recordAnswer(
        input({
          answerId: `weak-${index}`,
          correct: index === 0,
          answeredAt: `2026-07-19T10:0${index}:00.000Z`,
        }),
      );
    }
    const state = await LearningEngine.getLearningDebugState();
    const progress = state.letterProgress.find(
      (item) => item.letterId === 'hiragana-a',
    );

    expect(progress?.attempts).toBe(3);
    expect(progress?.accuracy).toBe(0.3333);
    expect(progress?.weakFlag).toBe(true);
    expect(state.reviewSchedules).toHaveLength(3);
    expect(await getDueReviewSchedules('2026-07-26')).toHaveLength(3);
  });

  it('当日以前の未完了予定を取得し、完了予定を除外する', async () => {
    for (let index = 0; index < 3; index += 1) {
      await LearningEngine.recordAnswer(
        input({ answerId: `due-${index}`, correct: false }),
      );
    }
    const due = await LearningEngine.getDueReviews({
      today: '2026-07-26',
      limit: 1,
    });

    expect(due).toHaveLength(1);
    expect(due[0]?.letterId).toBe('hiragana-a');
  });

  it('克服時にボーナス理由が返る', async () => {
    for (let index = 0; index < 3; index += 1) {
      await LearningEngine.recordAnswer(
        input({ answerId: `mastery-seed-${index}`, correct: false }),
      );
    }
    const schedule = (
      await LearningEngine.getLearningDebugState()
    ).reviewSchedules.find((item) => item.reviewStage === 'seven-days');
    for (let index = 0; index < 11; index += 1) {
      await LearningEngine.recordAnswer(
        input({
          answerId: `mastery-correct-${index}`,
          correct: true,
          answeredAt: `2026-07-19T10:${String(index + 3).padStart(2, '0')}:00.000Z`,
          responseTimeMs: 900 - index * 60,
        }),
      );
    }
    const result = await LearningEngine.recordAnswer(
      input({
        answerId: 'mastery-final',
        correct: true,
        responseTimeMs: 500,
        answeredAt: '2026-07-19T10:20:00.000Z',
        completedReviewScheduleId: schedule?.id,
      }),
    );

    expect(result.rewardBonusReasons).toContain('weak-letter-mastered');
    expect(result.rewardBonusReasons).toContain('final-review-completed');
  });

  it('出題候補10件を生成する', async () => {
    const candidates = await LearningEngine.createQuestionCandidates({
      count: 10,
      seed: 42,
    });

    expect(candidates).toHaveLength(10);
  });
});
