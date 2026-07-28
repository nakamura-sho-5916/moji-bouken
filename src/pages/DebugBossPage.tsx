import { useMemo, useState } from 'react';
import { BattleStatusPanel } from '../features/battle/components/BattleStatusPanel';
import { BossDefeatCinematic } from '../features/battle/components/BossDefeatCinematic';
import { BossIntroCinematic } from '../features/battle/components/BossIntroCinematic';
import {
  createBattleSession,
  getBossBattleMoments,
  getEnemy,
  selectBossBattleMoment,
  type BattleSession,
} from '../features/battle';

const debugBossId = 'boss-village-kana-guardian';

function createDebugBossBattle(): BattleSession {
  const battle = createBattleSession({
    enemyId: debugBossId,
    playerLevel: 4,
    sessionId: 'debug-boss',
  });
  return {
    ...battle,
    comboCount: 6,
    enemyCurrentHp: Math.floor(battle.enemyMaxHp * 0.55),
    specialGauge: battle.specialGaugeMax,
  };
}

export function DebugBossPage() {
  const [introVisible, setIntroVisible] = useState(false);
  const [defeatVisible, setDefeatVisible] = useState(true);
  const [missionIndex, setMissionIndex] = useState(3);
  const battle = useMemo(() => createDebugBossBattle(), []);
  const enemy = getEnemy(debugBossId) ?? null;
  const selectedMoment =
    getBossBattleMoments()[missionIndex % getBossBattleMoments().length] ??
    selectBossBattleMoment({
      battleId: battle.battleId,
      enemy,
      missionIndex,
    });

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Boss
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          Boss intro, battle moments, defeat, and unlock presentation.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          className="min-h-12 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-3 font-black text-white"
          onClick={() => setIntroVisible(true)}
          type="button"
        >
          Intro
        </button>
        <button
          className="min-h-12 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-3 font-black text-white"
          onClick={() => setMissionIndex((current) => current + 3)}
          type="button"
        >
          Moment
        </button>
        <button
          className="min-h-12 rounded-[var(--radius-medium)] bg-amber-500 px-3 font-black text-white"
          onClick={() => setDefeatVisible((current) => !current)}
          type="button"
        >
          Victory
        </button>
        <div className="rounded-[var(--radius-medium)] bg-white p-3 text-center text-sm font-black text-[var(--color-text-muted)]">
          cooldown ok
        </div>
      </div>
      {enemy ? (
        <BossIntroCinematic
          enemy={enemy}
          onComplete={() => setIntroVisible(false)}
          visible={introVisible}
        />
      ) : null}
      <BattleStatusPanel
        bossMoment={selectedMoment}
        battle={battle}
        lastDamage={32}
      />
      <BossDefeatCinematic enemy={enemy} visible={defeatVisible} />
      <div
        className="rounded-[var(--radius-large)] border border-amber-300 bg-amber-50 p-4 text-center font-black text-amber-800 motion-safe:animate-[game-world-route-open_1.1s_ease-out_1]"
        data-testid="debug-boss-world-unlock"
      >
        World unlock animation preview
      </div>
    </section>
  );
}
