import { openMojiBoukenDb, closeDbConnectionForTests } from '../../db/database';
import { initializeAppData } from '../../db/initializeAppData';
import { loadLearningContent } from '../../content/loaders/contentLoader';
import { getDueReviewSchedules } from '../../db/repositories/reviewScheduleRepository';
import type {
  ContentLetter,
  ContentWord,
  LetterProgress,
  LoadedContent,
  MissionType,
  ReviewSchedule,
} from '../../types';
import { calculateQuestionPriority } from './calculateQuestionPriority';
import { selectDueReviews } from './selectDueReviews';
import { toLocalDateString } from './createReviewSchedules';
import { recordLearningAnswer } from './recordLearningAnswer';
import type {
  QuestionCandidate,
  QuestionCategory,
  RecordAnswerInput,
} from './types';

const letterMissionTypes: MissionType[] = [
  'letter-introduction',
  'letter-search',
  'similar-letter-choice',
];

const wordMissionTypes: MissionType[] = [
  'illustration-letter-choice',
  'illustration-word-choice',
  'word-completion',
  'word-ordering',
  'vertical-reading',
  'horizontal-reading',
  'text-search',
];

async function getAllLetterProgress() {
  const db = await openMojiBoukenDb();
  return db.getAll('letterProgress');
}

async function getAllReviewSchedules() {
  const db = await openMojiBoukenDb();
  return db.getAll('reviewSchedules');
}

function findLetter(content: LoadedContent, letterId: string) {
  return [...content.hiragana, ...content.katakana].find(
    (letter) => letter.id === letterId,
  );
}

function wordsForLetter(content: LoadedContent, letterId: string) {
  return content.words.filter(
    (word) => word.active && word.letterIds.includes(letterId),
  );
}

function hasSimilarGroup(content: LoadedContent, letterId: string) {
  return content.similarLetters.some((group) =>
    group.letterIds.includes(letterId),
  );
}

function availableMissionTypes(
  content: LoadedContent,
  letter: ContentLetter,
  words: ContentWord[],
) {
  const types: MissionType[] = letterMissionTypes.filter(
    (missionType) =>
      missionType !== 'similar-letter-choice' ||
      hasSimilarGroup(content, letter.id),
  );

  if (words.length > 0) {
    types.push(...wordMissionTypes);
  }

  return types;
}

function toCandidates(
  category: QuestionCategory,
  letterId: string,
  content: LoadedContent,
  index: number,
): QuestionCandidate[] {
  const letter = findLetter(content, letterId);
  if (!letter) {
    return [];
  }
  const words = wordsForLetter(content, letterId);
  const types = availableMissionTypes(content, letter, words);
  return types.map((missionType, typeIndex) => {
    const word = words[(index + typeIndex) % Math.max(words.length, 1)];
    const usesWord = wordMissionTypes.includes(missionType);
    return {
      id: `${category}:${letterId}:${missionType}:${word?.id ?? letter.id}:${index}:${typeIndex}`,
      letterId,
      sourceContentId: usesWord ? (word?.id ?? letter.id) : letter.id,
      correctAnswer:
        missionType === 'illustration-word-choice' ||
        missionType === 'word-ordering' ||
        missionType === 'vertical-reading' ||
        missionType === 'horizontal-reading'
          ? (word?.display ?? letter.character)
          : letter.character,
      missionType,
      category,
      easy:
        letter.order <= 10 ||
        word?.difficulty === 1 ||
        category === 'normal' ||
        category === 'new',
    };
  });
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
      dueReview: dueReviews
        .map((schedule, index) =>
          toCandidates('due-review', schedule.letterId, content, index),
        )
        .flat(),
      weak: weakProgress.flatMap((item, index) =>
        toCandidates('weak', item.letterId, content, index),
      ),
      normal: normalProgress.flatMap((item, index) =>
        toCandidates('normal', item.letterId, content, index),
      ),
      new: newLetters.flatMap((letter, index) =>
        toCandidates('new', letter.id, content, index),
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
