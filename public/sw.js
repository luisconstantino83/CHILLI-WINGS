// Service worker mínimo: solo existe para poder mostrar notificaciones
// reales del sistema operativo (que aparecen aunque la app esté en
// segundo plano), usando self.registration.showNotification().
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Si el usuario toca la notificación, abre/enfoca la app.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return self.clients.openWindow("/");
    })
  );
});
