import { AnimatePresence, motion } from 'framer-motion';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { modalTransition } from '../utils/motion';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  });

  return (
    <AnimatePresence>
      {needRefresh ? (
        <motion.div
          animate="enter"
          className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] px-4 pb-[calc(env(safe-area-inset-bottom)+16px)]"
          exit="exit"
          initial="initial"
          variants={modalTransition}
        >
          <section className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)]">
            <p className="text-base font-black text-[var(--color-text)]">
              あたらしい じゅんびが できたよ
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="min-h-11 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-3 font-black text-white"
                onClick={() => void updateServiceWorker(true)}
                type="button"
              >
                あたらしくする
              </button>
              <button
                className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-3 font-black text-[var(--color-text)]"
                onClick={() => setNeedRefresh(false)}
                type="button"
              >
                あとで
              </button>
            </div>
          </section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
