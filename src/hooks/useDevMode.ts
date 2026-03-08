import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useDevMode() {
  const { isAdmin } = useAuth();
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setIsDevMode(false);
      return;
    }
    setIsDevMode(localStorage.getItem('dev_mode') === 'true');
  }, [isAdmin]);

  const toggleDevMode = useCallback((nextValue?: boolean) => {
    if (!isAdmin) return;
    const next = typeof nextValue === 'boolean' ? nextValue : !isDevMode;
    localStorage.setItem('dev_mode', String(next));
    setIsDevMode(next);
  }, [isAdmin, isDevMode]);

  return { isDevMode: isAdmin && isDevMode, toggleDevMode };
}
