import type { MissionViewModel } from '../types';
import { ChoiceGrid } from './ChoiceGrid';

type LetterSearchMissionProps = {
  viewModel: MissionViewModel;
  selectedValue: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
};

export function LetterSearchMission({
  viewModel,
  selectedValue,
  disabled,
  onSelect,
}: LetterSearchMissionProps) {
  return (
    <section className="grid gap-5">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-center">
        <p className="text-lg font-black text-[var(--color-text-muted)]">
          さがす もじ
        </p>
        <p className="mt-2 text-7xl font-black text-[var(--color-primary-strong)]">
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
