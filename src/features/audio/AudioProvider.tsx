import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_PLAYER_ID } from '../../db/constants';
import {
  getAppSettings,
  updateAppSettings,
} from '../../db/repositories/settingsRepository';
import { AUDIO_SETTINGS_EVENT } from './audioConstants';
import { audioManager } from './AudioManager';
import type {
  AudioSettings,
  AudioState,
  BgmId,
  SoundEffectId,
} from './audioTypes';

type AudioContextValue = {
  state: AudioState;
  unlock: () => Promise<boolean>;
  playSoundEffect: (id: SoundEffectId) => void;
  playBgm: (id: BgmId | null) => void;
  refreshSettings: () => Promise<void>;
};

const AudioContext = createContext<AudioContextValue | null>(null);

function toRatio(value: number) {
  return Math.min(1, Math.max(0, value > 1 ? value / 100 : value));
}

function mapPathToBgm(pathname: string): BgmId | null {
  if (pathname.startsWith('/debug') || pathname.startsWith('/parent')) {
    return null;
  }
  if (pathname === '/') {
    return 'title';
  }
  if (pathname.startsWith('/world')) {
    return 'world';
  }
  if (pathname.startsWith('/mission')) {
    return 'mission';
  }
  if (pathname.startsWith('/battle')) {
    return 'battle';
  }
  if (pathname.startsWith('/result')) {
    return 'result';
  }
  return 'home';
}

function toAudioSettings(settings: {
  bgmEnabled: boolean;
  soundEffectsEnabled: boolean;
  volume: number;
  masterVolume: number;
  bgmVolume: number;
  soundEffectVolume: number;
  muteAll: boolean;
}): AudioSettings {
  return {
    bgmEnabled: settings.bgmEnabled,
    soundEffectsEnabled: settings.soundEffectsEnabled,
    masterVolume: toRatio(settings.masterVolume ?? settings.volume),
    bgmVolume: toRatio(settings.bgmVolume),
    soundEffectVolume: toRatio(settings.soundEffectVolume),
    muteAll: settings.muteAll,
  };
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<AudioState>(() => audioManager.getState());

  const applyPersistedSettings = useCallback(async () => {
    const settings = await getAppSettings(DEFAULT_PLAYER_ID);
    if (settings) {
      audioManager.updateSettings(toAudioSettings(settings));
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    await applyPersistedSettings();
    setState(audioManager.getState());
  }, [applyPersistedSettings]);

  const unlock = useCallback(async () => {
    const unlocked = await audioManager.unlock();
    if (unlocked) {
      await updateAppSettings(DEFAULT_PLAYER_ID, {
        lastAudioEnabledAt: new Date().toISOString(),
      });
      await refreshSettings();
    }
    setState(audioManager.getState());
    return unlocked;
  }, [refreshSettings]);

  const value = useMemo<AudioContextValue>(
    () => ({
      state,
      unlock,
      playSoundEffect: (id) => audioManager.playSoundEffect(id),
      playBgm: (id) => audioManager.playBgm(id),
      refreshSettings,
    }),
    [refreshSettings, state, unlock],
  );

  useEffect(() => {
    void applyPersistedSettings().then(() => {
      setState(audioManager.getState());
    });
    const unsubscribe = audioManager.subscribe(() => {
      setState(audioManager.getState());
    });
    const onSettingsChanged = () => {
      void refreshSettings();
    };
    window.addEventListener(AUDIO_SETTINGS_EVENT, onSettingsChanged);
    return () => {
      unsubscribe();
      window.removeEventListener(AUDIO_SETTINGS_EVENT, onSettingsChanged);
    };
  }, [applyPersistedSettings, refreshSettings]);

  useEffect(() => {
    const onFirstClick = () => {
      void unlock();
    };
    window.addEventListener('click', onFirstClick, { once: true });
    return () => {
      window.removeEventListener('click', onFirstClick);
    };
  }, [unlock]);

  useEffect(() => {
    audioManager.playBgm(mapPathToBgm(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        audioManager.suspend();
      } else {
        audioManager.resume();
        audioManager.playBgm(mapPathToBgm(location.pathname));
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [location.pathname]);

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    return {
      state: audioManager.getState(),
      unlock: () => audioManager.unlock(),
      playSoundEffect: (id: SoundEffectId) => audioManager.playSoundEffect(id),
      playBgm: (id: BgmId | null) => audioManager.playBgm(id),
      refreshSettings: async () => undefined,
    };
  }
  return context;
}
