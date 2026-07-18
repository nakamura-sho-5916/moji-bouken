import type { Variants } from 'framer-motion';

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export const buttonTap = {
  scale: 0.96,
  transition: { duration: 0.12 },
};

export const modalTransition: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.24, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: 24,
    scale: 0.98,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export const rewardPop: Variants = {
  initial: { opacity: 0, scale: 0.7 },
  enter: {
    opacity: 1,
    scale: [0.7, 1.08, 1],
    transition: { duration: 0.56, ease: 'easeOut' },
  },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.24 } },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.16 } },
};
