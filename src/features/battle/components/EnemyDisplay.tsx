import { EnemyArtwork } from '../../assets';
import type { Enemy } from '../types';
import { EnemyHealthBar } from './EnemyHealthBar';

type EnemyDisplayProps = {
  enemy: Enemy;
  currentHp: number;
};

export function EnemyDisplay({ enemy, currentHp }: EnemyDisplayProps) {
  return (
    <section className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-center shadow-sm">
      <p className="text-sm font-black text-[var(--color-text-muted)]">
        てきが あらわれた
      </p>
      <div className="my-4">
        <EnemyArtwork
          defeated={currentHp <= 0}
          enemyId={enemy.id}
          hit={currentHp > 0 && currentHp < enemy.maxHp}
        />
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
