import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { initializeAppData } from '../../db/initializeAppData';
import { openMojiBoukenDb } from '../../db/database';
import type { LearningLog, LetterProgress, ReviewSchedule } from '../../types';

export type LearningOverview = {
  learningDays: number;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
  learningTimeMs: number;
  recentSevenDaysAnswers: number;
  recentThirtyDaysAnswers: number;
  masteredLetterCount: number;
  weakLetterCount: number;
  dueReviewCount: number;
  lastLearningAt: string | null;
};

export type WeakLetterFilter =
  'all' | 'weak' | 'mastered' | 'review-due' | 'hiragana' | 'katakana';

export type WeakLetterSort =
  'low-accuracy' | 'many-attempts' | 'nearest-review' | 'recent-answer';

export type WeakLetterRow = LetterProgress & {
  scriptType: 'hiragana' | 'katakana';
  nextReview: ReviewSchedule | null;
};

export type SpeedTrend = {
  letterId: string;
  logs: LearningLog[];
  averageResponseTimeMs: number;
  lastResponseTimeMs: number | null;
  previousResponseTimeMs: number | null;
  improving: boolean;
};

export type HistoryDay = {
  date: string;
  logs: LearningLog[];
};

async function readLearningData(playerId = DEFAULT_PLAYER_ID) {
  await initializeAppData();
  const db = await openMojiBoukenDb();
  const [logs, progress, reviews] = await Promise.all([
    db.getAllFromIndex('learningLogs', 'by-player', playerId),
    db.getAll('letterProgress'),
    db.getAll('reviewSchedules'),
  ]);
  return {
    logs,
    progress: progress.filter((item) => item.playerId === playerId),
    reviews: reviews.filter((item) => item.playerId === playerId),
  };
}

function isWithinDays(iso: string, days: number) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return Date.parse(iso) >= since;
}

export async function calculateLearningOverview(
  playerId = DEFAULT_PLAYER_ID,
): Promise<LearningOverview> {
  const { logs, progress, reviews } = await readLearningData(playerId);
  const days = new Set(logs.map((log) => log.answeredAt.slice(0, 10)));
  const correctAnswers = logs.filter((log) => log.correct).length;
  return {
    learningDays: days.size,
    totalAnswers: logs.length,
    correctAnswers,
    accuracy: logs.length > 0 ? correctAnswers / logs.length : 0,
    learningTimeMs: logs.reduce((sum, log) => sum + log.responseTimeMs, 0),
    recentSevenDaysAnswers: logs.filter((log) =>
      isWithinDays(log.answeredAt, 7),
    ).length,
    recentThirtyDaysAnswers: logs.filter((log) =>
      isWithinDays(log.answeredAt, 30),
    ).length,
    masteredLetterCount: progress.filter((item) => item.masteredFlag).length,
    weakLetterCount: progress.filter((item) => item.weakFlag).length,
    dueReviewCount: reviews.filter((item) => !item.completed).length,
    lastLearningAt:
      logs.map((log) => log.answeredAt).sort((a, b) => b.localeCompare(a))[0] ??
      null,
  };
}

function inferScriptType(letterId: string): 'hiragana' | 'katakana' {
  return letterId.startsWith('katakana') ? 'katakana' : 'hiragana';
}

export async function getWeakLetterRows(input?: {
  filter?: WeakLetterFilter;
  sort?: WeakLetterSort;
  playerId?: string;
}) {
  const { progress, reviews } = await readLearningData(
    input?.playerId ?? DEFAULT_PLAYER_ID,
  );
  const rows: WeakLetterRow[] = progress.map((item) => ({
    ...item,
    scriptType: inferScriptType(item.letterId),
    nextReview:
      reviews
        .filter(
          (review) => review.letterId === item.letterId && !review.completed,
        )
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0] ??
      null,
  }));
  const filter = input?.filter ?? 'all';
  const filtered = rows.filter((row) => {
    if (filter === 'weak') {
      return row.weakFlag;
    }
    if (filter === 'mastered') {
      return row.masteredFlag;
    }
    if (filter === 'review-due') {
      return Boolean(row.nextReview);
    }
    if (filter === 'hiragana' || filter === 'katakana') {
      return row.scriptType === filter;
    }
    return true;
  });
  const sort = input?.sort ?? 'low-accuracy';
  return filtered.sort((a, b) => {
    if (sort === 'many-attempts') {
      return b.attempts - a.attempts;
    }
    if (sort === 'nearest-review') {
      return (a.nextReview?.scheduledDate ?? '9999').localeCompare(
        b.nextReview?.scheduledDate ?? '9999',
      );
    }
    if (sort === 'recent-answer') {
      return (b.lastAnsweredAt ?? '').localeCompare(a.lastAnsweredAt ?? '');
    }
    return a.accuracy - b.accuracy;
  });
}

export async function getSpeedTrend(
  letterId: string,
  playerId = DEFAULT_PLAYER_ID,
) {
  const db = await openMojiBoukenDb();
  const logs = (await db.getAllFromIndex('learningLogs', 'by-letter', letterId))
    .filter((log) => log.playerId === playerId)
    .sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
  const total = logs.reduce((sum, log) => sum + log.responseTimeMs, 0);
  const last = logs.at(-1)?.responseTimeMs ?? null;
  const previous = logs.at(-2)?.responseTimeMs ?? null;
  return {
    letterId,
    logs,
    averageResponseTimeMs: logs.length > 0 ? total / logs.length : 0,
    lastResponseTimeMs: last,
    previousResponseTimeMs: previous,
    improving: Boolean(last !== null && previous !== null && last < previous),
  } satisfies SpeedTrend;
}

export async function getHistoryPage(input?: {
  offset?: number;
  limit?: number;
  playerId?: string;
}) {
  const { logs } = await readLearningData(input?.playerId ?? DEFAULT_PLAYER_ID);
  const offset = input?.offset ?? 0;
  const limit = input?.limit ?? 50;
  const page = logs
    .sort((a, b) => b.answeredAt.localeCompare(a.answeredAt))
    .slice(offset, offset + limit);
  const byDate = new Map<string, LearningLog[]>();
  for (const log of page) {
    const date = log.answeredAt.slice(0, 10);
    byDate.set(date, [...(byDate.get(date) ?? []), log]);
  }
  return {
    total: logs.length,
    nextOffset:
      offset + page.length < logs.length ? offset + page.length : null,
    days: Array.from(byDate, ([date, dayLogs]) => ({
      date,
      logs: dayLogs,
    })) satisfies HistoryDay[],
  };
}
