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
  const remainingChoices = useMemo(() => {
    const remaining = [...viewModel.choices];
    for (const piece of selectedPieces) {
      const index = remaining.findIndex((choice) => choice.value === piece);
      if (index >= 0) {
        remaining.splice(index, 1);
      }
    }
    return remaining;
  }, [selectedPieces, viewModel.choices]);
  const completed =
    selectedPieces.length >= (viewModel.orderedSlots ?? []).length;

  const handleChoice = (choice: MissionChoice) => {
    if (completed) {
      return;
    }
    onSelect(`${selectedValue ?? ''}${choice.value}`);
  };

  const handleBack = () => {
    onSelect(selectedPieces.slice(0, -1).join(''));
  };

  const handleReset = () => {
    onSelect('');
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
      <div className="grid grid-cols-2 gap-3">
        <button
          className="min-h-12 rounded-[var(--radius-medium)] border-2 border-[var(--color-border)] bg-white px-4 text-lg font-black disabled:opacity-50"
          disabled={disabled || selectedPieces.length === 0}
          onClick={handleBack}
          type="button"
        >
          ひとつ もどす
        </button>
        <button
          className="min-h-12 rounded-[var(--radius-medium)] border-2 border-[var(--color-border)] bg-white px-4 text-lg font-black disabled:opacity-50"
          disabled={disabled || selectedPieces.length === 0}
          onClick={handleReset}
          type="button"
        >
          さいしょから
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {remainingChoices.map((choice) => (
          <button
            className="min-h-16 rounded-[var(--radius-medium)] border-2 border-[var(--color-border)] bg-white p-3 text-3xl font-black shadow-sm"
            disabled={disabled || completed}
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
