import { AnswerEffect } from '../../effects';
import type { MissionAnswerState } from '../types';

type MissionFeedbackProps = {
  state: MissionAnswerState;
  saving: boolean;
  errorMessage?: string;
};

export function MissionFeedback({
  state,
  saving,
  errorMessage,
}: MissionFeedbackProps) {
  if (saving) {
    return (
      <p
        aria-live="polite"
        className="rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-4 text-lg font-black"
      >
        縺阪ｍ縺上＠縺ｦ縺・ｋ繧・
      </p>
    );
  }

  if (errorMessage) {
    return (
      <p
        aria-live="polite"
        className="rounded-[var(--radius-medium)] border-2 border-[var(--color-warning)] bg-white p-4 text-lg font-black"
      >
        繧ゅ≧縺・■縺ｩ 縺溘ａ縺励※縺ｿ繧医≧
      </p>
    );
  }

  if (state === 'correct') {
    return (
      <p
        aria-live="polite"
        className="relative overflow-hidden rounded-[var(--radius-medium)] border-2 border-[var(--color-success)] bg-white p-4 pr-24 text-lg font-black text-[var(--color-success)] motion-safe:animate-[game-answer-correct_.32s_ease-out_1]"
      >
        <AnswerEffect correct />
        繧・▲縺溘・
      </p>
    );
  }

  if (state === 'incorrect') {
    return (
      <p
        aria-live="polite"
        className="relative overflow-hidden rounded-[var(--radius-medium)] border-2 border-[var(--color-warning)] bg-white p-4 pr-24 text-lg font-black text-[var(--color-text)] motion-safe:animate-[game-answer-retry_.28s_ease-out_1]"
      >
        <AnswerEffect correct={false} />
        繧ゅ≧縺・■縺ｩ 縺ｿ縺ｦ縺ｿ繧医≧
      </p>
    );
  }

  return null;
}
