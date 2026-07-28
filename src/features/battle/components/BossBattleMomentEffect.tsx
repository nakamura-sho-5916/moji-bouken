import { EffectBurst } from '../../effects';
import type { BossBattleMoment } from '../bossBattlePresentation';

type BossBattleMomentEffectProps = {
  moment: BossBattleMoment | null;
};

const toneByKind = {
  anger: 'warning',
  charge: 'impact',
  line: 'rare',
} as const;

export function BossBattleMomentEffect({
  moment,
}: BossBattleMomentEffectProps) {
  if (!moment) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-medium)] border-2 border-amber-300 bg-amber-50 p-3 text-center motion-safe:animate-[game-boss-moment_.42s_ease-out_1]"
      data-testid="boss-battle-moment"
    >
      <div className="absolute inset-y-0 left-2 flex items-center opacity-40">
        <EffectBurst size="sm" tone={toneByKind[moment.kind]} />
      </div>
      <p className="relative text-sm font-black text-amber-700">
        {moment.title}
      </p>
      <p className="relative text-lg font-black text-[var(--color-text)]">
        {moment.message}
      </p>
    </div>
  );
}
