import type { MissionViewModel } from '../types';

type TextSearchMissionProps = {
  viewModel: MissionViewModel;
  selectedValue: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
};

export function TextSearchMission({
  viewModel,
  selectedValue,
  disabled,
  onSelect,
}: TextSearchMissionProps) {
  return (
    <section className="grid gap-5">
      <div
        aria-label={viewModel.prompt}
        className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-xl font-black leading-loose"
      >
        {viewModel.prompt}
      </div>
      <div className="grid gap-3">
        {(viewModel.textSearchUnits ?? []).map((unit) => (
          <button
            className={[
              'min-h-14 rounded-[var(--radius-medium)] border-2 bg-white px-4 text-xl font-black',
              selectedValue === unit.value
                ? 'border-[var(--color-secondary)]'
                : 'border-[var(--color-border)]',
            ].join(' ')}
            disabled={disabled}
            key={unit.id}
            onClick={() => onSelect(unit.value)}
            type="button"
          >
            {unit.label}
          </button>
        ))}
      </div>
    </section>
  );
}
