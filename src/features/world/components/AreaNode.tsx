import { AreaBackground } from '../../assets';
import type { AreaViewModel } from '../types';
import { NpcCharacter } from './NpcCharacter';
import { RecoveryScene } from './RecoveryScene';

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
        'relative w-full overflow-hidden rounded-[var(--radius-large)] border bg-white p-4 text-left shadow-sm',
        selected
          ? 'border-[var(--color-primary)] ring-4 ring-orange-100'
          : 'border-[var(--color-border)]',
      ].join(' ')}
      onClick={() => onSelect(area)}
      type="button"
    >
      <AreaBackground
        areaId={area.area.id}
        className="absolute inset-0 -z-0 rounded-none opacity-70"
        dimmed={!area.unlocked}
      />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--color-text-muted)]">
            {area.area.shortName}
          </p>
          <h3 className="text-2xl font-black text-[var(--color-primary-strong)]">
            {area.area.name}
          </h3>
        </div>
        <span
          aria-label={`ふっこう ${area.recoveryStage}`}
          className="rounded-full bg-white px-3 py-1 text-sm font-black text-[var(--color-primary-strong)]"
        >
          星{area.recoveryStage}
        </span>
      </div>
      <div className="relative z-10 mt-3">
        <RecoveryScene stage={area.recoveryStage} />
      </div>
      {area.availableNpc.length > 0 ? (
        <div className="relative z-10 mt-3 grid gap-2">
          {area.availableNpc.slice(0, 2).map((npc) => (
            <NpcCharacter key={npc.id} npc={npc} />
          ))}
        </div>
      ) : null}
    </button>
  );
}
