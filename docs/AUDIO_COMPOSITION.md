# Audio Composition

The production audio in v0.6.0 is procedural. BGM patterns live in
`src/features/audio/audioComposition.ts`; SFX patches live in
`src/features/audio/sfxPatches.ts`.

## BGM Targets

| ID                | BPM | Loop | Role              |
| ----------------- | --: | ---- | ----------------- |
| `title`           |  88 | yes  | hopeful opening   |
| `home`            |  96 | yes  | calm village      |
| `world`           | 112 | yes  | forward world map |
| `mission`         |  94 | yes  | focused learning  |
| `battle`          | 136 | yes  | moderate tension  |
| `boss`            | 148 | yes  | heavier battle    |
| `result`          | 104 | yes  | reward screen     |
| `world-recovery`  |  76 | no   | recovery cue      |
| `victory-fanfare` | 120 | no   | short victory cue |

Each composition has melody, bass, pad, and light percussion arrays. Patterns are
short so they can be scheduled cheaply on smartphones.

## SFX Approach

Each SFX patch is a small list of oscillator voices with:

- start time
- duration
- frequency
- optional frequency glide
- gain
- waveform

The system caps simultaneous SFX nodes and uses cooldowns to avoid duplicate
playback during React StrictMode or repeated taps.

## Originality

Do not imitate copyrighted game or anime music. Keep melodies short, simple, and
purpose-built for this project.
