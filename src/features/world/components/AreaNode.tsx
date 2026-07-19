import type { AreaViewModel } from '../types';
import { NpcCharacter } from './NpcCharacter';
import { RecoveryScene } from './RecoveryScene';

const themeClasses = {
  village: 'from-orange-100 to-yellow-50',
  forest: 'from-emerald-100 to-lime-50',
  hill: 'from-sky-100 to-white',
  cave: 'from-stone-200 to-amber-50',
  castle: 'from-rose-100 to-violet-50',
} as const;

export function AreaNode({
  area,
  selected,
  onSelect,
}: {
  area: AreaViewModel;
  selected: boolean;
  onSelect: (area: AreaViewModel) => void;
}) {
  return (
    <button
      className={[
        'w-full rounded-[var(--radius-large)] border p-4 text-left shadow-sm',
        'bg-gradient-to-b',
        themeClasses[area.area.theme],
        selected
          ? 'border-[var(--color-primary)] ring-4 ring-orange-100'
          : 'border-[var(--color-border)]',
      ].join(' ')}
      onClick={() => onSelect(area)}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--color-text-muted)]">
            {area.area.shortName}
          </p>
          <h3 className="text-2xl font-black text-[var(--color-primary-strong)]">
            {area.area.name}
          </h3>
        </div>
        <span
          className="rounded-full bg-white px-3 py-1 text-sm font-black text-[var(--color-primary-strong)]"
          aria-label={`ふっこう ${area.recoveryStage}`}
        >
          ★{area.recoveryStage}
        </span>
      </div>
      <div className="mt-3">
        <RecoveryScene stage={area.recoveryStage} />
      </div>
      {area.availableNpc.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {area.availableNpc.slice(0, 2).map((npc) => (
            <NpcCharacter key={npc.id} npc={npc} />
          ))}
        </div>
      ) : null}
    </button>
  );
}
