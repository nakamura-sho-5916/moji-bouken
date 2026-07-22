import {
  AUDIO_DEBUG_EVENT,
  DEFAULT_FADE_MS,
  MIN_TRIGGER_INTERVAL_MS,
} from './audioConstants';
import {
  bgmCompositions,
  midiToFrequency,
  type BgmComposition,
} from './audioComposition';
import { bgmRegistry, soundEffectRegistry } from './audioRegistry';
import { sfxPatches, type SfxVoice } from './sfxPatches';
import type {
  AudioEvent,
  AudioSettings,
  AudioState,
  BgmId,
  SoundEffectId,
} from './audioTypes';

type AudioContextConstructor = typeof AudioContext;
type BgmTimer = number;

const defaultSettings: AudioSettings = {
  bgmEnabled: true,
  soundEffectsEnabled: true,
  masterVolume: 0.7,
  bgmVolume: 0.45,
  soundEffectVolume: 0.7,
  muteAll: false,
};

const SCHEDULER_INTERVAL_MS = 90;
const SCHEDULER_LOOKAHEAD_SECONDS = 0.32;
const BGM_NOTE_LIMIT = 18;
const SFX_NODE_LIMIT = 18;
const DUCK_RATIO = 0.52;

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

function getStepDuration(composition: BgmComposition) {
  return 60 / composition.bpm / (composition.stepsPerBar / 4);
}

export class AudioManager {
  private context: AudioContext | null = null;
  private settings = defaultSettings;
  private unlocked = false;
  private queue: SoundEffectId[] = [];
  private lastPlayed = new Map<string, number>();
  private activeNodeCount = 0;
  private activeSfxNodes = 0;
  private ducking = false;
  private duckRestoreTimer: number | null = null;
  private currentBgm: {
    id: BgmId;
    gain: GainNode;
    timer: BgmTimer;
    nextStepTime: number;
    stepIndex: number;
    stopRequested: boolean;
  } | null = null;
  private listeners = new Set<(event: AudioEvent) => void>();

  getState(): AudioState {
    const composition = this.currentBgm
      ? bgmCompositions[this.currentBgm.id]
      : null;
    return {
      supported: Boolean(getAudioContextConstructor()),
      unlocked: this.unlocked,
      currentBgm: this.currentBgm?.id ?? null,
      queuedRequests: this.queue.length,
      audioContextState: this.context?.state ?? 'unavailable',
      currentBpm: composition?.bpm ?? null,
      currentStep: this.currentBgm?.stepIndex ?? null,
      activeNodeCount: this.activeNodeCount,
      ducking: this.ducking,
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
      this.applyBgmGain(0.08);
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
    const bgm = this.currentBgm;
    const now = this.context.currentTime;
    bgm.stopRequested = true;
    window.clearInterval(bgm.timer);
    bgm.gain.gain.cancelScheduledValues(now);
    bgm.gain.gain.setTargetAtTime(0, now, Math.max(0.02, fadeOutMs / 3000));
    window.setTimeout(() => {
      try {
        bgm.gain.disconnect();
      } catch {
        return;
      }
    }, fadeOutMs + 120);
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
    if (this.activeSfxNodes >= SFX_NODE_LIMIT) {
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
    const patch = sfxPatches[id];
    if (patch.duckBgm) {
      this.duckBgm(Math.max(650, patch.durationMs + 160));
    }
    for (const patchVoice of patch.voices) {
      this.scheduleSfxVoice(id, patchVoice);
    }
    this.emit({ type: 'sfx', id, played: true });
  }

  private scheduleSfxVoice(id: SoundEffectId, patchVoice: SfxVoice) {
    if (!this.context) {
      return;
    }
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const start = this.context.currentTime + patchVoice.startMs / 1000;
    const end = start + patchVoice.durationMs / 1000;
    const peak = this.getSfxGain(id) * patchVoice.gain;
    oscillator.type = patchVoice.wave;
    oscillator.frequency.setValueAtTime(patchVoice.frequency, start);
    if (patchVoice.endFrequency) {
      oscillator.frequency.linearRampToValueAtTime(
        patchVoice.endFrequency,
        end,
      );
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
    this.trackNode();
    this.activeSfxNodes += 1;
    window.setTimeout(
      () => {
        try {
          oscillator.disconnect();
          gain.disconnect();
        } catch {
          return;
        } finally {
          this.activeSfxNodes = Math.max(0, this.activeSfxNodes - 1);
          this.releaseNode();
        }
      },
      patchVoice.startMs + patchVoice.durationMs + 80,
    );
  }

  private startGeneratedBgm(id: BgmId) {
    if (!this.context) {
      return;
    }
    const composition = bgmCompositions[id];
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.setTargetAtTime(
      this.getBgmGain(id),
      now,
      bgmRegistry[id].fadeInMs / 3000,
    );
    gain.connect(this.context.destination);
    const bgm = {
      id,
      gain,
      timer: window.setInterval(() => {
        this.scheduleBgmSteps();
      }, SCHEDULER_INTERVAL_MS),
      nextStepTime: now + 0.04,
      stepIndex: 0,
      stopRequested: false,
    };
    this.currentBgm = bgm;
    if (!composition.loop) {
      this.duckBgm(
        Math.ceil(
          getStepDuration(composition) * composition.melody.length * 1000,
        ),
      );
    }
    this.scheduleBgmSteps();
    this.emit({ type: 'bgm', id, played: true });
  }

  private scheduleBgmSteps() {
    if (!this.context || !this.currentBgm) {
      return;
    }
    const bgm = this.currentBgm;
    const composition = bgmCompositions[bgm.id];
    const stepDuration = getStepDuration(composition);
    while (
      bgm.nextStepTime <
        this.context.currentTime + SCHEDULER_LOOKAHEAD_SECONDS &&
      !bgm.stopRequested
    ) {
      this.scheduleBgmStep(composition, bgm.stepIndex, bgm.nextStepTime);
      bgm.nextStepTime += stepDuration;
      bgm.stepIndex += 1;
      if (bgm.stepIndex >= composition.melody.length) {
        if (!composition.loop) {
          this.stopBgm(composition.id === 'victory-fanfare' ? 260 : 650);
          return;
        }
        bgm.stepIndex = 0;
      }
    }
  }

  private scheduleBgmStep(
    composition: BgmComposition,
    stepIndex: number,
    start: number,
  ) {
    if (!this.context || !this.currentBgm) {
      return;
    }
    const stepDuration = getStepDuration(composition);
    this.scheduleBgmNote({
      composition,
      stepIndex,
      part: 'pad',
      start,
      duration: stepDuration * 1.85,
    });
    this.scheduleBgmNote({
      composition,
      stepIndex,
      part: 'bass',
      start,
      duration: stepDuration * 0.9,
    });
    this.scheduleBgmNote({
      composition,
      stepIndex,
      part: 'melody',
      start,
      duration: stepDuration * 0.82,
    });
    if (composition.percussion[stepIndex]) {
      this.schedulePercussion(start, stepDuration * 0.55);
    }
  }

  private scheduleBgmNote(options: {
    composition: BgmComposition;
    stepIndex: number;
    part: 'melody' | 'bass' | 'pad';
    start: number;
    duration: number;
  }) {
    if (
      !this.context ||
      !this.currentBgm ||
      this.activeNodeCount >= BGM_NOTE_LIMIT + SFX_NODE_LIMIT
    ) {
      return;
    }
    const note = options.composition[options.part][options.stepIndex];
    if (!note) {
      return;
    }
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const octave = note.octaveOffset ?? (options.part === 'bass' ? -1 : 0);
    const midi = options.composition.rootMidi + note.note + octave * 12;
    const end = options.start + options.duration * (note.gate ?? 0.88);
    oscillator.type =
      options.part === 'bass'
        ? options.composition.bassWave
        : options.part === 'pad'
          ? options.composition.padWave
          : options.composition.leadWave;
    oscillator.frequency.setValueAtTime(midiToFrequency(midi), options.start);
    const partGain =
      options.part === 'pad' ? 0.08 : options.part === 'bass' ? 0.1 : 0.13;
    gain.gain.setValueAtTime(0.0001, options.start);
    gain.gain.linearRampToValueAtTime(
      partGain * (note.velocity ?? 0.6),
      options.start + 0.018,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(this.currentBgm.gain);
    oscillator.start(options.start);
    oscillator.stop(end + 0.03);
    this.trackNode();
    window.setTimeout(
      () => {
        try {
          oscillator.disconnect();
          gain.disconnect();
        } catch {
          return;
        } finally {
          this.releaseNode();
        }
      },
      Math.ceil((end - (this.context?.currentTime ?? options.start)) * 1000) +
        90,
    );
  }

  private schedulePercussion(start: number, duration: number) {
    if (!this.context || !this.currentBgm) {
      return;
    }
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const end = start + duration;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(95, start);
    oscillator.frequency.exponentialRampToValueAtTime(42, end);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.09, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(this.currentBgm.gain);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
    this.trackNode();
    window.setTimeout(
      () => {
        try {
          oscillator.disconnect();
          gain.disconnect();
        } catch {
          return;
        } finally {
          this.releaseNode();
        }
      },
      Math.ceil(duration * 1000) + 90,
    );
  }

  private duckBgm(durationMs: number) {
    if (!this.context || !this.currentBgm) {
      return;
    }
    if (this.duckRestoreTimer) {
      window.clearTimeout(this.duckRestoreTimer);
    }
    this.ducking = true;
    this.applyBgmGain(0.04, DUCK_RATIO);
    this.emit({ type: 'duck', active: true, ratio: DUCK_RATIO });
    this.duckRestoreTimer = window.setTimeout(() => {
      this.ducking = false;
      this.applyBgmGain(0.08);
      this.emit({ type: 'duck', active: false, ratio: 1 });
    }, durationMs);
  }

  private applyBgmGain(
    timeConstant: number,
    ratio = this.ducking ? DUCK_RATIO : 1,
  ) {
    if (!this.context || !this.currentBgm) {
      return;
    }
    this.currentBgm.gain.gain.setTargetAtTime(
      this.getBgmGain(this.currentBgm.id) * ratio,
      this.context.currentTime,
      timeConstant,
    );
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

  private trackNode() {
    this.activeNodeCount += 1;
    this.emit({ type: 'node-count', activeNodeCount: this.activeNodeCount });
  }

  private releaseNode() {
    this.activeNodeCount = Math.max(0, this.activeNodeCount - 1);
    this.emit({ type: 'node-count', activeNodeCount: this.activeNodeCount });
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
