import type { MissionViewModel } from '../types';
import { ChoiceGrid } from './ChoiceGrid';

type SimilarLetterChoiceMissionProps = {
  viewModel: MissionViewModel;
  selectedValue: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
};

export function SimilarLetterChoiceMission({
  viewModel,
  selectedValue,
  disabled,
  onSelect,
}: SimilarLetterChoiceMissionProps) {
  return (
    <section className="grid gap-5">
      <div className="rounded-[var(--radius-large)] border-2 border-[var(--color-secondary)] bg-white p-5 text-center">
        <p className="text-lg font-black text-[var(--color-text-muted)]">
          この もじを みつけよう
        </p>
        <p className="mt-2 text-7xl font-black text-[var(--color-secondary)]">
          {viewModel.targetText}
        </p>
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
