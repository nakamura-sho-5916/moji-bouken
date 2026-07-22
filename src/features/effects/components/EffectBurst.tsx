import type { GameEffectSize, GameEffectTone } from '../types';

type EffectBurstProps = {
  tone: GameEffectTone;
  size?: GameEffectSize;
  label?: string;
  className?: string;
};

const toneClasses: Record<GameEffectTone, string> = {
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  impact: 'text-orange-500',
  victory: 'text-sky-500',
  level: 'text-violet-500',
  treasure: 'text-yellow-500',
  companion: 'text-pink-500',
  recovery: 'text-emerald-500',
  shop: 'text-cyan-500',
  rare: 'text-indigo-500',
};

const sizeClasses: Record<GameEffectSize, string> = {
  sm: 'size-16',
  md: 'size-24',
  lg: 'size-32',
};

export function EffectBurst({
  tone,
  size = 'md',
  label,
  className,
}: EffectBurstProps) {
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={[
        'pointer-events-none shrink-0 motion-safe:animate-[game-burst_.72s_ease-out_1]',
        toneClasses[tone],
        sizeClasses[size],
        className ?? '',
      ].join(' ')}
      data-testid={`effect-burst-${tone}`}
      role={label ? 'img' : undefined}
      viewBox="0 0 120 120"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <circle className="opacity-20" cx="60" cy="60" r="34" strokeWidth="8" />
        <path d="M60 8v20M60 92v20M8 60h20M92 60h20" strokeWidth="8" />
        <path
          d="M23 23l14 14M83 83l14 14M97 23 83 37M37 83 23 97"
          strokeWidth="7"
        />
      </g>
      <g fill="currentColor">
        <circle cx="60" cy="60" r="13" />
        <circle cx="42" cy="47" r="5" />
        <circle cx="78" cy="47" r="5" />
        <circle cx="48" cy="78" r="4" />
        <circle cx="76" cy="76" r="4" />
      </g>
    </svg>
  );
}
