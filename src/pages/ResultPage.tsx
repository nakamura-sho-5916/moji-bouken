import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnemyArtwork } from '../features/assets';
import { enemies } from '../features/battle/enemies';
import { loadLastMissionResult } from '../features/missions/MissionSession';
import { RewardSummary } from '../features/rewards/components/RewardSummary';
import { LevelUpEffect } from '../features/rewards/components/LevelUpEffect';
import { RewardEngine } from '../features/rewards';
import { RecoveryEventModal } from '../features/world/components/RecoveryEventModal';
import { WorldRecoveryEngine } from '../features/world';
import type { RecoveryEvent } from '../features/world';
import {
  joinEligibleCompanions,
  recordAlbumEvent,
} from '../features/collection';
import { useAudio } from '../features/audio';

export function ResultPage() {
  const navigate = useNavigate();
  const result = loadLastMissionResult();
  const [rewardSummary] = useState(() => RewardEngine.loadLastRewardSummary());
  const completedCount = result?.results.length ?? 0;
  const [recoveryEvents, setRecoveryEvents] = useState<RecoveryEvent[]>([]);
  const audio = useAudio();
  const playedResultAudioRef = useRef(false);
  const defeatedEnemy = rewardSummary
    ? enemies.find((enemy) => rewardSummary.battleId.endsWith(enemy.id))
    : null;

  useEffect(() => {
    if (playedResultAudioRef.current || !rewardSummary) {
      return;
    }
    playedResultAudioRef.current = true;
    window.setTimeout(() => audio.playSoundEffect('reward'), 120);
    window.setTimeout(() => audio.playSoundEffect('exp-gain'), 260);
    if (rewardSummary.goldEarned > 0) {
      window.setTimeout(() => audio.playSoundEffect('gold-gain'), 390);
    }
    if (rewardSummary.levelUp) {
      window.setTimeout(() => audio.playSoundEffect('level-up'), 650);
    }
  }, [audio, rewardSummary]);

  useEffect(() => {
    if (!rewardSummary) {
      return;
    }

    let active = true;
    void WorldRecoveryEngine.applyRecovery({
      battleId: rewardSummary.battleId,
      areaId: rewardSummary.areaId,
      bossDefeated: rewardSummary.bossDefeated,
      bonusReasons: rewardSummary.bonusReasons,
      experienceEarned: rewardSummary.experienceEarned,
      goldEarned: rewardSummary.goldEarned,
    }).then((recoveryResult) => {
      if (!active || !recoveryResult) {
        return;
      }
      if (recoveryResult.triggeredEvents.length > 0) {
        audio.playSoundEffect('world-recovery');
      }
      void Promise.all(
        recoveryResult.triggeredEvents.map((event, index) =>
          recordAlbumEvent({
            eventId: `${event.areaId}-${event.id}`,
            areaId: event.areaId,
            title: event.title,
            description: event.message,
            beforeVisual: 'before',
            afterVisual: 'after',
            order: index,
          }),
        ),
      ).then(() => joinEligibleCompanions());
      setRecoveryEvents(recoveryResult.triggeredEvents);
    });

    return () => {
      active = false;
    };
  }, [audio, rewardSummary]);

  return (
    <section className="grid min-h-full gap-5">
      <RecoveryEventModal
        events={recoveryEvents}
        onClose={() => {
          setRecoveryEvents([]);
          navigate('/world');
        }}
      />
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-6 text-center shadow-sm">
        {defeatedEnemy ? (
          <EnemyArtwork
            className="mx-auto max-w-36"
            defeated
            enemyId={defeatedEnemy.id}
          />
        ) : (
          <p className="text-6xl" aria-hidden="true">
            星
          </p>
        )}
        <h1 className="mt-3 text-3xl font-black text-[var(--color-primary-strong)]">
          つづけて できたね
        </h1>
        <p className="mt-3 text-lg font-black text-[var(--color-text-muted)]">
          縺ｧ縺阪◆ 縺薙→縺・縺ｵ縺医◆繧・{' '}
        </p>
      </div>
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <p className="text-lg font-black text-[var(--color-text)]">
          縺ｲ縺九▲縺・縺ｾ繧・{' '}
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
          縺ゅ◆繧峨＠縺・縺帙°縺・{' '}
        </h2>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          縺ｾ縺｡縺ｫ 縺ゅ°繧翫′ 縺ｵ縺医ｋ繧・{' '}
        </p>
      </div>
      <div className="mt-auto grid gap-3">
        <Link
          className="flex min-h-14 items-center justify-center rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
          onClick={() => audio.playSoundEffect('ui-tap')}
          to="/mission"
        >
          繧ゅ≧縺・■縺ｩ
        </Link>
        <Link
          className="flex min-h-14 items-center justify-center rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-5 text-xl font-black text-white"
          onClick={() => audio.playSoundEffect('ui-tap')}
          to="/world"
        >
          縺帙°縺・∈
        </Link>
      </div>
    </section>
  );
}
