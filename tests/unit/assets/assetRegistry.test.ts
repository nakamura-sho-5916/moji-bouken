import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  backgroundAssets,
  companionAssets,
  enemyAssets,
  gameAssets,
  itemAssets,
  resolveAsset,
} from '../../../src/features/assets';
import type { GameAsset } from '../../../src/features/assets';

const validTypes = new Set(['enemy', 'companion', 'background', 'item', 'ui']);
const validRarities = new Set([
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
]);
const maxSvgBytes = 24 * 1024;

function publicPath(asset: GameAsset) {
  return join(process.cwd(), 'public', asset.src.replace(/^\//, ''));
}

function readSvg(asset: GameAsset) {
  return readFileSync(publicPath(asset), 'utf8');
}

describe('game asset registry', () => {
  it('registers required production artwork counts', () => {
    expect(enemyAssets).toHaveLength(10);
    expect(companionAssets).toHaveLength(5);
    expect(backgroundAssets).toHaveLength(6);
    expect(itemAssets).toHaveLength(30);
    expect(gameAssets.length).toBeGreaterThanOrEqual(51);
  });

  it('keeps asset metadata valid and unique', () => {
    const ids = new Set(gameAssets.map((asset) => asset.assetId));

    expect(ids.size).toBe(gameAssets.length);
    for (const asset of gameAssets) {
      expect(validTypes.has(asset.type)).toBe(true);
      expect(validRarities.has(asset.rarity)).toBe(true);
      expect(asset.altText.trim()).not.toBe('');
      expect(asset.fallbackEmoji.trim()).not.toBe('');
      expect(resolveAsset(asset.assetId)?.assetId).toBe(asset.assetId);
    }
  });

  it('points every registry src to an existing lightweight svg', () => {
    for (const asset of gameAssets) {
      const file = publicPath(asset);

      expect(existsSync(file), asset.assetId).toBe(true);
      expect(statSync(file).size, asset.assetId).toBeLessThan(maxSvgBytes);
      expect(asset.src.endsWith('.svg')).toBe(true);
    }
  });

  it('keeps svg files safe and parseable', () => {
    for (const asset of gameAssets) {
      const svg = readSvg(asset);
      const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
      const root = document.querySelector('svg');

      expect(root, asset.assetId).not.toBeNull();
      expect(root?.getAttribute('viewBox'), asset.assetId).toMatch(
        asset.type === 'background'
          ? /^0 0 1600 900$/
          : /^0 0 (512|256) (512|256)$/,
      );
      expect(svg.includes('<script')).toBe(false);
      expect(svg.includes('foreignObject')).toBe(false);
      expect(svg.includes('href="http')).toBe(false);
      expect(svg.includes("href='http")).toBe(false);
      expect(svg.includes('url(http')).toBe(false);
    }
  });
});
