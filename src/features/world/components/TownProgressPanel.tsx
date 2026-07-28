import type { AreaViewModel } from '../types';
import {
  getTownReconstructionStep,
  MAX_TOWN_RECONSTRUCTION_STAGE,
} from '../reconstructionStages';

export function TownProgressPanel({ area }: { area: AreaViewModel }) {
  const filledBlocks = Math.round(area.reconstructionPercent / 10);
  const blocks = Array.from({ length: 10 }, (_, index) => index < filledBlocks);
  const currentStep = getTownReconstructionStep(area.reconstructionStage);
  const nextStep = getTownReconstructionStep(
    Math.min(area.reconstructionStage + 1, MAX_TOWN_RECONSTRUCTION_STAGE),
  );
  const complete =
    area.reconstructionStage >= MAX_TOWN_RECONSTRUCTION_STAGE ||
    area.pointsToNextReconstructionStage === 0;

  return (
    <section className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-black text-[var(--color-text-muted)]">
            まちの 復興率
          </p>
          <p className="text-2xl font-black text-[var(--color-primary-strong)]">
            {currentStep.title}
          </p>
        </div>
        <p className="text-xl font-black text-[var(--color-primary-strong)]">
          {area.reconstructionPercent}%
        </p>
      </div>
      <div
        aria-label={`復興率 ${area.reconstructionPercent}%`}
        className="mt-3 grid grid-cols-10 gap-1"
      >
        {blocks.map((filled, index) => (
          <span
            className={[
              'h-4 rounded-[var(--radius-pill)]',
              filled ? 'bg-[var(--color-primary)]' : 'bg-slate-200',
            ].join(' ')}
            key={index}
          />
        ))}
      </div>
      <p className="mt-3 text-sm font-black text-[var(--color-text-muted)]">
        {complete
          ? '町は すっかり 元気に なったよ'
          : `次は「${nextStep.title}」まで あと${area.pointsToNextReconstructionStage}ポイント`}
      </p>
    </section>
  );
}
