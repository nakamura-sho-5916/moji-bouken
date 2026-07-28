import { useState } from 'react';
import { Link } from '../router';
import { motion } from 'framer-motion';
import { buttonTap, rewardPop } from '../utils/motion';
import {
  getStoryEvent,
  hasSeenStoryEvent,
  StoryEventPlayer,
} from '../features/story';
import { useNavigate } from '../router';

export function TitlePage() {
  const navigate = useNavigate();
  const openingStory = getStoryEvent('opening');
  const [activeOpening, setActiveOpening] = useState<typeof openingStory>(null);

  return (
    <section className="flex min-h-full flex-col items-center justify-center gap-6 text-center">
      <StoryEventPlayer
        event={activeOpening}
        onComplete={() => {
          setActiveOpening(null);
          navigate('/home');
        }}
      />
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
          onClick={(event) => {
            if (!openingStory || hasSeenStoryEvent(openingStory.id)) {
              return;
            }
            event.preventDefault();
            setActiveOpening(openingStory);
          }}
          to="/home"
        >
          はじめる
        </Link>
      </motion.div>
    </section>
  );
}
