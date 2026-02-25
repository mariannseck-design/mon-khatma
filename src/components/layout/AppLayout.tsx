import { ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { ZoomControl } from '@/components/ui/ZoomControl';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
}

export function AppLayout({ children, title, hideNav = false }: AppLayoutProps) {
  const { onTouchStart, onTouchEnd, isSwipeable } = useSwipeNavigation();

  return (
    <div className="min-h-screen bg-gradient-warm">
      <InstallBanner />
      <Header title={title} />
      <main
        className="container max-w-lg mx-auto page-container"
        {...(isSwipeable ? { onTouchStart, onTouchEnd } : {})}
      >
        {children}
      </main>
      {!hideNav && <Navigation />}
      <ZoomControl />
    </div>
  );
}
