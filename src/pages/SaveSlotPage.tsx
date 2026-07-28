import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import {
  copySaveSlot,
  deleteSaveSlot,
  getActiveSaveSlotId,
  listSaveSlotSummaries,
  renameSaveSlot,
  SAVE_SLOT_IDS,
  startSaveSlot,
  type SaveSlotId,
  type SaveSlotSummary,
} from '../db/repositories/saveSlotRepository';
import { useNavigate } from '../router';

function formatPlayTime(ms: number) {
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return hours > 0 ? `${hours}じかん ${restMinutes}ふん` : `${restMinutes}ふん`;
}

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleString('ja-JP') : 'まだ なし';
}

function nextSlotId(slotId: SaveSlotId): SaveSlotId {
  const index = SAVE_SLOT_IDS.indexOf(slotId);
  return SAVE_SLOT_IDS[(index + 1) % SAVE_SLOT_IDS.length] ?? 'slot-1';
}

export function SaveSlotPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<SaveSlotSummary[] | null>(null);
  const [message, setMessage] = useState('ぼうけんを えらんでね');

  const reload = async () => {
    setSlots(await listSaveSlotSummaries());
  };

  useEffect(() => {
    let active = true;
    void listSaveSlotSummaries().then((nextSlots) => {
      if (active) {
        setSlots(nextSlots);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!slots) {
    return <LoadingScreen />;
  }

  const activeSlotId = getActiveSaveSlotId();

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-center">
        <p className="text-sm font-black text-[var(--color-text-muted)]">
          もじぼうけん
        </p>
        <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
          セーブを えらぶ
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          {message}
        </p>
      </div>
      <div className="grid gap-3">
        {slots.map((slot) => (
          <article
            className={[
              'grid gap-3 rounded-[var(--radius-large)] border bg-white p-4 shadow-sm',
              activeSlotId === slot.id
                ? 'border-[var(--color-primary)]'
                : 'border-[var(--color-border)]',
            ].join(' ')}
            key={slot.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-[var(--color-primary-strong)]">
                  {slot.name}
                </h2>
                <p className="text-sm font-bold text-[var(--color-text-muted)]">
                  {slot.empty ? 'あたらしい ぼうけん' : 'つづきが あるよ'}
                </p>
              </div>
              <span className="rounded-[var(--radius-pill)] bg-orange-50 px-3 py-1 text-sm font-black">
                Lv {slot.level}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm font-bold">
              <div>
                <dt className="text-[var(--color-text-muted)]">まち</dt>
                <dd>{slot.townRecoveryRate}%</dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">じかん</dt>
                <dd>{formatPlayTime(slot.playTimeMs)}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">さいご</dt>
                <dd>{formatDate(slot.lastPlayedAt)}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">エリア</dt>
                <dd>{slot.currentAreaName}</dd>
              </div>
            </dl>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="min-h-12 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-3 font-black text-white"
                onClick={() => {
                  void startSaveSlot(slot.id).then(() => navigate('/title'));
                }}
                type="button"
              >
                {slot.empty ? 'あたらしく はじめる' : 'つづきから'}
              </button>
              <button
                className="min-h-12 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-3 font-black"
                onClick={() => {
                  const name = window.prompt('なまえを いれてね', slot.name);
                  if (!name) {
                    return;
                  }
                  void renameSaveSlot(slot.id, name).then(async () => {
                    setMessage('なまえを かえたよ');
                    await reload();
                  });
                }}
                type="button"
              >
                名前変更
              </button>
              <button
                className="min-h-12 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-3 font-black"
                disabled={slot.empty}
                onClick={() => {
                  const targetSlotId = nextSlotId(slot.id);
                  void copySaveSlot(slot.id, targetSlotId).then(async () => {
                    setMessage(`${slot.name}を コピーしたよ`);
                    await reload();
                  });
                }}
                type="button"
              >
                コピー
              </button>
              <button
                className="min-h-12 rounded-[var(--radius-medium)] border border-red-200 bg-red-50 px-3 font-black text-red-700"
                disabled={slot.empty}
                onClick={() => {
                  if (!window.confirm('このぼうけんを\nけしますか？')) {
                    return;
                  }
                  void deleteSaveSlot(slot.id).then(async () => {
                    setMessage('けしたよ');
                    await reload();
                  });
                }}
                type="button"
              >
                削除
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
