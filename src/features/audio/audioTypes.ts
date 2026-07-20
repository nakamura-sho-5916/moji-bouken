export type SoundEffectId =
  | 'ui-tap'
  | 'choice-select'
  | 'correct'
  | 'retry'
  | 'attack'
  | 'special-attack'
  | 'enemy-defeated'
  | 'reward'
  | 'level-up'
  | 'world-recovery'
  | 'companion-joined'
  | 'equipment-acquired'
  | 'shop-purchase'
  | 'area-unlocked';

export type BgmId =
  'title' | 'home' | 'world' | 'mission' | 'battle' | 'boss' | 'result';

export type AudioCategory = 'sfx' | 'bgm';

export type AudioAsset = {
  id: SoundEffectId | BgmId;
  src: string | null;
  category: AudioCategory;
  defaultVolume: number;
  loop: boolean;
  preload: boolean;
  maxSimultaneous: number;
  cooldownMs: number;
  fadeInMs: number;
  fadeOutMs: number;
  description: string;
  licenseId: string;
};

export type AudioSettings = {
  bgmEnabled: boolean;
  soundEffectsEnabled: boolean;
  masterVolume: number;
  bgmVolume: number;
  soundEffectVolume: number;
  muteAll: boolean;
};

export type AudioState = {
  supported: boolean;
  unlocked: boolean;
  currentBgm: BgmId | null;
  queuedRequests: number;
};

export type AudioEvent =
  | { type: 'unlock'; unlocked: boolean }
  | { type: 'sfx'; id: SoundEffectId; played: boolean }
  | { type: 'bgm'; id: BgmId | null; played: boolean };
