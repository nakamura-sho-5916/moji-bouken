import { useState } from 'react';
import { CompanionSupportEffect } from '../features/battle/components/CompanionSupportEffect';
import {
  companionData,
  getCompanionBattleStat,
  getCompanionSupportDefinition,
  resetCompanionBattleStats,
  type CompanionSupportEvent,
} from '../features/collection';

function createPreviewSupport(
  companionId: string,
): CompanionSupportEvent | null {
  const companion = companionData.find((item) => item.id === companionId);
  const definition = getCompanionSupportDefinition(companionId);
  if (!companion || !definition) {
    return null;
  }

  return {
    companionId: companion.id,
    companionName: companion.name,
    skill: definition.skill,
    skillName: definition.skillName,
    line: definition.line,
    effectLabel: definition.effectLabel,
    damageBonus: definition.getDamageBonus(16),
    experienceBonus: definition.experienceBonus,
    goldBonus: definition.goldBonus,
  };
}

export function DebugCompanionsPage() {
  const [selectedId, setSelectedId] = useState(
    companionData[0]?.id ?? 'rabbit',
  );
  const [resetCount, setResetCount] = useState(0);
  const support = createPreviewSupport(selectedId);

  if (!import.meta.env.DEV) {
    return <p>404</p>;
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Companions
        </h1>
        <p className="mt-2 font-bold">support rate: 32% / max 1 per battle</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {companionData.map((companion) => (
          <button
            className={[
              'min-h-12 rounded-[var(--radius-medium)] px-3 font-black',
              companion.id === selectedId
                ? 'bg-[var(--color-primary)] text-white'
                : 'border border-[var(--color-border)] bg-white',
            ].join(' ')}
            key={companion.id}
            onClick={() => setSelectedId(companion.id)}
            type="button"
          >
            {companion.name}
          </button>
        ))}
      </div>
      <CompanionSupportEffect support={support} />
      <div className="grid gap-2 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
        <h2 className="font-black">Stats</h2>
        {companionData.map((companion) => {
          const stat = getCompanionBattleStat(companion.id);
          return (
            <p className="text-sm font-black" key={companion.id}>
              {companion.name}: 発動 {stat.activationCount} / 応援{' '}
              {stat.cheerCount} / 追加 {stat.extraDamageTotal} / EXP{' '}
              {stat.experienceBonusTotal} / Gold {stat.goldBonusTotal}
            </p>
          );
        })}
        <button
          className="min-h-11 rounded-[var(--radius-medium)] border border-red-200 bg-red-50 px-3 font-black text-red-700"
          onClick={() => {
            resetCompanionBattleStats();
            setResetCount((count) => count + 1);
          }}
          type="button"
        >
          reset stats {resetCount}
        </button>
      </div>
    </section>
  );
}
