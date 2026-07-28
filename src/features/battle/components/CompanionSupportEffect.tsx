import { CompanionArtwork } from '../../assets';
import type { CompanionSupportEvent } from '../../collection';

type CompanionSupportEffectProps = {
  support: CompanionSupportEvent | null;
};

export function CompanionSupportEffect({
  support,
}: CompanionSupportEffectProps) {
  if (!support) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-large)] border border-pink-200 bg-pink-50 p-3 shadow-sm motion-safe:animate-[game-companion-support-enter_.9s_ease-out_1]"
      data-testid="companion-support-effect"
    >
      <div className="grid grid-cols-[72px_1fr] items-center gap-3">
        <CompanionArtwork
          className="size-18 bg-white"
          companionId={support.companionId}
          selected
        />
        <div className="min-w-0">
          <p className="text-sm font-black text-pink-700">
            {support.companionName} の {support.skillName}
          </p>
          <p className="break-words text-lg font-black text-[var(--color-text)]">
            {support.line}
          </p>
          <p className="mt-1 inline-flex rounded-[var(--radius-pill)] bg-white px-3 py-1 text-sm font-black text-[var(--color-primary-strong)] ring-2 ring-pink-100">
            {support.effectLabel}
            {support.damageBonus > 0 ? ` / +${support.damageBonus}` : ''}
          </p>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="absolute -right-6 -top-6 size-20 rounded-full bg-white/70 blur-xl"
      />
    </div>
  );
}
