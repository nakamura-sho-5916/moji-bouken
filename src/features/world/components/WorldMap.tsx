import { AnimatePresence } from 'framer-motion';
import type { AreaViewModel } from '../types';
import { AreaNode } from './AreaNode';
import { LockedArea } from './LockedArea';

export function WorldMap({
  areas,
  selectedAreaId,
  onSelect,
}: {
  areas: AreaViewModel[];
  selectedAreaId: string | null;
  onSelect: (area: AreaViewModel) => void;
}) {
  return (
    <div className="grid gap-3">
      {areas.map((area) => (
        <AnimatePresence key={area.area.id} mode="wait">
          {area.unlocked ? (
            <AreaNode
              area={area}
              key={`${area.area.id}-unlocked`}
              onSelect={onSelect}
              selected={area.area.id === selectedAreaId}
            />
          ) : (
            <LockedArea area={area} key={`${area.area.id}-locked`} />
          )}
        </AnimatePresence>
      ))}
    </div>
  );
}
