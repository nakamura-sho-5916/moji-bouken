import { AnimatePresence, motion } from 'framer-motion';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { slideUp } from '../utils/motion';

export function OfflineNotice() {
  const { message } = useOnlineStatus();

  return (
    <AnimatePresence>
      {message ? (
        <motion.p
          animate="enter"
          aria-live="polite"
          className="pointer-events-none fixed bottom-24 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-[var(--radius-pill)] bg-[var(--color-text)] px-4 py-3 text-center text-sm font-bold text-white shadow-[var(--shadow-soft)]"
          exit="exit"
          initial="initial"
          role="status"
          variants={slideUp}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
