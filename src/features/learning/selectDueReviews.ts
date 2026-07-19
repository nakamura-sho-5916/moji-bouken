import type { ReviewSchedule } from '../../types';

export function selectDueReviews(input: {
  schedules: ReviewSchedule[];
  today: string;
  limit?: number;
}) {
  const seenLetters = new Set<string>();
  const due = input.schedules
    .filter(
      (schedule) =>
        !schedule.completed &&
        schedule.scheduledDate.slice(0, 10) <= input.today,
    )
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .filter((schedule) => {
      if (seenLetters.has(schedule.letterId)) {
        return false;
      }
      seenLetters.add(schedule.letterId);
      return true;
    });

  return typeof input.limit === 'number' ? due.slice(0, input.limit) : due;
}
