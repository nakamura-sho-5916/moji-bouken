import { useMemo } from 'react';
import type { MissionChoice, MissionViewModel } from '../types';

type WordOrderingMissionProps = {
  viewModel: MissionViewModel;
  selectedValue: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
};

export function WordOrderingMission({
  viewModel,
  selectedValue,
  disabled,
  onSelect,
}: WordOrderingMissionProps) {
  const selectedPieces = useMemo(
    () => Array.from(selectedValue ?? ''),
    [selectedValue],
  );

  const handleChoice = (choice: MissionChoice) => {
    if (!selectedValue) {
      onSelect(choice.value);
      return;
    }
    onSelect(choice.value);
  };

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <div className="flex min-h-16 flex-wrap justify-center gap-2">
          {(viewModel.orderedSlots ?? []).map((_, index) => (
            <span
              className="flex min-h-14 min-w-14 items-center justify-center rounded-[var(--radius-medium)] border-2 border-[var(--color-border)] text-3xl font-black"
              key={index}
            >
              {selectedPieces[index] ?? ''}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {viewModel.choices.map((choice) => (
          <button
            className="min-h-16 rounded-[var(--radius-medium)] border-2 border-[var(--color-border)] bg-white p-3 text-3xl font-black shadow-sm"
            disabled={disabled}
            key={choice.id}
            onClick={() => handleChoice(choice)}
            type="button"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}
