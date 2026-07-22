export const MIN_ATTEMPTS_FOR_WEAK = 3;
export const WEAK_ACCURACY_THRESHOLD = 0.7;

export const MASTERY_RECENT_WINDOW = 5;
export const MASTERY_REQUIRED_CORRECT = 4;
export const MASTERY_ACCURACY_THRESHOLD = 0.8;
export const REQUIRED_FINAL_REVIEW_STAGE = 3;

export const REVIEW_STAGE_DAYS = {
  1: 1,
  2: 3,
  3: 7,
} as const;

export const MIN_RESPONSE_TIME_MS = 100;
export const MAX_RESPONSE_TIME_MS = 300000;

export const SPEED_IMPROVEMENT_RATIO = 0.05;
export const MIN_SPEED_DIFFERENCE_MS = 50;

export const QUESTION_PRIORITY_WEIGHTS = {
  dueReview: 40,
  weak: 30,
  normal: 20,
  new: 10,
} as const;

export const DEFAULT_SESSION_QUESTION_COUNT = 10;
export const MAX_NEW_LETTERS_PER_SESSION = 5;
export const MIN_EASY_QUESTIONS_PER_SESSION = 3;
