import {
  AUDIO_DEBUG_EVENT,
  DEFAULT_FADE_MS,
  MIN_TRIGGER_INTERVAL_MS,
} from './audioConstants';
import { bgmRegistry, soundEffectRegistry } from './audioRegistry';
import type {
  AudioEvent,
  AudioSettings,
  AudioState,
  BgmId,
  SoundEffectId,
} from './audioTypes';

type AudioContextConstructor = typeof AudioContext;

const defaultSettings: AudioSettings = {
  bgmEnabled: true,
  soundEffectsEnabled: true,
  masterVolume: 0.7,
  bgmVolume: 0.45,
  soundEffectVolume: 0.7,
  muteAll: false,
};

function clamp01(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function toRatio(value: number) {
  return clamp01(value > 1 ? value / 100 : value);
}

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.AudioContext ?? null;
}

export class AudioManager {
  private context: AudioContext | null = null;
  private settings = defaultSettings;
  private unlocked = false;
  private queue: SoundEffectId[] = [];
  private lastPlayed = new Map<string, number>();
  private currentBgm: {
    id: BgmId;
    oscillator: OscillatorNode;
    gain: GainNode;
  } | null = null;
  private listeners = new Set<(event: AudioEvent) => void>();

  getState(): AudioState {
    return {
      supported: Boolean(getAudioContextConstructor()),
      unlocked: this.unlocked,
      currentBgm: this.currentBgm?.id ?? null,
      queuedRequests: this.queue.length,
    };
  }

  subscribe(listener: (event: AudioEvent) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  updateSettings(settings: Partial<AudioSettings>) {
    this.settings = {
      ...this.settings,
      ...settings,
      masterVolume: toRatio(
        settings.masterVolume ?? this.settings.masterVolume,
      ),
      bgmVolume: toRatio(settings.bgmVolume ?? this.settings.bgmVolume),
      soundEffectVolume: toRatio(
        settings.soundEffectVolume ?? this.settings.soundEffectVolume,
      ),
    };
    if (this.settings.muteAll || !this.settings.bgmEnabled) {
      this.stopBgm();
    } else if (this.currentBgm) {
      this.currentBgm.gain.gain.setTargetAtTime(
        this.getBgmGain(this.currentBgm.id),
        this.context?.currentTime ?? 0,
        0.08,
      );
    }
  }

  async unlock() {
    if (this.unlocked) {
      return true;
    }
    const Constructor = getAudioContextConstructor();
    if (!Constructor) {
      this.emit({ type: 'unlock', unlocked: false });
      return false;
    }
    try {
      this.context ??= new Constructor();
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      this.unlocked = this.context.state === 'running';
      this.emit({ type: 'unlock', unlocked: this.unlocked });
      this.flushQueue();
      return this.unlocked;
    } catch (error) {
      console.warn('Audio unlock failed.', error);
      this.emit({ type: 'unlock', unlocked: false });
      return false;
    }
  }

  playSoundEffect(id: SoundEffectId) {
    if (!this.canPlaySfx(id)) {
      this.emit({ type: 'sfx', id, played: false });
      return;
    }
    if (!this.unlocked) {
      this.queue = [...this.queue.slice(-4), id];
      this.emit({ type: 'sfx', id, played: false });
      return;
    }
    this.playGeneratedSfx(id);
  }

  playBgm(id: BgmId | null) {
    if (!id || this.settings.muteAll || !this.settings.bgmEnabled) {
      this.stopBgm();
      this.emit({ type: 'bgm', id, played: false });
      return;
    }
    if (!this.unlocked) {
      this.emit({ type: 'bgm', id, played: false });
      return;
    }
    if (this.currentBgm?.id === id) {
      return;
    }
    this.stopBgm(DEFAULT_FADE_MS);
    this.startGeneratedBgm(id);
  }

  stopBgm(fadeOutMs = DEFAULT_FADE_MS) {
    if (!this.context || !this.currentBgm) {
      this.currentBgm = null;
      return;
    }
    const { oscillator, gain } = this.currentBgm;
    const now = this.context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(0, now, Math.max(0.02, fadeOutMs / 3000));
    oscillator.stop(now + fadeOutMs / 1000 + 0.08);
    this.currentBgm = null;
  }

  suspend() {
    this.stopBgm(120);
    void this.context?.suspend().catch(() => undefined);
  }

  resume() {
    if (this.unlocked) {
      void this.context?.resume().catch(() => undefined);
    }
  }

  private canPlaySfx(id: SoundEffectId) {
    if (this.settings.muteAll || !this.settings.soundEffectsEnabled) {
      return false;
    }
    const now = Date.now();
    const asset = soundEffectRegistry[id];
    const last = this.lastPlayed.get(id) ?? 0;
    const cooldown = Math.max(asset.cooldownMs, MIN_TRIGGER_INTERVAL_MS);
    if (now - last < cooldown) {
      return false;
    }
    this.lastPlayed.set(id, now);
    return true;
  }

  private flushQueue() {
    const queued = [...this.queue];
    this.queue = [];
    for (const id of queued) {
      this.playGeneratedSfx(id);
    }
  }

  private playGeneratedSfx(id: SoundEffectId) {
    if (!this.context) {
      return;
    }
    const asset = soundEffectRegistry[id];
    const frequencies = this.getSfxFrequencies(id);
    const start = this.context.currentTime;
    const output = this.context.createGain();
    output.gain.value = this.getSfxGain(id);
    output.connect(this.context.destination);

    frequencies.forEach((frequency, index) => {
      const oscillator = this.context?.createOscillator();
      const gain = this.context?.createGain();
      if (!oscillator || !gain || !this.context) {
        return;
      }
      const time = start + index * 0.055;
      oscillator.type = id === 'retry' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.45, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      oscillator.connect(gain);
      gain.connect(output);
      oscillator.start(time);
      oscillator.stop(time + 0.14);
    });

    this.emit({ type: 'sfx', id, played: true });
    window.setTimeout(() => output.disconnect(), 500);
    void asset;
  }

  private startGeneratedBgm(id: BgmId) {
    if (!this.context) {
      return;
    }
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.value = this.getBgmFrequency(id);
    gain.gain.setValueAtTime(0, now);
    gain.gain.setTargetAtTime(
      this.getBgmGain(id),
      now,
      bgmRegistry[id].fadeInMs / 3000,
    );
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start();
    this.currentBgm = { id, oscillator, gain };
    this.emit({ type: 'bgm', id, played: true });
  }

  private getSfxGain(id: SoundEffectId) {
    return (
      this.settings.masterVolume *
      this.settings.soundEffectVolume *
      soundEffectRegistry[id].defaultVolume
    );
  }

  private getBgmGain(id: BgmId) {
    return (
      this.settings.masterVolume *
      this.settings.bgmVolume *
      bgmRegistry[id].defaultVolume
    );
  }

  private getSfxFrequencies(id: SoundEffectId) {
    const map: Record<SoundEffectId, number[]> = {
      'ui-tap': [520],
      'choice-select': [620],
      correct: [523, 659, 784],
      retry: [392, 330],
      attack: [180, 260],
      'special-attack': [440, 660, 880],
      'enemy-defeated': [784, 659, 523],
      reward: [523, 659, 784],
      'level-up': [523, 659, 784, 1046],
      'world-recovery': [392, 523, 659],
      'companion-joined': [494, 622, 740],
      'equipment-acquired': [587, 740],
      'shop-purchase': [440, 554],
      'area-unlocked': [392, 523, 784],
    };
    return map[id];
  }

  private getBgmFrequency(id: BgmId) {
    const map: Record<BgmId, number> = {
      title: 196,
      home: 220,
      world: 174,
      mission: 247,
      battle: 146,
      boss: 110,
      result: 262,
    };
    return map[id];
  }

  private emit(event: AudioEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(AUDIO_DEBUG_EVENT, { detail: event }),
      );
    }
  }
}

export const audioManager = new AudioManager();
