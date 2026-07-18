import type { ReactNode } from 'react';

type MainContentProps = {
  children: ReactNode;
};

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5">{children}</main>
  );
}
