import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import {
  getActivePlayerId,
  getActiveSaveSlotId,
  listSaveSlotSummaries,
  startSaveSlot,
  type SaveSlotSummary,
} from '../db/repositories/saveSlotRepository';

export function DebugSavePage() {
  const [slots, setSlots] = useState<SaveSlotSummary[] | null>(null);

  const reload = async () => {
    setSlots(await listSaveSlotSummaries());
  };

  useEffect(() => {
    let active = true;
    void listSaveSlotSummaries().then((nextSlots) => {
      if (active) {
        setSlots(nextSlots);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!slots) {
    return <LoadingScreen />;
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Save
        </h1>
        <p className="mt-2 font-bold">slots: {slots.length}</p>
        <p className="font-bold">activeSlot: {getActiveSaveSlotId()}</p>
        <p className="font-bold">activePlayer: {getActivePlayerId()}</p>
      </div>
      <div className="grid gap-3">
        {slots.map((slot) => (
          <button
            className="grid min-h-16 gap-1 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-3 text-left font-bold"
            key={slot.id}
            onClick={() => {
              void startSaveSlot(slot.id).then(reload);
            }}
            type="button"
          >
            <span className="font-black">
              {slot.id} / {slot.name}
            </span>
            <span>
              empty: {String(slot.empty)} / level: {slot.level} / town:{' '}
              {slot.townRecoveryRate}%
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
