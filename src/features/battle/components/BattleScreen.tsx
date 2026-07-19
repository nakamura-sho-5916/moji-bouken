import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadActiveBattleSession } from '../BattleSessionStore';
import { BattleStatusPanel } from './BattleStatusPanel';

export function BattleScreen() {
  const [battle] = useState(() => loadActiveBattleSession());

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          className="rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white px-4 py-3 font-black"
          to="/home"
        >
          もどる
        </Link>
        <Link
          className="rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-4 py-3 font-black text-white"
          to="/mission"
        >
          ミッションへ
        </Link>
      </div>
      {battle ? (
        <BattleStatusPanel battle={battle} />
      ) : (
        <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5 text-center">
          <p className="text-2xl font-black text-[var(--color-primary-strong)]">
            バトルは ミッションと いっしょに すすむよ
          </p>
          <Link
            className="mt-4 flex min-h-14 items-center justify-center rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-5 text-xl font-black text-white"
            to="/mission"
          >
            ミッションを はじめる
          </Link>
        </div>
      )}
    </section>
  );
}
