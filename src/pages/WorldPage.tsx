import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingScreen } from '../components/LoadingScreen';
import { AreaDetailPanel } from '../features/world/components/AreaDetailPanel';
import { WorldMap } from '../features/world/components/WorldMap';
import { selectAreaEnemy, WorldRecoveryEngine } from '../features/world';
import type { AreaViewModel } from '../features/world';

export function WorldPage() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<AreaViewModel[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void WorldRecoveryEngine.getWorldState()
      .then((state) => {
        if (!active) {
          return;
        }
        setAreas(state);
        setSelectedAreaId(
          state.find((area) => area.unlocked)?.area.id ??
            state[0]?.area.id ??
            null,
        );
      })
      .catch(() => {
        if (active) {
          setError('せかいを よみこめなかったよ');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedArea = useMemo(
    () => areas.find((area) => area.area.id === selectedAreaId) ?? null,
    [areas, selectedAreaId],
  );
  const selectedEnemy = selectedArea
    ? selectAreaEnemy({
        area: selectedArea,
        seed: `${selectedArea.area.id}-${selectedArea.recoveryStage}`,
      })
    : null;

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <section className="grid gap-4">
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-center">
          <p className="text-2xl font-black text-[var(--color-primary-strong)]">
            {error}
          </p>
          <Link
            className="mt-4 inline-flex min-h-14 items-center rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
            to="/home"
          >
            ホームへ
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-[var(--color-text-muted)]">
          ぼうけんマップ
        </p>
        <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
          もじの せかい
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          げんきにした ばしょから いろが もどるよ
        </p>
      </div>
      <WorldMap
        areas={areas}
        onSelect={(area) => setSelectedAreaId(area.area.id)}
        selectedAreaId={selectedAreaId}
      />
      {selectedArea ? (
        <AreaDetailPanel
          area={selectedArea}
          enemy={selectedEnemy}
          onStart={() => {
            if (!selectedEnemy) {
              return;
            }
            navigate(
              `/mission?areaId=${selectedArea.area.id}&enemyId=${selectedEnemy.id}`,
            );
          }}
        />
      ) : null}
    </section>
  );
}
