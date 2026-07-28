import { createContext, useContext, useMemo } from 'react';

export type RouterLocation = {
  pathname: string;
  search: string;
};

export type RouterContextValue = {
  location: RouterLocation;
  navigate: (to: string | number, options?: { replace?: boolean }) => void;
};

export const RouterContext = createContext<RouterContextValue | null>(null);

export function useLocation() {
  return useRouterContext().location;
}

export function useNavigate() {
  return useRouterContext().navigate;
}

export function useSearchParams(): [URLSearchParams] {
  const { location } = useRouterContext();
  return useMemo(
    () => [new URLSearchParams(location.search)],
    [location.search],
  );
}

function useRouterContext() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('Router hooks must be used inside a Router.');
  }
  return context;
}
