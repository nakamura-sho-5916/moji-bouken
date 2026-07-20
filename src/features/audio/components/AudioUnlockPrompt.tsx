import { useState } from 'react';
import { useAudio } from '../AudioProvider';

export function AudioUnlockPrompt() {
  const audio = useAudio();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || audio.state.unlocked || !audio.state.supported) {
    return null;
  }

  return (
    <div className="mx-3 mb-3 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-[var(--color-text-muted)]">
          おとを つける？
        </p>
        <div className="flex gap-2">
          <button
            className="min-h-10 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-3 text-sm font-black text-[var(--color-text-muted)]"
            onClick={() => setDismissed(true)}
            type="button"
          >
            縺翫→縺ｪ縺励〒
          </button>
          <button
            className="min-h-10 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-3 text-sm font-black text-white"
            onClick={() => {
              void audio.unlock();
            }}
            type="button"
          >
            おとを つける
          </button>
        </div>
      </div>
    </div>
  );
}
