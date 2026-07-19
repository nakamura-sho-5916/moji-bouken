import { Link } from 'react-router-dom';
import { loadLastMissionResult } from '../features/missions/MissionSession';
import { RewardSummary } from '../features/rewards/components/RewardSummary';
import { LevelUpEffect } from '../features/rewards/components/LevelUpEffect';
import { RewardEngine } from '../features/rewards';

export function ResultPage() {
  const result = loadLastMissionResult();
  const rewardSummary = RewardEngine.loadLastRewardSummary();
  const completedCount = result?.results.length ?? 0;

  return (
    <section className="grid min-h-full gap-5">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-6 text-center shadow-sm">
        <p className="text-6xl" aria-hidden="true">
          ✨
        </p>
        <h1 className="mt-3 text-3xl font-black text-[var(--color-primary-strong)]">
          つづけて できたね
        </h1>
        <p className="mt-3 text-lg font-black text-[var(--color-text-muted)]">
          できた ことが ふえたよ
        </p>
      </div>
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <p className="text-lg font-black text-[var(--color-text)]">
          ひかった まる
        </p>
        <div className="mt-3 grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, index) => (
            <span
              className={[
                'h-5 rounded-[var(--radius-pill)]',
                index < completedCount
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-orange-100',
              ].join(' ')}
              key={index}
            />
          ))}
        </div>
      </div>
      <LevelUpEffect visible={Boolean(rewardSummary?.levelUp)} />
      <RewardSummary summary={rewardSummary} />
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-xl font-black text-[var(--color-primary-strong)]">
          あたらしい せかい
        </h2>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          まちに あかりが ふえるよ
        </p>
      </div>
      <div className="mt-auto grid gap-3">
        <Link
          className="flex min-h-14 items-center justify-center rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
          to="/mission"
        >
          もういちど
        </Link>
        <Link
          className="flex min-h-14 items-center justify-center rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-5 text-xl font-black text-white"
          to="/home"
        >
          ホームへ
        </Link>
      </div>
    </section>
  );
}
