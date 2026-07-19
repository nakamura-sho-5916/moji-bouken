import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DEFAULT_PLAYER_ID } from '../../../db/constants';
import { initializeAppData } from '../../../db/initializeAppData';
import { getPlayerById } from '../../../db/repositories/playerRepository';
import { RewardEngine } from '../../rewards';
import { BattleEngine } from '../BattleEngine';
import { createBattleSession } from '../createBattleSession';
import { getDefaultEnemy, getEnemy } from '../enemies';
import type { BattleSession } from '../types';
import { ComboDisplay } from './ComboDisplay';
import { DamageEffect } from './DamageEffect';
import { EnemyDisplay } from './EnemyDisplay';
import { SpecialAttackButton } from './SpecialAttackButton';
import { SpecialGauge } from './SpecialGauge';
import { VictoryEffect } from './VictoryEffect';

export function BattleScreen() {
  const navigate = useNavigate();
  const [battle, setBattle] = useState<BattleSession | null>(null);
  const [lastDamage, setLastDamage] = useState(0);
  const [message, setMessage] = useState('バトルを はじめよう');
  const enemy = battle
    ? (getEnemy(battle.enemyId) ?? getDefaultEnemy(false))
    : getDefaultEnemy(false);

  const startBattle = async (boss = false) => {
    const data = await initializeAppData();
    const player = (await getPlayerById(DEFAULT_PLAYER_ID)) ?? data.player;
    const nextBattle = createBattleSession({
      sessionId: `battle-${boss ? 'boss' : 'normal'}-${Date.now()}`,
      playerLevel: player.level,
      boss,
    });
    setBattle(nextBattle);
    setLastDamage(0);
    setMessage(nextBattle.lastMessage);
  };

  const finishIfVictory = async (nextBattle: BattleSession) => {
    if (nextBattle.status !== 'victory') {
      return;
    }
    await RewardEngine.grantBattleRewards({
      battle: nextBattle,
      missionResults: [],
    });
    setBattle({ ...nextBattle, status: 'completed' });
  };

  const answer = async (correct: boolean) => {
    if (!battle) {
      return;
    }
    const result = BattleEngine.applyAnswer({ battle, correct });
    setBattle(
      result.battle.status === 'feedback'
        ? { ...result.battle, status: 'active' }
        : result.battle,
    );
    setLastDamage(result.damage);
    setMessage(result.battle.lastMessage);
    await finishIfVictory(result.battle);
  };

  const handleSpecialAttack = async () => {
    if (!battle) {
      return;
    }
    const result = BattleEngine.applySpecialAttack(battle);
    setBattle(
      result.battle.status === 'feedback'
        ? { ...result.battle, status: 'active' }
        : result.battle,
    );
    setLastDamage(result.damage);
    setMessage(result.battle.lastMessage);
    await finishIfVictory(result.battle);
  };

  const goResult = () => {
    navigate('/result');
  };

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          className="rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-4 py-3 font-black"
          to="/home"
        >
          もどる
        </Link>
        <button
          className="rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-4 py-3 font-black text-white"
          onClick={() => {
            void startBattle(false);
          }}
          type="button"
        >
          バトルを はじめる
        </button>
      </div>
      {battle ? (
        <>
          <EnemyDisplay enemy={enemy} currentHp={battle.enemyCurrentHp} />
          <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
            <p className="text-lg font-black">{message}</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-text-muted)]">
              もじを えらんで てきを てらそう
            </p>
          </div>
          <DamageEffect damage={lastDamage} />
          <div className="grid grid-cols-2 gap-3">
            <button
              className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-4 text-xl font-black text-white"
              disabled={battle.status === 'completed'}
              onClick={() => {
                void answer(true);
              }}
              type="button"
            >
              せいかい
            </button>
            <button
              className="min-h-14 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-4 text-xl font-black"
              disabled={battle.status === 'completed'}
              onClick={() => {
                void answer(false);
              }}
              type="button"
            >
              ちがう
            </button>
          </div>
          <ComboDisplay comboCount={battle.comboCount} />
          <SpecialGauge
            max={battle.specialGaugeMax}
            value={battle.specialGauge}
          />
          <SpecialAttackButton
            onUse={() => {
              void handleSpecialAttack();
            }}
            ready={
              battle.specialGauge >= battle.specialGaugeMax &&
              battle.status !== 'completed'
            }
          />
          <VictoryEffect visible={battle.status === 'completed'} />
          {battle.status === 'completed' ? (
            <button
              className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-success)] px-5 text-xl font-black text-white"
              onClick={goResult}
              type="button"
            >
              けっかへ
            </button>
          ) : null}
        </>
      ) : (
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-center">
          <p className="text-2xl font-black text-[var(--color-primary-strong)]">
            ことばの ちからで すすもう
          </p>
          <button
            className="mt-4 min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
            onClick={() => {
              void startBattle(true);
            }}
            type="button"
          >
            ボスに ちょうせん
          </button>
        </div>
      )}
    </section>
  );
}
