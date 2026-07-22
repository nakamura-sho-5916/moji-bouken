# Audio Guide

## Overview

Mojibouken uses a lightweight Web Audio API system. Version 0.6.0 does not
bundle, stream, or download external audio files. BGM and sound effects are
generated at runtime from original composition and patch data stored in the
project.

If audio cannot be unlocked or the browser does not support Web Audio API, the
game continues silently.

## User Gesture Unlock

Mobile browsers usually require a user gesture before audio can start. The app
attempts to unlock audio from the first pointer interaction and also shows an
optional prompt. The unlock state is visible on `/debug/audio` in development.

## Settings

Audio settings are stored in `AppSettings` and apply immediately.

- `bgmEnabled`
- `soundEffectsEnabled`
- `volume`
- `masterVolume`
- `bgmVolume`
- `soundEffectVolume`
- `muteAll`
- `lastAudioEnabledAt`

Child settings expose simple on/off and master volume controls. Parent settings
expose master, BGM, and sound effect volume controls.

## BGM

BGM IDs are:

- `title`
- `home`
- `world`
- `mission`
- `battle`
- `boss`
- `result`
- `world-recovery`
- `victory-fanfare`

Route-based BGM switching remains in `AudioProvider`. The player never downloads
audio assets; each track is scheduled from compact note patterns in
`src/features/audio/audioComposition.ts`.

## SFX

SFX IDs are:

- `ui-tap`
- `choice-select`
- `correct`
- `retry`
- `attack`
- `special-attack`
- `enemy-defeated`
- `reward`
- `level-up`
- `world-recovery`
- `companion-joined`
- `equipment-acquired`
- `shop-purchase`
- `area-unlocked`
- `critical-hit`
- `chest-drop`
- `rare-drop`
- `legendary-drop`
- `exp-gain`
- `gold-gain`
- `boss-appearance`

Patches are defined in `src/features/audio/sfxPatches.ts`. Each patch keeps
duration, oscillator voices, gain, timing, and optional BGM ducking metadata.

## Timing Rules

Correct answers play `correct`, then the battle attack is applied about 90ms
later. Incorrect answers only play `retry`. Special attacks play a charge cue
before the impact is applied. Reward screens stagger reward, EXP, Gold, and level
up sounds to avoid clutter.

Level up, world recovery, companion joined, rare rewards, and fanfare cues duck
BGM and restore it after the cue.

## Debug Audio

`/debug/audio` is available only in development. It shows:

- AudioContext state
- unlock state
- current BGM
- BPM
- current step
- active node count
- ducking state
- queued requests
- manual SFX/BGM controls
- recent audio events

Production builds return a 404-like page for this route.

## Offline And PWA

No external audio download is required. Procedural audio works offline after the
PWA shell is cached. Audio changes update the normal Vite PWA precache output,
while IndexedDB learning data is not deleted.

## License Policy

All v0.6.0 audio is original procedural/project-generated audio. Do not add
third-party audio without recording the source and license in
`public/assets/audio/LICENSES.md`.
