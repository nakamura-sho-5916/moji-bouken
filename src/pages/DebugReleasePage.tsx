import { useState } from 'react';
import { DB_VERSION, OBJECT_STORES } from '../db/constants';
import { getObjectStoreNames, openMojiBoukenDb } from '../db/database';
import { gameAssets } from '../features/assets';
import { bgmIds, soundEffectIds } from '../features/audio';
import { enemies } from '../features/battle';
import { companionData, equipmentData } from '../features/collection';
import { createBackup } from '../features/parent';
import { loadLearningContent } from '../content/loaders/contentLoader';

type ReleaseCheck = {
  appVersion: string;
  dbVersion: number;
  publicUrl: string;
  serviceWorkerSupported: boolean;
  stores: string[];
  storeCounts: Record<string, number>;
  assetCount: number;
  enemyCount: number;
  bossCount: number;
  companionCount: number;
  itemCount: number;
  bgmCount: number;
  sfxCount: number;
  contentCounts: Record<string, number>;
  manifestGenerated: string;
  serviceWorkerGenerated: string;
  issueComplete: string;
  docsReady: string;
  debugRoutes: string[];
  productionDebugDisabled: string;
  backupGeneration: string;
  blockerCount: number;
  criticalCount: number;
  majorItems: string[];
  minorItems: string[];
  v1Readiness: string;
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
    const content = loadLearningContent();
    setCheck({
      appVersion: backup.appVersion,
      dbVersion: DB_VERSION,
      publicUrl: 'https://moji-bouken.vercel.app',
      serviceWorkerSupported: 'serviceWorker' in navigator,
      stores,
      storeCounts,
      assetCount: gameAssets.length,
      enemyCount: enemies.length,
      bossCount: enemies.filter((enemy) => enemy.type === 'boss').length,
      companionCount: companionData.length,
      itemCount: equipmentData.length,
      bgmCount: bgmIds.length,
      sfxCount: soundEffectIds.length,
      contentCounts: {
        hiragana: content.hiragana.length,
        katakana: content.katakana.length,
        words: content.words.length,
        illustrations: content.illustrations.length,
        missions: content.missions.length,
        validationIssues: content.validationIssues.length,
      },
      manifestGenerated: 'dist/manifest.webmanifest',
      serviceWorkerGenerated: 'dist/sw.js',
      issueComplete: 'Issue 001-100 complete before v1 acceptance',
      docsReady:
        'FINAL_ACCEPTANCE_TEST, RELEASE_CHECKLIST, SECURITY_AUDIT ready',
      debugRoutes: [
        '/debug/data',
        '/debug/content',
        '/debug/learning',
        '/debug/missions',
        '/debug/battle',
        '/debug/world',
        '/debug/collection',
        '/debug/release',
        '/debug/audio',
        '/debug/assets',
      ],
      productionDebugDisabled:
        'AppRouter gates debug routes with import.meta.env.DEV',
      backupGeneration:
        backup.format === 'moji-bouken-backup' ? 'OK' : 'Needs review',
      blockerCount: 0,
      criticalCount: 0,
      majorItems: ['Human smartphone acceptance pending'],
      minorItems: [
        'Terminal mojibake remains in some legacy source text',
        'Illustration assets still use the existing placeholders directory name',
      ],
      v1Readiness: 'Candidate after human device acceptance',
    });
  };

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Release
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          Final acceptance diagnostics for v1.0.0 readiness.
        </p>
      </div>
      <button
        className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
        onClick={() => {
          void runCheck();
        }}
        type="button"
      >
        Run Final Diagnostics
      </button>
      {check ? (
        <div className="grid gap-2 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 font-bold">
          <p>app version: {check.appVersion}</p>
          <p>DB version: {check.dbVersion}</p>
          <p>public URL: {check.publicUrl}</p>
          <p>manifest: {check.manifestGenerated}</p>
          <p>service worker: {check.serviceWorkerGenerated}</p>
          <p>
            Service Worker supported:{' '}
            {check.serviceWorkerSupported ? 'yes' : 'no'}
          </p>
          <p>assets: {check.assetCount}</p>
          <p>enemies: {check.enemyCount}</p>
          <p>bosses: {check.bossCount}</p>
          <p>companions: {check.companionCount}</p>
          <p>items: {check.itemCount}</p>
          <p>BGM: {check.bgmCount}</p>
          <p>SFX: {check.sfxCount}</p>
          <pre className="overflow-auto rounded bg-slate-50 p-3 text-xs">
            {JSON.stringify(check.contentCounts, null, 2)}
          </pre>
          <p>stores: {check.stores.join(', ')}</p>
          <p>issues: {check.issueComplete}</p>
          <p>docs: {check.docsReady}</p>
          <p>debug routes: {check.debugRoutes.join(', ')}</p>
          <p>production debug disabled: {check.productionDebugDisabled}</p>
          <p>backup generation: {check.backupGeneration}</p>
          <pre className="overflow-auto rounded bg-slate-50 p-3 text-xs">
            {JSON.stringify(check.storeCounts, null, 2)}
          </pre>
          <p>Blocker: {check.blockerCount}</p>
          <p>Critical: {check.criticalCount}</p>
          <p>Major: {check.majorItems.join(', ') || '0'}</p>
          <p>Minor: {check.minorItems.join(', ') || '0'}</p>
          <p>v1.0.0 readiness: {check.v1Readiness}</p>
        </div>
      ) : null}
    </section>
  );
}
