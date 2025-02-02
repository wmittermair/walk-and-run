importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

self.addEventListener('install', event => {
  event.waitUntil(
    fetch('/config.json')
      .then(response => response.json())
      .then(config => {
        firebase.initializeApp(config);
      })
  );
});

const messaging = firebase.messaging();

messaging.getToken().then(token => {
  console.log('Service Worker initialized with token:', token);
}).catch(err => {
  console.error('Error getting token:', err);
});

messaging.onBackgroundMessage(async (payload) => {
  const timestamp = Date.now();
  console.log(`[${timestamp}] Service Worker received message:`, payload);
  
  const windowClients = await clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });
  
  const isAppActive = windowClients.some(client => 
    client.visibilityState === 'visible' && 
    client.url.includes(self.location.origin)
  );

  if (!isAppActive) {
    const { title, body } = payload.notification;
    
    // Versuche einen eindeutigen Identifier für die Nachricht zu erstellen
    const notificationId = payload.data?.activityId || timestamp.toString();
    
    return self.registration.showNotification(title, {
      body,
      tag: notificationId,  // Benutze die Activity ID als Tag
      renotify: false,      // Verhindere mehrfache Benachrichtigungen mit gleichem Tag
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Öffnen'
        }
      ],
      data: {
        ...payload.data,
        timestamp,
        notificationId
      }
    });
  } else {
    console.log(`[${timestamp}] App is active, suppressing notification`);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  event.notification.close();
  const urlToOpen = new URL('/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Wenn bereits ein Fenster offen ist, fokussiere es
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Wenn kein Fenster offen ist, öffne ein neues
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
}); 