type EnemyHealthBarProps = {
  currentHp: number;
  maxHp: number;
  boss?: boolean;
};

export function EnemyHealthBar({
  boss = false,
  currentHp,
  maxHp,
}: EnemyHealthBarProps) {
  const ratio = maxHp <= 0 ? 0 : Math.max(0, currentHp / maxHp);

  return (
    <div className="grid gap-2" aria-label="てきのHP">
      <div
        className={[
          'overflow-hidden rounded-[var(--radius-pill)]',
          boss
            ? 'h-7 border-2 border-red-300 bg-red-100 shadow-inner'
            : 'h-5 bg-orange-100',
        ].join(' ')}
      >
        <div
          className={[
            'h-full rounded-[var(--radius-pill)] transition-all',
            boss
              ? 'bg-gradient-to-r from-red-500 via-orange-400 to-amber-300'
              : 'bg-[var(--color-primary)]',
          ].join(' ')}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p
        className={[
          'text-right font-black',
          boss
            ? 'text-sm text-red-700'
            : 'text-xs text-[var(--color-text-muted)]',
        ].join(' ')}
      >
        HP {currentHp} / {maxHp}
      </p>
    </div>
  );
}
