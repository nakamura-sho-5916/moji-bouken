import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { DEFAULT_PLAYER_ID } from '../db/constants';
import {
  getAppSettings,
  updateAppSettings,
} from '../db/repositories/settingsRepository';
import type { AppSettings } from '../types';

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState('すきな かたちに しよう');

  const reload = async () => {
    setSettings((await getAppSettings(DEFAULT_PLAYER_ID)) ?? null);
  };

  useEffect(() => {
    let active = true;
    void getAppSettings(DEFAULT_PLAYER_ID).then((nextSettings) => {
      if (active) {
        setSettings(nextSettings ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!settings) {
    return <LoadingScreen />;
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
          せってい
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          {message}
        </p>
      </div>
      <div className="grid gap-3 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <label className="flex min-h-14 items-center justify-between gap-3 font-black">
          BGM
          <input
            checked={settings.bgmEnabled}
            onChange={(event) => {
              void updateAppSettings(DEFAULT_PLAYER_ID, {
                bgmEnabled: event.target.checked,
              }).then(async () => {
                setMessage('ほぞんしました');
                await reload();
              });
            }}
            type="checkbox"
          />
        </label>
        <label className="flex min-h-14 items-center justify-between gap-3 font-black">
          こうかおん
          <input
            checked={settings.soundEffectsEnabled}
            onChange={(event) => {
              void updateAppSettings(DEFAULT_PLAYER_ID, {
                soundEffectsEnabled: event.target.checked,
              }).then(async () => {
                setMessage('ほぞんしました');
                await reload();
              });
            }}
            type="checkbox"
          />
        </label>
        <label className="grid gap-2 font-black">
          おとの おおきさ {settings.volume}
          <input
            max={100}
            min={0}
            onChange={(event) => {
              void updateAppSettings(DEFAULT_PLAYER_ID, {
                volume: Number(event.target.value),
              }).then(async () => {
                setMessage('ほぞんしました');
                await reload();
              });
            }}
            type="range"
            value={settings.volume}
          />
        </label>
      </div>
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <p className="font-black text-[var(--color-text-muted)]">
          保護者用の設定は、保護者画面で変更できます。
        </p>
      </div>
    </section>
  );
}
