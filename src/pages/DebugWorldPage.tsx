import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { WorldMap } from '../features/world/components/WorldMap';
import { WorldRecoveryEngine } from '../features/world';
import type { AreaViewModel } from '../features/world';

const DEBUG_BATTLE_ID_PREFIX = 'debug-world';

export function DebugWorldPage() {
  const [areas, setAreas] = useState<AreaViewModel[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState('starting-village');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('せかいの 状態を 確認できます');

  const reload = async () => {
    const state = await WorldRecoveryEngine.getWorldState();
    setAreas(state);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void WorldRecoveryEngine.getWorldState().then((state) => {
      if (!active) {
        return;
      }
      setAreas(state);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const applyDebugRecovery = async (bossDefeated: boolean) => {
    const result = await WorldRecoveryEngine.applyRecovery({
      battleId: `${DEBUG_BATTLE_ID_PREFIX}-${selectedAreaId}-${Date.now()}`,
      areaId: selectedAreaId,
      bossDefeated,
      bonusReasons: bossDefeated
        ? ['boss-defeated', 'weak-letter-mastered']
        : ['weak-letter-progress'],
      experienceEarned: bossDefeated ? 120 : 25,
      goldEarned: bossDefeated ? 60 : 10,
    });
    await reload();
    setMessage(
      result
        ? `${result.pointsAdded}こぶん せかいが げんきになりました`
        : 'エリアを みつけられませんでした',
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <p className="text-sm font-black text-[var(--color-text-muted)]">
          Debug World
        </p>
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          世界復興デバッグ
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          {message}
        </p>
      </div>
      <div className="grid gap-3 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
        <label className="grid gap-2 text-sm font-black">
          エリア
          <select
            className="min-h-12 rounded-[var(--radius-medium)] border border-[var(--color-border)] px-3"
            onChange={(event) => setSelectedAreaId(event.target.value)}
            value={selectedAreaId}
          >
            {areas.map((area) => (
              <option key={area.area.id} value={area.area.id}>
                {area.area.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-4 font-black text-white"
            onClick={() => {
              void applyDebugRecovery(false);
            }}
            type="button"
          >
            通常勝利
          </button>
          <button
            className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-4 font-black text-white"
            onClick={() => {
              void applyDebugRecovery(true);
            }}
            type="button"
          >
            大きく復興
          </button>
        </div>
      </div>
      <WorldMap
        areas={areas}
        onSelect={(area) => setSelectedAreaId(area.area.id)}
        selectedAreaId={selectedAreaId}
      />
    </section>
  );
}
