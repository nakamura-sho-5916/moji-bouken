type SpecialGaugeProps = {
  value: number;
  max: number;
};

export function SpecialGauge({ value, max }: SpecialGaugeProps) {
  const ratio = max <= 0 ? 0 : Math.min(1, value / max);

  return (
    <div className="rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-3">
      <p className="text-sm font-black text-[var(--color-text-muted)]">
        ことばフラッシュ
      </p>
      <div className="mt-2 h-4 overflow-hidden rounded-[var(--radius-pill)] bg-sky-100">
        <div
          className="h-full rounded-[var(--radius-pill)] bg-[var(--color-secondary)] transition-all"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
