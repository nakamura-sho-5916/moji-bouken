import { Link } from 'react-router-dom';

export function AppHeader() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
      <Link
        className="inline-flex min-h-11 items-center rounded-[var(--radius-medium)] text-xl font-black text-[var(--color-primary-strong)]"
        to="/"
      >
        もじぼうけん！
      </Link>
    </header>
  );
}
