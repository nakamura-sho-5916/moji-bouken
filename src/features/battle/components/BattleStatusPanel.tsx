import { getDefaultEnemy, getEnemy } from '../enemies';
import type { BattleSession } from '../types';
import { ComboDisplay } from './ComboDisplay';
import { DamageEffect } from './DamageEffect';
import { EnemyDisplay } from './EnemyDisplay';
import { SpecialAttackButton } from './SpecialAttackButton';
import { SpecialGauge } from './SpecialGauge';
import { VictoryEffect } from './VictoryEffect';

type BattleStatusPanelProps = {
  battle: BattleSession;
  lastDamage?: number;
  onUseSpecial?: () => void;
};

export function BattleStatusPanel({
  battle,
  lastDamage = 0,
  onUseSpecial,
}: BattleStatusPanelProps) {
  const enemy = getEnemy(battle.enemyId) ?? getDefaultEnemy(false);
  const specialReady =
    battle.specialGauge >= battle.specialGaugeMax &&
    battle.status !== 'completed' &&
    battle.status !== 'victory';

  return (
    <section className="grid gap-3">
      <EnemyDisplay enemy={enemy} currentHp={battle.enemyCurrentHp} />
      <DamageEffect damage={lastDamage} />
      <ComboDisplay comboCount={battle.comboCount} />
      <SpecialGauge max={battle.specialGaugeMax} value={battle.specialGauge} />
      {onUseSpecial ? (
        <SpecialAttackButton onUse={onUseSpecial} ready={specialReady} />
      ) : (
        <div className="rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-3 text-center font-black text-[var(--color-text-muted)]">
          ひっさつわざ {specialReady ? 'じゅんびOK' : 'じゅんびちゅう'}
        </div>
      )}
      <VictoryEffect
        visible={battle.status === 'completed' || battle.status === 'victory'}
      />
    </section>
  );
}
