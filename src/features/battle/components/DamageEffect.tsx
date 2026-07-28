import { ImpactSlash } from '../../effects';

type DamageEffectProps = {
  damage: number;
  bossMode?: boolean;
};

export function DamageEffect({ bossMode = false, damage }: DamageEffectProps) {
  if (damage <= 0) {
    return null;
  }

  return (
    <div
      className={[
        'relative overflow-hidden rounded-[var(--radius-medium)] p-3 text-center text-xl font-black motion-safe:animate-[game-impact-card_.28s_ease-out_1]',
        bossMode
          ? 'border-2 border-red-300 bg-red-50 text-red-700'
          : 'bg-orange-50 text-[var(--color-primary-strong)]',
      ].join(' ')}
    >
      <ImpactSlash />
      {bossMode ? (
        <span className="absolute inset-0 bg-amber-200/30 motion-safe:animate-[game-boss-attack-flash_.32s_ease-out_1]" />
      ) : null}
      <p className="relative">ことばで こうげき！</p>
    </div>
  );
}
