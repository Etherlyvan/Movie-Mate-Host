// backend/controllers/notificationController.js
const webpush = require("web-push");
const User = require("../models/User");

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:your-email@example.com", // Replace with your email
  process.env.VAPID_PUBLIC_KEY || "BPyHEfVaSEggfA0XDLyIer5y9l5rwKJUA0WrOFV4PyAb3A1zOebatkg2zd08XLzCLzgBnuEjwDy6jgsZttW-vlg",
  process.env.VAPID_PRIVATE_KEY || "KG5E3plMtjWClFcbd-4m6BouRdpQGjsGEG23BnSoAfQ"
);

// Subscribe to push notifications
const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription data",
      });
    }

    // Save subscription to user
    await User.findByIdAndUpdate(userId, {
      $set: {
        pushSubscription: subscription,
        "preferences.notifications.push": true,
      },
    });

    res.json({
      success: true,
      message: "Successfully subscribed to push notifications",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to subscribe to push notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Unsubscribe from push notifications
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
    console.error("Unsubscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe from push notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Send test notification
const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.pushSubscription) {
      return res.status(400).json({
        success: false,
        message: "User not subscribed to push notifications",
      });
    }

    const payload = JSON.stringify({
      title: "🎬 Test Notification",
      body: "This is a test notification from Movie Tracker!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      type: "test",
      tag: "test-notification",
      url: "/dashboard",
    });

    await webpush.sendNotification(user.pushSubscription, payload);

    res.json({
      success: true,
      message: "Test notification sent successfully",
    });
  } catch (error) {
    console.error("Send test notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Send notification to specific user
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
    console.error("Send notification to user error:", error);
    return false;
  }
};

// Send notification to multiple users
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
    console.error("Send bulk notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  sendTestNotification,
  sendNotificationToUser,
  sendBulkNotification,
};
