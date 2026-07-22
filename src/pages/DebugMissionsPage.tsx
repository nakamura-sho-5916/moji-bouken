import { useMemo, useState } from 'react';
import { loadLearningContent } from '../content/loaders/contentLoader';
import { LearningEngine } from '../services/learningService';
import {
  createMissionSession,
  loadMissionSession,
  saveMissionSession,
} from '../features/missions/MissionSession';
import { buildMissionViewModel } from '../features/missions/utils/buildMissionViewModel';
import { createQuestionSignature } from '../features/missions/utils/dynamicMissionFactory';
import type { ContentMission } from '../types';
import { PageFrame } from './PageFrame';

function countBy(
  items: ContentMission[],
  getKey: (item: ContentMission) => string,
) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()];
}

export function DebugMissionsPage() {
  const content = useMemo(() => loadLearningContent(), []);
  const [missionType, setMissionType] = useState(
    content.missions[0]?.missionType ?? 'letter-search',
  );
  const [seed, setSeed] = useState(5916);
  const [sessionCount, setSessionCount] = useState(
    loadMissionSession()?.missions.length ?? 0,
  );
  const [sessionMissions, setSessionMissions] = useState<ContentMission[]>(
    loadMissionSession()?.missions ?? [],
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
  const sessionSignatures = sessionMissions.map(createQuestionSignature);
  const duplicateSignatureCount =
    sessionSignatures.length - new Set(sessionSignatures).size;
  const missionTypeCounts = countBy(
    sessionMissions,
    (mission) => mission.missionType,
  );
  const targetCounts = countBy(sessionMissions, (mission) =>
    mission.targetIds.join('+'),
  );

  const generateSession = async () => {
    const session = await createMissionSession({ seed, count: 10 });
    saveMissionSession(session);
    setSessionCount(session.missions.length);
    setSessionMissions(session.missions);
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
    setSessionMissions([]);
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
          <p>duplicateSignatureCount: {duplicateSignatureCount}</p>
        </div>
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
          <h2 className="text-lg font-black">session diversity</h2>
          <p className="mt-2 text-sm font-bold">
            missionTypes:{' '}
            {missionTypeCounts
              .map(([type, count]) => `${type}:${count}`)
              .join(', ') || 'none'}
          </p>
          <p className="mt-2 text-sm font-bold">
            targets:{' '}
            {targetCounts
              .map(([target, count]) => `${target}:${count}`)
              .join(', ') || 'none'}
          </p>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
          <table className="w-full min-w-[680px] text-left text-xs font-bold">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 pr-2">missionId</th>
                <th className="py-2 pr-2">type</th>
                <th className="py-2 pr-2">target</th>
                <th className="py-2 pr-2">answer</th>
              </tr>
            </thead>
            <tbody>
              {sessionMissions.map((mission, index) => (
                <tr
                  className="border-b border-[var(--color-border)]"
                  key={`${mission.missionId}-${index}`}
                >
                  <td className="py-2 pr-2">{index + 1}</td>
                  <td className="py-2 pr-2">{mission.missionId}</td>
                  <td className="py-2 pr-2">{mission.missionType}</td>
                  <td className="py-2 pr-2">{mission.targetIds.join(', ')}</td>
                  <td className="py-2 pr-2">{mission.correctAnswer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageFrame>
  );
}
