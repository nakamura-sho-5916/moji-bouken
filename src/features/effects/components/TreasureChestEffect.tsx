import type { GameAssetRarity } from '../../assets';

type TreasureChestEffectProps = {
  rare?: boolean;
  label?: string;
  open?: boolean;
  rarity?: GameAssetRarity;
};

export function TreasureChestEffect({
  rare = false,
  label,
  open = false,
  rarity,
}: TreasureChestEffectProps) {
  const tone = rarity ?? (rare ? 'rare' : 'common');
  const chestTone = {
    common: 'text-yellow-500',
    uncommon: 'text-emerald-500',
    rare: 'text-slate-400',
    epic: 'text-violet-500',
    legendary: 'text-amber-400',
  } satisfies Record<GameAssetRarity, string>;
  const bodyFill = {
    common: '#92400e',
    uncommon: '#166534',
    rare: '#94a3b8',
    epic: '#6d28d9',
    legendary: '#f59e0b',
  } satisfies Record<GameAssetRarity, string>;
  const lidFill = {
    common: '#facc15',
    uncommon: '#86efac',
    rare: '#e2e8f0',
    epic: '#ddd6fe',
    legendary: '#fde68a',
  } satisfies Record<GameAssetRarity, string>;

  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={[
        'mx-auto size-24 motion-safe:animate-[game-treasure-pop_.82s_ease-out_1]',
        chestTone[tone],
      ].join(' ')}
      data-testid={rare ? 'treasure-effect-rare' : 'treasure-effect'}
      role={label ? 'img' : undefined}
      viewBox="0 0 160 160"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M34 66h92v54H34z" fill={bodyFill[tone]} strokeWidth="8" />
        <path
          className={
            open
              ? 'motion-safe:animate-[game-chest-open_.85s_ease-out_1_forwards]'
              : ''
          }
          d="M40 66c5-25 24-38 40-38s35 13 40 38"
          fill={lidFill[tone]}
          strokeWidth="8"
        />
        <path d="M30 66h100M80 66v54" strokeWidth="8" />
        <path d="M68 86h24v24H68z" fill="#fef3c7" strokeWidth="6" />
        <path d="M52 38 42 24M108 38l10-14M80 24V10" strokeWidth="7" />
      </g>
      <g
        className="motion-safe:animate-[game-sparkle-rise_1.1s_ease-out_1]"
        fill="currentColor"
      >
        <circle cx="52" cy="35" r="5" />
        <circle cx="108" cy="36" r="4" />
        <circle cx="80" cy="18" r="4" />
      </g>
    </svg>
  );
}
