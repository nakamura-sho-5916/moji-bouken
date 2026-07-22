import type { ReactNode } from 'react';
import type { GameEffectTone } from '../types';
import { EffectBurst } from './EffectBurst';

type SceneEffectProps = {
  tone: GameEffectTone;
  title: string;
  children?: ReactNode;
  className?: string;
};

export function SceneEffect({
  tone,
  title,
  children,
  className,
}: SceneEffectProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 text-center shadow-sm',
        'motion-safe:animate-[game-card-pop_.42s_ease-out_1]',
        className ?? '',
      ].join(' ')}
      data-testid={`scene-effect-${tone}`}
    >
      <div className="absolute -right-6 -top-7 opacity-25">
        <EffectBurst size="lg" tone={tone} />
      </div>
      <div className="relative">
        <p className="text-lg font-black text-[var(--color-primary-strong)]">
          {title}
        </p>
        {children ? <div className="mt-2">{children}</div> : null}
      </div>
    </div>
  );
}
