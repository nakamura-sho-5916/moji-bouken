import { ImpactSlash } from '../../effects';

type DamageEffectProps = {
  damage: number;
};

export function DamageEffect({ damage }: DamageEffectProps) {
  if (damage <= 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-medium)] bg-orange-50 p-3 text-center text-xl font-black text-[var(--color-primary-strong)] motion-safe:animate-[game-impact-card_.28s_ease-out_1]">
      <ImpactSlash />
      <p className="relative">ことばが とどいた</p>
    </div>
  );
}
