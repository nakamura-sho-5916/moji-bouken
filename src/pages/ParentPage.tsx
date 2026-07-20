import { useEffect, useMemo, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { DEFAULT_PLAYER_ID, DB_VERSION } from '../db/constants';
import {
  getAppSettings,
  updateAppSettings,
} from '../db/repositories/settingsRepository';
import { AudioSettingsPanel } from '../features/audio';
import {
  calculateLearningOverview,
  APP_VERSION,
  changeParentPin,
  clearParentPin,
  configureParentPin,
  createBackup,
  createBackupFileName,
  getHistoryPage,
  getSpeedTrend,
  getWeakLetterRows,
  isParentSessionAuthenticated,
  lockParentSession,
  MAX_BACKUP_FILE_SIZE_BYTES,
  parseBackupJson,
  RESET_CONFIRM_TEXT,
  resetAllData,
  restoreBackup,
  serializeBackup,
  verifyParentPin,
  type HistoryDay,
  type LearningOverview,
  type SpeedTrend,
  type WeakLetterFilter,
  type WeakLetterRow,
  type WeakLetterSort,
} from '../features/parent';
import type { AppSettings } from '../types';

type ParentTab =
  'overview' | 'weak' | 'speed' | 'history' | 'settings' | 'backup';

function formatSeconds(ms: number) {
  return `${Math.round(ms / 1000)}秒`;
}

function downloadJson(fileName: string, json: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function summarizeBackup(json: ReturnType<typeof parseBackupJson>) {
  const { data } = json;
  return [
    `プレイヤー ${data.players.length}件`,
    `学習ログ ${data.learningLogs.length}件`,
    `文字進み ${data.letterProgress.length}件`,
    `復習予定 ${data.reviewSchedules.length}件`,
    `世界 ${data.worldProgress.length}件`,
    `もちもの ${data.inventories.length}件`,
  ].join(' / ');
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('おうちのひと用の番号を決めます');

  useEffect(() => {
    let active = true;
    void getAppSettings(DEFAULT_PLAYER_ID).then((nextSettings) => {
      if (active) {
        setSettings(nextSettings ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!settings) {
    return <LoadingScreen />;
  }

  const configured = settings.parentPinConfigured;
  return (
    <section className="grid gap-4 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
      <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
        保護者
      </h1>
      <p className="font-bold text-[var(--color-text-muted)]">{message}</p>
      <input
        className="min-h-14 rounded-[var(--radius-medium)] border border-[var(--color-border)] px-4 text-xl font-black"
        inputMode="numeric"
        maxLength={4}
        onChange={(event) => setPin(event.target.value)}
        placeholder="4けた"
        type="password"
        value={pin}
      />
      {!configured ? (
        <input
          className="min-h-14 rounded-[var(--radius-medium)] border border-[var(--color-border)] px-4 text-xl font-black"
          inputMode="numeric"
          maxLength={4}
          onChange={(event) => setConfirmPin(event.target.value)}
          placeholder="もういちど"
          type="password"
          value={confirmPin}
        />
      ) : null}
      <button
        className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
        onClick={() => {
          void (
            configured
              ? verifyParentPin(pin)
              : configureParentPin({ pin, confirmPin })
          ).then((result) => {
            setMessage(result.message);
            if (result.ok) {
              onUnlock();
            }
          });
        }}
        type="button"
      >
        {configured ? 'ひらく' : 'せっていする'}
      </button>
    </section>
  );
}

function OverviewPanel({ overview }: { overview: LearningOverview }) {
  const items = [
    ['学習日数', `${overview.learningDays}日`],
    ['総回答数', `${overview.totalAnswers}`],
    ['正解数', `${overview.correctAnswers}`],
    ['正答率', `${Math.round(overview.accuracy * 100)}%`],
    ['学習時間', formatSeconds(overview.learningTimeMs)],
    ['7日間回答', `${overview.recentSevenDaysAnswers}`],
    ['30日間回答', `${overview.recentThirtyDaysAnswers}`],
    ['習得文字', `${overview.masteredLetterCount}`],
    ['苦手文字', `${overview.weakLetterCount}`],
    ['復習待ち', `${overview.dueReviewCount}`],
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(([label, value]) => (
        <div
          className="rounded-[var(--radius-medium)] bg-slate-50 p-3"
          key={label}
        >
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="text-2xl font-black text-slate-800">{value}</p>
        </div>
      ))}
      <p className="col-span-2 rounded-[var(--radius-medium)] bg-slate-50 p-3 font-bold text-slate-600">
        最近の学習: {overview.lastLearningAt ?? 'まだ記録がありません'}
      </p>
    </div>
  );
}

function WeakPanel({ rows }: { rows: WeakLetterRow[] }) {
  return (
    <div className="grid gap-2">
      {rows.length === 0 ? (
        <p className="rounded-[var(--radius-medium)] bg-slate-50 p-4 font-bold">
          表示する文字はありません。
        </p>
      ) : (
        rows.map((row) => (
          <div
            className="rounded-[var(--radius-medium)] bg-slate-50 p-3"
            key={row.id}
          >
            <p className="font-black">
              {row.letterId} / {row.scriptType}
            </p>
            <p className="text-sm font-bold text-slate-600">
              正答率 {Math.round(row.accuracy * 100)}% / 出題 {row.attempts}回 /
              平均 {formatSeconds(row.averageResponseTimeMs)}
            </p>
            <p className="text-sm font-bold text-slate-600">
              最終 {row.lastAnsweredAt ?? '-'} / 復習{' '}
              {row.nextReview?.scheduledDate ?? '-'} /{' '}
              {row.nextReview?.reviewStage ?? '-'}
            </p>
            <p className="text-sm font-bold text-slate-600">
              {row.weakFlag ? '苦手判定中' : '通常'} /{' '}
              {row.masteredFlag ? '克服済み' : '練習中'}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

function SpeedPanel({ trend }: { trend: SpeedTrend | null }) {
  if (!trend || trend.logs.length === 0) {
    return (
      <p className="rounded-[var(--radius-medium)] bg-slate-50 p-4 font-bold">
        回答時間データはまだありません。
      </p>
    );
  }
  const max = Math.max(...trend.logs.map((log) => log.responseTimeMs), 1);
  const points = trend.logs
    .slice(-10)
    .map((log, index, list) => {
      const x = list.length === 1 ? 10 : 10 + (index / (list.length - 1)) * 180;
      const y = 90 - (log.responseTimeMs / max) * 70;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <div className="grid gap-3">
      <p className="rounded-[var(--radius-medium)] bg-amber-50 p-3 font-black">
        はやさだけでなく、ただしく わかることを大切にしています。
      </p>
      <svg
        aria-label="回答時間推移"
        className="h-32 w-full"
        viewBox="0 0 200 100"
      >
        <polyline
          fill="none"
          points={points}
          stroke="#f97316"
          strokeWidth="4"
        />
        {trend.logs.slice(-10).map((log, index, list) => {
          const x =
            list.length === 1 ? 10 : 10 + (index / (list.length - 1)) * 180;
          const y = 90 - (log.responseTimeMs / max) * 70;
          return (
            <text fontSize="10" key={log.id} x={x - 3} y={y - 5}>
              {log.correct ? '○' : '△'}
            </text>
          );
        })}
      </svg>
      <p className="font-bold">
        平均 {formatSeconds(trend.averageResponseTimeMs)} / 直近{' '}
        {trend.lastResponseTimeMs
          ? formatSeconds(trend.lastResponseTimeMs)
          : '-'}{' '}
        / {trend.improving ? '改善傾向' : '様子を見ています'}
      </p>
    </div>
  );
}

function HistoryPanel({ days }: { days: HistoryDay[] }) {
  return (
    <div className="grid gap-3">
      {days.map((day) => (
        <div
          className="rounded-[var(--radius-medium)] bg-slate-50 p-3"
          key={day.date}
        >
          <p className="font-black">{day.date}</p>
          {day.logs.map((log) => (
            <p className="text-sm font-bold text-slate-600" key={log.id}>
              {log.answeredAt.slice(11, 16)} / {log.missionId} /{' '}
              {log.targetLetter} / {log.correct ? '正解' : '再挑戦'} /{' '}
              {formatSeconds(log.responseTimeMs)}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ParentPage({
  initialTab = 'overview',
}: {
  initialTab?: ParentTab;
}) {
  const [authenticated, setAuthenticated] = useState(
    isParentSessionAuthenticated(),
  );
  const [tab, setTab] = useState<ParentTab>(initialTab);
  const [overview, setOverview] = useState<LearningOverview | null>(null);
  const [weakRows, setWeakRows] = useState<WeakLetterRow[]>([]);
  const [speedTrend, setSpeedTrend] = useState<SpeedTrend | null>(null);
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [pinCurrent, setPinCurrent] = useState('');
  const [pinNew, setPinNew] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [message, setMessage] = useState('保護者ダッシュボード');
  const [weakFilter, setWeakFilter] = useState<WeakLetterFilter>('all');
  const [weakSort, setWeakSort] = useState<WeakLetterSort>('low-accuracy');
  const [isResetting, setIsResetting] = useState(false);

  const reload = async () => {
    const [nextOverview, nextWeakRows, nextHistory, nextSettings] =
      await Promise.all([
        calculateLearningOverview(),
        getWeakLetterRows({ filter: weakFilter, sort: weakSort }),
        getHistoryPage({ limit: 50 }),
        getAppSettings(DEFAULT_PLAYER_ID),
      ]);
    setOverview(nextOverview);
    setWeakRows(nextWeakRows);
    setHistory(nextHistory.days);
    setSettings(nextSettings ?? null);
    setSpeedTrend(
      nextWeakRows[0] ? await getSpeedTrend(nextWeakRows[0].letterId) : null,
    );
  };

  useEffect(() => {
    if (!authenticated) {
      return;
    }
    let active = true;
    void Promise.all([
      calculateLearningOverview(),
      getWeakLetterRows({ filter: weakFilter, sort: weakSort }),
      getHistoryPage({ limit: 50 }),
      getAppSettings(DEFAULT_PLAYER_ID),
    ]).then(async ([nextOverview, nextWeakRows, nextHistory, nextSettings]) => {
      if (!active) {
        return;
      }
      setOverview(nextOverview);
      setWeakRows(nextWeakRows);
      setHistory(nextHistory.days);
      setSettings(nextSettings ?? null);
      setSpeedTrend(
        nextWeakRows[0] ? await getSpeedTrend(nextWeakRows[0].letterId) : null,
      );
    });
    return () => {
      active = false;
    };
  }, [authenticated, weakFilter, weakSort]);

  const tabs = useMemo(
    () =>
      [
        ['overview', '概要'],
        ['weak', '苦手'],
        ['speed', '時間'],
        ['history', '履歴'],
        ['settings', '設定'],
        ['backup', 'バックアップ'],
      ] as const,
    [],
  );

  if (!authenticated) {
    return (
      <PinGate
        onUnlock={() => {
          setMessage('保護者ダッシュボード');
          setAuthenticated(true);
        }}
      />
    );
  }
  if (!overview || !settings) {
    return <LoadingScreen />;
  }

  return (
    <section className="grid gap-4 text-slate-800">
      <div className="rounded-[var(--radius-large)] border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">保護者</h1>
            <p className="mt-2 font-bold text-slate-500">{message}</p>
          </div>
          <button
            className="rounded-[var(--radius-medium)] bg-slate-100 px-4 py-3 font-black"
            onClick={() => {
              lockParentSession();
              setAuthenticated(false);
            }}
            type="button"
          >
            ロック
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tabs.map(([id, label]) => (
          <button
            className={[
              'min-h-12 rounded-[var(--radius-medium)] font-black',
              tab === id ? 'bg-slate-800 text-white' : 'bg-white',
            ].join(' ')}
            key={id}
            onClick={() => setTab(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="rounded-[var(--radius-large)] border border-slate-200 bg-white p-5">
        {tab === 'overview' ? <OverviewPanel overview={overview} /> : null}
        {tab === 'weak' ? (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <select
                className="min-h-12 rounded-[var(--radius-medium)] border px-3"
                onChange={(event) =>
                  setWeakFilter(event.target.value as WeakLetterFilter)
                }
                value={weakFilter}
              >
                <option value="all">すべて</option>
                <option value="weak">苦手</option>
                <option value="mastered">習得済み</option>
                <option value="review-due">復習待ち</option>
                <option value="hiragana">ひらがな</option>
                <option value="katakana">カタカナ</option>
              </select>
              <select
                className="min-h-12 rounded-[var(--radius-medium)] border px-3"
                onChange={(event) =>
                  setWeakSort(event.target.value as WeakLetterSort)
                }
                value={weakSort}
              >
                <option value="low-accuracy">正答率が低い順</option>
                <option value="many-attempts">出題回数が多い順</option>
                <option value="nearest-review">復習日が近い順</option>
                <option value="recent-answer">最近回答した順</option>
              </select>
            </div>
            <WeakPanel rows={weakRows} />
          </div>
        ) : null}
        {tab === 'speed' ? <SpeedPanel trend={speedTrend} /> : null}
        {tab === 'history' ? <HistoryPanel days={history} /> : null}
        {tab === 'settings' ? (
          <div className="grid gap-3">
            <label className="grid gap-2 font-black">
              アニメーション軽減
              <input
                checked={settings.reducedMotion}
                onChange={(event) => {
                  void updateAppSettings(DEFAULT_PLAYER_ID, {
                    reducedMotion: event.target.checked,
                  }).then(reload);
                }}
                type="checkbox"
              />
            </label>
            <label className="grid gap-2 font-black">
              文字サイズ
              <select
                className="min-h-12 rounded-[var(--radius-medium)] border px-3"
                onChange={(event) => {
                  void updateAppSettings(DEFAULT_PLAYER_ID, {
                    fontSize: event.target.value as AppSettings['fontSize'],
                  }).then(reload);
                }}
                value={settings.fontSize}
              >
                <option value="standard">標準</option>
                <option value="large">大きめ</option>
                <option value="extra-large">とても大きい</option>
              </select>
            </label>
            <label className="grid gap-2 font-black">
              標準問題数
              <select
                className="min-h-12 rounded-[var(--radius-medium)] border px-3"
                onChange={(event) => {
                  void updateAppSettings(DEFAULT_PLAYER_ID, {
                    standardQuestionCount: Number(
                      event.target.value,
                    ) as AppSettings['standardQuestionCount'],
                  }).then(reload);
                }}
                value={settings.standardQuestionCount}
              >
                <option value={5}>5問</option>
                <option value={10}>10問</option>
                <option value={15}>15問</option>
              </select>
            </label>
            <AudioSettingsPanel
              onUpdated={reload}
              parentMode
              settings={settings}
            />
            <div className="grid gap-2 rounded-[var(--radius-medium)] bg-slate-50 p-3">
              <p className="font-black">PIN変更・解除</p>
              <input
                className="min-h-12 rounded border px-3"
                maxLength={4}
                onChange={(event) => setPinCurrent(event.target.value)}
                placeholder="現在のPIN"
                type="password"
                value={pinCurrent}
              />
              <input
                className="min-h-12 rounded border px-3"
                maxLength={4}
                onChange={(event) => setPinNew(event.target.value)}
                placeholder="新しいPIN"
                type="password"
                value={pinNew}
              />
              <input
                className="min-h-12 rounded border px-3"
                maxLength={4}
                onChange={(event) => setPinConfirm(event.target.value)}
                placeholder="新しいPIN確認"
                type="password"
                value={pinConfirm}
              />
              <button
                className="min-h-12 rounded bg-slate-800 font-black text-white"
                onClick={() =>
                  void changeParentPin({
                    currentPin: pinCurrent,
                    newPin: pinNew,
                    confirmPin: pinConfirm,
                  }).then((result) => setMessage(result.message))
                }
                type="button"
              >
                PIN変更
              </button>
              <button
                className="min-h-12 rounded bg-slate-100 font-black"
                onClick={() =>
                  void clearParentPin(pinCurrent).then((result) =>
                    setMessage(result.message),
                  )
                }
                type="button"
              >
                PIN解除
              </button>
            </div>
            <p className="font-bold">
              バージョン {APP_VERSION} / DB v{DB_VERSION}
            </p>
          </div>
        ) : null}
        {tab === 'backup' ? (
          <div className="grid gap-3">
            <p className="rounded-[var(--radius-medium)] bg-amber-50 p-3 font-black">
              このファイルは、たいせつに ほかんしてください。
            </p>
            <button
              className="min-h-14 rounded-[var(--radius-medium)] bg-slate-800 font-black text-white"
              onClick={() => {
                void createBackup().then((backup) => {
                  downloadJson(
                    createBackupFileName(backup.createdAt),
                    serializeBackup(backup),
                  );
                  setMessage('バックアップを作りました');
                });
              }}
              type="button"
            >
              バックアップ出力
            </button>
            <label className="grid gap-2 font-black">
              復元ファイル
              <input
                accept="application/json"
                className="min-h-12 rounded border px-3 py-2"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  if (file.size > MAX_BACKUP_FILE_SIZE_BYTES) {
                    setMessage('ファイルが大きすぎます');
                    return;
                  }
                  void file.text().then(async (text) => {
                    try {
                      const backup = parseBackupJson(text);
                      if (
                        !window.confirm(
                          `いまのデータを、えらんだバックアップに入れかえます。\n${summarizeBackup(
                            backup,
                          )}`,
                        )
                      ) {
                        return;
                      }
                      const beforeRestore = await restoreBackup(backup);
                      downloadJson(
                        createBackupFileName(beforeRestore.createdAt),
                        serializeBackup(beforeRestore),
                      );
                      setMessage('復元しました。再読み込みします');
                      window.location.reload();
                    } catch {
                      setMessage('バックアップを確認できませんでした');
                    }
                  });
                }}
                type="file"
              />
            </label>
            <div className="grid gap-2 rounded-[var(--radius-medium)] bg-slate-50 p-3">
              <p className="font-black">データ初期化</p>
              <p className="text-sm font-bold text-slate-600">
                実行前にバックアップをおすすめします。確認文字:{' '}
                {RESET_CONFIRM_TEXT}
              </p>
              <button
                className="min-h-12 rounded bg-red-50 font-black text-red-700"
                disabled={isResetting}
                onClick={() => {
                  if (isResetting) {
                    return;
                  }
                  const pin = window.prompt('PINを入力してください') ?? '';
                  const confirmText =
                    window.prompt('確認文字を入力してください') ?? '';
                  setIsResetting(true);
                  void resetAllData({ pin, confirmText }).then((result) => {
                    setMessage(result.message);
                    if (result.ok) {
                      window.location.assign('/');
                      return;
                    }
                    setIsResetting(false);
                  });
                }}
                type="button"
              >
                データ初期化
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
