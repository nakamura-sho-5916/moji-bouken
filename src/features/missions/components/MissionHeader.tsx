type MissionHeaderProps = {
  title: string;
  prompt: string;
  currentIndex: number;
  totalCount: number;
  onBack: () => void;
};

export function MissionHeader({
  title,
  prompt,
  currentIndex,
  totalCount,
  onBack,
}: MissionHeaderProps) {
  return (
    <header className="grid gap-3">
      <button
        className="min-h-11 w-fit rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-4 text-base font-black"
        onClick={onBack}
        type="button"
      >
        もどる
      </button>
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
            {title}
          </h1>
          <span className="text-sm font-black text-[var(--color-text-muted)]">
            {currentIndex + 1} / {totalCount}
          </span>
        </div>
        <p className="mt-3 text-lg font-black text-[var(--color-text)]">
          {prompt}
        </p>
      </div>
    </header>
  );
}
