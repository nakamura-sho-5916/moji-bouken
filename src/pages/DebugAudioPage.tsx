import { useEffect, useState } from 'react';
import { DEFAULT_PLAYER_ID } from '../db/constants';
import {
  getAppSettings,
  updateAppSettings,
} from '../db/repositories/settingsRepository';
import {
  audioManager,
  bgmCompositions,
  bgmRegistry,
  soundEffectIds,
  sfxPatches,
  useAudio,
  type AudioEvent,
} from '../features/audio';
import { AUDIO_SETTINGS_EVENT } from '../features/audio/audioConstants';
import type { AppSettings } from '../types';

export function DebugAudioPage() {
  const audio = useAudio();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [events, setEvents] = useState<AudioEvent[]>([]);

  const reload = async () => {
    const persistedSettings = (await getAppSettings(DEFAULT_PLAYER_ID)) ?? null;
    setSettings(persistedSettings);
  };

  useEffect(() => {
    void getAppSettings(DEFAULT_PLAYER_ID).then((persistedSettings) => {
      setSettings(persistedSettings ?? null);
    });
    return audioManager.subscribe((event) => {
      setEvents((current) => [event, ...current].slice(0, 10));
    });
  }, []);

  if (!import.meta.env.DEV) {
    return <p>404</p>;
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Audio
        </h1>
        <p className="mt-2 font-bold">
          supported: {String(audio.state.supported)}
        </p>
        <p className="font-bold">unlocked: {String(audio.state.unlocked)}</p>
        <p className="font-bold">
          currentBgm: {audio.state.currentBgm ?? 'none'}
        </p>
        <p className="font-bold">bpm: {audio.state.currentBpm ?? 'none'}</p>
        <p className="font-bold">step: {audio.state.currentStep ?? 'none'}</p>
        <p className="font-bold">context: {audio.state.audioContextState}</p>
        <p className="font-bold">nodes: {audio.state.activeNodeCount}</p>
        <p className="font-bold">ducking: {String(audio.state.ducking)}</p>
        <p className="font-bold">queued: {audio.state.queuedRequests}</p>
      </div>
      <button
        className="min-h-12 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-4 font-black text-white"
        onClick={() => {
          void audio.unlock();
        }}
        type="button"
      >
        unlock
      </button>
      <div className="grid gap-2 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
        <h2 className="font-black">SFX</h2>
        <div className="grid grid-cols-2 gap-2">
          {soundEffectIds.map((id) => (
            <button
              className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-2 text-sm font-black"
              key={id}
              onClick={() => audio.playSoundEffect(id)}
              type="button"
            >
              {id}
              <span className="block text-[10px] text-[var(--color-text-muted)]">
                {sfxPatches[id].durationMs}ms
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
        <h2 className="font-black">BGM</h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(bgmRegistry).map((id) => (
            <button
              className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-2 text-sm font-black"
              key={id}
              onClick={() => audio.playBgm(id as keyof typeof bgmRegistry)}
              type="button"
            >
              {id}
              <span className="block text-[10px] text-[var(--color-text-muted)]">
                {bgmCompositions[id as keyof typeof bgmRegistry].bpm} BPM
              </span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-2 text-sm font-black"
            onClick={() => audio.playBgm('victory-fanfare')}
            type="button"
          >
            duck + fanfare
          </button>
          <button
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-2 text-sm font-black"
            onClick={() => audio.playSoundEffect('level-up')}
            type="button"
          >
            duck + level-up
          </button>
        </div>
        <button
          className="min-h-11 rounded-[var(--radius-medium)] bg-slate-800 px-2 text-sm font-black text-white"
          onClick={() => audio.playBgm(null)}
          type="button"
        >
          stop
        </button>
      </div>
      <div className="grid gap-2 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
        <h2 className="font-black">Settings</h2>
        <p className="text-sm font-bold">
          muteAll: {String(settings?.muteAll)}
        </p>
        <button
          className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-2 text-sm font-black"
          onClick={() => {
            void updateAppSettings(DEFAULT_PLAYER_ID, {
              bgmEnabled: true,
              soundEffectsEnabled: true,
              masterVolume: 70,
              bgmVolume: 45,
              soundEffectVolume: 70,
              muteAll: false,
            }).then(async () => {
              window.dispatchEvent(new Event(AUDIO_SETTINGS_EVENT));
              await reload();
            });
          }}
          type="button"
        >
          reset audio settings
        </button>
      </div>
      <div className="grid gap-1 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
        <h2 className="font-black">Events</h2>
        {events.map((event, index) => (
          <p className="text-xs font-bold" key={`${event.type}-${index}`}>
            {JSON.stringify(event)}
          </p>
        ))}
      </div>
    </section>
  );
}
