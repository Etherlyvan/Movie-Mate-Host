// backend/controllers/notificationController.js - Enhanced debugging
const webpush = require("web-push");
const User = require("../models/User");

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY ||
    "BPyHEfVaSEggfA0XDLyIer5y9l5rwKJUA0WrOFV4PyAb3A1zOebatkg2zd08XLzCLzgBnuEjwDy6jgsZttW-vlg",
  process.env.VAPID_PRIVATE_KEY || "KG5E3plMtjWClFcbd-4m6BouRdpQGjsGEG23BnSoAfQ"
);

// Enhanced test notification
const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    console.log("🧪 Sending test notification to user:", userId);
    console.log("👤 User push subscription:", !!user?.pushSubscription);

    if (!user || !user.pushSubscription) {
      return res.status(400).json({
        success: false,
        message: "User not subscribed to push notifications",
      });
    }

    const payload = JSON.stringify({
      title: "🎬 Test Notification",
      body: "This is a test notification from Movie Tracker!",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      type: "test",
      tag: "test-notification",
      url: "/dashboard",
      timestamp: Date.now(),
    });

    console.log("📦 Sending payload:", payload);
    console.log("🔑 Using subscription:", user.pushSubscription);

    const result = await webpush.sendNotification(
      user.pushSubscription,
      payload
    );
    console.log("✅ Notification sent successfully:", result);

    res.json({
      success: true,
      message: "Test notification sent successfully",
      debug: {
        hasSubscription: !!user.pushSubscription,
        payload: JSON.parse(payload),
      },
    });
  } catch (error) {
    console.error("❌ Send test notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Enhanced bookmark notification
const sendBookmarkNotification = async (userId, movieData) => {
  try {
    const user = await User.findById(userId);

    if (
      !user ||
      !user.pushSubscription ||
      !user.preferences?.notifications?.push
    ) {
      console.log("❌ User not eligible for push notifications:", {
        hasUser: !!user,
        hasSubscription: !!user?.pushSubscription,
        pushEnabled: user?.preferences?.notifications?.push,
      });
      return false;
    }

    const notificationData = {
      title: "🔖 Movie Bookmarked!",
      body: `You've added "${movieData.title}" to your watchlist!`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      image: movieData.poster_path
        ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
        : null,
      type: "bookmark",
      tag: `bookmark-${movieData.id}`,
      movieId: movieData.id,
      url: `/movies/${movieData.id}`,
      timestamp: Date.now(),
    };

    console.log("📚 Sending bookmark notification:", notificationData);

    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(notificationData)
    );
    console.log("✅ Bookmark notification sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Send bookmark notification error:", error);
    return false;
  }
};

// Rest of the functions remain the same...
const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    console.log("📝 Subscribing user:", userId);
    console.log("🔔 Subscription data:", subscription);

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription data",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $set: {
        pushSubscription: subscription,
        "preferences.notifications.push": true,
      },
    });

    console.log("✅ User subscription saved successfully");

    res.json({
      success: true,
      message: "Successfully subscribed to push notifications",
    });
  } catch (error) {
    console.error("❌ Subscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to subscribe to push notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $unset: { pushSubscription: 1 },
      $set: { "preferences.notifications.push": false },
    });

    res.json({
      success: true,
      message: "Successfully unsubscribed from push notifications",
    });
  } catch (error) {
    console.error("❌ Unsubscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe from push notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const sendNotificationToUser = async (userId, notificationData) => {
  try {
    const user = await User.findById(userId);

    if (
      !user ||
      !user.pushSubscription ||
      !user.preferences?.notifications?.push
    ) {
      return false;
    }

    const payload = JSON.stringify(notificationData);
    await webpush.sendNotification(user.pushSubscription, payload);
    return true;
  } catch (error) {
    console.error("❌ Send notification to user error:", error);
    return false;
  }
};

const sendBulkNotification = async (req, res) => {
  try {
    const { userIds, notification } = req.body;

    if (!userIds || !Array.isArray(userIds) || !notification) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    const results = await Promise.allSettled(
      userIds.map((userId) => sendNotificationToUser(userId, notification))
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value
    ).length;
    const failed = results.length - successful;

    res.json({
      success: true,
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      data: {
        total: results.length,
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error("❌ Send bulk notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const sendWatchedNotification = async (userId, movieData) => {
  try {
    const user = await User.findById(userId);

    if (
      !user ||
      !user.pushSubscription ||
      !user.preferences?.notifications?.push
    ) {
      console.log("❌ User not eligible for push notifications:", {
        hasUser: !!user,
        hasSubscription: !!user?.pushSubscription,
        pushEnabled: user?.preferences?.notifications?.push,
      });
      return false;
    }

    // Enhanced message with rating
    const ratingText = movieData.rating
      ? ` and rated it ${movieData.rating}/10`
      : "";

    const notificationData = {
      title: "✅ Movie Watched!",
      body: `You've watched "${movieData.title}"${ratingText}!`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      image: movieData.poster_path
        ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
        : null,
      type: "watched",
      tag: `watched-${movieData.id}`,
      movieId: movieData.id,
      url: `/movies/${movieData.id}`,
      timestamp: Date.now(),
      rating: movieData.rating, // Include rating in notification data
    };

    console.log("🎬 Sending watched notification:", notificationData);

    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(notificationData)
    );
    console.log("✅ Watched notification sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Send watched notification error:", error);
    return false;
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  sendTestNotification,
  sendNotificationToUser,
  sendBulkNotification,
  sendBookmarkNotification,
  sendWatchedNotification,
};
