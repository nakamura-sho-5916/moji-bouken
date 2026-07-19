import { useState } from 'react';
import {
  DEFAULT_PLAYER_ID,
  DB_NAME,
  DB_VERSION,
  STARTING_AREA_ID,
} from '../db/constants';
import { getObjectStoreNames } from '../db/database';
import {
  initializeAppData,
  type InitialAppData,
} from '../db/initializeAppData';
import { PageFrame } from './PageFrame';

type DebugData = InitialAppData & {
  objectStores: string[];
};

export function DebugDataPage() {
  const [data, setData] = useState<DebugData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!import.meta.env.DEV) {
    return (
      <PageFrame
        description="このページは つかえません"
        showBack={false}
        title="404"
      />
    );
  }

  const reload = async () => {
    try {
      setErrorMessage(null);
      const initialData = await initializeAppData();
      const objectStores = await getObjectStoreNames();
      setData({ ...initialData, objectStores });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'データを確認できませんでした。',
      );
    }
  };

  return (
    <PageFrame description="開発用の保存データ確認画面です" title="Debug Data">
      <dl className="grid gap-2 rounded-[var(--radius-large)] bg-white p-4 text-sm">
        <div>
          <dt className="font-bold">DB名</dt>
          <dd>{DB_NAME}</dd>
        </div>
        <div>
          <dt className="font-bold">DBバージョン</dt>
          <dd>{DB_VERSION}</dd>
        </div>
        <div>
          <dt className="font-bold">初期Player</dt>
          <dd>{DEFAULT_PLAYER_ID}</dd>
        </div>
        <div>
          <dt className="font-bold">開始エリア</dt>
          <dd>{STARTING_AREA_ID}</dd>
        </div>
      </dl>
      <button
        className="min-h-11 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-4 font-black text-white"
        onClick={() => void reload()}
        type="button"
      >
        初期データを再確認
      </button>
      {errorMessage ? (
        <p className="rounded-[var(--radius-medium)] bg-red-50 p-3 text-sm font-bold text-[var(--color-danger)]">
          {errorMessage}
        </p>
      ) : null}
      {data ? (
        <pre className="max-h-96 overflow-auto rounded-[var(--radius-medium)] bg-slate-900 p-3 text-left text-xs text-white">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}
    </PageFrame>
  );
}
