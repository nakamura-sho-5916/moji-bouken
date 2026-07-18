import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { buttonTap, rewardPop } from '../utils/motion';

export function TitlePage() {
  return (
    <section className="flex min-h-full flex-col items-center justify-center gap-6 text-center">
      <motion.div animate="enter" initial="initial" variants={rewardPop}>
        <h1 className="text-[length:var(--font-size-hero)] font-black leading-tight text-[var(--color-primary-strong)]">
          もじぼうけん！
        </h1>
      </motion.div>
      <p className="text-xl font-black text-[var(--color-text-muted)]">
        ことばのせかいを すくおう
      </p>
      <motion.div whileTap={buttonTap}>
        <Link
          className="flex min-h-14 items-center justify-center rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-10 text-xl font-black text-white shadow-[var(--shadow-soft)]"
          to="/home"
        >
          はじめる
        </Link>
      </motion.div>
    </section>
  );
}
