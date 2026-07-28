import { EnemyArtwork } from '../../assets';
import { EffectBurst } from '../../effects';
import type { Enemy } from '../types';

type BossDefeatCinematicProps = {
  enemy: Enemy | null;
  visible: boolean;
};

export function BossDefeatCinematic({
  enemy,
  visible,
}: BossDefeatCinematicProps) {
  if (!visible || !enemy) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden rounded-[var(--radius-large)] border-2 border-amber-300 bg-slate-950 p-5 text-center text-white shadow-sm"
      data-testid="boss-defeat-cinematic"
    >
      <div className="absolute inset-0 bg-amber-300/10 motion-safe:animate-[game-boss-victory-glow_1.4s_ease-in-out_infinite]" />
      <div className="relative grid gap-3">
        <p className="text-sm font-black text-amber-200">ボス撃破</p>
        <EnemyArtwork
          alt={enemy.name}
          className="max-w-44 motion-safe:animate-[game-boss-defeat-vanish_1.1s_ease-in_1]"
          defeated
          enemyId={enemy.id}
        />
        <div className="mx-auto flex items-center justify-center gap-2">
          <EffectBurst size="sm" tone="victory" />
          <h1 className="text-4xl font-black tracking-normal text-amber-200">
            VICTORY
          </h1>
          <EffectBurst size="sm" tone="victory" />
        </div>
        <p className="text-lg font-black">{enemy.name}を たおした！</p>
        <p className="text-sm font-bold text-amber-100">
          あたらしい道が ひらいていくよ
        </p>
      </div>
    </section>
  );
}
