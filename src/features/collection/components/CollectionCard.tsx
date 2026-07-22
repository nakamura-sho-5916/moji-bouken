import type { ReactNode } from 'react';

export function CollectionCard({
  icon,
  title,
  description,
  discovered,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  discovered: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={[
        'min-h-24 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4 text-left shadow-sm',
        discovered
          ? 'motion-safe:animate-[game-collection-new_.6s_ease-out_1]'
          : '',
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-orange-50 text-3xl"
        >
          {discovered ? icon : '?'}
        </span>
        <div>
          <p className="text-lg font-black text-[var(--color-primary-strong)]">
            {discovered ? title : 'まだ であっていないよ'}
          </p>
          <p className="text-sm font-bold text-[var(--color-text-muted)]">
            {discovered ? description : 'たのしみに していてね'}
          </p>
        </div>
      </div>
    </button>
  );
}
