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
    durationMs: 520,
    voices: [
      voice(0, 70, 493.88, 0.24, 'triangle', 659.25),
      voice(70, 95, 587.33, 0.2, 'triangle'),
      voice(150, 95, 739.99, 0.2, 'triangle'),
      voice(230, 120, 880, 0.18, 'sine'),
      voice(355, 90, 1174.66, 0.09, 'sine', 1318.51),
    ],
  },
  'correct-rise': {
    id: 'correct-rise',
    durationMs: 540,
    voices: [
      voice(0, 72, 523.25, 0.23, 'triangle', 698.46),
      voice(78, 90, 659.25, 0.19, 'triangle'),
      voice(156, 96, 783.99, 0.19, 'triangle'),
      voice(238, 120, 987.77, 0.16, 'sine'),
      voice(372, 86, 1318.51, 0.08, 'sine', 1174.66),
    ],
  },
  'correct-spark': {
    id: 'correct-spark',
    durationMs: 500,
    voices: [
      voice(0, 66, 466.16, 0.22, 'triangle', 622.25),
      voice(74, 84, 587.33, 0.18, 'triangle'),
      voice(146, 92, 698.46, 0.18, 'triangle'),
      voice(218, 116, 880, 0.16, 'sine'),
      voice(338, 72, 1396.91, 0.075, 'sine', 1567.98),
    ],
  },
  'correct-combo-3': {
    id: 'correct-combo-3',
    durationMs: 560,
    voices: [
      voice(0, 70, 493.88, 0.24, 'triangle', 659.25),
      voice(70, 95, 587.33, 0.2, 'triangle'),
      voice(150, 95, 739.99, 0.2, 'triangle'),
      voice(230, 120, 880, 0.18, 'sine'),
      voice(350, 78, 1174.66, 0.085, 'sine'),
      voice(408, 80, 1396.91, 0.07, 'sine'),
    ],
  },
  'correct-combo-5': {
    id: 'correct-combo-5',
    durationMs: 600,
    voices: [
      voice(0, 70, 523.25, 0.24, 'triangle', 698.46),
      voice(78, 92, 659.25, 0.2, 'triangle'),
      voice(156, 95, 783.99, 0.19, 'triangle'),
      voice(238, 118, 987.77, 0.16, 'sine'),
      voice(366, 80, 1318.51, 0.075, 'sine'),
      voice(430, 78, 1567.98, 0.065, 'sine'),
    ],
  },
  'correct-combo-10': {
    id: 'correct-combo-10',
    durationMs: 640,
    voices: [
      voice(0, 74, 587.33, 0.24, 'triangle', 739.99),
      voice(84, 92, 698.46, 0.2, 'triangle'),
      voice(164, 96, 880, 0.18, 'triangle'),
      voice(246, 120, 1046.5, 0.15, 'sine'),
      voice(374, 82, 1396.91, 0.07, 'sine'),
      voice(438, 78, 1567.98, 0.06, 'sine'),
      voice(498, 78, 1760, 0.05, 'triangle'),
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
