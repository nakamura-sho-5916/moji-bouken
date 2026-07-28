import { useState } from 'react';
import {
  loadStoryProgress,
  resetStoryProgress,
  storyEvents,
  StoryEventPlayer,
  type StoryEvent,
} from '../features/story';

export function DebugStoryPage() {
  const [activeEvent, setActiveEvent] = useState<StoryEvent | null>(null);
  const [progress, setProgress] = useState(() => loadStoryProgress());
  const seenIds = new Set(progress.entries.map((entry) => entry.eventId));

  return (
    <section className="grid gap-4">
      <StoryEventPlayer
        event={activeEvent}
        onComplete={() => {
          setActiveEvent(null);
          setProgress(loadStoryProgress());
        }}
      />
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Story
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          All story events can be previewed here.
        </p>
      </div>
      <button
        className="min-h-12 rounded-[var(--radius-medium)] bg-slate-700 px-4 font-black text-white"
        onClick={() => {
          resetStoryProgress();
          setProgress(loadStoryProgress());
        }}
        type="button"
      >
        Reset story progress
      </button>
      <div className="grid gap-3">
        {storyEvents.map((event) => (
          <button
            className="grid min-h-16 gap-1 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-4 text-left shadow-sm"
            key={event.id}
            onClick={() => setActiveEvent(event)}
            type="button"
          >
            <span className="text-base font-black text-[var(--color-primary-strong)]">
              {event.title}
            </span>
            <span className="text-sm font-bold text-[var(--color-text-muted)]">
              {event.kind} / {event.scenes.length} scenes /{' '}
              {seenIds.has(event.id) ? 'saved' : 'new'}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
