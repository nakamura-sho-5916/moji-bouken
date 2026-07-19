import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { content, session, dispatch, start } = useMissionSession();
  const { restart, getElapsedMs } = useMissionTimer();
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [pendingResult, setPendingResult] = useState<MissionResult | null>(
    null,
  );
  const [practiceCorrect, setPracticeCorrect] = useState(false);

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

  const answerSubmission = useAnswerSubmission({
    content,
    session: session.status === 'active' ? session : null,
    onSaved: (result) => {
      setPendingResult(result);
      setPracticeCorrect(result.correct);
    },
    onPractice: (correct) => {
      setPracticeCorrect(correct);
    },
  });

  const finishCurrentMission = (result: MissionResult) => {
    const nextSession = advanceSession(session, result);
    dispatch({ type: 'start', session: nextSession });
    saveMissionSession(nextSession);
    answerSubmission.resetAnswer();
    restart();
    setSelectedValue(null);
    setPendingResult(null);
    setPracticeCorrect(false);
    if (nextSession.status === 'completed') {
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
    finishCurrentMission(result);
  };

  const submitSelectedAnswer = async () => {
    if (!selectedValue || answerSubmission.saving) {
      return;
    }
    await answerSubmission.submit(selectedValue, getElapsedMs());
  };

  const continueAfterCorrect = () => {
    if (pendingResult) {
      finishCurrentMission(pendingResult);
      return;
    }
    completePracticeMission();
  };

  if (session.status === 'ready' || session.missions.length === 0) {
    return (
      <section className="grid gap-5">
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
          <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
            ミッション
          </h1>
          <p className="mt-3 text-lg font-black text-[var(--color-text-muted)]">
            10この もんだいに ちょうせんしよう
          </p>
        </div>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
          onClick={() => {
            restart();
            void start(5916);
          }}
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
          onClick={() => {
            restart();
            void start(5916);
          }}
          type="button"
        >
          もういちど
        </button>
      </section>
    );
  }

  const answeredCorrect =
    answerSubmission.answerState === 'correct' || practiceCorrect;
  const canAnswer =
    Boolean(selectedValue) &&
    answerSubmission.answerState !== 'correct' &&
    !answerSubmission.saving;

  return (
    <section className="grid gap-4">
      <MissionHeader
        currentIndex={session.currentIndex}
        onBack={() => {
          if (window.confirm('つづける ミッションを やめる？')) {
            navigate('/home');
          }
        }}
        prompt={viewModel.prompt}
        title={viewModel.title}
        totalCount={session.missions.length}
      />
      <MissionProgress
        currentIndex={session.currentIndex}
        totalCount={session.missions.length}
      />
      <MissionRegistry
        disabled={answerSubmission.saving || answeredCorrect}
        onComplete={completePracticeMission}
        onSelect={setSelectedValue}
        selectedValue={selectedValue}
        viewModel={viewModel}
      />
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
