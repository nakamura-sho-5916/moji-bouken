import { BridgeRecovery } from './BridgeRecovery';
import { NatureRecovery } from './NatureRecovery';
import { ShopRecovery } from './ShopRecovery';

export function RecoveryScene({ stage }: { stage: number }) {
  const isBright = stage >= 2;
  return (
    <div
      className={[
        'grid gap-2 rounded-[var(--radius-large)] p-3 transition-colors',
        isBright ? 'bg-lime-50' : 'bg-slate-100 grayscale',
      ].join(' ')}
    >
      <NatureRecovery active={stage >= 1} />
      <ShopRecovery opened={stage >= 2} />
      <BridgeRecovery repaired={stage >= 3} />
    </div>
  );
}
