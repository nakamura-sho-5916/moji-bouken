import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { DEFAULT_PLAYER_ID } from '../db/constants';
import { getAppSettings } from '../db/repositories/settingsRepository';
import { AudioSettingsPanel } from '../features/audio';
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
      <AudioSettingsPanel
        onUpdated={async () => {
          setMessage('ほぞんしました');
          await reload();
        }}
        settings={settings}
      />
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <p className="font-black text-[var(--color-text-muted)]">
          おとが なくても ぜんぶ あそべます。
        </p>
      </div>
    </section>
  );
}
