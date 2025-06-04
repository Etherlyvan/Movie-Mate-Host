// frontend/public/sw.js
const CACHE_NAME = "movie-mate";
const API_BASE_URL = "http://localhost:3001/api"; // Sesuaikan dengan backend URL

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Install event");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate event");
  event.waitUntil(self.clients.claim());
});

// Push event handler
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push event received", event);

  if (!event.data) {
    console.log("Push event but no data");
    return;
  }

  const data = event.data.json();
  console.log("Push data:", data);

  const options = {
    body: data.body || "You have a new notification",
    icon: data.icon || "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    image: data.image,
    data: {
      movieId: data.movieId,
      type: data.type,
      url: data.url || "/",
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "view",
        title: "View Movie",
        icon: "/icons/view-icon.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/dismiss-icon.png",
      },
    ],
    requireInteraction: true,
    silent: false,
    tag: data.tag || "movie-notification",
    renotify: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Movie Tracker", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click event", event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  if (action === "dismiss") {
    return;
  }

  // Default action or 'view' action
  let urlToOpen = "/";

  if (data.movieId) {
    urlToOpen = `/movies/${data.movieId}`;
  } else if (data.url) {
    urlToOpen = data.url;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              url: urlToOpen,
              data: data,
            });
            return;
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(self.location.origin + urlToOpen);
        }
      })
  );
});

// Notification close handler
self.addEventListener("notificationclose", (event) => {
  console.log("Service Worker: Notification close event", event);

  // Track notification dismissal
  const data = event.notification.data;
  if (data && data.type) {
    // Send analytics or update user preferences
    fetch(`${API_BASE_URL}/notifications/dismissed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: data.type,
        movieId: data.movieId,
        timestamp: data.timestamp,
      }),
    }).catch((err) => console.log("Failed to track dismissal:", err));
  }
});

// Background sync (for future offline support)
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log("Performing background sync...");
}

// Message handler (for communication with main thread)
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
