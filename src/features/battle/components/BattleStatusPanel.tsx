import { getDefaultEnemy, getEnemy } from '../enemies';
import type { BossBattleMoment } from '../bossBattlePresentation';
import type { BattleSession } from '../types';
import type { CompanionSupportEvent } from '../../collection';
import { BossBattleMomentEffect } from './BossBattleMomentEffect';
import { ComboDisplay } from './ComboDisplay';
import { CompanionSupportEffect } from './CompanionSupportEffect';
import { DamageEffect } from './DamageEffect';
import { EnemyDisplay } from './EnemyDisplay';
import { SpecialAttackButton } from './SpecialAttackButton';
import { SpecialGauge } from './SpecialGauge';
import { VictoryEffect } from './VictoryEffect';

type BattleStatusPanelProps = {
  battle: BattleSession;
  lastDamage?: number;
  companionSupport?: CompanionSupportEvent | null;
  bossMoment?: BossBattleMoment | null;
  onUseSpecial?: () => void;
};

export function BattleStatusPanel({
  bossMoment = null,
  battle,
  companionSupport = null,
  lastDamage = 0,
  onUseSpecial,
}: BattleStatusPanelProps) {
  const enemy = getEnemy(battle.enemyId) ?? getDefaultEnemy(false);
  const bossMode = enemy.type === 'boss';
  const specialReady =
    battle.specialGauge >= battle.specialGaugeMax &&
    battle.status !== 'completed' &&
    battle.status !== 'victory';

  return (
    <section className="grid gap-3">
      <EnemyDisplay
        bossMode={bossMode}
        bossMoment={bossMoment}
        currentHp={battle.enemyCurrentHp}
        enemy={enemy}
      />
      <BossBattleMomentEffect moment={bossMoment} />
      <CompanionSupportEffect support={companionSupport} />
      <DamageEffect bossMode={bossMode} damage={lastDamage} />
      <ComboDisplay bossMode={bossMode} comboCount={battle.comboCount} />
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
