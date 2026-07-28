import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from '../router';
import { EnemyArtwork } from '../features/assets';
import { enemies } from '../features/battle/enemies';
import { BOSS_DEFEAT_RECOVERY_DELAY_MS } from '../features/battle';
import { BossDefeatCinematic } from '../features/battle/components/BossDefeatCinematic';
import { loadLastMissionResult } from '../features/missions/MissionSession';
import { RewardSummary } from '../features/rewards/components/RewardSummary';
import { LevelUpEffect } from '../features/rewards/components/LevelUpEffect';
import { RewardEngine } from '../features/rewards';
import {
  getHighestRewardRarity,
  rewardRarityOrder,
} from '../features/rewards/rewardPresentation';
import { RecoveryEventModal } from '../features/world/components/RecoveryEventModal';
import { WorldRecoveryEngine } from '../features/world';
import type { RecoveryEvent } from '../features/world';
import {
  joinEligibleCompanions,
  recordAreaUnlock,
  recordAlbumEvent,
} from '../features/collection';
import { useAudio } from '../features/audio';
import { AreaUnlockCinematic } from '../features/world/components/AreaUnlockCinematic';
import {
  getStoryEvent,
  hasSeenStoryEvent,
  StoryEventPlayer,
  type StoryEvent,
} from '../features/story';

export function ResultPage() {
  const navigate = useNavigate();
  const result = loadLastMissionResult();
  const [rewardSummary] = useState(() => RewardEngine.loadLastRewardSummary());
  const completedCount = result?.results.length ?? 0;
  const [recoveryEvents, setRecoveryEvents] = useState<RecoveryEvent[]>([]);
  const [pendingAreaUnlockIds, setPendingAreaUnlockIds] = useState<string[]>(
    [],
  );
  const [activeAreaUnlockIds, setActiveAreaUnlockIds] = useState<string[]>([]);
  const [activeStory, setActiveStory] = useState<StoryEvent | null>(null);
  const [storyQueue, setStoryQueue] = useState<StoryEvent[]>([]);
  const audio = useAudio();
  const playedResultAudioRef = useRef(false);
  const defeatedEnemy = rewardSummary
    ? enemies.find((enemy) => rewardSummary.battleId.endsWith(enemy.id))
    : null;
  const visibleDefeatedEnemy = defeatedEnemy ?? null;

  useEffect(() => {
    if (playedResultAudioRef.current || !rewardSummary) {
      return;
    }
    playedResultAudioRef.current = true;
    const droppedItems = rewardSummary.droppedItems ?? [];
    const highestRarity = getHighestRewardRarity(droppedItems);
    window.setTimeout(() => audio.playSoundEffect('reward'), 120);
    window.setTimeout(() => audio.playSoundEffect('chest-drop'), 210);
    window.setTimeout(() => audio.playSoundEffect('exp-gain'), 260);
    if (rewardSummary.goldEarned > 0) {
      window.setTimeout(() => audio.playSoundEffect('gold-gain'), 390);
    }
    if (highestRarity === 'legendary') {
      window.setTimeout(() => audio.playSoundEffect('legendary-drop'), 480);
    } else if (rewardRarityOrder[highestRarity] >= rewardRarityOrder.rare) {
      window.setTimeout(() => audio.playSoundEffect('rare-drop'), 480);
    }
    if (rewardSummary.levelUp) {
      window.setTimeout(() => audio.playSoundEffect('level-up'), 650);
    }
  }, [audio, rewardSummary]);

  useEffect(() => {
    if (!rewardSummary?.bossDefeated) {
      return undefined;
    }

    let active = true;
    const completedEnemy = enemies.find((enemy) =>
      rewardSummary.battleId.endsWith(enemy.id),
    );
    const eventIds =
      completedEnemy?.id === 'boss-mojinexus'
        ? ['boss-after-default', 'area-clear-default', 'ending']
        : ['boss-after-default', 'area-clear-default'];
    const nextStories = eventIds
      .map((eventId) => getStoryEvent(eventId))
      .filter((event): event is StoryEvent =>
        Boolean(event && !hasSeenStoryEvent(event.id)),
      );
    const [firstStory, ...remainingStories] = nextStories;
    if (firstStory) {
      const timer = window.setTimeout(() => {
        if (active) {
          setActiveStory(firstStory);
          setStoryQueue(remainingStories);
        }
      }, 0);
      return () => {
        active = false;
        window.clearTimeout(timer);
      };
    }
    return undefined;
  }, [rewardSummary]);

  useEffect(() => {
    if (!rewardSummary) {
      return;
    }

    let active = true;
    let recoveryTimer: number | null = null;
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
      const unlockedAreaIds = recoveryResult.unlockedAreaIds;
      if (unlockedAreaIds.length > 0) {
        unlockedAreaIds.forEach((areaId) => recordAreaUnlock(areaId));
        setPendingAreaUnlockIds(unlockedAreaIds);
      }
      void Promise.all(
        [
          ...recoveryResult.triggeredEvents.map((event, index) => ({
            eventId: `${event.areaId}-${event.id}`,
            areaId: event.areaId,
            title: event.title,
            description: event.message,
            beforeVisual: 'before',
            afterVisual: 'after',
            order: index,
          })),
          ...unlockedAreaIds.map((areaId, index) => ({
            eventId: `${areaId}-area-unlocked`,
            areaId,
            title: 'NEW AREA',
            description: '新しい道がひらいた！',
            beforeVisual: 'cloud',
            afterVisual: 'open',
            order: recoveryResult.triggeredEvents.length + index,
          })),
        ].map((event) => recordAlbumEvent(event)),
      ).then(() => joinEligibleCompanions());
      const showRecoveryEvents = () => {
        if (active) {
          if (recoveryResult.triggeredEvents.length > 0) {
            setRecoveryEvents(recoveryResult.triggeredEvents);
          } else if (unlockedAreaIds.length > 0) {
            audio.playSoundEffect('area-unlocked');
            setActiveAreaUnlockIds(unlockedAreaIds);
          }
        }
      };
      if (rewardSummary.bossDefeated) {
        recoveryTimer = window.setTimeout(
          showRecoveryEvents,
          BOSS_DEFEAT_RECOVERY_DELAY_MS,
        );
      } else {
        showRecoveryEvents();
      }
    });

    return () => {
      active = false;
      if (recoveryTimer !== null) {
        window.clearTimeout(recoveryTimer);
      }
    };
  }, [audio, rewardSummary]);

  return (
    <section className="grid min-h-full gap-5">
      <RecoveryEventModal
        events={recoveryEvents}
        onClose={() => {
          setRecoveryEvents([]);
          if (pendingAreaUnlockIds.length > 0) {
            audio.playSoundEffect('area-unlocked');
            setActiveAreaUnlockIds(pendingAreaUnlockIds);
            setPendingAreaUnlockIds([]);
            return;
          }
          navigate('/world');
        }}
      />
      <AreaUnlockCinematic
        areaIds={activeAreaUnlockIds}
        onComplete={() => {
          setActiveAreaUnlockIds([]);
          navigate('/world');
        }}
      />
      <StoryEventPlayer
        event={activeStory}
        onComplete={() => {
          const [nextStory, ...remainingStories] = storyQueue;
          setActiveStory(nextStory ?? null);
          setStoryQueue(remainingStories);
        }}
      />
      <BossDefeatCinematic
        enemy={visibleDefeatedEnemy}
        visible={Boolean(rewardSummary?.bossDefeated)}
      />
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-6 text-center shadow-sm">
        {defeatedEnemy ? (
          <EnemyArtwork
            alt={defeatedEnemy.name}
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
          できた ことが ふえたよ
        </p>
      </div>
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <p className="text-lg font-black text-[var(--color-text)]">
          ひかった たま
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
          onClick={() => audio.playSoundEffect('ui-tap')}
          to="/mission"
        >
          もういちど
        </Link>
        <Link
          className="flex min-h-14 items-center justify-center rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-5 text-xl font-black text-white"
          onClick={() => audio.playSoundEffect('ui-tap')}
          to="/world"
        >
          せかいへ
        </Link>
      </div>
    </section>
  );
}
