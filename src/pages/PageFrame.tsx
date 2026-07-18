import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { buttonTap } from '../utils/motion';

type PageFrameProps = {
  title: string;
  description: string;
  children?: ReactNode;
  showBack?: boolean;
};

export function PageFrame({
  title,
  description,
  children,
  showBack = true,
}: PageFrameProps) {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-full flex-col gap-5">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
          {title}
        </h1>
        <p className="mt-3 text-lg font-bold text-[var(--color-text-muted)]">
          {description}
        </p>
      </div>
      {children}
      <div className="mt-auto grid gap-3">
        {showBack ? (
          <motion.button
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-4 font-black text-[var(--color-text)]"
            onClick={() => navigate(-1)}
            type="button"
            whileTap={buttonTap}
          >
            もどる
          </motion.button>
        ) : null}
        <Link
          className="flex min-h-11 items-center justify-center rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-4 font-black text-white"
          to="/home"
        >
          ホームへ
        </Link>
      </div>
    </section>
  );
}
