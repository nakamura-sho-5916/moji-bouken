import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import {
  equipmentData,
  getCollectionState,
  isShopOpen,
  purchaseEquipment,
} from '../features/collection';
import type { Inventory } from '../types';

export function ShopPage() {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('おみせは まだ じゅんびちゅうだよ');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const [state, shopOpen] = await Promise.all([
      getCollectionState(),
      isShopOpen(),
    ]);
    setInventory(state.inventory ?? null);
    setOpen(shopOpen);
    setMessage(
      shopOpen ? 'どれを てにいれる？' : 'おみせは まだ じゅんびちゅうだよ',
    );
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void Promise.all([getCollectionState(), isShopOpen()]).then(
      ([state, shopOpen]) => {
        if (!active) {
          return;
        }
        setInventory(state.inventory ?? null);
        setOpen(shopOpen);
        setMessage(
          shopOpen ? 'どれを てにいれる？' : 'おみせは まだ じゅんびちゅうだよ',
        );
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const ownedIds = new Set(inventory?.equipment.map((item) => item.id));

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
          おみせ
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          {message}
        </p>
        <p className="mt-3 rounded-[var(--radius-medium)] bg-yellow-50 p-3 font-black">
          ゴールド {inventory?.gold ?? 0}
        </p>
      </div>
      {open ? (
        <div className="grid gap-3">
          {equipmentData.map((equipment) => {
            const owned = ownedIds.has(equipment.id);
            const confirming = confirmingId === equipment.id;
            return (
              <div
                className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 shadow-sm"
                key={equipment.id}
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl" aria-hidden="true">
                    {equipment.imageId}
                  </span>
                  <div>
                    <p className="text-xl font-black text-[var(--color-primary-strong)]">
                      {equipment.name}
                    </p>
                    <p className="text-sm font-bold text-[var(--color-text-muted)]">
                      {equipment.description} / {equipment.price}ゴールド
                    </p>
                  </div>
                </div>
                {confirming ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] font-black text-white disabled:bg-slate-300"
                      disabled={busy}
                      onClick={() => {
                        setBusy(true);
                        void purchaseEquipment(equipment.id).then(
                          async (result) => {
                            setConfirmingId(null);
                            setBusy(false);
                            await reload();
                            setMessage(result.message);
                          },
                        );
                      }}
                      type="button"
                    >
                      てにいれる
                    </button>
                    <button
                      className="min-h-14 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white font-black"
                      onClick={() => setConfirmingId(null)}
                      type="button"
                    >
                      やめる
                    </button>
                  </div>
                ) : (
                  <button
                    className="mt-3 min-h-14 w-full rounded-[var(--radius-medium)] bg-[var(--color-secondary)] font-black text-white disabled:bg-slate-300"
                    disabled={owned}
                    onClick={() => setConfirmingId(equipment.id)}
                    type="button"
                  >
                    {owned ? 'もっているよ' : 'これを てにいれる？'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
