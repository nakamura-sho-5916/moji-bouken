import { EnemyArtwork } from '../../assets';
import { EffectBurst } from '../../effects';
import type { Enemy } from '../types';
import { EnemyHealthBar } from './EnemyHealthBar';

type EnemyDisplayProps = {
  enemy: Enemy;
  currentHp: number;
};

export function EnemyDisplay({ enemy, currentHp }: EnemyDisplayProps) {
  const hit = currentHp > 0 && currentHp < enemy.maxHp;
  const defeated = currentHp <= 0;

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-center shadow-sm">
      <p className="text-sm font-black text-[var(--color-text-muted)]">
        {defeated ? enemy.defeatLine : enemy.battleLine}
      </p>
      <div className="relative my-4">
        {hit ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <EffectBurst size="lg" tone="impact" />
          </div>
        ) : null}
        {defeated ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <EffectBurst size="lg" tone="victory" />
          </div>
        ) : null}
        <EnemyArtwork defeated={defeated} enemyId={enemy.id} hit={hit} />
      </div>
      <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
        {enemy.name}
      </h1>
      <div className="mt-4">
        <EnemyHealthBar currentHp={currentHp} maxHp={enemy.maxHp} />
      </div>
    </section>
  );
}
