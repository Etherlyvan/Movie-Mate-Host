// frontend/public/sw.js - Enhanced for rating display
const CACHE_NAME = "movie-mate";
const API_BASE_URL = "http://localhost:3001/api";

// Enhanced duplicate tracking
const notificationTracker = {
  shown: new Map(),

  shouldShow(type, movieId) {
    const key = `${type}-${movieId || "general"}`;
    const now = Date.now();
    const lastShown = this.shown.get(key);

    if (lastShown && now - lastShown < 10000) {
      console.log("🚫 Duplicate notification prevented:", key);
      return false;
    }

    this.shown.set(key, now);

    this.shown.forEach((timestamp, k) => {
      if (now - timestamp > 60000) {
        this.shown.delete(k);
      }
    });

    return true;
  },
};

// Install event
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker: Install event");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker: Activate event");
  event.waitUntil(self.clients.claim());
});

// Push event handler
self.addEventListener("push", (event) => {
  console.log("🔔 Service Worker: Push event received");

  if (!event.data) {
    console.log("❌ Push event but no data");
    return;
  }

  let data;
  try {
    data = event.data.json();
    console.log("📦 Push data:", data);
  } catch (error) {
    console.error("❌ Failed to parse push data:", error);
    return;
  }

  if (!notificationTracker.shouldShow(data.type, data.movieId)) {
    return;
  }

  // Enhanced body with rating for watched movies
  let body = data.body || "You have a new notification";
  if (data.type === "watched" && data.rating) {
    body = `You've watched "${data.movieTitle || "this movie"}" and rated it ${
      data.rating
    }/10!`;
  }

  const options = {
    body: body,
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    image: data.image,
    data: {
      movieId: data.movieId,
      type: data.type,
      url: data.url || "/",
      timestamp: Date.now(),
      rating: data.rating, // Pass rating to notification data
    },
    actions: [
      {
        action: "view",
        title: "View Movie",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
    requireInteraction: false,
    silent: false,
    tag: `${data.type}-${data.movieId || "general"}-${Date.now()}`,
    renotify: false,
    vibrate: [200, 100, 200],
  };

  console.log("🔔 Showing notification:", data.title);

  const notificationPromise = self.registration
    .showNotification(data.title || "Movie Tracker", options)
    .then(() => {
      console.log("✅ Notification shown successfully");
    })
    .catch((error) => {
      console.error("❌ Failed to show notification:", error);
    });

  event.waitUntil(notificationPromise);
});

// Rest of the service worker remains the same...
self.addEventListener("notificationclick", (event) => {
  console.log("👆 Notification clicked");

  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  if (action === "dismiss") {
    console.log("🚫 Notification dismissed");
    return;
  }

  let urlToOpen = "/";
  if (data.movieId) {
    urlToOpen = `/movies/${data.movieId}`;
  } else if (data.url) {
    urlToOpen = data.url;
  }

  console.log("🔗 Opening URL:", urlToOpen);

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
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

        if (clients.openWindow) {
          return clients.openWindow(self.location.origin + urlToOpen);
        }
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("❌ Notification closed");
});

self.addEventListener("message", (event) => {
  console.log("💬 Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
