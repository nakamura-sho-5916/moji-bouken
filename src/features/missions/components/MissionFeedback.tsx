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
        きろくしているよ
      </p>
    );
  }

  if (errorMessage) {
    return (
      <p
        aria-live="polite"
        className="rounded-[var(--radius-medium)] border-2 border-[var(--color-warning)] bg-white p-4 text-lg font-black"
      >
        もういちど ためしてみよう
      </p>
    );
  }

  if (state === 'correct') {
    return (
      <p
        aria-live="polite"
        className="rounded-[var(--radius-medium)] border-2 border-[var(--color-success)] bg-white p-4 text-lg font-black text-[var(--color-success)]"
      >
        やったね
      </p>
    );
  }

  if (state === 'incorrect') {
    return (
      <p
        aria-live="polite"
        className="rounded-[var(--radius-medium)] border-2 border-[var(--color-warning)] bg-white p-4 text-lg font-black text-[var(--color-text)]"
      >
        もういちど みてみよう
      </p>
    );
  }

  return null;
}
