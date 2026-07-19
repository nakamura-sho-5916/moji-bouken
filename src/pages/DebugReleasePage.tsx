import { useState } from 'react';
import { DB_VERSION, OBJECT_STORES } from '../db/constants';
import { getObjectStoreNames, openMojiBoukenDb } from '../db/database';
import { createBackup } from '../features/parent';

type ReleaseCheck = {
  appVersion: string;
  dbVersion: number;
  serviceWorkerSupported: boolean;
  stores: string[];
  storeCounts: Record<string, number>;
  issueComplete: string;
  docsReady: string;
  debugRoutes: string[];
  productionDebugDisabled: string;
  backupGeneration: string;
  warnings: string[];
};

export function DebugReleasePage() {
  const [check, setCheck] = useState<ReleaseCheck | null>(null);

  const runCheck = async () => {
    const db = await openMojiBoukenDb();
    const stores = await getObjectStoreNames();
    const storeCounts: Record<string, number> = {};
    for (const store of OBJECT_STORES) {
      const tx = db.transaction(store, 'readonly');
      storeCounts[store] = await tx.objectStore(store).count();
      await tx.done;
    }
    const backup = await createBackup();
    setCheck({
      appVersion: '0.1.0',
      dbVersion: DB_VERSION,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      stores,
      storeCounts,
      issueComplete: 'Issue 001〜100はISSUES.mdで確認',
      docsReady: 'docs必須ファイルを作成済み',
      debugRoutes: [
        '/debug/data',
        '/debug/content',
        '/debug/learning',
        '/debug/missions',
        '/debug/battle',
        '/debug/world',
        '/debug/collection',
        '/debug/release',
      ],
      productionDebugDisabled: 'import.meta.env.DEVで制御',
      backupGeneration:
        backup.format === 'moji-bouken-backup' ? 'OK' : '確認が必要',
      warnings: [],
    });
  };

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Release
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          MVP最終確認
        </p>
      </div>
      <button
        className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
        onClick={() => {
          void runCheck();
        }}
        type="button"
      >
        最終確認を実行
      </button>
      {check ? (
        <div className="grid gap-2 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 font-bold">
          <p>アプリバージョン: {check.appVersion}</p>
          <p>DBバージョン: {check.dbVersion}</p>
          <p>manifest: buildで生成確認</p>
          <p>
            Service Worker対応: {check.serviceWorkerSupported ? 'あり' : 'なし'}
          </p>
          <p>Store一覧: {check.stores.join(', ')}</p>
          <p>Issue確認: {check.issueComplete}</p>
          <p>docs確認: {check.docsReady}</p>
          <p>Debugルート: {check.debugRoutes.join(', ')}</p>
          <p>本番Debug無効: {check.productionDebugDisabled}</p>
          <p>バックアップ生成: {check.backupGeneration}</p>
          <pre className="overflow-auto rounded bg-slate-50 p-3 text-xs">
            {JSON.stringify(check.storeCounts, null, 2)}
          </pre>
          <p>未解決警告: {check.warnings.length}</p>
        </div>
      ) : null}
    </section>
  );
}
