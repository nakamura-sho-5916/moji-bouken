type ComboDisplayProps = {
  comboCount: number;
  bossMode?: boolean;
};

export function ComboDisplay({
  bossMode = false,
  comboCount,
}: ComboDisplayProps) {
  const message =
    comboCount >= 10
      ? 'パーフェクト'
      : comboCount >= 5
        ? 'ことばの ちから'
        : comboCount >= 3
          ? 'すごい'
          : comboCount >= 2
            ? 'いいかんじ'
            : 'つぎも いこう';

  return (
    <div
      className={[
        'rounded-[var(--radius-medium)] border p-3 text-center font-black',
        bossMode
          ? 'border-amber-300 bg-slate-900 text-white motion-safe:animate-[game-boss-combo-pulse_.6s_ease-out_1]'
          : 'border-[var(--color-border)] bg-white',
      ].join(' ')}
    >
      <p
        className={[
          'text-sm',
          bossMode ? 'text-amber-100' : 'text-[var(--color-text-muted)]',
        ].join(' ')}
      >
        コンボ
      </p>
      <p
        className={[
          'text-2xl',
          bossMode ? 'text-amber-200' : 'text-[var(--color-secondary)]',
        ].join(' ')}
      >
        {message}
      </p>
    </div>
  );
}
