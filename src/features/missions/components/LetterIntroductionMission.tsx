import type { MissionViewModel } from '../types';

type LetterIntroductionMissionProps = {
  viewModel: MissionViewModel;
  onComplete: () => void;
};

export function LetterIntroductionMission({
  viewModel,
  onComplete,
}: LetterIntroductionMissionProps) {
  return (
    <section className="grid gap-5">
      <div className="flex min-h-48 items-center justify-center rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white">
        <span className="text-8xl font-black text-[var(--color-primary-strong)]">
          {viewModel.targetText}
        </span>
      </div>
      <p className="text-center text-xl font-black text-[var(--color-text)]">
        この もじを おぼえよう
      </p>
      <button
        className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
        onClick={onComplete}
        type="button"
      >
        おぼえた
      </button>
    </section>
  );
}
