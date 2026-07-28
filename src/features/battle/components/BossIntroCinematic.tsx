import { useEffect } from 'react';
import { EnemyArtwork } from '../../assets';
import { BOSS_INTRO_DURATION_MS } from '../bossBattlePresentation';
import type { Enemy } from '../types';

type BossIntroCinematicProps = {
  enemy: Enemy;
  visible: boolean;
  onComplete?: () => void;
};

export function BossIntroCinematic({
  enemy,
  visible,
  onComplete,
}: BossIntroCinematicProps) {
  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onComplete?.();
    }, BOSS_INTRO_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [onComplete, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 px-4 text-center text-white motion-safe:animate-[game-boss-darken_.28s_ease-out_1]"
      data-testid="boss-intro-cinematic"
    >
      <div className="grid w-full max-w-sm gap-3">
        <p className="text-5xl font-black text-amber-300 motion-safe:animate-[game-boss-warning_.5s_ease-out_1]">
          ！！
        </p>
        <p className="text-xl font-black tracking-normal text-orange-100">
          強大な気配…
        </p>
        <p className="text-4xl font-black tracking-normal text-red-300 motion-safe:animate-[game-boss-title_.8s_ease-out_1]">
          BOSS
        </p>
        <h2 className="text-3xl font-black tracking-normal">{enemy.name}</h2>
        <EnemyArtwork
          alt={enemy.name}
          className="max-w-64 motion-safe:animate-[game-boss-zoom_.85s_ease-out_1]"
          enemyId={enemy.id}
        />
      </div>
    </div>
  );
}
