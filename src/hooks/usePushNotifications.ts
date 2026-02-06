import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: true,
  });

  // Check support and current subscription status
  useEffect(() => {
    const checkStatus = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      
      if (!isSupported) {
        setState({
          isSupported: false,
          isSubscribed: false,
          permission: 'default',
          isLoading: false,
        });
        return;
      }

      const permission = Notification.permission;
      let isSubscribed = false;

      if (permission === 'granted' && user) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          isSubscribed = !!subscription;
        } catch (e) {
          console.error('Error checking subscription:', e);
        }
      }

      setState({
        isSupported,
        isSubscribed,
        permission,
        isLoading: false,
      });
    };

    checkStatus();
  }, [user]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user) {
      toast.error('Connecte-toi pour activer les notifications');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Permission refusée pour les notifications');
        setState(prev => ({ ...prev, permission, isLoading: false }));
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error('Impossible d\'enregistrer le service worker');
      }

      await navigator.serviceWorker.ready;

      // Create push subscription
      // Note: In production, you'd use VAPID keys from your server
      const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      // Save subscription to database
      const subscriptionData = subscription.toJSON();
      
      // Check if subscription already exists
      const { data: existingSub } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('endpoint', subscriptionData.endpoint!)
        .maybeSingle();

      if (!existingSub) {
        const { error } = await supabase
          .from('push_subscriptions')
          .insert({
            user_id: user.id,
            endpoint: subscriptionData.endpoint!,
            p256dh: subscriptionData.keys?.p256dh || '',
            auth: subscriptionData.keys?.auth || '',
          });

        if (error) {
          console.error('Error saving subscription:', error);
          throw new Error('Impossible de sauvegarder l\'abonnement');
        }
      }

      // Also ensure notification preferences exist
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!prefs) {
        await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            daily_reminder_enabled: true,
            reminder_time: '20:00:00',
          });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        isLoading: false,
      }));

      toast.success('Notifications activées! Tu recevras un rappel quotidien à 20h');
      return true;

    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Erreur lors de l\'activation des notifications');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user, registerServiceWorker]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      toast.success('Notifications désactivées');
      return true;

    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Erreur lors de la désactivation');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      toast.error('Active d\'abord les notifications');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Test - Istiqamah 📖', {
        body: 'Les notifications fonctionnent parfaitement!',
        icon: '/favicon.ico',
        tag: 'test-notification',
      });
      toast.success('Notification de test envoyée!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Erreur lors du test');
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
    registerServiceWorker,
  };
}
