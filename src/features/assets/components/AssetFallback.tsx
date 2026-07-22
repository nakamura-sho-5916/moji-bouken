import type { GameAsset } from '../assetTypes';

type AssetFallbackProps = {
  asset: GameAsset;
  className?: string;
};

export function AssetFallback({ asset, className }: AssetFallbackProps) {
  return (
    <span
      aria-label={asset.altText}
      className={[
        'inline-flex aspect-square items-center justify-center rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white text-3xl font-black',
        className ?? '',
      ].join(' ')}
      style={{
        boxShadow: `0 12px 26px ${asset.shadowColor}33`,
        color: asset.dominantColor,
      }}
      role="img"
    >
      {asset.fallbackEmoji}
    </span>
  );
}
