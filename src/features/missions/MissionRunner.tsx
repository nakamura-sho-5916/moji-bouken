import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { getPlayerById } from '../../db/repositories/playerRepository';
import {
  BattleEngine,
  createBattleSession,
  saveActiveBattleSession,
  type BattleSession,
} from '../battle';
import { useAudio } from '../audio';
import { BattleStatusPanel } from '../battle/components/BattleStatusPanel';
import {
  applyCompanionSkill,
  getSelectedCompanion,
  recordEnemyEncounter,
} from '../collection';
import type { CompanionData } from '../collection';
import { RewardEngine } from '../rewards';
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
  const [lastDamage, setLastDamage] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(false);
  const [selectedCompanion, setSelectedCompanion] =
    useState<CompanionData | null>(null);
  const audio = useAudio();

  useEffect(() => {
    let active = true;
    void getSelectedCompanion().then((companion) => {
      if (active) {
        setSelectedCompanion(companion);
      }
    });
    return () => {
      active = false;
    };
  }, []);

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
    setLastDamage(0);
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
      audio.playSoundEffect(result.correct ? 'correct' : 'retry');
      setPendingBattle(applyBattleAnswer(result.correct));
      setPendingResult(result);
      setPracticeCorrect(result.correct);
    },
    onPractice: (correct) => {
      audio.playSoundEffect(correct ? 'correct' : 'retry');
      setPracticeCorrect(correct);
    },
  });

  const applyBattleAnswer = (correct: boolean) => {
    if (!battle) {
      return null;
    }
    const answerResult = BattleEngine.applyAnswer({ battle, correct });
    if (correct) {
      window.setTimeout(() => audio.playSoundEffect('attack'), 90);
    }
    const nextBattle =
      answerResult.battle.status === 'feedback'
        ? { ...answerResult.battle, status: 'active' as const }
        : answerResult.battle;
    setBattle(nextBattle);
    setLastDamage(answerResult.damage);
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
      const completedBattle = battleForReward ?? battle;
      if (completedBattle) {
        await RewardEngine.grantBattleRewards({
          battle: completedBattle,
          missionResults: nextSession.results,
        });
        await recordEnemyEncounter({
          enemyId: completedBattle.enemyId,
          source:
            completedBattle.enemyCurrentHp <= 0
              ? 'normal-victory'
              : 'encounter',
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

  return (
    <section className="grid gap-4">
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
          battle={battle}
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
