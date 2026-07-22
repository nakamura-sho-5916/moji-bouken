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
  | 'area-unlocked'
  | 'critical-hit'
  | 'chest-drop'
  | 'rare-drop'
  | 'legendary-drop'
  | 'exp-gain'
  | 'gold-gain'
  | 'boss-appearance';

export type BgmId =
  | 'title'
  | 'home'
  | 'world'
  | 'mission'
  | 'battle'
  | 'boss'
  | 'result'
  | 'world-recovery'
  | 'victory-fanfare';

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
  bpm?: number;
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
  audioContextState: AudioContextState | 'unavailable';
  currentBpm: number | null;
  currentStep: number | null;
  activeNodeCount: number;
  ducking: boolean;
};

export type AudioEvent =
  | { type: 'unlock'; unlocked: boolean }
  | { type: 'sfx'; id: SoundEffectId; played: boolean }
  | { type: 'bgm'; id: BgmId | null; played: boolean }
  | { type: 'duck'; active: boolean; ratio: number }
  | { type: 'node-count'; activeNodeCount: number };
