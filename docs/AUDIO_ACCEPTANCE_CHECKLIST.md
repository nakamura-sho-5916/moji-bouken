# Audio Acceptance Checklist

Use this checklist before releasing audio changes.

- No external audio files were added without license documentation.
- `npm run test:audio` succeeds.
- `npm run test:run` succeeds.
- `npm run build` succeeds.
- BGM starts after a user gesture on mobile.
- BGM switches by route without duplicate playback.
- Muting immediately stops BGM and SFX.
- BGM volume, SFX volume, and master volume apply immediately.
- Correct answer sound plays before attack sound.
- Incorrect answer sound does not trigger attack sound.
- Correct answer sound clearly feels successful and refreshing.
- Correct answer sound is not sharp or tiring after 10 questions.
- Correct answer sound does not blur too much with the attack sound.
- Correct answer volume is not too loud on a phone speaker.
- Children say the correct answer sound feels good.
- Correct answer sound respects the mute setting.
- Level up and world recovery duck BGM and restore it.
- `/debug/audio` shows AudioContext state, BGM, BPM, step, node count, and ducking.
- `/debug/audio` is unavailable in production builds.
- PWA works offline without downloading audio.
- IndexedDB learning data is not deleted by audio updates.
