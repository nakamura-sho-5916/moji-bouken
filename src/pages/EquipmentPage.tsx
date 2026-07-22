import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { ItemArtwork } from '../features/assets';
import {
  equipItem,
  equipmentData,
  getCollectionState,
} from '../features/collection';
import { useAudio } from '../features/audio';
import type { Inventory } from '../types';

export function EquipmentPage() {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [message, setMessage] = useState('そうびを みてみよう');
  const [loading, setLoading] = useState(true);
  const audio = useAudio();

  const reload = async () => {
    const state = await getCollectionState();
    setInventory(state.inventory ?? null);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void getCollectionState().then((state) => {
      if (!active) {
        return;
      }
      setInventory(state.inventory ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const ownedIds = new Set(inventory?.equipment.map((item) => item.id));
  const equippedBySlot = new Map(
    inventory?.equipment.map((item) => [item.slot, item.id]),
  );

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-center">
        <p className="text-6xl" aria-hidden="true">
          🧒
        </p>
        <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
          そうび
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          {message}
        </p>
      </div>
      <div className="grid gap-3">
        {equipmentData.map((equipment) => {
          const owned = ownedIds.has(equipment.id);
          const equipped = equippedBySlot.get(equipment.type) === equipment.id;
          return (
            <button
              className="min-h-24 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 text-left shadow-sm disabled:bg-slate-100"
              disabled={!owned}
              key={equipment.id}
              onClick={() => {
                void equipItem(equipment.id).then(async (done) => {
                  if (done) {
                    audio.playSoundEffect('equipment-acquired');
                  }
                  setMessage(done ? 'にあってるね！' : 'まだ もっていないよ');
                  await reload();
                });
              }}
              type="button"
            >
              <div className="flex items-center gap-3">
                <ItemArtwork
                  className="size-16 shrink-0"
                  equipped={equipped}
                  itemId={equipment.id}
                  locked={!owned}
                />
                <div>
                  <p className="text-xl font-black text-[var(--color-primary-strong)]">
                    {equipment.name}
                  </p>
                  <p className="text-sm font-bold text-[var(--color-text-muted)]">
                    {owned
                      ? `${equipment.description}${equipped ? ' / そうび中' : ''}`
                      : 'まだ てにいれていないよ'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
