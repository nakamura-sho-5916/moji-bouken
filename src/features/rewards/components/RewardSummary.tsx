import { RewardChestPresentation } from './RewardChestPresentation';
import type { RewardSummary as RewardSummaryData } from '../types';

type RewardSummaryProps = {
  summary: RewardSummaryData | null;
};

export function RewardSummary({ summary }: RewardSummaryProps) {
  if (!summary) {
    return null;
  }

  const progressMax = Math.max(
    1,
    (summary.nextLevelExperience ?? summary.experienceAfter) -
      summary.experienceBefore,
  );
  const progressValue = Math.max(
    0,
    Math.min(progressMax, summary.experienceAfter - summary.experienceBefore),
  );
  const droppedItems = summary.droppedItems ?? [];
  const companionSupports = summary.companionSupports ?? [];

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
      <h2 className="text-xl font-black text-[var(--color-primary-strong)]">
        たからばこ
      </h2>
      <div className="mt-4">
        <RewardChestPresentation items={droppedItems} />
      </div>
      {companionSupports.length > 0 ? (
        <div className="mt-4 rounded-[var(--radius-medium)] border border-pink-200 bg-pink-50 p-3">
          <p className="font-black text-pink-700">なかまの かつやく</p>
          <div className="mt-2 grid gap-2">
            {companionSupports.map((support) => (
              <div
                className="rounded-[var(--radius-medium)] bg-white p-3 font-black"
                key={`${support.companionId}-${support.skill}`}
              >
                <p className="text-[var(--color-primary-strong)]">
                  {support.companionName} / {support.skillName}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {support.effectLabel}
                  {support.damageBonus > 0 ? ` / +${support.damageBonus}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-medium)] bg-orange-50 p-3 text-center font-black">
          <p>けいけん</p>
          <p className="text-2xl">+{summary.experienceGained}</p>
          <p className="mt-1 text-sm">
            {summary.experienceBefore} → {summary.experienceAfter}
          </p>
        </div>
        <div className="rounded-[var(--radius-medium)] bg-sky-50 p-3 text-center font-black">
          <p>Gold</p>
          <p className="text-2xl">+{summary.goldGained}</p>
          <p className="mt-1 text-sm">
            {summary.goldBefore} → {summary.goldAfter}
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-[var(--radius-medium)] bg-emerald-50 p-3 font-black">
        <div className="flex items-center justify-between gap-3">
          <span>レベル {summary.levelAfter}</span>
          <span>あと {summary.experienceToNextLevel}</span>
        </div>
        <div className="mt-2 h-4 overflow-hidden rounded-[var(--radius-pill)] bg-white">
          <div
            className="h-full rounded-[var(--radius-pill)] bg-[var(--color-primary)]"
            style={{ width: `${(progressValue / progressMax) * 100}%` }}
          />
        </div>
      </div>
      {summary.levelUp ? (
        <p className="mt-4 rounded-[var(--radius-medium)] bg-[var(--color-primary)] p-3 text-center text-lg font-black text-white motion-safe:animate-[game-rare-glow_1s_ease-in-out_2]">
          レベルアップ！
        </p>
      ) : null}
    </section>
  );
}
