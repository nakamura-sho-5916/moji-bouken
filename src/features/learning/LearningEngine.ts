import { openMojiBoukenDb, closeDbConnectionForTests } from '../../db/database';
import { initializeAppData } from '../../db/initializeAppData';
import { loadLearningContent } from '../../content/loaders/contentLoader';
import { getDueReviewSchedules } from '../../db/repositories/reviewScheduleRepository';
import type {
  ContentMission,
  LetterProgress,
  ReviewSchedule,
} from '../../types';
import { calculateQuestionPriority } from './calculateQuestionPriority';
import { selectDueReviews } from './selectDueReviews';
import { toLocalDateString } from './createReviewSchedules';
import { recordLearningAnswer } from './recordLearningAnswer';
import type { QuestionCandidate, RecordAnswerInput } from './types';

function missionForLetter(
  missions: ContentMission[],
  letterId: string,
  index: number,
) {
  return (
    missions.find((mission) => mission.targetIds.includes(letterId)) ??
    missions[index % missions.length]
  );
}

async function getAllLetterProgress() {
  const db = await openMojiBoukenDb();
  return db.getAll('letterProgress');
}

async function getAllReviewSchedules() {
  const db = await openMojiBoukenDb();
  return db.getAll('reviewSchedules');
}

function toCandidate(
  category: QuestionCandidate['category'],
  letterId: string,
  mission: ContentMission,
  index: number,
): QuestionCandidate {
  return {
    id: `${category}:${letterId}:${mission.missionId}:${index}`,
    letterId,
    missionType: mission.missionType,
    category,
    easy:
      mission.difficulty <= 1 || category === 'normal' || category === 'new',
  };
}

export const LearningEngine = {
  recordAnswer(input: RecordAnswerInput) {
    return recordLearningAnswer(input);
  },

  async getDueReviews(input?: { today?: string; limit?: number }) {
    const today = input?.today ?? toLocalDateString(new Date());
    const schedules = await getDueReviewSchedules(today);
    return selectDueReviews({ schedules, today, limit: input?.limit });
  },

  async createQuestionCandidates(input?: {
    count?: number;
    seed?: number;
    today?: string;
  }) {
    await initializeAppData();
    const content = loadLearningContent();
    const progress = await getAllLetterProgress();
    const schedules = await getAllReviewSchedules();
    const today = input?.today ?? toLocalDateString(new Date());
    const dueReviews = selectDueReviews({ schedules, today });
    const activeLetters = [...content.hiragana, ...content.katakana].filter(
      (letter) => letter.active,
    );
    const progressByLetter = new Map(
      progress.map((item) => [item.letterId, item]),
    );
    const weakProgress = progress.filter((item) => item.weakFlag);
    const normalProgress = progress.filter(
      (item) => !item.weakFlag && !item.masteredFlag,
    );
    const newLetters = activeLetters.filter(
      (letter) => !progressByLetter.has(letter.id),
    );

    return calculateQuestionPriority({
      dueReview: dueReviews.map((schedule, index) =>
        toCandidate(
          'due-review',
          schedule.letterId,
          missionForLetter(content.missions, schedule.letterId, index),
          index,
        ),
      ),
      weak: weakProgress.map((item, index) =>
        toCandidate(
          'weak',
          item.letterId,
          missionForLetter(content.missions, item.letterId, index),
          index,
        ),
      ),
      normal: normalProgress.map((item, index) =>
        toCandidate(
          'normal',
          item.letterId,
          missionForLetter(content.missions, item.letterId, index),
          index,
        ),
      ),
      new: newLetters.map((letter, index) =>
        toCandidate(
          'new',
          letter.id,
          missionForLetter(content.missions, letter.id, index),
          index,
        ),
      ),
      count: input?.count,
      seed: input?.seed,
    });
  },

  async getLearningDebugState() {
    await initializeAppData();
    const db = await openMojiBoukenDb();
    const [letterProgress, reviewSchedules, learningLogs] = await Promise.all([
      db.getAll('letterProgress'),
      db.getAll('reviewSchedules'),
      db.getAll('learningLogs'),
    ]);
    return { letterProgress, reviewSchedules, learningLogs };
  },

  async resetDebugLearningData() {
    const db = await openMojiBoukenDb();
    const tx = db.transaction(
      ['learningLogs', 'letterProgress', 'reviewSchedules'],
      'readwrite',
    );
    await Promise.all([
      tx.objectStore('learningLogs').clear(),
      tx.objectStore('letterProgress').clear(),
      tx.objectStore('reviewSchedules').clear(),
    ]);
    await tx.done;
    await closeDbConnectionForTests();
    await initializeAppData();
  },
};

export type LearningDebugState = {
  letterProgress: LetterProgress[];
  reviewSchedules: ReviewSchedule[];
};
