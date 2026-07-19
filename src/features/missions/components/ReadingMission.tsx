import type { MissionViewModel } from '../types';
import { ChoiceGrid } from './ChoiceGrid';

type ReadingMissionProps = {
  viewModel: MissionViewModel;
  selectedValue: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
};

export function ReadingMission({
  viewModel,
  selectedValue,
  disabled,
  onSelect,
}: ReadingMissionProps) {
  return (
    <section className="grid gap-5">
      <div
        className={[
          'mx-auto flex min-h-44 items-center justify-center rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-4xl font-black leading-loose',
          viewModel.orientation === 'vertical'
            ? '[writing-mode:vertical-rl]'
            : '',
        ].join(' ')}
      >
        {viewModel.word ?? viewModel.targetText}
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
