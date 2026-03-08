import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useDevMode() {
  const { isAdmin } = useAuth();
  const [isDevMode, setIsDevMode] = useState(() => {
    if (!isAdmin) return false;
    return localStorage.getItem('dev_mode') === 'true';
  });

  const toggleDevMode = useCallback(() => {
    if (!isAdmin) return;
    const next = !isDevMode;
    localStorage.setItem('dev_mode', String(next));
    setIsDevMode(next);
  }, [isAdmin, isDevMode]);

  return { isDevMode: isAdmin && isDevMode, toggleDevMode };
}
