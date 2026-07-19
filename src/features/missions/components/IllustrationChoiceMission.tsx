import type { MissionViewModel } from '../types';
import { ChoiceGrid } from './ChoiceGrid';

type IllustrationChoiceMissionProps = {
  viewModel: MissionViewModel;
  selectedValue: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
};

export function IllustrationChoiceMission({
  viewModel,
  selectedValue,
  disabled,
  onSelect,
}: IllustrationChoiceMissionProps) {
  return (
    <section className="grid gap-5">
      <div className="flex min-h-44 items-center justify-center rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
        {viewModel.illustration ? (
          <img
            alt={viewModel.illustration.altText}
            className="max-h-36 max-w-full object-contain"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
            src={viewModel.illustration.assetPath}
          />
        ) : null}
        <span
          aria-hidden={Boolean(viewModel.illustration)}
          className="text-6xl"
        >
          {viewModel.illustration?.fallbackText ?? viewModel.targetText}
        </span>
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
