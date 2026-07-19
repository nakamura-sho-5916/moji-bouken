import type { RewardSummary as RewardSummaryData } from '../types';

type RewardSummaryProps = {
  summary: RewardSummaryData | null;
};

export function RewardSummary({ summary }: RewardSummaryProps) {
  if (!summary) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
      <h2 className="text-xl font-black text-[var(--color-primary-strong)]">
        たからばこ
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-medium)] bg-orange-50 p-3 text-center font-black">
          <p>けいけん</p>
          <p className="text-2xl">+{summary.experienceGained}</p>
        </div>
        <div className="rounded-[var(--radius-medium)] bg-sky-50 p-3 text-center font-black">
          <p>ゴールド</p>
          <p className="text-2xl">+{summary.goldGained}</p>
        </div>
      </div>
      {summary.levelUp ? (
        <p className="mt-4 rounded-[var(--radius-medium)] bg-[var(--color-primary)] p-3 text-center text-lg font-black text-white">
          レベルアップ
        </p>
      ) : null}
    </section>
  );
}
