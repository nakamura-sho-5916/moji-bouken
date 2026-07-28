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
  const showsRouteOpening =
    area.unlocked && area.area.requiredPreviousAreaId !== null;

  return (
    <button
      className={[
        'relative w-full overflow-hidden rounded-[var(--radius-large)] border bg-white p-4 text-left shadow-sm',
        area.reconstructionStage > 0
          ? 'motion-safe:animate-[game-recovery-breathe_2.8s_ease-in-out_infinite]'
          : '',
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
      {showsRouteOpening ? (
        <div
          className="absolute left-0 right-0 top-0 z-10 h-2 bg-gradient-to-r from-transparent via-amber-300 to-transparent motion-safe:animate-[game-world-route-open_1.1s_ease-out_1]"
          data-testid="world-route-opening"
        />
      ) : null}
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
          aria-label={`復興 ${area.reconstructionStage}`}
          className="rounded-full bg-white px-3 py-1 text-sm font-black text-[var(--color-primary-strong)]"
        >
          星{area.reconstructionStage}
        </span>
      </div>
      {showsRouteOpening ? (
        <p className="relative z-10 mt-2 w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 motion-safe:animate-[game-world-gate-open_.75s_ease-out_1]">
          道が ひらいた
        </p>
      ) : null}
      <div className="relative z-10 mt-3">
        <RecoveryScene stage={area.reconstructionStage} />
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
