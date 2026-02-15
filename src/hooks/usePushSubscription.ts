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

  // Fetch VAPID public key from edge function
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid-key');
        if (data?.vapidPublicKey) {
          setVapidKey(data.vapidPublicKey);
        }
      } catch (err) {
        console.error('Failed to fetch VAPID key:', err);
      }
    };
    fetchKey();
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/',
      });
      return registration;
    } catch (err) {
      console.error('SW registration failed:', err);
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
        if (permission !== 'granted') return;

        subscription = await (registration as any).pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys) return;

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
      } else {
        registeredRef.current = true;
      }
    } catch (err) {
      console.error('Push subscription failed:', err);
    }
  }, [user, vapidKey, registerServiceWorker]);

  useEffect(() => {
    if (vapidKey) {
      subscribeToPush();
    }
  }, [subscribeToPush, vapidKey]);

  return { subscribeToPush };
}
