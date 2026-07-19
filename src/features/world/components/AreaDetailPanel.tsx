import { Link } from 'react-router-dom';
import type { Enemy } from '../../battle/types';
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
