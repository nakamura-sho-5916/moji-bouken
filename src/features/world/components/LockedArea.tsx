import type { AreaViewModel } from '../types';

export function LockedArea({ area }: { area: AreaViewModel }) {
  return (
    <div className="rounded-[var(--radius-large)] border border-dashed border-slate-300 bg-slate-100 p-4 text-slate-500">
      <p className="text-3xl" aria-hidden="true">
        🔒
      </p>
      <h3 className="mt-2 text-xl font-black">{area.area.name}</h3>
      <p className="mt-1 text-sm font-bold">まえの ばしょを げんきにしよう</p>
    </div>
  );
}
