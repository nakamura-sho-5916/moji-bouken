import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { initializeAppData } from '../db/initializeAppData';
import { touchSaveSlot } from '../db/repositories/saveSlotRepository';
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

  useEffect(() => {
    if (state !== 'ready') {
      return undefined;
    }

    let lastTick = Date.now();
    const saveElapsed = () => {
      const now = Date.now();
      const elapsed = now - lastTick;
      lastTick = now;
      if (elapsed > 0) {
        void touchSaveSlot(undefined, elapsed);
      }
    };
    const timer = window.setInterval(saveElapsed, 60_000);
    window.addEventListener('beforeunload', saveElapsed);
    document.addEventListener('visibilitychange', saveElapsed);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('beforeunload', saveElapsed);
      document.removeEventListener('visibilitychange', saveElapsed);
      saveElapsed();
    };
  }, [state]);

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
