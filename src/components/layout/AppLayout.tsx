import { ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { ZoomControl } from '@/components/ui/ZoomControl';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
}

export function AppLayout({ children, title, hideNav = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header title={title} />
      <main className="container max-w-lg mx-auto page-container">
        {children}
      </main>
      {!hideNav && <Navigation />}
      <ZoomControl />
    </div>
  );
}
