import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { loadLearningContent } from '../../../content/loaders/contentLoader';
import { createMissionSession, saveMissionSession } from '../MissionSession';
import { missionSessionReducer } from '../missionSessionReducer';
import type { MissionSessionState } from '../types';

const emptySession: MissionSessionState = {
  sessionId: 'empty',
  missions: [],
  currentIndex: 0,
  results: [],
  startedAt: new Date(0).toISOString(),
  completedAt: null,
  status: 'ready',
  seed: 1,
};

export function useMissionSession() {
  const content = useMemo(() => loadLearningContent(), []);
  const [session, dispatch] = useReducer(missionSessionReducer, emptySession);

  useEffect(() => {
    if (session.status !== 'ready') {
      saveMissionSession(session);
    }
  }, [session]);

  const start = useCallback(async (seed?: number) => {
    const nextSession = await createMissionSession({ seed, count: 10 });
    dispatch({ type: 'start', session: nextSession });
    saveMissionSession(nextSession);
  }, []);

  return {
    content,
    session,
    dispatch,
    start,
  };
}
