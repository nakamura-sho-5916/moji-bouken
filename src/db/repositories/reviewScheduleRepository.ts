import { openMojiBoukenDb } from '../database';
import type { ReviewSchedule, ReviewStage } from '../../types';

export async function addReviewSchedule(schedule: ReviewSchedule) {
  const db = await openMojiBoukenDb();
  const schedules = await db.getAllFromIndex(
    'reviewSchedules',
    'by-letter',
    schedule.letterId,
  );
  const duplicate = schedules.find(
    (item) =>
      item.playerId === schedule.playerId &&
      item.reviewStage === schedule.reviewStage,
  );

  if (duplicate) {
    return duplicate;
  }

  await db.add('reviewSchedules', schedule);
  return schedule;
}

export async function getDueReviewSchedules(date: string) {
  const db = await openMojiBoukenDb();
  const schedules = await db.getAllFromIndex(
    'reviewSchedules',
    'by-scheduled-date',
    IDBKeyRange.upperBound(date),
  );
  return schedules.filter((schedule) => !schedule.completed);
}

export async function completeReviewSchedule(
  scheduleId: string,
  completedAt = new Date().toISOString(),
) {
  const db = await openMojiBoukenDb();
  const schedule = await db.get('reviewSchedules', scheduleId);

  if (!schedule) {
    return undefined;
  }

  const updated: ReviewSchedule = {
    ...schedule,
    completed: true,
    completedAt,
    updatedAt: completedAt,
  };
  await db.put('reviewSchedules', updated);
  return updated;
}

export function createReviewScheduleId(
  playerId: string,
  letterId: string,
  reviewStage: ReviewStage,
) {
  return `${playerId}:${letterId}:${reviewStage}`;
}
