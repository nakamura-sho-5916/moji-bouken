import { createContext } from 'react';
import type { AudioState, BgmId, SoundEffectId } from './audioTypes';

export type AudioContextValue = {
  state: AudioState;
  unlock: () => Promise<boolean>;
  playSoundEffect: (id: SoundEffectId) => void;
  playBgm: (id: BgmId | null) => void;
  refreshSettings: () => Promise<void>;
};

export const AudioContext = createContext<AudioContextValue | null>(null);
