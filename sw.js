// Service Worker — background notification scheduler
const _timers = [];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'SCHEDULE') return;
  _timers.forEach(id => clearTimeout(id));
  _timers.length = 0;
  (e.data.jobs || []).forEach(({ at, title, body, tag }) => {
    const delay = at - Date.now();
    if (delay <= 0 || delay > 86400000) return;
    _timers.push(setTimeout(() => {
      self.registration.showNotification(title, { body, tag, renotify: true });
    }, delay));
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./'))
  );
});
