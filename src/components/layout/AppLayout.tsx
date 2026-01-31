import { ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
}

export function AppLayout({ children, title, hideNav = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background pattern-overlay">
      <Header title={title} />
      <main className="container max-w-lg mx-auto px-4 pb-24 pt-6">
        {children}
      </main>
      {!hideNav && <Navigation />}
    </div>
  );
}
