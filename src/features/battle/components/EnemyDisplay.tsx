import { EnemyArtwork } from '../../assets';
import { EffectBurst } from '../../effects';
import type { BossBattleMoment } from '../bossBattlePresentation';
import type { Enemy } from '../types';
import { EnemyHealthBar } from './EnemyHealthBar';

type EnemyDisplayProps = {
  enemy: Enemy;
  currentHp: number;
  bossMode?: boolean;
  bossMoment?: BossBattleMoment | null;
};

export function EnemyDisplay({
  bossMode = false,
  bossMoment = null,
  enemy,
  currentHp,
}: EnemyDisplayProps) {
  const hit = currentHp > 0 && currentHp < enemy.maxHp;
  const defeated = currentHp <= 0;

  return (
    <section
      className={[
        'relative overflow-hidden rounded-[var(--radius-large)] border p-5 text-center shadow-sm',
        bossMode
          ? 'border-red-300 bg-gradient-to-b from-slate-950 to-red-950 text-white'
          : 'border-[var(--color-border)] bg-white',
        bossMode && (hit || bossMoment)
          ? 'motion-safe:animate-[game-boss-screen-shake_.24s_ease-out_1]'
          : '',
      ].join(' ')}
    >
      {bossMode ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,.18),transparent_58%)] motion-safe:animate-[game-boss-aura_1.8s_ease-in-out_infinite]" />
      ) : null}
      {bossMode ? (
        <p className="relative mx-auto mb-2 w-fit rounded-full border border-red-300 bg-red-500 px-3 py-1 text-xs font-black text-white">
          BOSS
        </p>
      ) : null}
      <p
        className={[
          'relative text-sm font-black',
          bossMode ? 'text-amber-100' : 'text-[var(--color-text-muted)]',
        ].join(' ')}
      >
        {defeated ? enemy.defeatLine : enemy.battleLine}
      </p>
      <div className="relative my-4">
        {hit ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <EffectBurst
              className={bossMode ? 'scale-125' : undefined}
              size="lg"
              tone="impact"
            />
          </div>
        ) : null}
        {defeated ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <EffectBurst size="lg" tone="victory" />
          </div>
        ) : null}
        <EnemyArtwork
          alt={enemy.name}
          className={bossMode ? 'max-w-80 sm:max-w-96' : 'max-w-72 sm:max-w-80'}
          defeated={defeated}
          enemyId={enemy.id}
          hit={hit}
        />
      </div>
      <h1
        className={[
          'relative text-2xl font-black',
          bossMode ? 'text-amber-200' : 'text-[var(--color-primary-strong)]',
        ].join(' ')}
      >
        {enemy.name}
      </h1>
      <div className="relative mt-4">
        <EnemyHealthBar
          boss={bossMode}
          currentHp={currentHp}
          maxHp={enemy.maxHp}
        />
      </div>
    </section>
  );
}
