import { useEffect, useState, useCallback } from 'react';
import { getTodayMessage } from '@/lib/dailyMessages';

const NOTIFICATION_STORAGE_KEY = 'monkhatma_last_notification_date';
const NOTIFICATION_HOUR = 8; // 08:00

interface NotificationState {
  hasPermission: boolean;
  isSupported: boolean;
  todayMessage: string;
  showNotification: boolean;
}

export function useDailyNotification() {
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
    
    setState(prev => ({
      ...prev,
      isSupported,
      hasPermission
    }));
  }, []);

  // Check if we should show a notification on app load
  useEffect(() => {
    const checkAndShowNotification = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().split('T')[0];
      const lastNotificationDate = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      
      // Show notification if:
      // 1. It's after 08:00
      // 2. We haven't shown a notification today
      if (currentHour >= NOTIFICATION_HOUR && lastNotificationDate !== todayStr) {
        setState(prev => ({ ...prev, showNotification: true }));
        
        // Send browser notification if permitted
        if (state.hasPermission) {
          sendBrowserNotification();
        }
        
        // Mark as shown for today
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, todayStr);
      }
    };

    checkAndShowNotification();
  }, [state.hasPermission]);

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
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      setState(prev => ({
        ...prev,
        hasPermission: granted
      }));
      
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
