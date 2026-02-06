// Istiqamah Service Worker for Push Notifications

const CACHE_NAME = 'istiqamah-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'Rappel de lecture du Coran 📖',
    body: "N'oublie pas ta lecture quotidienne!",
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'daily-quran-reminder',
    data: { url: '/planificateur' }
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (e) {
    console.log('[SW] Could not parse push data:', e);
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'istiqamah-notification',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
    actions: [
      { action: 'open', title: 'Ouvrir le Planificateur' },
      { action: 'close', title: 'Fermer' }
    ],
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/planificateur';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline support
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});

// Periodic background sync for scheduled notifications
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    console.log('[SW] Periodic sync for daily reminder');
    event.waitUntil(checkAndShowReminder());
  }
});

async function checkAndShowReminder() {
  // This runs periodically to check if it's time to show a reminder
  const now = new Date();
  const hour = now.getHours();
  
  // Show reminder at 20:00 (8 PM)
  if (hour === 20) {
    const lastShown = await getLastReminderDate();
    const today = now.toISOString().split('T')[0];
    
    if (lastShown !== today) {
      await self.registration.showNotification('Rappel de lecture du Coran 📖', {
        body: "C'est l'heure de ta lecture quotidienne du Coran!",
        icon: '/favicon.ico',
        tag: 'daily-quran-reminder',
        data: { url: '/planificateur' }
      });
      await setLastReminderDate(today);
    }
  }
}

// Simple storage helpers using IndexedDB via cache API
async function getLastReminderDate() {
  try {
    const cache = await caches.open('istiqamah-data');
    const response = await cache.match('last-reminder-date');
    if (response) {
      return await response.text();
    }
  } catch (e) {
    console.log('[SW] Could not get last reminder date:', e);
  }
  return null;
}

async function setLastReminderDate(date) {
  try {
    const cache = await caches.open('istiqamah-data');
    await cache.put('last-reminder-date', new Response(date));
  } catch (e) {
    console.log('[SW] Could not set last reminder date:', e);
  }
}
