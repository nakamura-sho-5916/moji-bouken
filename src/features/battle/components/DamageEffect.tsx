type DamageEffectProps = {
  damage: number;
};

export function DamageEffect({ damage }: DamageEffectProps) {
  if (damage <= 0) {
    return null;
  }

  return (
    <p className="rounded-[var(--radius-medium)] bg-orange-50 p-3 text-center text-xl font-black text-[var(--color-primary-strong)]">
      ことばが とどいた
    </p>
  );
}
