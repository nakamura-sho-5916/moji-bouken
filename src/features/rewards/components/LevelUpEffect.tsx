type LevelUpEffectProps = {
  visible: boolean;
};

export function LevelUpEffect({ visible }: LevelUpEffectProps) {
  if (!visible) {
    return null;
  }

  return (
    <p className="rounded-[var(--radius-large)] border-2 border-[var(--color-primary)] bg-white p-4 text-center text-xl font-black text-[var(--color-primary-strong)]">
      あたらしい ちからが めざめたよ
    </p>
  );
}
