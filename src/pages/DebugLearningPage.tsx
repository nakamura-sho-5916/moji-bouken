import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PLAYER_ID } from '../db/constants';
import { loadLearningContent } from '../content/loaders/contentLoader';
import { LearningEngine } from '../services/learningService';
import type {
  QuestionCandidate,
  RecordAnswerResult,
} from '../features/learning';
import type { LetterProgress, ReviewSchedule } from '../types';
import { PageFrame } from './PageFrame';

type DebugState = {
  letterProgress: LetterProgress[];
  reviewSchedules: ReviewSchedule[];
  learningLogs: unknown[];
};

const DEFAULT_LETTER_ID = 'hiragana-a';

export function DebugLearningPage() {
  const content = useMemo(() => loadLearningContent(), []);
  const selectableLetters = content.hiragana
    .filter((letter) => letter.active)
    .slice(0, 10);
  const [letterId, setLetterId] = useState(DEFAULT_LETTER_ID);
  const [correct, setCorrect] = useState(false);
  const [responseTimeMs, setResponseTimeMs] = useState(1200);
  const [debugState, setDebugState] = useState<DebugState | null>(null);
  const [lastResult, setLastResult] = useState<RecordAnswerResult | null>(null);
  const [candidates, setCandidates] = useState<QuestionCandidate[]>([]);

  const reload = useCallback(async () => {
    const state = await LearningEngine.getLearningDebugState();
    setDebugState(state);
  }, []);

  useEffect(() => {
    let active = true;
    void LearningEngine.getLearningDebugState().then((state) => {
      if (active) {
        setDebugState(state);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!import.meta.env.DEV) {
    return (
      <PageFrame
        description="このページは つかえません"
        showBack={false}
        title="404"
      />
    );
  }

  const saveAnswer = async () => {
    const result = await LearningEngine.recordAnswer({
      playerId: DEFAULT_PLAYER_ID,
      missionId: 'debug-learning',
      targetLetterIds: [letterId],
      correct,
      responseTimeMs,
      answeredAt: new Date().toISOString(),
      answerId: `debug-${crypto.randomUUID()}`,
    });
    setLastResult(result);
    await reload();
  };

  const generateCandidates = async () => {
    setCandidates(
      await LearningEngine.createQuestionCandidates({
        count: 10,
        seed: 5916,
      }),
    );
  };

  const resetData = async () => {
    const confirmed = window.confirm('テスト用の学習データをリセットします。');
    if (!confirmed) {
      return;
    }
    await LearningEngine.resetDebugLearningData();
    setLastResult(null);
    setCandidates([]);
    await reload();
  };

  const currentProgress = debugState?.letterProgress.find(
    (progress) => progress.letterId === letterId,
  );
  const dueReviews =
    debugState?.reviewSchedules.filter((schedule) => !schedule.completed) ?? [];

  return (
    <PageFrame
      description="開発用の学習エンジン確認画面です"
      title="Debug Learning"
    >
      <section className="grid gap-3 rounded-[var(--radius-large)] bg-white p-4 text-sm">
        <label className="grid gap-1 font-bold">
          対象文字
          <select
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] px-3"
            onChange={(event) => setLetterId(event.target.value)}
            value={letterId}
          >
            {selectableLetters.map((letter) => (
              <option key={letter.id} value={letter.id}>
                {letter.character} ({letter.id})
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 font-bold">
          <input
            checked={correct}
            onChange={(event) => setCorrect(event.target.checked)}
            type="checkbox"
          />
          正解として保存
        </label>
        <label className="grid gap-1 font-bold">
          回答時間(ms)
          <input
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] px-3"
            min={1}
            onChange={(event) => setResponseTimeMs(Number(event.target.value))}
            type="number"
            value={responseTimeMs}
          />
        </label>
        <button
          className="min-h-11 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-4 font-black text-white"
          onClick={() => void saveAnswer()}
          type="button"
        >
          回答記録を保存
        </button>
        <button
          className="min-h-11 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-4 font-black text-white"
          onClick={() => void generateCandidates()}
          type="button"
        >
          出題候補10件を生成
        </button>
        <button
          className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-danger)] bg-white px-4 font-black text-[var(--color-danger)]"
          onClick={() => void resetData()}
          type="button"
        >
          テストデータをリセット
        </button>
      </section>

      <section className="rounded-[var(--radius-large)] bg-white p-4 text-sm">
        <h2 className="text-lg font-black">現在の文字進捗</h2>
        <p>weakFlag: {String(currentProgress?.weakFlag ?? false)}</p>
        <p>masteredFlag: {String(currentProgress?.masteredFlag ?? false)}</p>
        <p>attempts: {currentProgress?.attempts ?? 0}</p>
        <p>accuracy: {currentProgress?.accuracy ?? 0}</p>
      </section>

      <section className="rounded-[var(--radius-large)] bg-white p-4 text-sm">
        <h2 className="text-lg font-black">復習予定</h2>
        <p>未完了: {dueReviews.length}</p>
        <pre className="mt-2 max-h-60 overflow-auto rounded-[var(--radius-medium)] bg-slate-900 p-3 text-xs text-white">
          {JSON.stringify(dueReviews, null, 2)}
        </pre>
      </section>

      <section className="rounded-[var(--radius-large)] bg-white p-4 text-sm">
        <h2 className="text-lg font-black">出題候補</h2>
        <p>候補数: {candidates.length}</p>
        <pre className="mt-2 max-h-60 overflow-auto rounded-[var(--radius-medium)] bg-slate-900 p-3 text-xs text-white">
          {JSON.stringify(candidates, null, 2)}
        </pre>
      </section>

      {lastResult ? (
        <section className="rounded-[var(--radius-large)] bg-white p-4 text-sm">
          <h2 className="text-lg font-black">保存結果</h2>
          <pre className="mt-2 max-h-60 overflow-auto rounded-[var(--radius-medium)] bg-slate-900 p-3 text-xs text-white">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </section>
      ) : null}
    </PageFrame>
  );
}
