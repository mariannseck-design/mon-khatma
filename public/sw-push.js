// Custom Service Worker for Push Notifications - Ma Khatma

self.addEventListener('push', (event) => {
  let data = {
    title: '🌙 Rappel Makhatma',
    body: "Assalamou aleykoum ! C'est le moment de ta lecture pour rester régulière avec le Livre d'Allah (عز وجل). Prête pour tes pages du jour ?",
    icon: '/favicon.png',
    url: '/accueil',
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.log('Push data parse error:', e);
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.png',
    badge: '/pwa-192x192.png',
    tag: 'makhatma-reminder',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: data.url || '/accueil' },
    actions: [
      { action: 'open', title: '📖 Ouvrir Ma Khatma' },
      { action: 'dismiss', title: 'Plus tard' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/accueil';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
