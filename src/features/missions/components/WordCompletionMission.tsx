import type { MissionViewModel } from '../types';
import { ChoiceGrid } from './ChoiceGrid';

type WordCompletionMissionProps = {
  viewModel: MissionViewModel;
  selectedValue: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
};

export function WordCompletionMission({
  viewModel,
  selectedValue,
  disabled,
  onSelect,
}: WordCompletionMissionProps) {
  const missing = viewModel.missingWord;

  return (
    <section className="grid gap-5">
      <div className="flex min-h-32 items-center justify-center rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-5xl font-black">
        <span>{missing?.before}</span>
        <span className="mx-2 inline-flex min-h-16 min-w-16 items-center justify-center rounded-[var(--radius-medium)] border-2 border-dashed border-[var(--color-secondary)] text-[var(--color-secondary)]">
          {selectedValue ?? ' '}
        </span>
        <span>{missing?.after}</span>
      </div>
      <ChoiceGrid
        choices={viewModel.choices}
        disabled={disabled}
        onSelect={onSelect}
        selectedValue={selectedValue}
      />
    </section>
  );
}
