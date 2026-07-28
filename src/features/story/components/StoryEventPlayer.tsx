import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { StoryEvent } from '../storyData';
import { recordStoryEvent } from '../storyProgress';

type StoryEventPlayerProps = {
  event: StoryEvent | null;
  onComplete: () => void;
};

export function StoryEventPlayer({ event, onComplete }: StoryEventPlayerProps) {
  const [cursor, setCursor] = useState({ eventId: '', sceneIndex: 0 });
  const sceneIndex = cursor.eventId === event?.id ? cursor.sceneIndex : 0;

  const finish = useCallback(
    (status: 'seen' | 'skipped') => {
      if (!event) {
        return;
      }
      recordStoryEvent(event.id, status);
      onComplete();
    },
    [event, onComplete],
  );

  const advance = useCallback(() => {
    if (!event) {
      return;
    }
    if (sceneIndex >= event.scenes.length - 1) {
      finish('seen');
      return;
    }
    setCursor({
      eventId: event.id,
      sceneIndex: sceneIndex + 1,
    });
  }, [event, finish, sceneIndex]);

  useEffect(() => {
    if (!event) {
      return undefined;
    }

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.code === 'Space') {
        keyboardEvent.preventDefault();
        advance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advance, event]);

  if (!event) {
    return null;
  }

  const scene = event.scenes[sceneIndex] ?? event.scenes[0];
  const atLastScene = sceneIndex >= event.scenes.length - 1;

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-3 py-5 text-white"
      data-testid="story-event-player"
      onClick={advance}
      role="dialog"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full max-w-sm gap-4 rounded-[var(--radius-large)] border border-amber-200 bg-slate-900 p-4 shadow-[var(--shadow-soft)]"
        initial={{ opacity: 0, y: 12 }}
        onClick={(eventClick) => eventClick.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-black text-amber-200">{event.title}</p>
          <button
            className="min-h-10 rounded-[var(--radius-medium)] bg-white/10 px-3 text-sm font-black text-white"
            data-testid="story-skip"
            onClick={() => finish('skipped')}
            type="button"
          >
            スキップ
          </button>
        </div>
        <div className="grid grid-cols-[80px_1fr] items-center gap-3">
          <div className="grid size-20 place-items-center rounded-[var(--radius-medium)] bg-white p-2">
            <img
              alt={scene.name}
              className="max-h-full max-w-full object-contain"
              src={scene.portrait}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-amber-100">{scene.name}</p>
            <div className="mt-2 grid gap-1 text-xl font-black leading-snug">
              {scene.lines.slice(0, 3).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
        <button
          className="min-h-12 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-4 text-lg font-black text-white"
          data-testid="story-next"
          onClick={advance}
          type="button"
        >
          {atLastScene ? 'おわる' : 'つぎへ'}
        </button>
      </motion.div>
    </div>
  );
}
