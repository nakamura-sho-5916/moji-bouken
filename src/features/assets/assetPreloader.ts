import { gameAssets } from './assetRegistry';

export function preloadGameAssets() {
  if (typeof document === 'undefined') {
    return;
  }
  for (const asset of gameAssets.filter((item) => item.preload && item.src)) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = asset.src;
    document.head.appendChild(link);
  }
}
