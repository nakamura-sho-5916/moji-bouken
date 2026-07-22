import { describe, expect, it } from 'vitest';
import {
  bgmCompositions,
  bgmIds,
  bgmRegistry,
  sfxPatches,
  soundEffectIds,
  soundEffectRegistry,
} from '../../../src/features/audio';

const bgmBpmRanges = {
  title: [80, 96],
  home: [90, 110],
  world: [105, 120],
  mission: [85, 105],
  battle: [125, 145],
  boss: [135, 155],
  result: [90, 115],
  'world-recovery': [70, 90],
  'victory-fanfare': [110, 130],
} as const;

describe('production audio registry', () => {
  it('registers all required original BGM compositions', () => {
    expect(bgmIds).toEqual([
      'title',
      'home',
      'world',
      'mission',
      'battle',
      'boss',
      'result',
      'world-recovery',
      'victory-fanfare',
    ]);

    for (const id of bgmIds) {
      const composition = bgmCompositions[id];
      const asset = bgmRegistry[id];
      const [minimumBpm, maximumBpm] = bgmBpmRanges[id];

      expect(asset.src).toBeNull();
      expect(asset.licenseId).toBe('generated-web-audio');
      expect(asset.bpm).toBe(composition.bpm);
      expect(composition.bpm).toBeGreaterThanOrEqual(minimumBpm);
      expect(composition.bpm).toBeLessThanOrEqual(maximumBpm);
      expect(composition.melody.some(Boolean)).toBe(true);
      expect(composition.bass.some(Boolean)).toBe(true);
      expect(composition.pad.some(Boolean)).toBe(true);
      expect(composition.melody).toHaveLength(
        composition.bars * composition.stepsPerBar,
      );
    }

    expect(bgmCompositions['world-recovery'].loop).toBe(false);
    expect(bgmCompositions['victory-fanfare'].loop).toBe(false);
  });

  it('registers production SFX patches with bounded timing and volume', () => {
    expect(soundEffectIds).toContain('boss-appearance');
    expect(soundEffectIds).toContain('legendary-drop');

    for (const id of soundEffectIds) {
      const asset = soundEffectRegistry[id];
      const patch = sfxPatches[id];

      expect(asset.src).toBeNull();
      expect(asset.licenseId).toBe('generated-web-audio');
      expect(asset.defaultVolume).toBeGreaterThan(0);
      expect(asset.defaultVolume).toBeLessThanOrEqual(0.5);
      expect(patch.durationMs).toBeGreaterThan(0);
      expect(patch.durationMs).toBeLessThanOrEqual(1000);
      expect(patch.voices.length).toBeGreaterThan(0);

      for (const voice of patch.voices) {
        expect(voice.gain).toBeGreaterThan(0);
        expect(voice.gain).toBeLessThanOrEqual(0.35);
        expect(voice.startMs + voice.durationMs).toBeLessThanOrEqual(
          patch.durationMs,
        );
      }
    }
  });

  it('marks cinematic SFX as BGM ducking cues', () => {
    expect(sfxPatches['level-up'].duckBgm).toBe(true);
    expect(sfxPatches['world-recovery'].duckBgm).toBe(true);
    expect(sfxPatches['companion-joined'].duckBgm).toBe(true);
    expect(sfxPatches['legendary-drop'].duckBgm).toBe(true);
  });
});
