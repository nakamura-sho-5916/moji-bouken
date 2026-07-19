import { useMemo, useState } from 'react';
import { loadLearningContent } from '../content/loaders/contentLoader';
import { LearningEngine } from '../services/learningService';
import {
  createMissionSession,
  loadMissionSession,
  saveMissionSession,
} from '../features/missions/MissionSession';
import { buildMissionViewModel } from '../features/missions/utils/buildMissionViewModel';
import type { ContentMission } from '../types';
import { PageFrame } from './PageFrame';

export function DebugMissionsPage() {
  const content = useMemo(() => loadLearningContent(), []);
  const [missionType, setMissionType] = useState(
    content.missions[0]?.missionType ?? 'letter-search',
  );
  const [seed, setSeed] = useState(5916);
  const [sessionCount, setSessionCount] = useState(
    loadMissionSession()?.missions.length ?? 0,
  );
  const [learningLogCount, setLearningLogCount] = useState(0);

  if (!import.meta.env.DEV) {
    return (
      <PageFrame
        description="このページは つかえません"
        showBack={false}
        title="404"
      />
    );
  }

  const sampleMission =
    content.missions.find((mission) => mission.missionType === missionType) ??
    content.missions[0];
  const viewModel = sampleMission
    ? buildMissionViewModel({ content, mission: sampleMission, seed })
    : null;

  const generateSession = async () => {
    const session = await createMissionSession({ seed, count: 10 });
    saveMissionSession(session);
    setSessionCount(session.missions.length);
  };

  const refreshLearningLogs = async () => {
    const state = await LearningEngine.getLearningDebugState();
    setLearningLogCount(state.learningLogs.length);
  };

  const resetDebugData = async () => {
    const confirmed = window.confirm('テストデータを リセットします');
    if (!confirmed) {
      return;
    }
    await LearningEngine.resetDebugLearningData();
    localStorage.removeItem('moji-bouken:mission-session');
    localStorage.removeItem('moji-bouken:last-mission-result');
    setSessionCount(0);
    setLearningLogCount(0);
  };

  return (
    <PageFrame
      description="ミッションエンジンの かくにん"
      title="Debug Missions"
    >
      <section className="grid gap-4">
        <label className="grid gap-2 text-sm font-black">
          missionType
          <select
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-3"
            onChange={(event) =>
              setMissionType(
                event.currentTarget.value as ContentMission['missionType'],
              )
            }
            value={missionType}
          >
            {[
              ...new Set(
                content.missions.map((mission) => mission.missionType),
              ),
            ].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black">
          seed
          <input
            className="min-h-11 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-3"
            onChange={(event) => setSeed(Number(event.currentTarget.value))}
            type="number"
            value={seed}
          />
        </label>
        {viewModel ? (
          <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
            <h2 className="text-xl font-black">{viewModel.title}</h2>
            <p className="mt-2 font-bold">{viewModel.prompt}</p>
            <p className="mt-2 text-sm font-black text-[var(--color-text-muted)]">
              choices: {viewModel.choices.length}
            </p>
          </div>
        ) : null}
        <button
          className="min-h-12 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-4 font-black text-white"
          onClick={() => {
            void generateSession();
          }}
          type="button"
        >
          セッション10問を生成
        </button>
        <button
          className="min-h-12 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-4 font-black text-white"
          onClick={() => {
            void refreshLearningLogs();
          }}
          type="button"
        >
          保存結果を確認
        </button>
        <button
          className="min-h-12 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-4 font-black"
          onClick={() => {
            void resetDebugData();
          }}
          type="button"
        >
          テストデータをリセット
        </button>
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 font-black">
          <p>sessionCount: {sessionCount}</p>
          <p>learningLogCount: {learningLogCount}</p>
        </div>
      </section>
    </PageFrame>
  );
}
