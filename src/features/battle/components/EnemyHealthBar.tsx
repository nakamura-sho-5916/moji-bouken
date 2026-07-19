type EnemyHealthBarProps = {
  currentHp: number;
  maxHp: number;
};

export function EnemyHealthBar({ currentHp, maxHp }: EnemyHealthBarProps) {
  const ratio = maxHp <= 0 ? 0 : Math.max(0, currentHp / maxHp);

  return (
    <div className="grid gap-2" aria-label="てきのHP">
      <div className="h-5 overflow-hidden rounded-[var(--radius-pill)] bg-orange-100">
        <div
          className="h-full rounded-[var(--radius-pill)] bg-[var(--color-primary)] transition-all"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="text-right text-xs font-black text-[var(--color-text-muted)]">
        HP {currentHp} / {maxHp}
      </p>
    </div>
  );
}
