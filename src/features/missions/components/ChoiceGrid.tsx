import type { MissionChoice } from '../types';

type ChoiceGridProps = {
  choices: MissionChoice[];
  selectedValue: string | null;
  disabled?: boolean;
  onSelect: (value: string) => void;
};

export function ChoiceGrid({
  choices,
  selectedValue,
  disabled = false,
  onSelect,
}: ChoiceGridProps) {
  return (
    <div aria-label="選択肢" className="grid grid-cols-2 gap-3" role="group">
      {choices.map((choice) => (
        <button
          className={[
            'min-h-16 rounded-[var(--radius-medium)] border-2 bg-white p-3 text-2xl font-black shadow-sm transition',
            selectedValue === choice.value
              ? 'border-[var(--color-secondary)]'
              : 'border-[var(--color-border)]',
          ].join(' ')}
          disabled={disabled}
          key={choice.id}
          onClick={() => onSelect(choice.value)}
          type="button"
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
