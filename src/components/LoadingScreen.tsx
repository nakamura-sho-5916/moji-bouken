import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div
      aria-live="polite"
      className="flex min-h-60 flex-col items-center justify-center gap-4 text-center"
      role="status"
    >
      <motion.div
        animate={{ rotate: [-3, 3, -3], y: [0, -4, 0] }}
        aria-hidden="true"
        className="text-6xl"
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        📖
      </motion.div>
      <p className="text-xl font-black text-[var(--color-primary-strong)]">
        じゅんびちゅう…
      </p>
    </div>
  );
}
