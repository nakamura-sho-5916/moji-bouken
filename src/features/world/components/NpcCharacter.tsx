import type { NpcData } from '../types';

export function NpcCharacter({ npc }: { npc: NpcData }) {
  return (
    <div className="rounded-[var(--radius-medium)] bg-white/80 p-3">
      <p className="text-sm font-black text-[var(--color-primary-strong)]">
        {npc.name}
      </p>
      <p className="text-xs font-bold text-[var(--color-text-muted)]">
        {npc.message}
      </p>
    </div>
  );
}
