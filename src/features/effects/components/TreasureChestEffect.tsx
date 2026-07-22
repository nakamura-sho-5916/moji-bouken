type TreasureChestEffectProps = {
  rare?: boolean;
  label?: string;
};

export function TreasureChestEffect({
  rare = false,
  label,
}: TreasureChestEffectProps) {
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={[
        'mx-auto size-24 motion-safe:animate-[game-treasure-pop_.82s_ease-out_1]',
        rare ? 'text-indigo-500' : 'text-yellow-500',
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
        <path d="M34 66h92v54H34z" fill="#92400e" strokeWidth="8" />
        <path
          d="M40 66c5-25 24-38 40-38s35 13 40 38"
          fill="#facc15"
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
