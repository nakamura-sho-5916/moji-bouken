import { motion } from 'framer-motion';
import { AreaBackground } from '../../assets';
import type { AreaViewModel } from '../types';

export function LockedArea({ area }: { area: AreaViewModel }) {
  return (
    <article
      className="relative min-h-56 overflow-hidden rounded-[var(--radius-large)] border border-slate-300 bg-slate-100 p-4 text-slate-700 shadow-sm"
      data-testid="locked-area-card"
    >
      <AreaBackground
        areaId={area.area.id}
        className="absolute inset-0 -z-0 rounded-none opacity-45"
        dimmed
      />
      <motion.div
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-20 bg-slate-950/45"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      />
      <div className="relative z-30 max-w-[14rem] pr-12 sm:max-w-none">
        <p className="text-sm font-black text-white drop-shadow">
          {area.area.shortName}
        </p>
        <h3 className="mt-1 text-2xl font-black leading-tight text-white drop-shadow">
          {area.area.name}
        </h3>
      </div>
      <div className="absolute inset-0 z-30 grid place-items-center px-4 text-center">
        <div className="rounded-[var(--radius-large)] bg-slate-950/35 px-6 py-4 text-white shadow-lg">
          <p aria-hidden="true" className="text-5xl leading-none">
            🔒
          </p>
          <p className="mt-2 text-2xl font-black tracking-wide">未解放</p>
        </div>
      </div>
      <p className="absolute inset-x-4 bottom-4 z-30 rounded-[var(--radius-medium)] bg-white/95 px-3 py-2 text-center text-sm font-black leading-relaxed text-slate-800 shadow-sm">
        まえの ばしょを げんきにしよう
      </p>
    </article>
  );
}
