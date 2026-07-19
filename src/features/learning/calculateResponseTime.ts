import { MAX_RESPONSE_TIME_MS, MIN_RESPONSE_TIME_MS } from './constants';

export function normalizeResponseTime(responseTimeMs: number) {
  if (!Number.isFinite(responseTimeMs)) {
    return MIN_RESPONSE_TIME_MS;
  }

  return Math.min(
    MAX_RESPONSE_TIME_MS,
    Math.max(MIN_RESPONSE_TIME_MS, Math.round(responseTimeMs)),
  );
}

export function calculateAverageResponseTime(input: {
  previousAverageMs: number;
  previousAttempts: number;
  currentResponseTimeMs: number;
}) {
  const responseTimeMs = normalizeResponseTime(input.currentResponseTimeMs);

  if (input.previousAttempts <= 0) {
    return responseTimeMs;
  }

  return Math.round(
    (input.previousAverageMs * input.previousAttempts + responseTimeMs) /
      (input.previousAttempts + 1),
  );
}
