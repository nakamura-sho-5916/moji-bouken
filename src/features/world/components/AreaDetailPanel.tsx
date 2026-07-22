import { Link } from 'react-router-dom';
import type { Enemy } from '../../battle/types';
import { RECOVERY_STAGE_THRESHOLDS } from '../constants';
import type { AreaViewModel } from '../types';

export function AreaDetailPanel({
  area,
  enemy,
  onStart,
}: {
  area: AreaViewModel;
  enemy: Enemy | null;
  onStart: () => void;
}) {
  const nextStage = Math.min(
    area.recoveryStage + 1,
    RECOVERY_STAGE_THRESHOLDS.length - 1,
  );
  const nextStagePoints = RECOVERY_STAGE_THRESHOLDS[nextStage] ?? 0;
  const pointsToNextStage = Math.max(0, nextStagePoints - area.recoveryPoints);
  const progressMax = Math.max(1, nextStagePoints);
  const progressValue = Math.min(progressMax, area.recoveryPoints);

  return (
    <aside className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <p className="text-sm font-black text-[var(--color-text-muted)]">
        つぎの ぼうけん
      </p>
      <h2 className="text-2xl font-black text-[var(--color-primary-strong)]">
        {area.area.name}
      </h2>
      <p className="mt-2 font-bold text-[var(--color-text-muted)]">
        {enemy ? `${enemy.name}が まっているよ` : 'いまは ひとやすみ'}
      </p>
      <div className="mt-4 rounded-[var(--radius-medium)] bg-emerald-50 p-3 font-black">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>ふっこう {area.recoveryStage}</span>
          <span>
            {pointsToNextStage > 0
              ? `あと ${pointsToNextStage}`
              : 'つぎへ すすめるよ'}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-[var(--radius-pill)] bg-white">
          <div
            className="h-full rounded-[var(--radius-pill)] bg-[var(--color-primary)]"
            style={{ width: `${(progressValue / progressMax) * 100}%` }}
          />
        </div>
      </div>
      <button
        className="mt-4 min-h-14 w-full rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white disabled:bg-slate-300"
        disabled={!enemy}
        onClick={onStart}
        type="button"
      >
        ここへ いく
      </button>
      {area.area.id === 'starting-village' && area.recoveryStage >= 3 ? (
        <Link
          className="mt-3 flex min-h-14 items-center justify-center rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-5 text-xl font-black text-white"
          to="/shop"
        >
          おみせへ
        </Link>
      ) : null}
    </aside>
  );
}
