import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNavigation } from './BottomNavigation';
import { MainContent } from './MainContent';
import { OfflineNotice } from './OfflineNotice';
import { UpdatePrompt } from './UpdatePrompt';
import { AudioProvider, AudioUnlockPrompt } from '../features/audio';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <AudioProvider>
      <div className="min-h-dvh bg-[var(--color-parent-background)] text-[var(--color-text)]">
        <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-[var(--color-background)] shadow-[var(--shadow-shell)]">
          <AppHeader />
          <MainContent>{children}</MainContent>
          <AudioUnlockPrompt />
          <BottomNavigation />
          <OfflineNotice />
          <UpdatePrompt />
        </div>
      </div>
    </AudioProvider>
  );
}
