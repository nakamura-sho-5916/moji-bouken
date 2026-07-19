type ComboDisplayProps = {
  comboCount: number;
};

export function ComboDisplay({ comboCount }: ComboDisplayProps) {
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
    <div className="rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-3 text-center font-black">
      <p className="text-sm text-[var(--color-text-muted)]">コンボ</p>
      <p className="text-2xl text-[var(--color-secondary)]">{message}</p>
    </div>
  );
}
