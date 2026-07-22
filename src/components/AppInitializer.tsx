import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { initializeAppData } from '../db/initializeAppData';
import { preloadGameAssets } from '../features/assets';
import { LoadingScreen } from './LoadingScreen';

type AppInitializerProps = {
  children: ReactNode;
};

type InitializationState = 'loading' | 'ready';

export function AppInitializer({ children }: AppInitializerProps) {
  const initializedRef = useRef(false);
  const [state, setState] = useState<InitializationState>('loading');
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    preloadGameAssets();
    void initializeAppData()
      .then(() => {
        setState('ready');
      })
      .catch((caughtError: unknown) => {
        setError(caughtError);
      });
  }, []);

  if (error) {
    throw error;
  }

  if (state === 'loading') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[var(--color-background)]">
        <LoadingScreen />
      </main>
    );
  }

  return children;
}
