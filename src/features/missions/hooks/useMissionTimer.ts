import { useCallback, useRef } from 'react';

const MIN_RESPONSE_TIME_MS = 100;

export function useMissionTimer() {
  const startedAtRef = useRef<number | null>(null);

  const restart = useCallback(() => {
    startedAtRef.current = Date.now();
  }, []);

  const getElapsedMs = useCallback(() => {
    const startedAt = startedAtRef.current ?? Date.now();
    return Math.max(MIN_RESPONSE_TIME_MS, Date.now() - startedAt);
  }, []);

  return { restart, getElapsedMs };
}
