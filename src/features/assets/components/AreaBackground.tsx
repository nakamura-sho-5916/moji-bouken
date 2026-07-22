import { resolveBackgroundAsset } from '../assetResolver';
import { GameAssetImage } from './GameAssetImage';

type AreaBackgroundProps = {
  areaId: string;
  className?: string;
  dimmed?: boolean;
};

export function AreaBackground({
  areaId,
  className,
  dimmed = false,
}: AreaBackgroundProps) {
  const asset = resolveBackgroundAsset(areaId);
  return (
    <div
      className={[
        'relative isolate overflow-hidden rounded-[var(--radius-large)] bg-white',
        className ?? '',
      ].join(' ')}
    >
      <GameAssetImage
        assetId={asset.assetId}
        className={[
          'h-full w-full object-cover',
          dimmed ? 'brightness-75 grayscale' : '',
        ].join(' ')}
        decorative
        size="full"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
    </div>
  );
}
