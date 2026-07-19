import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import {
  companionData,
  getCollectionState,
  joinEligibleCompanions,
  selectCompanion,
} from '../features/collection';
import type { CompanionData } from '../features/collection';
import type { Inventory } from '../types';

export function CompanionsPage() {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('いっしょに いく なかまを えらぼう');
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    await joinEligibleCompanions();
    const state = await getCollectionState();
    setInventory(state.inventory ?? null);
    setSelectedId(state.selectedCompanion?.id ?? null);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void joinEligibleCompanions().then(() =>
      getCollectionState().then((state) => {
        if (!active) {
          return;
        }
        setInventory(state.inventory ?? null);
        setSelectedId(state.selectedCompanion?.id ?? null);
        setLoading(false);
      }),
    );
    return () => {
      active = false;
    };
  }, []);

  const joinedIds = new Set(
    inventory?.companions.map((companion) => companion.id),
  );

  const choose = async (companion: CompanionData) => {
    const selected = await selectCompanion(companion.id);
    setMessage(selected ? 'いっしょに いこうね' : 'まだ であっていないよ');
    await reload();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
          なかま
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          {message}
        </p>
      </div>
      <div className="grid gap-3">
        {companionData.map((companion) => {
          const joined = joinedIds.has(companion.id);
          return (
            <button
              className={[
                'min-h-24 rounded-[var(--radius-large)] border bg-white p-4 text-left shadow-sm',
                selectedId === companion.id
                  ? 'border-[var(--color-primary)] ring-4 ring-orange-100'
                  : 'border-[var(--color-border)]',
              ].join(' ')}
              disabled={!joined}
              key={companion.id}
              onClick={() => {
                void choose(companion);
              }}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="text-5xl" aria-hidden="true">
                  {joined ? companion.imageId : '？'}
                </span>
                <div>
                  <p className="text-xl font-black text-[var(--color-primary-strong)]">
                    {joined ? companion.name : 'まだ であっていないよ'}
                  </p>
                  <p className="text-sm font-bold text-[var(--color-text-muted)]">
                    {joined
                      ? `${companion.skillName} / ${companion.description}`
                      : '🔒 せかいを げんきにしよう'}
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
