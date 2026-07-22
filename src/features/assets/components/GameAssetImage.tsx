import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { getAssetOrFallback } from '../assetResolver';
import type { GameAsset } from '../assetTypes';
import { AssetFallback } from './AssetFallback';

type AssetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type GameAssetImageProps = {
  assetId: string;
  alt?: string;
  className?: string;
  size?: AssetSize;
  loading?: 'eager' | 'lazy';
  fallbackMode?: 'emoji' | 'empty';
  animate?: boolean;
  decorative?: boolean;
  onLoad?: () => void;
  onError?: () => void;
};

const sizeClasses: Record<AssetSize, string> = {
  sm: 'size-12',
  md: 'size-20',
  lg: 'size-32',
  xl: 'size-48',
  full: 'size-full',
};

const animationClasses: Record<GameAsset['animationHint'], string> = {
  float: 'motion-safe:animate-[asset-float_3s_ease-in-out_infinite]',
  bounce: 'motion-safe:animate-[asset-bounce_1.8s_ease-in-out_infinite]',
  glow: 'motion-safe:animate-[asset-glow_2.4s_ease-in-out_infinite]',
  hit: 'motion-safe:animate-[asset-hit_.28s_ease-out_1]',
  defeat: 'motion-safe:animate-[asset-defeat_.42s_ease-in_1]',
  shine: 'motion-safe:animate-[asset-shine_2.8s_ease-in-out_infinite]',
  still: '',
};

export function GameAssetImage({
  assetId,
  alt,
  className,
  size = 'md',
  loading = 'lazy',
  fallbackMode = 'emoji',
  animate = true,
  decorative = false,
  onLoad,
  onError,
}: GameAssetImageProps) {
  const asset = getAssetOrFallback(assetId);
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(!asset.src);
  const label = alt ?? asset.altText;

  if (failed) {
    if (fallbackMode === 'empty') {
      return null;
    }
    return <AssetFallback asset={asset} className={className} />;
  }

  return (
    <img
      alt={decorative ? '' : label}
      aria-hidden={decorative ? true : undefined}
      className={[
        'block object-contain',
        sizeClasses[size],
        animate && !reducedMotion ? animationClasses[asset.animationHint] : '',
        className ?? '',
      ].join(' ')}
      decoding="async"
      loading={loading}
      onError={() => {
        setFailed(true);
        onError?.();
      }}
      onLoad={onLoad}
      src={asset.src}
      style={{
        filter: `drop-shadow(0 16px 18px ${asset.shadowColor}30)`,
      }}
    />
  );
}
