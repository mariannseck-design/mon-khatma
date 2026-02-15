import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const { user } = useAuth();
  const registeredRef = useRef(false);
  const [vapidKey, setVapidKey] = useState<string>('');
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Fetch VAPID public key from edge function
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid-key');
        if (error) {
          console.error('Error fetching VAPID key:', error);
          setSubscriptionError('vapid_fetch_failed');
          return;
        }
        if (data?.vapidPublicKey && data.vapidPublicKey.length > 20) {
          setVapidKey(data.vapidPublicKey);
          console.log('VAPID key fetched successfully, length:', data.vapidPublicKey.length);
        } else {
          console.error('VAPID key is missing or too short:', data?.vapidPublicKey?.length);
          setSubscriptionError('vapid_invalid');
        }
      } catch (err) {
        console.error('Failed to fetch VAPID key:', err);
        setSubscriptionError('vapid_fetch_failed');
      }
    };
    fetchKey();
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push not supported in this browser');
      setSubscriptionError('push_not_supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/',
      });
      console.log('Service Worker registered successfully');
      return registration;
    } catch (err) {
      console.error('SW registration failed:', err);
      setSubscriptionError('sw_registration_failed');
      return null;
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!user || registeredRef.current || !vapidKey) return;

    const registration = await registerServiceWorker();
    if (!registration) return;

    try {
      await navigator.serviceWorker.ready;

      let subscription = await (registration as any).pushManager.getSubscription();

      if (!subscription) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission denied');
          setSubscriptionError('permission_denied');
          return;
        }

        try {
          subscription = await (registration as any).pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          });
          console.log('Push subscription created successfully');
        } catch (subErr) {
          console.error('Push subscribe failed:', subErr);
          setSubscriptionError('subscribe_failed');
          return;
        }
      }

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys) {
        console.error('Invalid subscription JSON:', subJson);
        setSubscriptionError('invalid_subscription');
        return;
      }

      // Save to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh!,
          auth: subJson.keys.auth!,
        }, {
          onConflict: 'endpoint',
        });

      if (error) {
        console.error('Error saving push subscription:', error);
        setSubscriptionError('db_save_failed');
      } else {
        registeredRef.current = true;
        setSubscriptionError(null);
        console.log('Push subscription saved to database');
      }
    } catch (err) {
      console.error('Push subscription failed:', err);
      setSubscriptionError('unknown_error');
    }
  }, [user, vapidKey, registerServiceWorker]);

  useEffect(() => {
    if (vapidKey) {
      subscribeToPush();
    }
  }, [subscribeToPush, vapidKey]);

  return { subscribeToPush, subscriptionError };
}
