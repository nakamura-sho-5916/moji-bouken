import type { SoundEffectId } from './audioTypes';

export type SfxVoice = {
  startMs: number;
  durationMs: number;
  frequency: number;
  endFrequency?: number;
  gain: number;
  wave: OscillatorType;
};

export type SfxPatch = {
  id: SoundEffectId;
  durationMs: number;
  duckBgm?: boolean;
  voices: SfxVoice[];
};

const voice = (
  startMs: number,
  durationMs: number,
  frequency: number,
  gain: number,
  wave: OscillatorType = 'sine',
  endFrequency?: number,
): SfxVoice => ({
  startMs,
  durationMs,
  frequency,
  endFrequency,
  gain,
  wave,
});

export const sfxPatches: Record<SoundEffectId, SfxPatch> = {
  'ui-tap': {
    id: 'ui-tap',
    durationMs: 80,
    voices: [voice(0, 60, 660, 0.18, 'triangle', 740)],
  },
  'choice-select': {
    id: 'choice-select',
    durationMs: 110,
    voices: [voice(0, 90, 740, 0.2, 'triangle', 880)],
  },
  correct: {
    id: 'correct',
    durationMs: 320,
    voices: [
      voice(0, 110, 523.25, 0.26, 'sine'),
      voice(75, 120, 659.25, 0.24, 'sine'),
      voice(150, 150, 783.99, 0.24, 'triangle'),
    ],
  },
  retry: {
    id: 'retry',
    durationMs: 260,
    voices: [
      voice(0, 150, 392, 0.15, 'triangle', 349.23),
      voice(110, 120, 329.63, 0.13, 'sine'),
    ],
  },
  attack: {
    id: 'attack',
    durationMs: 180,
    voices: [
      voice(0, 110, 180, 0.26, 'sawtooth', 90),
      voice(55, 90, 520, 0.16, 'square', 360),
    ],
  },
  'special-attack': {
    id: 'special-attack',
    durationMs: 640,
    duckBgm: true,
    voices: [
      voice(0, 280, 330, 0.18, 'triangle', 660),
      voice(180, 260, 660, 0.22, 'sawtooth', 990),
      voice(430, 160, 140, 0.32, 'square', 70),
    ],
  },
  'enemy-defeated': {
    id: 'enemy-defeated',
    durationMs: 520,
    voices: [
      voice(0, 140, 880, 0.22, 'triangle', 740),
      voice(130, 160, 659.25, 0.2, 'triangle', 523.25),
      voice(300, 180, 392, 0.18, 'sine', 261.63),
    ],
  },
  reward: {
    id: 'reward',
    durationMs: 380,
    voices: [
      voice(0, 100, 523.25, 0.18, 'triangle'),
      voice(90, 100, 659.25, 0.2, 'triangle'),
      voice(180, 150, 987.77, 0.22, 'sine'),
    ],
  },
  'level-up': {
    id: 'level-up',
    durationMs: 760,
    duckBgm: true,
    voices: [
      voice(0, 120, 523.25, 0.2, 'triangle'),
      voice(120, 130, 659.25, 0.22, 'triangle'),
      voice(250, 150, 783.99, 0.22, 'triangle'),
      voice(400, 260, 1046.5, 0.25, 'sine'),
    ],
  },
  'world-recovery': {
    id: 'world-recovery',
    durationMs: 900,
    duckBgm: true,
    voices: [
      voice(0, 240, 392, 0.14, 'sine'),
      voice(220, 260, 523.25, 0.18, 'triangle'),
      voice(460, 300, 783.99, 0.2, 'sine'),
    ],
  },
  'companion-joined': {
    id: 'companion-joined',
    durationMs: 560,
    duckBgm: true,
    voices: [
      voice(0, 120, 493.88, 0.16, 'triangle'),
      voice(120, 140, 622.25, 0.19, 'triangle'),
      voice(260, 220, 739.99, 0.2, 'sine'),
    ],
  },
  'equipment-acquired': {
    id: 'equipment-acquired',
    durationMs: 350,
    voices: [
      voice(0, 120, 587.33, 0.16, 'triangle'),
      voice(110, 180, 739.99, 0.2, 'sine'),
    ],
  },
  'shop-purchase': {
    id: 'shop-purchase',
    durationMs: 260,
    voices: [
      voice(0, 90, 440, 0.14, 'triangle'),
      voice(80, 120, 554.37, 0.16, 'triangle'),
    ],
  },
  'area-unlocked': {
    id: 'area-unlocked',
    durationMs: 700,
    duckBgm: true,
    voices: [
      voice(0, 160, 392, 0.15, 'sine'),
      voice(150, 180, 523.25, 0.18, 'triangle'),
      voice(320, 250, 783.99, 0.21, 'sine'),
    ],
  },
  'critical-hit': {
    id: 'critical-hit',
    durationMs: 360,
    voices: [
      voice(0, 120, 1046.5, 0.22, 'square', 1567.98),
      voice(110, 170, 160, 0.3, 'sawtooth', 80),
    ],
  },
  'chest-drop': {
    id: 'chest-drop',
    durationMs: 420,
    voices: [
      voice(0, 120, 349.23, 0.13, 'triangle'),
      voice(120, 160, 698.46, 0.19, 'triangle'),
      voice(260, 120, 880, 0.18, 'sine'),
    ],
  },
  'rare-drop': {
    id: 'rare-drop',
    durationMs: 680,
    duckBgm: true,
    voices: [
      voice(0, 150, 659.25, 0.17, 'triangle'),
      voice(140, 190, 880, 0.2, 'triangle'),
      voice(320, 260, 1318.51, 0.22, 'sine'),
    ],
  },
  'legendary-drop': {
    id: 'legendary-drop',
    durationMs: 900,
    duckBgm: true,
    voices: [
      voice(0, 180, 523.25, 0.16, 'triangle'),
      voice(180, 180, 783.99, 0.18, 'triangle'),
      voice(360, 320, 1174.66, 0.24, 'sine'),
      voice(520, 300, 1567.98, 0.18, 'sine'),
    ],
  },
  'exp-gain': {
    id: 'exp-gain',
    durationMs: 230,
    voices: [voice(0, 180, 587.33, 0.15, 'triangle', 783.99)],
  },
  'gold-gain': {
    id: 'gold-gain',
    durationMs: 240,
    voices: [
      voice(0, 80, 987.77, 0.12, 'sine'),
      voice(90, 100, 1174.66, 0.13, 'sine'),
    ],
  },
  'boss-appearance': {
    id: 'boss-appearance',
    durationMs: 780,
    duckBgm: true,
    voices: [
      voice(0, 340, 196, 0.22, 'sawtooth', 130.81),
      voice(280, 380, 98, 0.25, 'square', 73.42),
    ],
  },
};

export const sfxPatchIds = Object.keys(sfxPatches) as SoundEffectId[];
