import { useEffect, useState, useCallback, useRef } from 'react';
import { getTodayMessage } from '@/lib/dailyMessages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NOTIFICATION_STORAGE_KEY = 'makhatma_last_notification_date';
const REMINDER_STORAGE_PREFIX = 'makhatma_reminder_shown_';

interface NotificationState {
  hasPermission: boolean;
  isSupported: boolean;
  todayMessage: string;
  showNotification: boolean;
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
    const isSupported = 'Notification' in window;
    const hasPermission = isSupported && Notification.permission === 'granted';
    setState(prev => ({ ...prev, isSupported, hasPermission }));
  }, []);

  // Daily banner notification (8AM)
  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lastDate = localStorage.getItem(NOTIFICATION_STORAGE_KEY);

    if (now.getHours() >= 8 && lastDate !== todayStr) {
      setState(prev => ({ ...prev, showNotification: true }));
      if (state.hasPermission) {
        sendBrowserNotification();
      }
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, todayStr);
    }
  }, [state.hasPermission]);

  // Check custom reminders every minute
  useEffect(() => {
    if (!user) return;

    const checkReminders = async () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0=Sun
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];

      const { data: reminders } = await supabase
        .from('reading_reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_enabled', true);

      if (!reminders) return;

      for (const reminder of reminders) {
        // Check if today's day is in the reminder's days_of_week
        if (!reminder.days_of_week.includes(currentDay)) continue;

        // Compare HH:MM (reminder_time is "HH:MM:SS")
        const reminderHHMM = reminder.reminder_time.slice(0, 5);
        if (reminderHHMM !== currentTime) continue;

        // Check if already shown today for this reminder
        const storageKey = `${REMINDER_STORAGE_PREFIX}${reminder.id}_${todayStr}`;
        if (localStorage.getItem(storageKey)) continue;

        // Fire notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Ma Khatma 📖', {
            body: reminder.message,
            icon: '/favicon.ico',
            tag: `reminder-${reminder.id}`,
            requireInteraction: false,
          });
        }

        localStorage.setItem(storageKey, '1');
      }
    };

    // Check immediately then every 60s
    checkReminders();
    intervalRef.current = setInterval(checkReminders, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  const sendBrowserNotification = useCallback(() => {
    const message = getTodayMessage();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Ma Khatma - Rappel Quotidien 📖', {
        body: message.message,
        icon: '/favicon.ico',
        tag: 'daily-reminder',
        requireInteraction: false
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setState(prev => ({ ...prev, hasPermission: granted }));
      return granted;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
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
