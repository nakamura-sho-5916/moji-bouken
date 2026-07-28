import type { AreaViewModel } from '../types';

export function LockedArea({ area }: { area: AreaViewModel }) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-large)] border border-dashed border-slate-300 bg-slate-100 p-4 text-slate-500">
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-around bg-white/55 text-3xl font-black text-sky-200"
      >
        <span>雲</span>
        <span>雲</span>
        <span>雲</span>
      </div>
      <div className="relative z-10">
        <p className="text-3xl" aria-hidden="true">
          霧
        </p>
        <h3 className="mt-2 text-xl font-black">{area.area.name}</h3>
        <p className="mt-1 text-sm font-bold">まえの ばしょを げんきにしよう</p>
      </div>
    </div>
  );
}
