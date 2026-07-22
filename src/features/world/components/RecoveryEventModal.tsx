import { motion } from 'framer-motion';
import { SceneEffect } from '../../effects';
import type { RecoveryEvent } from '../types';

export function RecoveryEventModal({
  events,
  onClose,
}: {
  events: RecoveryEvent[];
  onClose: () => void;
}) {
  if (events.length === 0) {
    return null;
  }

  const event = events[0];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-[var(--radius-large)] bg-white p-6 text-center shadow-xl"
        initial={{ opacity: 0, scale: 0.94 }}
      >
        <SceneEffect title="せかいが ひかりだした" tone="recovery" />
        <h2 className="mt-3 text-3xl font-black text-[var(--color-primary-strong)]">
          {event.title}
        </h2>
        <p className="mt-3 text-lg font-bold text-[var(--color-text-muted)]">
          {event.message}
        </p>
        <button
          className="mt-5 min-h-14 w-full rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
          onClick={onClose}
          type="button"
        >
          せかいを みにいく
        </button>
      </motion.div>
    </div>
  );
}
