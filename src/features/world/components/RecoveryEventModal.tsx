import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { RecoveryEvent } from '../types';

export function RecoveryEventModal({
  events,
  onClose,
}: {
  events: RecoveryEvent[];
  onClose: () => void;
}) {
  const event =
    [...events].reverse().find((item) => item.addedDetail) ??
    events[events.length - 1];

  useEffect(() => {
    if (!event) {
      return undefined;
    }
    const timer = window.setTimeout(onClose, 1000);
    return () => window.clearTimeout(timer);
  }, [event, onClose]);

  if (!event) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[var(--radius-large)] bg-white p-6 text-center shadow-xl"
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
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
        </div>
      </motion.div>
    </div>
  );
}
