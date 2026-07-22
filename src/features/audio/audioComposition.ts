import type { BgmId } from './audioTypes';

export type Waveform = OscillatorType;

export type BgmStep = {
  note: number;
  octaveOffset?: number;
  velocity?: number;
  gate?: number;
};

export type BgmComposition = {
  id: BgmId;
  bpm: number;
  loop: boolean;
  bars: number;
  stepsPerBar: number;
  rootMidi: number;
  leadWave: Waveform;
  bassWave: Waveform;
  padWave: Waveform;
  melody: Array<BgmStep | null>;
  bass: Array<BgmStep | null>;
  pad: Array<BgmStep | null>;
  percussion: boolean[];
  description: string;
};

const STEPS_PER_BAR = 8;

function repeatPattern<T>(pattern: T[], length: number): T[] {
  return Array.from({ length }, (_, index) => pattern[index % pattern.length]);
}

function steps(
  values: Array<number | null>,
  velocity = 0.72,
): Array<BgmStep | null> {
  return values.map((note) => (note === null ? null : { note, velocity }));
}

function createComposition(input: {
  id: BgmId;
  bpm: number;
  loop: boolean;
  bars: number;
  rootMidi: number;
  leadWave?: Waveform;
  bassWave?: Waveform;
  padWave?: Waveform;
  melody: Array<number | null>;
  bass: Array<number | null>;
  pad: Array<number | null>;
  percussion: boolean[];
  description: string;
}): BgmComposition {
  const length = input.bars * STEPS_PER_BAR;
  return {
    id: input.id,
    bpm: input.bpm,
    loop: input.loop,
    bars: input.bars,
    stepsPerBar: STEPS_PER_BAR,
    rootMidi: input.rootMidi,
    leadWave: input.leadWave ?? 'triangle',
    bassWave: input.bassWave ?? 'sine',
    padWave: input.padWave ?? 'sine',
    melody: steps(repeatPattern(input.melody, length)),
    bass: steps(repeatPattern(input.bass, length), 0.5),
    pad: steps(repeatPattern(input.pad, length), 0.24),
    percussion: repeatPattern(input.percussion, length),
    description: input.description,
  };
}

export function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export const bgmCompositions: Record<BgmId, BgmComposition> = {
  title: createComposition({
    id: 'title',
    bpm: 88,
    loop: true,
    bars: 10,
    rootMidi: 60,
    melody: [0, null, 4, 7, 9, null, 7, 4, 5, null, 9, 12, 11, null, 7, 4],
    bass: [0, null, null, null, 5, null, null, null],
    pad: [0, null, 7, null, 9, null, 7, null],
    percussion: [true, false, false, false, true, false, false, false],
    description: 'Hopeful opening fanfare loop',
  }),
  home: createComposition({
    id: 'home',
    bpm: 96,
    loop: true,
    bars: 8,
    rootMidi: 62,
    melody: [
      0,
      null,
      2,
      null,
      4,
      7,
      null,
      4,
      2,
      null,
      0,
      null,
      -2,
      null,
      0,
      null,
    ],
    bass: [0, null, null, null, 7, null, null, null],
    pad: [0, null, 4, null, 7, null, 4, null],
    percussion: [true, false, false, false, false, false, true, false],
    description: 'Calm village loop',
  }),
  world: createComposition({
    id: 'world',
    bpm: 112,
    loop: true,
    bars: 8,
    rootMidi: 57,
    melody: [0, 2, 4, null, 7, 9, 7, null, 5, 7, 9, 12, null, 9, 7, 4],
    bass: [0, null, 0, null, 5, null, 7, null],
    pad: [0, null, 5, null, 9, null, 7, null],
    percussion: [true, false, true, false, true, false, false, true],
    description: 'Forward world map loop',
  }),
  mission: createComposition({
    id: 'mission',
    bpm: 94,
    loop: true,
    bars: 8,
    rootMidi: 65,
    melody: [
      0,
      null,
      3,
      null,
      5,
      null,
      3,
      null,
      0,
      2,
      null,
      5,
      null,
      7,
      null,
      5,
    ],
    bass: [0, null, null, null, -5, null, null, null],
    pad: [0, null, 5, null, 8, null, 5, null],
    percussion: [false, false, true, false, false, false, true, false],
    description: 'Quiet focused mission loop',
  }),
  battle: createComposition({
    id: 'battle',
    bpm: 136,
    loop: true,
    bars: 8,
    rootMidi: 52,
    leadWave: 'square',
    melody: [0, null, 3, 5, 7, null, 5, 3, 0, 3, 7, null, 10, 7, 5, null],
    bass: [0, 0, null, 0, 5, 5, null, 7],
    pad: [0, null, 7, null, 10, null, 7, null],
    percussion: [true, false, true, true, true, false, true, false],
    description: 'Moderate battle tension loop',
  }),
  boss: createComposition({
    id: 'boss',
    bpm: 148,
    loop: true,
    bars: 8,
    rootMidi: 48,
    leadWave: 'sawtooth',
    bassWave: 'square',
    melody: [0, 1, 3, null, 6, 5, 3, null, 8, null, 6, 5, 3, null, 1, null],
    bass: [0, 0, 0, null, -5, -5, 0, null],
    pad: [0, null, 6, null, 10, null, 6, null],
    percussion: [true, true, false, true, true, false, true, true],
    description: 'Heavier boss battle loop',
  }),
  result: createComposition({
    id: 'result',
    bpm: 104,
    loop: true,
    bars: 8,
    rootMidi: 60,
    melody: [0, null, 4, 7, 12, null, 11, 7, 9, null, 7, 4, 5, null, 7, null],
    bass: [0, null, null, null, 5, null, null, null],
    pad: [0, null, 4, null, 9, null, 7, null],
    percussion: [true, false, false, true, false, false, true, false],
    description: 'Reward result loop',
  }),
  'world-recovery': createComposition({
    id: 'world-recovery',
    bpm: 76,
    loop: false,
    bars: 10,
    rootMidi: 55,
    melody: [
      0,
      null,
      4,
      null,
      7,
      9,
      12,
      null,
      11,
      null,
      7,
      9,
      12,
      null,
      14,
      null,
    ],
    bass: [0, null, null, null, 5, null, null, null],
    pad: [0, null, 7, null, 9, null, 12, null],
    percussion: [false, false, true, false, false, false, true, false],
    description: 'One-shot recovery cue',
  }),
  'victory-fanfare': createComposition({
    id: 'victory-fanfare',
    bpm: 120,
    loop: false,
    bars: 2,
    rootMidi: 60,
    melody: [0, 4, 7, 12, null, 11, 12, null, 7, 9, 12, 16, null, 14, 12, null],
    bass: [0, null, 0, null, 5, null, 7, null],
    pad: [0, null, 4, null, 7, null, 12, null],
    percussion: [true, false, true, false, true, true, false, true],
    description: 'Short victory fanfare',
  }),
};

export const bgmCompositionIds = Object.keys(bgmCompositions) as BgmId[];
