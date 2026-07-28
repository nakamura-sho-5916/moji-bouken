import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { getActivePlayerId } from '../../db/repositories/saveSlotRepository';

export type StoryProgressStatus = 'seen' | 'skipped';

export type StoryProgressEntry = {
  eventId: string;
  status: StoryProgressStatus;
  viewedAt: string;
};

export type StoryProgressState = {
  entries: StoryProgressEntry[];
};

export const STORY_PROGRESS_STORAGE_KEY = 'moji-bouken:story-progress';

function storageKey() {
  const playerId = getActivePlayerId();
  return playerId === DEFAULT_PLAYER_ID
    ? STORY_PROGRESS_STORAGE_KEY
    : `${STORY_PROGRESS_STORAGE_KEY}:${playerId}`;
}

function readStoryProgress(): StoryProgressState {
  const raw = localStorage.getItem(storageKey());
  if (!raw) {
    return { entries: [] };
  }

  try {
    const parsed = JSON.parse(raw) as StoryProgressState;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    localStorage.removeItem(storageKey());
    return { entries: [] };
  }
}

function writeStoryProgress(state: StoryProgressState) {
  localStorage.setItem(storageKey(), JSON.stringify(state));
}

export function loadStoryProgress() {
  return readStoryProgress();
}

export function hasSeenStoryEvent(eventId: string) {
  return readStoryProgress().entries.some((entry) => entry.eventId === eventId);
}

export function recordStoryEvent(eventId: string, status: StoryProgressStatus) {
  const state = readStoryProgress();
  const existing = state.entries.find((entry) => entry.eventId === eventId);
  const nextEntry: StoryProgressEntry = {
    eventId,
    status,
    viewedAt: existing?.viewedAt ?? new Date().toISOString(),
  };
  writeStoryProgress({
    entries: [
      ...state.entries.filter((entry) => entry.eventId !== eventId),
      nextEntry,
    ],
  });
  return nextEntry;
}

export function resetStoryProgress() {
  localStorage.removeItem(storageKey());
}
