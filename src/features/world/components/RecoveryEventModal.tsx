import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { RecoveryEvent } from '../types';

export const RECOVERY_EVENT_AUTO_CLOSE_MS = 4000;
export const RECOVERY_EVENT_FADE_OUT_MS = 200;

export function RecoveryEventModal({
  events,
  onClose,
}: {
  events: RecoveryEvent[];
  onClose: () => void;
}) {
  const [closingEventId, setClosingEventId] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const event =
    [...events].reverse().find((item) => item.addedDetail) ??
    events[events.length - 1];
  const activeEventId = event ? `${event.areaId}:${event.id}` : null;
  const closing = activeEventId !== null && closingEventId === activeEventId;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const finishClose = useCallback(() => {
    if (activeEventId === null || closeTimerRef.current !== null) {
      return;
    }
    setClosingEventId(activeEventId);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setClosingEventId(null);
      onCloseRef.current();
    }, RECOVERY_EVENT_FADE_OUT_MS);
  }, [activeEventId]);

  useEffect(() => {
    if (!event) {
      return undefined;
    }
    const timer = window.setTimeout(finishClose, RECOVERY_EVENT_AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [event, finishClose]);

  useEffect(() => {
    if (!event) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [event]);

  useEffect(() => {
    if (!event) {
      return undefined;
    }
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        finishClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [event, finishClose]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  if (!event) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex cursor-default items-center justify-center bg-black/35 p-4 text-left"
      data-testid="recovery-event-overlay"
      onClick={finishClose}
      onPointerDown={finishClose}
    >
      <motion.div
        animate={{
          opacity: closing ? 0 : 1,
          scale: closing ? 0.96 : 1,
          y: closing ? 8 : 0,
        }}
        className="relative w-full max-w-sm cursor-default overflow-hidden rounded-[var(--radius-large)] bg-white p-6 text-center shadow-xl"
        data-testid="recovery-event-modal"
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        transition={{ duration: closing ? 0.2 : 0.24, ease: 'easeOut' }}
      >
        <div aria-hidden="true" className="absolute inset-0">
          {Array.from({ length: 14 }, (_, index) => (
            <span
              className="absolute h-2 w-2 rounded-full bg-[var(--color-primary)] opacity-70 motion-safe:animate-[game-sparkle-rise_900ms_ease-out]"
              key={index}
              style={{
                left: `${8 + ((index * 17) % 82)}%`,
                top: `${10 + ((index * 23) % 72)}%`,
              }}
            />
          ))}
        </div>
        <div className="relative">
          <p className="text-lg font-black tracking-[0.08em] text-[var(--color-secondary)]">
            ★★★★★★★★★★★★
          </p>
          <h2 className="mt-2 whitespace-pre-line text-3xl font-black leading-tight text-[var(--color-primary-strong)]">
            まちが{'\n'}レベルアップ！
          </h2>
          <p className="mt-2 text-lg font-black tracking-[0.08em] text-[var(--color-secondary)]">
            ★★★★★★★★★★★★
          </p>
          <p className="mt-4 rounded-[var(--radius-medium)] bg-emerald-50 p-3 text-xl font-black text-emerald-800">
            {event.addedDetail ?? event.message}
          </p>
          <button
            className="mt-5 min-h-14 w-full rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white shadow-sm transition hover:bg-[var(--color-primary-strong)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-secondary)]"
            onClick={finishClose}
            onPointerDown={finishClose}
            type="button"
          >
            ▶ つぎへ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
