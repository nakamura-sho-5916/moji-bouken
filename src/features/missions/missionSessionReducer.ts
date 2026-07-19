import type { MissionSessionAction, MissionSessionState } from './types';

export function missionSessionReducer(
  state: MissionSessionState,
  action: MissionSessionAction,
): MissionSessionState {
  switch (action.type) {
    case 'start':
      return action.session;
    case 'activate':
      return { ...state, status: 'active' };
    case 'saving':
      return { ...state, status: 'saving' };
    case 'answer-saved': {
      const results = [...state.results, action.result];
      const nextIndex = state.currentIndex + 1;
      const completed = nextIndex >= state.missions.length;
      return {
        ...state,
        currentIndex: completed ? state.currentIndex : nextIndex,
        results,
        status: completed ? 'completed' : 'active',
        completedAt: completed ? new Date().toISOString() : state.completedAt,
      };
    }
    case 'retry-practice':
      return { ...state, status: 'active' };
    case 'complete':
      return { ...state, status: 'completed', completedAt: action.completedAt };
    case 'error':
      return { ...state, status: 'error' };
    default:
      return state;
  }
}
