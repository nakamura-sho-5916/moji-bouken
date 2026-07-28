import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from '../../router';
import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { getInventory } from '../../db/repositories/inventoryRepository';
import { getPlayerById } from '../../db/repositories/playerRepository';
import { createCorrectAnswerFeedbackController } from '../audio';
import {
  BattleEngine,
  createBattleSession,
  getEnemy,
  saveActiveBattleSession,
  selectBossBattleMoment,
  type BattleSession,
} from '../battle';
import { BossIntroCinematic } from '../battle/components/BossIntroCinematic';
import { useAudio } from '../audio';
import { BattleStatusPanel } from '../battle/components/BattleStatusPanel';
import {
  applyCompanionSkill,
  companionData,
  evaluateCompanionBattleSupport,
  loadCompanionBattleStats,
  recordBossDefeat,
  recordCompanionSupportEvent,
  getSelectedCompanion,
  recordEnemyEncounter,
} from '../collection';
import type { CompanionData, CompanionSupportEvent } from '../collection';
import { RewardEngine } from '../rewards';
import {
  getBossBeforeStoryEvent,
  hasSeenStoryEvent,
  StoryEventPlayer,
  type StoryEvent,
} from '../story';
import { MissionFeedback } from './components/MissionFeedback';
import { MissionHeader } from './components/MissionHeader';
import { MissionProgress } from './components/MissionProgress';
import { useAnswerSubmission } from './hooks/useAnswerSubmission';
import { useMissionSession } from './hooks/useMissionSession';
import { useMissionTimer } from './hooks/useMissionTimer';
import { MissionRegistry } from './missionRegistry';
import { saveMissionSession } from './MissionSession';
import { buildMissionViewModel } from './utils/buildMissionViewModel';
import type { MissionResult, MissionSessionState } from './types';

function advanceSession(
  session: MissionSessionState,
  result: MissionResult,
): MissionSessionState {
  const results = [...session.results, result];
  const nextIndex = session.currentIndex + 1;
  const completed = nextIndex >= session.missions.length;
  return {
    ...session,
    results,
    currentIndex: completed ? session.currentIndex : nextIndex,
    status: completed ? 'completed' : 'active',
    completedAt: completed ? new Date().toISOString() : session.completedAt,
  };
}

export function MissionRunner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { content, session, dispatch, start } = useMissionSession();
  const { restart, getElapsedMs } = useMissionTimer();
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<MissionResult | null>(
    null,
  );
  const [pendingBattle, setPendingBattle] = useState<BattleSession | null>(
    null,
  );
  const [battle, setBattle] = useState<BattleSession | null>(null);
  const [bossIntroBattleId, setBossIntroBattleId] = useState<string | null>(
    null,
  );
  const [activeStory, setActiveStory] = useState<StoryEvent | null>(null);
  const [lastDamage, setLastDamage] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(false);
  const [selectedCompanion, setSelectedCompanion] =
    useState<CompanionData | null>(null);
  const [joinedCompanions, setJoinedCompanions] = useState<CompanionData[]>([]);
  const [lastCompanionSupport, setLastCompanionSupport] =
    useState<CompanionSupportEvent | null>(null);
  const audio = useAudio();
  const correctFeedback = useRef(createCorrectAnswerFeedbackController());
  const companionSupportsRef = useRef<CompanionSupportEvent[]>([]);
  const playedBossIntroSfxRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    void getSelectedCompanion().then((companion) => {
      if (active) {
        setSelectedCompanion(companion);
      }
    });
    void getInventory(DEFAULT_PLAYER_ID).then((inventory) => {
      if (!active) {
        return;
      }
      const joinedIds = new Set(
        inventory?.companions.map((companion) => companion.id) ?? [],
      );
      setJoinedCompanions(
        companionData.filter((companion) => joinedIds.has(companion.id)),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!battle || session.status !== 'active') {
      return;
    }

    const enemy = getEnemy(battle.enemyId);
    if (enemy?.type === 'boss') {
      if (bossIntroBattleId === battle.battleId) {
        return;
      }
      audio.playBgm('boss');
      return;
    }

    audio.playBgm('battle');
  }, [audio, battle, bossIntroBattleId, session.status]);

  useEffect(() => {
    if (!battle || bossIntroBattleId !== battle.battleId) {
      return;
    }
    if (playedBossIntroSfxRef.current === battle.battleId) {
      return;
    }

    playedBossIntroSfxRef.current = battle.battleId;
    window.setTimeout(() => audio.playSoundEffect('boss-appearance'), 40);
  }, [audio, battle, bossIntroBattleId]);

  const createMissionBattle = async (sessionId: string) => {
    const player = await getPlayerById(DEFAULT_PLAYER_ID);
    const companion = await getSelectedCompanion();
    const nextBattle = createBattleSession({
      sessionId,
      playerLevel: player?.level ?? 1,
      enemyId: searchParams.get('enemyId') ?? undefined,
      playerAttackBonus: companion?.skillId === 'damage-up' ? 4 : 0,
    });
    setBattle(nextBattle);
    setBossIntroBattleId(
      getEnemy(nextBattle.enemyId)?.type === 'boss'
        ? nextBattle.battleId
        : null,
    );
    const enemy = getEnemy(nextBattle.enemyId);
    const story =
      enemy?.type === 'boss' ? getBossBeforeStoryEvent(enemy.id) : null;
    if (story && !hasSeenStoryEvent(story.id)) {
      setActiveStory(story);
    }
    setLastDamage(0);
    setLastCompanionSupport(null);
    companionSupportsRef.current = [];
    saveActiveBattleSession(nextBattle);
    return nextBattle;
  };

  const mission = session.missions[session.currentIndex];
  const viewModel = useMemo(() => {
    if (!mission) {
      return null;
    }
    return buildMissionViewModel({
      content,
      mission,
      seed: session.seed + session.currentIndex,
    });
  }, [content, mission, session.currentIndex, session.seed]);

  const companionSkill = useMemo(() => {
    if (!viewModel || !selectedCompanion || viewModel.choices.length === 0) {
      return null;
    }
    return applyCompanionSkill({
      skillId: selectedCompanion.skillId,
      missionType: viewModel.mission.missionType,
      choices: viewModel.choices.map((choice) => choice.value),
      correctAnswer: viewModel.mission.correctAnswer,
      usedCount: 0,
      maxUses: 1,
    });
  }, [selectedCompanion, viewModel]);

  const playableViewModel = useMemo(() => {
    if (!viewModel || !companionSkill?.activated) {
      return viewModel;
    }
    const allowed = new Set(companionSkill.choices);
    return {
      ...viewModel,
      choices: viewModel.choices.filter((choice) => allowed.has(choice.value)),
    };
  }, [companionSkill, viewModel]);

  const answerSubmission = useAnswerSubmission({
    content,
    session: session.status === 'active' ? session : null,
    onSaved: (result) => {
      if (!result.correct) {
        audio.playSoundEffect('retry');
      }
      setPendingBattle(
        applyBattleAnswer(
          result.correct,
          `${session.sessionId}:${session.currentIndex}:${result.missionId}`,
        ),
      );
      setPendingResult(result);
      setPracticeCorrect(result.correct);
    },
    onPractice: (correct) => {
      if (correct) {
        correctFeedback.current.play({
          comboCount: battle?.comboCount ?? 0,
          feedbackKey: `${session.sessionId}:${session.currentIndex}:practice`,
          playSoundEffect: audio.playSoundEffect,
          scheduleAttack: false,
          seed: `${session.seed}:${session.currentIndex}:practice`,
        });
      } else {
        audio.playSoundEffect('retry');
      }
      setPracticeCorrect(correct);
    },
  });

  const applyBattleAnswer = (correct: boolean, feedbackKey: string) => {
    if (!battle) {
      return null;
    }
    const answerResult = BattleEngine.applyAnswer({ battle, correct });
    let nextAnswerBattle = answerResult.battle;
    let totalDamage = answerResult.damage;
    if (correct) {
      const supportEvent = evaluateCompanionBattleSupport({
        battle,
        missionIndex: session.currentIndex,
        totalMissions: session.missions.length,
        companions: joinedCompanions,
        previousCompanionId: loadCompanionBattleStats().lastCompanionId,
        alreadyActivatedCount: companionSupportsRef.current.length,
        baseDamage: answerResult.damage,
      });
      if (supportEvent) {
        recordCompanionSupportEvent(supportEvent);
        companionSupportsRef.current = [
          ...companionSupportsRef.current,
          supportEvent,
        ];
        setLastCompanionSupport(supportEvent);
        nextAnswerBattle = BattleEngine.applySupportDamage({
          battle: nextAnswerBattle,
          damage: supportEvent.damageBonus,
          message: `${supportEvent.companionName}が たすけてくれたよ`,
        });
        totalDamage += supportEvent.damageBonus;
        window.setTimeout(() => audio.playSoundEffect('companion-joined'), 70);
      } else {
        setLastCompanionSupport(null);
      }
      correctFeedback.current.play({
        comboCount: nextAnswerBattle.comboCount,
        feedbackKey,
        playSoundEffect: audio.playSoundEffect,
        seed: `${session.seed}:${session.currentIndex}:${feedbackKey}`,
      });
    } else {
      setLastCompanionSupport(null);
    }
    const nextBattle =
      nextAnswerBattle.status === 'feedback'
        ? { ...nextAnswerBattle, status: 'active' as const }
        : nextAnswerBattle;
    setBattle(nextBattle);
    setLastDamage(totalDamage);
    saveActiveBattleSession(nextBattle);
    if (nextBattle.enemyCurrentHp <= 0) {
      window.setTimeout(() => audio.playSoundEffect('enemy-defeated'), 180);
    }
    return nextBattle;
  };

  const handleSpecialAttack = () => {
    if (!battle) {
      return;
    }
    audio.playSoundEffect('special-attack');
    window.setTimeout(() => {
      const specialResult = BattleEngine.applySpecialAttack(battle);
      const nextBattle =
        specialResult.battle.status === 'feedback'
          ? { ...specialResult.battle, status: 'active' as const }
          : specialResult.battle;
      setBattle(nextBattle);
      setLastDamage(specialResult.damage);
      saveActiveBattleSession(nextBattle);
      if (nextBattle.enemyCurrentHp <= 0) {
        window.setTimeout(() => audio.playSoundEffect('enemy-defeated'), 120);
      }
    }, 220);
  };

  const finishCurrentMission = async (
    result: MissionResult,
    battleForReward: BattleSession | null,
  ) => {
    const nextSession = advanceSession(session, result);
    dispatch({ type: 'start', session: nextSession });
    saveMissionSession(nextSession);
    answerSubmission.resetAnswer();
    restart();
    setSelectedValue(null);
    setPendingResult(null);
    setPendingBattle(null);
    setPracticeCorrect(false);
    if (nextSession.status === 'completed') {
      audio.stopBgm(180);
      const completedBattle = battleForReward ?? battle;
      if (completedBattle) {
        const completedEnemy = getEnemy(completedBattle.enemyId);
        const defeated = completedBattle.enemyCurrentHp <= 0;
        const encounterSource =
          defeated && completedEnemy?.type === 'boss'
            ? 'boss'
            : defeated
              ? 'normal-victory'
              : 'encounter';
        await RewardEngine.grantBattleRewards({
          battle: completedBattle,
          missionResults: nextSession.results,
          companionSupports: companionSupportsRef.current,
        });
        if (encounterSource === 'boss') {
          recordBossDefeat(completedBattle.enemyId);
        }
        await recordEnemyEncounter({
          enemyId: completedBattle.enemyId,
          source: encounterSource,
        });
        saveActiveBattleSession({ ...completedBattle, status: 'completed' });
      }
      navigate('/result');
    }
  };

  const completePracticeMission = () => {
    if (!mission) {
      return;
    }
    const result: MissionResult = {
      missionId: mission.missionId,
      missionType: mission.missionType,
      targetLetterIds: [],
      selectedAnswer: mission.correctAnswer,
      correctAnswer: mission.correctAnswer,
      correct: true,
      responseTimeMs: getElapsedMs(),
      saved: false,
      firstAttemptRecorded: false,
      learningResult: null,
    };
    void finishCurrentMission(result, battle);
  };

  const submitSelectedAnswer = async () => {
    if (!selectedValue || answerSubmission.saving) {
      return;
    }
    await answerSubmission.submit(selectedValue, getElapsedMs());
  };

  const continueAfterCorrect = () => {
    if (pendingResult) {
      void finishCurrentMission(pendingResult, pendingBattle);
      return;
    }
    completePracticeMission();
  };

  const startNewSession = () => {
    restart();
    void start().then((nextSession) => {
      void createMissionBattle(nextSession.sessionId);
    });
  };

  if (session.status === 'ready' || session.missions.length === 0) {
    return (
      <section className="grid gap-5">
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
          <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
            ミッション
          </h1>
          <p className="mt-3 text-lg font-black text-[var(--color-text-muted)]">
            もじの もんだいに ちょうせんしよう
          </p>
        </div>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
          onClick={startNewSession}
          type="button"
        >
          ミッションを はじめる
        </button>
      </section>
    );
  }

  if (!mission || !viewModel) {
    return (
      <section className="grid gap-4">
        <p className="rounded-[var(--radius-large)] bg-white p-5 text-xl font-black">
          ミッションを ひらけなかったよ
        </p>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-5 font-black text-white"
          onClick={startNewSession}
          type="button"
        >
          もういちど
        </button>
      </section>
    );
  }

  const answeredCorrect =
    answerSubmission.answerState === 'correct' || practiceCorrect;
  const answerReady =
    viewModel.mission.missionType === 'word-ordering'
      ? Array.from(selectedValue ?? '').length ===
        (viewModel.orderedSlots ?? []).length
      : Boolean(selectedValue);
  const canAnswer =
    answerReady &&
    answerSubmission.answerState !== 'correct' &&
    !answerSubmission.saving;
  const activeViewModel = playableViewModel ?? viewModel;
  const battleEnemy = battle ? getEnemy(battle.enemyId) : null;
  const bossIntroVisible =
    Boolean(battle && battleEnemy?.type === 'boss') &&
    bossIntroBattleId === battle?.battleId;
  const bossMoment =
    battle && battleEnemy?.type === 'boss'
      ? selectBossBattleMoment({
          battleId: battle.battleId,
          enemy: battleEnemy,
          missionIndex: session.currentIndex,
        })
      : null;

  return (
    <section className="grid gap-4">
      <StoryEventPlayer
        event={activeStory}
        onComplete={() => setActiveStory(null)}
      />
      {battle && battleEnemy?.type === 'boss' ? (
        <BossIntroCinematic
          enemy={battleEnemy}
          onComplete={() => {
            setBossIntroBattleId((current) =>
              current === battle.battleId ? null : current,
            );
          }}
          visible={bossIntroVisible}
        />
      ) : null}
      <MissionHeader
        currentIndex={session.currentIndex}
        onBack={() => {
          if (window.confirm('つづける ミッションを やめる？')) {
            navigate('/home');
          }
        }}
        prompt={activeViewModel.prompt}
        title={activeViewModel.title}
        totalCount={session.missions.length}
      />
      <MissionProgress
        currentIndex={session.currentIndex}
        totalCount={session.missions.length}
      />
      {battle ? (
        <BattleStatusPanel
          bossMoment={bossMoment}
          battle={battle}
          companionSupport={lastCompanionSupport}
          lastDamage={lastDamage}
          onUseSpecial={handleSpecialAttack}
        />
      ) : null}
      <MissionRegistry
        disabled={answerSubmission.saving || answeredCorrect}
        onComplete={completePracticeMission}
        onSelect={(value) => {
          audio.playSoundEffect('choice-select');
          setSelectedValue(value);
        }}
        selectedValue={selectedValue}
        viewModel={activeViewModel}
      />
      {companionSkill?.activated ? (
        <p className="rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-3 text-center text-sm font-black text-[var(--color-primary-strong)]">
          {companionSkill.message}
        </p>
      ) : null}
      <MissionFeedback
        errorMessage={answerSubmission.errorMessage}
        saving={answerSubmission.saving}
        state={answerSubmission.answerState}
      />
      {answeredCorrect ? (
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
          onClick={continueAfterCorrect}
          type="button"
        >
          つぎへ
        </button>
      ) : (
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-5 text-xl font-black text-white disabled:opacity-50"
          disabled={!canAnswer}
          onClick={() => {
            void submitSelectedAnswer();
          }}
          type="button"
        >
          こたえる
        </button>
      )}
    </section>
  );
}
