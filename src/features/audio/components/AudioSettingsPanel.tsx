import { useState } from 'react';
import { saveAppSettings } from '../../../db/repositories/settingsRepository';
import { AUDIO_SETTINGS_EVENT } from '../audioConstants';
import { useAudio } from '../useAudio';
import { VolumeControl } from './VolumeControl';
import type { AppSettings } from '../../../types';

type AudioSettingsPanelProps = {
  settings: AppSettings;
  onUpdated: () => Promise<void>;
  parentMode?: boolean;
};

function dispatchSettingsChanged() {
  window.dispatchEvent(new Event(AUDIO_SETTINGS_EVENT));
}

export function AudioSettingsPanel({
  settings,
  onUpdated,
  parentMode = false,
}: AudioSettingsPanelProps) {
  const audio = useAudio();
  const [draftSettings, setDraftSettings] = useState(settings);

  const update = async (
    patch: Partial<Omit<AppSettings, 'playerId' | 'updatedAt'>>,
  ) => {
    const nextSettings = {
      ...draftSettings,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    setDraftSettings(nextSettings);
    await saveAppSettings(nextSettings);
    dispatchSettingsChanged();
    await onUpdated();
  };

  return (
    <div className="grid gap-4 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
      <label className="flex min-h-14 items-center justify-between gap-3 font-black">
        おと
        <input
          checked={!draftSettings.muteAll}
          onChange={() => {
            void update({ muteAll: !draftSettings.muteAll });
          }}
          type="checkbox"
        />
      </label>
      <label className="flex min-h-14 items-center justify-between gap-3 font-black">
        BGM
        <input
          checked={draftSettings.bgmEnabled}
          onChange={() => {
            void update({ bgmEnabled: !draftSettings.bgmEnabled });
          }}
          type="checkbox"
        />
      </label>
      <label className="flex min-h-14 items-center justify-between gap-3 font-black">
        こうかおん
        <input
          checked={draftSettings.soundEffectsEnabled}
          onChange={() => {
            void update({
              soundEffectsEnabled: !draftSettings.soundEffectsEnabled,
            });
          }}
          type="checkbox"
        />
      </label>
      {parentMode ? (
        <>
          <VolumeControl
            label="マスター音量"
            onChange={(value) => {
              void update({ masterVolume: value, volume: value });
            }}
            value={draftSettings.masterVolume}
          />
          <VolumeControl
            label="BGM音量"
            onChange={(value) => {
              void update({ bgmVolume: value });
            }}
            value={draftSettings.bgmVolume}
          />
          <VolumeControl
            label="効果音音量"
            onChange={(value) => {
              void update({ soundEffectVolume: value });
            }}
            value={draftSettings.soundEffectVolume}
          />
        </>
      ) : (
        <VolumeControl
          label="おとの おおきさ"
          onChange={(value) => {
            void update({
              masterVolume: value,
              volume: value,
            });
          }}
          value={draftSettings.masterVolume}
        />
      )}
      <button
        className="min-h-12 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-4 font-black text-white"
        onClick={() => {
          void audio.unlock().then(() => {
            audio.playSoundEffect('correct');
          });
        }}
        type="button"
      >
        おとを ためす
      </button>
    </div>
  );
}
