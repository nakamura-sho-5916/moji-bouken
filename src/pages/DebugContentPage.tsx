import { useMemo, useState } from 'react';
import {
  loadLearningContent,
  resetLearningContentCacheForTests,
} from '../content/loaders/contentLoader';
import type { LoadedContent } from '../types';
import { PageFrame } from './PageFrame';

function summarize(content: LoadedContent) {
  const categories = [
    ...new Set(content.words.map((word) => word.category)),
  ].slice(0, 5);
  const missionTypeCounts = content.missions.reduce<Record<string, number>>(
    (counts, mission) => {
      counts[mission.missionType] = (counts[mission.missionType] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return { categories, missionTypeCounts };
}

export function DebugContentPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const content = useMemo(() => {
    void refreshKey;
    resetLearningContentCacheForTests();
    return loadLearningContent();
  }, [refreshKey]);
  const { categories, missionTypeCounts } = summarize(content);

  if (!import.meta.env.DEV) {
    return (
      <PageFrame
        description="このページは つかえません"
        showBack={false}
        title="404"
      />
    );
  }

  return (
    <PageFrame
      description="開発用の教材データ確認画面です"
      title="Debug Content"
    >
      <section className="grid gap-3 rounded-[var(--radius-large)] bg-white p-4 text-sm">
        <p>
          ひらがな件数:{' '}
          {content.hiragana.filter((letter) => letter.active).length}
        </p>
        <p>
          カタカナ件数:{' '}
          {content.katakana.filter((letter) => letter.active).length}
        </p>
        <p>単語件数: {content.words.length}</p>
        <p>イラスト件数: {content.illustrations.length}</p>
        <p>似た文字グループ件数: {content.similarLetters.length}</p>
        <p>ミッション件数: {content.missions.length}</p>
        <p>検証エラー件数: {content.validationIssues.length}</p>
      </section>
      <button
        className="min-h-11 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-4 font-black text-white"
        onClick={() => setRefreshKey((current) => current + 1)}
        type="button"
      >
        教材を再検証
      </button>
      <section className="rounded-[var(--radius-large)] bg-white p-4 text-sm">
        <h2 className="text-lg font-black">カテゴリ</h2>
        <p>{categories.join(' / ')}</p>
        <h2 className="mt-3 text-lg font-black">ミッション形式別件数</h2>
        <pre className="mt-2 overflow-auto rounded-[var(--radius-medium)] bg-slate-900 p-3 text-xs text-white">
          {JSON.stringify(missionTypeCounts, null, 2)}
        </pre>
      </section>
      <section className="rounded-[var(--radius-large)] bg-white p-4 text-sm">
        <h2 className="text-lg font-black">先頭データ</h2>
        <pre className="mt-2 max-h-96 overflow-auto rounded-[var(--radius-medium)] bg-slate-900 p-3 text-xs text-white">
          {JSON.stringify(
            {
              hiragana: content.hiragana.slice(0, 5),
              katakana: content.katakana.slice(0, 5),
              words: content.words.slice(0, 5),
              illustrations: content.illustrations.slice(0, 5),
              similarLetters: content.similarLetters.slice(0, 3),
              missions: content.missions.slice(0, 3),
            },
            null,
            2,
          )}
        </pre>
      </section>
    </PageFrame>
  );
}
