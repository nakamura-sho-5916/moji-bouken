import { useEffect, useState } from 'react';
import { DEFAULT_PLAYER_ID } from '../db/constants';
import { getInventory } from '../db/repositories/inventoryRepository';
import { getPlayerById } from '../db/repositories/playerRepository';
import { experienceRequiredForLevel } from '../features/rewards';
import type { Inventory, Player } from '../types';
import { PageFrame } from './PageFrame';

export function HomePage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      getPlayerById(DEFAULT_PLAYER_ID),
      getInventory(DEFAULT_PLAYER_ID),
    ]).then(([nextPlayer, nextInventory]) => {
      if (!active) {
        return;
      }
      setPlayer(nextPlayer ?? null);
      setInventory(nextInventory ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  const level = player?.level ?? 1;
  const experience = player?.experience ?? 0;
  const nextLevelExperience = experienceRequiredForLevel(level + 1);
  const currentLevelExperience = experienceRequiredForLevel(level);
  const levelRange = Math.max(1, nextLevelExperience - currentLevelExperience);
  const levelProgress = Math.max(0, experience - currentLevelExperience);
  const experienceToNext = Math.max(0, nextLevelExperience - experience);

  return (
    <PageFrame
      description="きょうの ぼうけんを えらぼう"
      showBack={false}
      title="ホーム"
    >
      <div className="grid gap-3 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <div className="flex items-center justify-between gap-3 font-black">
          <span className="text-xl text-[var(--color-primary-strong)]">
            レベル {level}
          </span>
          <span className="rounded-[var(--radius-pill)] bg-sky-50 px-3 py-1">
            ゴールド {inventory?.gold ?? player?.gold ?? 0}
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3 text-sm font-black text-[var(--color-text-muted)]">
            <span>けいけん {experience}</span>
            <span>つぎまで あと {experienceToNext}</span>
          </div>
          <div className="mt-2 h-4 overflow-hidden rounded-[var(--radius-pill)] bg-orange-100">
            <div
              className="h-full rounded-[var(--radius-pill)] bg-[var(--color-primary)]"
              style={{ width: `${(levelProgress / levelRange) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
