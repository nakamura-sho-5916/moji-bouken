import {
  getTownReconstructionStep,
  TOWN_RECONSTRUCTION_STEPS,
} from '../reconstructionStages';

const townParts = [
  { stage: 1, label: '土台', className: 'bg-stone-200 text-stone-800' },
  { stage: 2, label: '家', className: 'bg-amber-200 text-amber-900' },
  { stage: 3, label: '木', className: 'bg-emerald-200 text-emerald-900' },
  { stage: 4, label: '橋', className: 'bg-sky-200 text-sky-900' },
  { stage: 5, label: '宿屋', className: 'bg-rose-200 text-rose-900' },
  { stage: 7, label: '市場', className: 'bg-orange-200 text-orange-900' },
  { stage: 8, label: '噴水', className: 'bg-cyan-200 text-cyan-900' },
  { stage: 9, label: '教会', className: 'bg-violet-200 text-violet-900' },
  { stage: 10, label: '城', className: 'bg-indigo-200 text-indigo-900' },
] as const;

export function RecoveryScene({ stage }: { stage: number }) {
  const currentStep = getTownReconstructionStep(stage);
  const residents =
    TOWN_RECONSTRUCTION_STEPS[
      Math.min(stage, TOWN_RECONSTRUCTION_STEPS.length - 1)
    ]?.residents ?? [];

  return (
    <div
      className={[
        'rounded-[var(--radius-large)] border border-white/70 p-3 transition-colors',
        stage > 0 ? 'bg-lime-50' : 'bg-slate-100 grayscale',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-[var(--color-primary-strong)]">
          {currentStep.title}
        </p>
        <span className="rounded-[var(--radius-pill)] bg-white px-3 py-1 text-xs font-black text-[var(--color-text-muted)]">
          {stage}/10
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {townParts.map((part) => {
          const complete = stage >= part.stage;
          return (
            <div
              className={[
                'flex min-h-12 items-center justify-center rounded-[var(--radius-medium)] border px-1 text-center text-sm font-black transition-all',
                complete
                  ? `${part.className} border-white shadow-sm motion-safe:animate-[game-building-pop_420ms_ease-out]`
                  : 'border-slate-200 bg-white/55 text-slate-400 opacity-55',
              ].join(' ')}
              key={part.stage}
            >
              {part.label}
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-[var(--radius-medium)] bg-white/80 p-2">
        <p className="text-xs font-black text-[var(--color-text-muted)]">
          住人
        </p>
        {residents.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {residents.map((resident) => (
              <span
                className="rounded-[var(--radius-pill)] bg-[var(--color-secondary)] px-2 py-1 text-xs font-black text-white motion-safe:animate-[game-resident-walk_900ms_ease-in-out]"
                key={resident}
              >
                {resident}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm font-bold text-[var(--color-text-muted)]">
            まだ だれも いないよ
          </p>
        )}
      </div>
    </div>
  );
}
