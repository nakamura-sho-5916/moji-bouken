import { NavLink } from 'react-router-dom';

const navigationItems = [
  { label: 'ホーム', icon: '🏠', to: '/home' },
  { label: 'ぼうけん', icon: '🗺️', to: '/world' },
  { label: 'ずかん', icon: '📚', to: '/collection' },
] as const;

export function BottomNavigation() {
  return (
    <nav
      aria-label="主な画面"
      className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2"
    >
      <ul className="grid grid-cols-3 gap-2">
        {navigationItems.map((item) => (
          <li key={item.to}>
            <NavLink
              className={({ isActive }) =>
                [
                  'flex min-h-11 flex-col items-center justify-center rounded-[var(--radius-medium)] px-2 py-1 text-sm font-bold transition',
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-orange-100',
                ].join(' ')
              }
              to={item.to}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
