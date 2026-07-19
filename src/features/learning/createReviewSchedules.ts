import { REVIEW_STAGE_DAYS } from './constants';
import type { ReviewStageNumber } from './types';

export function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addLocalDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function createReviewScheduleDates(baseDate: Date) {
  return ([1, 2, 3] as const).map((stage) => ({
    stage,
    scheduledDate: toLocalDateString(
      addLocalDays(baseDate, REVIEW_STAGE_DAYS[stage]),
    ),
  }));
}

export function toReviewStageName(stage: ReviewStageNumber) {
  if (stage === 1) {
    return 'next-day';
  }
  if (stage === 2) {
    return 'three-days';
  }
  return 'seven-days';
}
