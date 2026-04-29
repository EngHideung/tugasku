// public/sw.js
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'TugasKu';
  const options = {
    body: data.body || 'Ada tugas yang akan segera deadline!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'tugasku-notif',
    requireInteraction: true,
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
