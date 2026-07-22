export { audioManager, AudioManager } from './AudioManager';
export { AudioProvider, useAudio } from './AudioProvider';
export { AudioSettingsPanel } from './components/AudioSettingsPanel';
export { AudioUnlockPrompt } from './components/AudioUnlockPrompt';
export { VolumeControl } from './components/VolumeControl';
export {
  audioRegistry,
  bgmIds,
  bgmRegistry,
  soundEffectIds,
  soundEffectRegistry,
} from './audioRegistry';
export { bgmCompositionIds, bgmCompositions } from './audioComposition';
export { sfxPatchIds, sfxPatches } from './sfxPatches';
export type {
  AudioAsset,
  AudioEvent,
  AudioSettings,
  AudioState,
  BgmId,
  SoundEffectId,
} from './audioTypes';
