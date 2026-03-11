import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useDevMode() {
  const { hasFullAccess } = useAuth();
  const [isDevMode, setIsDevMode] = useState(() => localStorage.getItem('dev_mode') === 'true');

  useEffect(() => {
    if (!hasFullAccess) {
      setIsDevMode(false);
    }
  }, [hasFullAccess]);

  const toggleDevMode = useCallback((nextValue?: boolean) => {
    if (!hasFullAccess) return;
    const next = typeof nextValue === 'boolean' ? nextValue : !isDevMode;
    localStorage.setItem('dev_mode', String(next));
    setIsDevMode(next);
  }, [hasFullAccess, isDevMode]);

  return { isDevMode: hasFullAccess && isDevMode, toggleDevMode };
}
