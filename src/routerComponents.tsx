import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { RouterContext, useLocation, useNavigate } from './routerContext';
import type { RouterLocation } from './routerContext';

function normalizePath(to: string) {
  return to.startsWith('/') ? to : `/${to}`;
}

function getBrowserLocation(): RouterLocation {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

function createMemoryLocation(path: string): RouterLocation {
  const url = new URL(path, 'https://moji-bouken.local');
  return {
    pathname: url.pathname,
    search: url.search,
  };
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<RouterLocation>(() =>
    getBrowserLocation(),
  );

  useEffect(() => {
    const onPopState = () => setLocation(getBrowserLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        window.history.go(to);
        return;
      }
      const target = normalizePath(to);
      if (options?.replace) {
        window.history.replaceState(null, '', target);
      } else {
        window.history.pushState(null, '', target);
      }
      setLocation(getBrowserLocation());
    },
    [],
  );

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

export function MemoryRouter({
  children,
  initialEntries = ['/'],
}: {
  children: ReactNode;
  initialEntries?: string[];
}) {
  const [entries, setEntries] = useState(() =>
    initialEntries.length > 0 ? initialEntries : ['/'],
  );
  const [index, setIndex] = useState(0);
  const location = createMemoryLocation(entries[index] ?? '/');

  const navigate = useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        setIndex((current) =>
          Math.min(Math.max(current + to, 0), entries.length - 1),
        );
        return;
      }

      const target = normalizePath(to);
      setEntries((currentEntries) => {
        if (options?.replace) {
          return currentEntries.map((entry, entryIndex) =>
            entryIndex === index ? target : entry,
          );
        }
        return [...currentEntries.slice(0, index + 1), target];
      });
      if (!options?.replace) {
        setIndex((current) => current + 1);
      }
    },
    [entries.length, index],
  );

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

export function Link({
  children,
  onClick,
  to,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
}) {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

export function NavLink({
  className,
  to,
  ...props
}: Omit<Parameters<typeof Link>[0], 'className'> & {
  className?: string | ((state: { isActive: boolean }) => string);
}) {
  const location = useLocation();
  const isActive =
    location.pathname === to || location.pathname.startsWith(`${to}/`);
  const resolvedClassName =
    typeof className === 'function' ? className({ isActive }) : className;

  return <Link className={resolvedClassName} to={to} {...props} />;
}
