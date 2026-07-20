# Audio Guide

## Overview

Mojibouken uses a small Web Audio API based audio system. The current release
does not bundle external audio files. Sound effects and quiet placeholder BGM
are generated at runtime.

## User Gesture Unlock

Mobile browsers may block audio until the first user action. The app attempts to
unlock audio from the first pointer interaction and also shows a short optional
prompt. If unlock fails, the game continues silently.

## Settings

Audio settings are stored in `AppSettings`.

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

## Registry

Audio IDs are defined in `src/features/audio/audioRegistry.ts`. Every entry has
metadata for category, default volume, loop, preload, simultaneous playback,
cooldown, fade timing, description, and license ID.

## Offline And PWA

No external audio download is required in v0.2.0. Future audio files placed
under `public/assets/audio` must remain small and be documented in
`public/assets/audio/LICENSES.md`.
