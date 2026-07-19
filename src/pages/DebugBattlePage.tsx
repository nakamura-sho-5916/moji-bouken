import { useState } from 'react';
import { BattleEngine, createBattleSession, enemies } from '../features/battle';
import type { BattleSession } from '../features/battle';
import { RewardEngine } from '../features/rewards';
import { PageFrame } from './PageFrame';

export function DebugBattlePage() {
  const [battle, setBattle] = useState<BattleSession | null>(null);
  const [rewardText, setRewardText] = useState('reward: none');

  if (!import.meta.env.DEV) {
    return (
      <PageFrame
        description="このページは つかえません"
        showBack={false}
        title="404"
      />
    );
  }

  const start = (enemyId: string) => {
    setBattle(createBattleSession({ enemyId, sessionId: `debug-${enemyId}` }));
    setRewardText('reward: none');
  };

  const answer = (correct: boolean) => {
    if (!battle) return;
    const result = BattleEngine.applyAnswer({ battle, correct });
    setBattle(
      result.battle.status === 'feedback'
        ? { ...result.battle, status: 'active' }
        : result.battle,
    );
  };

  const special = () => {
    if (!battle) return;
    const result = BattleEngine.applySpecialAttack(battle);
    setBattle(
      result.battle.status === 'feedback'
        ? { ...result.battle, status: 'active' }
        : result.battle,
    );
  };

  const grant = async () => {
    if (!battle) return;
    const summary = await RewardEngine.grantBattleRewards({
      battle: { ...battle, enemyCurrentHp: 0, status: 'victory' },
      missionResults: [],
    });
    setRewardText(
      `reward: exp ${summary.experienceGained}, gold ${summary.goldGained}, duplicate ${summary.alreadyRewarded}`,
    );
  };

  return (
    <PageFrame description="バトル計算の かくにん" title="Debug Battle">
      <section className="grid gap-3">
        <select
          className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-3"
          onChange={(event) => start(event.currentTarget.value)}
          value={battle?.enemyId ?? ''}
        >
          <option value="">てきを えらぶ</option>
          {enemies.map((enemy) => (
            <option key={enemy.id} value={enemy.id}>
              {enemy.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <button
            className="min-h-11 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-3 font-black text-white"
            onClick={() => answer(true)}
            type="button"
          >
            正解攻撃
          </button>
          <button
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-3 font-black"
            onClick={() => answer(false)}
            type="button"
          >
            誤答
          </button>
          <button
            className="min-h-11 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-3 font-black text-white"
            onClick={special}
            type="button"
          >
            必殺
          </button>
          <button
            className="min-h-11 rounded-[var(--radius-medium)] bg-[var(--color-success)] px-3 font-black text-white"
            onClick={() => void grant()}
            type="button"
          >
            報酬計算
          </button>
        </div>
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 font-black">
          <p>hp: {battle?.enemyCurrentHp ?? '-'}</p>
          <p>combo: {battle?.comboCount ?? '-'}</p>
          <p>gauge: {battle?.specialGauge ?? '-'}</p>
          <p>{rewardText}</p>
        </div>
      </section>
    </PageFrame>
  );
}
