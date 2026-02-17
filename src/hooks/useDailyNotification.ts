import { useEffect, useState, useCallback, useRef } from 'react';
import { getTodayMessage } from '@/lib/dailyMessages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const NOTIFICATION_STORAGE_KEY = 'makhatma_last_notification_date';
const REMINDER_STORAGE_PREFIX = 'makhatma_reminder_shown_';

const FALLBACK_TITLE = '🌙 Rappel Makhatma';
const FALLBACK_MESSAGE = 'Assalamou aleykoum ! C\'est le moment de ta lecture pour rester régulière avec le Livre d\'Allah (عز وجل). Prête pour tes pages du jour ?';

interface NotificationState {
  hasPermission: boolean;
  isSupported: boolean;
  todayMessage: string;
  showNotification: boolean;
}

/**
 * Check if currentTime (HH:MM) is within ±windowMin of targetTime (HH:MM).
 */
function isWithinWindow(currentTime: string, targetTime: string, windowMin = 2): boolean {
  const [cH, cM] = currentTime.split(':').map(Number);
  const [tH, tM] = targetTime.split(':').map(Number);
  const currentMinutes = cH * 60 + cM;
  const targetMinutes = tH * 60 + tM;
  return Math.abs(currentMinutes - targetMinutes) <= windowMin;
}

/**
 * Check if targetTime (HH:MM) has already passed today.
 */
function hasTimePassed(targetTime: string): boolean {
  const now = new Date();
  const [tH, tM] = targetTime.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = tH * 60 + tM;
  return currentMinutes > targetMinutes + 2; // past the window
}

/**
 * Fire a browser notification or fall back to a toast.
 */
function fireNotification(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `reminder-${Date.now()}`,
        requireInteraction: false,
      });
    } else {
      toast(title, { description: body, duration: 15000 });
    }
  } catch (_e) {
    // Fallback for Samsung Internet or restricted contexts
    toast(title, { description: body, duration: 15000 });
  }
}

export function useDailyNotification() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<NotificationState>({
    hasPermission: false,
    isSupported: false,
    todayMessage: getTodayMessage().message,
    showNotification: false
  });

  // Check if notifications are supported and get permission status
  useEffect(() => {
    try {
      const isSupported = typeof window !== 'undefined' && 'Notification' in window;
      const hasPermission = isSupported && Notification.permission === 'granted';
      setState(prev => ({ ...prev, isSupported, hasPermission }));
    } catch (_e) {
      // Samsung Internet may throw on Notification access
      setState(prev => ({ ...prev, isSupported: false, hasPermission: false }));
    }
  }, []);

  // Daily banner notification (8AM)
  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lastDate = localStorage.getItem(NOTIFICATION_STORAGE_KEY);

    if (now.getHours() >= 8 && lastDate !== todayStr) {
      setState(prev => ({ ...prev, showNotification: true }));
      fireNotification(
        'Ma Khatma - Rappel Quotidien 📖',
        getTodayMessage().message
      );
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, todayStr);
    }
  }, [state.hasPermission]);

  // Check custom reminders every 30s + missed reminders on mount
  useEffect(() => {
    if (!user) return;

    const checkReminders = async () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];

      const { data: reminders } = await supabase
        .from('reading_reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_enabled', true);

      if (!reminders) return;

      for (const reminder of reminders) {
        if (!reminder.days_of_week.includes(currentDay)) continue;

        const reminderHHMM = reminder.reminder_time.slice(0, 5);
        const storageKey = `${REMINDER_STORAGE_PREFIX}${reminder.id}_${todayStr}`;

        // Already shown today
        if (localStorage.getItem(storageKey)) continue;

        // Check ±2 min window OR missed (time already passed today)
        const inWindow = isWithinWindow(currentTime, reminderHHMM, 2);
        const missed = hasTimePassed(reminderHHMM);

        if (inWindow || missed) {
          fireNotification(FALLBACK_TITLE, reminder.message);
          localStorage.setItem(storageKey, '1');
        }
      }
    };

    // Check immediately (catches missed reminders on app launch)
    checkReminders();
    // Then every 30 seconds for better accuracy
    intervalRef.current = setInterval(checkReminders, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  const sendBrowserNotification = useCallback(() => {
    const message = getTodayMessage();
    fireNotification('Ma Khatma - Rappel Quotidien 📖', message.message);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    try {
      // Polyfill: old Samsung Internet uses callback-based API
      const permission = await new Promise<NotificationPermission>((resolve) => {
        try {
          Notification.requestPermission().then(resolve).catch(() => resolve('default'));
        } catch (_e) {
          // Fallback for callback-based API (Samsung Internet < 15)
          Notification.requestPermission((p) => resolve(p));
        }
      });
      const granted = permission === 'granted';
      setState(prev => ({ ...prev, hasPermission: granted }));
      return granted;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }, []);

  const dismissNotification = useCallback(() => {
    setState(prev => ({ ...prev, showNotification: false }));
  }, []);

  return {
    ...state,
    requestPermission,
    dismissNotification,
    sendBrowserNotification
  };
}
