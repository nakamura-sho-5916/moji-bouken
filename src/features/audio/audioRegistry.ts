import type { AudioAsset, BgmId, SoundEffectId } from './audioTypes';
import { bgmCompositions } from './audioComposition';
import { sfxPatches } from './sfxPatches';

const sfx = (
  id: SoundEffectId,
  description: string,
  defaultVolume = 0.45,
  cooldownMs = 80,
): AudioAsset => ({
  id,
  src: null,
  category: 'sfx',
  defaultVolume,
  loop: false,
  preload: false,
  maxSimultaneous: 2,
  cooldownMs,
  fadeInMs: 0,
  fadeOutMs: 0,
  description,
  licenseId: 'generated-web-audio',
});

const bgm = (id: BgmId, description: string): AudioAsset => ({
  id,
  src: null,
  category: 'bgm',
  defaultVolume: 0.22,
  loop: bgmCompositions[id].loop,
  preload: false,
  maxSimultaneous: 1,
  cooldownMs: 0,
  fadeInMs: 500,
  fadeOutMs: 500,
  bpm: bgmCompositions[id].bpm,
  description,
  licenseId: 'generated-web-audio',
});

export const soundEffectRegistry: Record<SoundEffectId, AudioAsset> = {
  'ui-tap': sfx('ui-tap', 'Small UI tap', 0.2, 45),
  'choice-select': sfx('choice-select', 'Choice selected', 0.25, 45),
  correct: sfx('correct', 'Correct answer', 0.45, 120),
  retry: sfx('retry', 'Retry prompt', 0.28, 160),
  attack: sfx('attack', 'Battle attack', 0.35, 120),
  'special-attack': sfx('special-attack', 'Special attack', 0.4, 250),
  'enemy-defeated': sfx('enemy-defeated', 'Enemy defeated', 0.45, 500),
  reward: sfx('reward', 'Reward received', 0.4, 300),
  'level-up': sfx('level-up', 'Level up', 0.42, 500),
  'world-recovery': sfx('world-recovery', 'World recovery', 0.36, 400),
  'companion-joined': sfx('companion-joined', 'Companion joined', 0.35, 400),
  'equipment-acquired': sfx(
    'equipment-acquired',
    'Equipment acquired',
    0.34,
    300,
  ),
  'shop-purchase': sfx('shop-purchase', 'Shop purchase', 0.32, 300),
  'area-unlocked': sfx('area-unlocked', 'Area unlocked', 0.38, 500),
  'critical-hit': sfx('critical-hit', 'Critical hit', 0.4, 220),
  'chest-drop': sfx('chest-drop', 'Chest drop', 0.34, 260),
  'rare-drop': sfx('rare-drop', 'Rare drop', 0.38, 500),
  'legendary-drop': sfx('legendary-drop', 'Legendary drop', 0.42, 700),
  'exp-gain': sfx('exp-gain', 'Experience gain', 0.24, 100),
  'gold-gain': sfx('gold-gain', 'Gold gain', 0.24, 100),
  'boss-appearance': sfx('boss-appearance', 'Boss appearance', 0.38, 700),
};

export const bgmRegistry: Record<BgmId, AudioAsset> = {
  title: bgm('title', 'Title screen ambience'),
  home: bgm('home', 'Home screen ambience'),
  world: bgm('world', 'World map ambience'),
  mission: bgm('mission', 'Mission ambience'),
  battle: bgm('battle', 'Battle ambience'),
  boss: bgm('boss', 'Boss battle ambience'),
  result: bgm('result', 'Result screen ambience'),
  'world-recovery': bgm('world-recovery', 'World recovery cue'),
  'victory-fanfare': bgm('victory-fanfare', 'Victory fanfare cue'),
};

for (const id of Object.keys(sfxPatches) as SoundEffectId[]) {
  if (!soundEffectRegistry[id]) {
    throw new Error(`Missing SFX registry entry: ${id}`);
  }
}

export const audioRegistry = {
  ...soundEffectRegistry,
  ...bgmRegistry,
};

export const soundEffectIds = Object.keys(
  soundEffectRegistry,
) as SoundEffectId[];
export const bgmIds = Object.keys(bgmRegistry) as BgmId[];
