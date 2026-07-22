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
      <div className="flex items-center gap-2 rounded-[var(--radius-medium)] bg-pink-100 px-3 py-2 text-sm font-black text-pink-900">
        <span aria-hidden="true">{stage >= 1 ? '花' : '芽'}</span>
        <span>{stage >= 1 ? 'はなが さいたよ' : 'はなが めを だしそう'}</span>
      </div>
      <ShopRecovery opened={stage >= 2} />
      <div className="flex items-center gap-2 rounded-[var(--radius-medium)] bg-orange-100 px-3 py-2 text-sm font-black text-orange-900">
        <span aria-hidden="true">{stage >= 2 ? '家' : '土'}</span>
        <span>
          {stage >= 2 ? 'たてものが もどったよ' : 'ひろばを なおしているよ'}
        </span>
      </div>
      <BridgeRecovery repaired={stage >= 3} />
      <div className="flex items-center gap-2 rounded-[var(--radius-medium)] bg-violet-100 px-3 py-2 text-sm font-black text-violet-900">
        <span aria-hidden="true">{stage >= 3 ? '人' : '道'}</span>
        <span>
          {stage >= 3 ? 'ひとが あつまってきたよ' : 'みちを ひらいているよ'}
        </span>
      </div>
    </div>
  );
}
