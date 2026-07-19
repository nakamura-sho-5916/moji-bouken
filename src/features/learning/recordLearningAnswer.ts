import { openMojiBoukenDb } from '../../db/database';
import {
  createLetterProgressId,
  getLetterProgress,
} from '../../db/repositories/letterProgressRepository';
import { createReviewScheduleId } from '../../db/repositories/reviewScheduleRepository';
import type { LearningLog, LetterProgress, ReviewSchedule } from '../../types';
import { calculateAccuracy } from './calculateAccuracy';
import {
  calculateAverageResponseTime,
  normalizeResponseTime,
} from './calculateResponseTime';
import {
  createReviewScheduleDates,
  toReviewStageName,
} from './createReviewSchedules';
import { evaluateMastery } from './evaluateMastery';
import { evaluateSpeedImprovement } from './evaluateSpeedImprovement';
import { evaluateWeakLetter } from './evaluateWeakLetter';
import type {
  RecordAnswerInput,
  RecordAnswerResult,
  RewardBonusReason,
} from './types';

function createLearningLogId(
  answerId: string,
  letterId: string,
  total: number,
) {
  return total === 1 ? answerId : `${answerId}:${letterId}`;
}

function createInitialProgress(input: {
  playerId: string;
  letterId: string;
  answeredAt: string;
}): LetterProgress {
  return {
    id: createLetterProgressId(input.playerId, input.letterId),
    playerId: input.playerId,
    letterId: input.letterId,
    attempts: 0,
    correctCount: 0,
    incorrectCount: 0,
    accuracy: 0,
    averageResponseTimeMs: 0,
    lastResponseTimeMs: 0,
    consecutiveCorrect: 0,
    weakFlag: false,
    weakFlagIndex: 0,
    masteredFlag: false,
    masteredFlagIndex: 0,
    lastAnsweredAt: input.answeredAt,
    updatedAt: input.answeredAt,
  };
}

function updateProgress(input: {
  current: LetterProgress;
  correct: boolean;
  responseTimeMs: number;
  answeredAt: string;
  finalReviewCompletedCorrect: boolean;
  recentCorrect: boolean[];
}) {
  const previousWeak = input.current.weakFlag;
  const previousMastered = input.current.masteredFlag;
  const attempts = input.current.attempts + 1;
  const correctCount = input.current.correctCount + (input.correct ? 1 : 0);
  const incorrectCount = input.current.incorrectCount + (input.correct ? 0 : 1);
  const accuracy = calculateAccuracy(correctCount, attempts);
  const weakEvaluation = evaluateWeakLetter({ attempts, accuracy });
  const masteryEvaluation = evaluateMastery({
    recentCorrect: [...input.recentCorrect, input.correct],
    accuracy,
    finalReviewCompletedCorrect: input.finalReviewCompletedCorrect,
  });
  const weakFlag = masteryEvaluation.weakCleared ? false : weakEvaluation.weak;
  const masteredFlag = masteryEvaluation.mastered || input.current.masteredFlag;

  const progress: LetterProgress = {
    ...input.current,
    attempts,
    correctCount,
    incorrectCount,
    accuracy,
    averageResponseTimeMs: calculateAverageResponseTime({
      previousAverageMs: input.current.averageResponseTimeMs,
      previousAttempts: input.current.attempts,
      currentResponseTimeMs: input.responseTimeMs,
    }),
    lastResponseTimeMs: input.responseTimeMs,
    consecutiveCorrect: input.correct
      ? input.current.consecutiveCorrect + 1
      : 0,
    weakFlag,
    weakFlagIndex: weakFlag ? 1 : 0,
    masteredFlag,
    masteredFlagIndex: masteredFlag ? 1 : 0,
    lastAnsweredAt: input.answeredAt,
    updatedAt: input.answeredAt,
  };

  return {
    progress,
    weakStatusChanged: previousWeak !== progress.weakFlag,
    masteryStatusChanged: previousMastered !== progress.masteredFlag,
  };
}

export async function recordLearningAnswer(
  input: RecordAnswerInput,
): Promise<RecordAnswerResult> {
  if (input.targetLetterIds.length === 0) {
    throw new Error('targetLetterIdsが空です。');
  }

  const db = await openMojiBoukenDb();
  const responseTimeMs = normalizeResponseTime(input.responseTimeMs);
  const targetLetterIds = [...new Set(input.targetLetterIds)];
  const logIds = targetLetterIds.map((letterId) =>
    createLearningLogId(input.answerId, letterId, targetLetterIds.length),
  );

  const existingLogs = await Promise.all(
    logIds.map((logId) => db.get('learningLogs', logId)),
  );
  if (existingLogs.some(Boolean)) {
    return {
      learningLogs: existingLogs.filter((log): log is LearningLog =>
        Boolean(log),
      ),
      updatedProgress: (
        await Promise.all(
          targetLetterIds.map((letterId) =>
            getLetterProgress(input.playerId, letterId),
          ),
        )
      ).filter((progress): progress is LetterProgress => Boolean(progress)),
      weakStatusChanged: false,
      masteryStatusChanged: false,
      createdReviewSchedules: [],
      speedImprovement: evaluateSpeedImprovement({
        correct: input.correct,
        previousTimeMs: null,
        currentTimeMs: responseTimeMs,
      }),
      rewardBonusReasons: [],
    };
  }

  const tx = db.transaction(
    ['learningLogs', 'letterProgress', 'reviewSchedules'],
    'readwrite',
  );
  const learningLogs: LearningLog[] = [];
  const updatedProgress: LetterProgress[] = [];
  const createdReviewSchedules: ReviewSchedule[] = [];
  const rewardBonusReasons: RewardBonusReason[] = [];
  let weakStatusChanged = false;
  let masteryStatusChanged = false;
  let firstSpeedImprovement = evaluateSpeedImprovement({
    correct: input.correct,
    previousTimeMs: null,
    currentTimeMs: responseTimeMs,
  });

  for (const [index, letterId] of targetLetterIds.entries()) {
    const log: LearningLog = {
      id: logIds[index],
      playerId: input.playerId,
      missionId: input.missionId,
      targetLetter: letterId,
      correct: input.correct,
      responseTimeMs,
      answeredAt: input.answeredAt,
    };
    const current =
      (await tx
        .objectStore('letterProgress')
        .get(createLetterProgressId(input.playerId, letterId))) ??
      createInitialProgress({
        playerId: input.playerId,
        letterId,
        answeredAt: input.answeredAt,
      });
    const previousCorrectLogs = (
      await tx.objectStore('learningLogs').index('by-letter').getAll(letterId)
    )
      .filter((item) => item.playerId === input.playerId)
      .sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
    const previousCorrectTime =
      [...previousCorrectLogs].reverse().find((item) => item.correct)
        ?.responseTimeMs ?? null;
    const finalReviewSchedule = input.completedReviewScheduleId
      ? await tx
          .objectStore('reviewSchedules')
          .get(input.completedReviewScheduleId)
      : undefined;
    const finalReviewCompletedCorrect =
      Boolean(finalReviewSchedule?.reviewStage === 'seven-days') &&
      input.correct;
    const result = updateProgress({
      current,
      correct: input.correct,
      responseTimeMs,
      answeredAt: input.answeredAt,
      finalReviewCompletedCorrect,
      recentCorrect: previousCorrectLogs.map((item) => item.correct),
    });
    const speedImprovement = evaluateSpeedImprovement({
      correct: input.correct,
      previousTimeMs: previousCorrectTime,
      currentTimeMs: responseTimeMs,
    });

    if (index === 0) {
      firstSpeedImprovement = speedImprovement;
    }

    await tx.objectStore('learningLogs').add(log);
    await tx.objectStore('letterProgress').put(result.progress);
    learningLogs.push(log);
    updatedProgress.push(result.progress);
    weakStatusChanged ||= result.weakStatusChanged;
    masteryStatusChanged ||= result.masteryStatusChanged;

    if (input.correct) {
      rewardBonusReasons.push('normal-correct');
    }
    if (speedImprovement.improved) {
      rewardBonusReasons.push('speed-improvement');
    }
    if (result.progress.weakFlag) {
      rewardBonusReasons.push('weak-letter-progress');
      for (const review of createReviewScheduleDates(
        new Date(input.answeredAt),
      )) {
        const reviewStage = toReviewStageName(review.stage);
        const existing = (
          await tx
            .objectStore('reviewSchedules')
            .index('by-letter')
            .getAll(letterId)
        ).find(
          (schedule) =>
            schedule.playerId === input.playerId &&
            schedule.reviewStage === reviewStage &&
            !schedule.completed,
        );

        if (!existing) {
          const schedule: ReviewSchedule = {
            id: createReviewScheduleId(input.playerId, letterId, reviewStage),
            playerId: input.playerId,
            letterId,
            reviewStage,
            scheduledDate: review.scheduledDate,
            completed: false,
            completedAt: null,
            updatedAt: input.answeredAt,
          };
          await tx.objectStore('reviewSchedules').put(schedule);
          createdReviewSchedules.push(schedule);
        }
      }
    }
    if (result.progress.masteredFlag && result.masteryStatusChanged) {
      rewardBonusReasons.push('weak-letter-mastered');
    }
    if (finalReviewCompletedCorrect) {
      rewardBonusReasons.push('final-review-completed');
    }

    if (finalReviewSchedule) {
      await tx.objectStore('reviewSchedules').put({
        ...finalReviewSchedule,
        completed: true,
        completedAt: input.answeredAt,
        updatedAt: input.answeredAt,
      });
    }
  }

  await tx.done;

  return {
    learningLogs,
    updatedProgress,
    weakStatusChanged,
    masteryStatusChanged,
    createdReviewSchedules,
    speedImprovement: firstSpeedImprovement,
    rewardBonusReasons: [...new Set(rewardBonusReasons)],
  };
}
