import { useContext } from 'react';
import { AudioContext } from './AudioContext';
import { audioManager } from './AudioManager';
import type { BgmId, SoundEffectId } from './audioTypes';

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    return {
      state: audioManager.getState(),
      unlock: () => audioManager.unlock(),
      playSoundEffect: (id: SoundEffectId) => audioManager.playSoundEffect(id),
      playBgm: (id: BgmId | null) => audioManager.playBgm(id),
      stopBgm: (fadeOutMs?: number) => audioManager.stopBgm(fadeOutMs),
      refreshSettings: async () => undefined,
    };
  }
  return context;
}
