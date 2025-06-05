// backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  subscribe,
  unsubscribe,
  sendTestNotification,
  sendBulkNotification,
  sendBookmarkNotification,
  sendWatchedNotification,
} = require("../controllers/notificationController");

// POST /api/notifications/subscribe
router.post("/subscribe", auth, subscribe);

// POST /api/notifications/unsubscribe
router.post("/unsubscribe", auth, unsubscribe);

// POST /api/notifications/test
router.post("/test", auth, sendTestNotification);

// POST /api/notifications/bulk (admin only)
router.post("/bulk", auth, sendBulkNotification);

// NEW: Routes untuk bookmark dan watched notifications
router.post("/bookmark", auth, async (req, res) => {
  try {
    const { movieData } = req.body;
    const userId = req.user.id;

    const success = await sendBookmarkNotification(userId, movieData);

    res.json({
      success,
      message: success
        ? "Bookmark notification sent"
        : "Failed to send notification",
    });
  } catch (error) {
    console.error("Bookmark notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending bookmark notification",
    });
  }
});

router.post("/watched", auth, async (req, res) => {
  try {
    const { movieData } = req.body;
    const userId = req.user.id;

    const success = await sendWatchedNotification(userId, movieData);

    res.json({
      success,
      message: success
        ? "Watched notification sent"
        : "Failed to send notification",
    });
  } catch (error) {
    console.error("Watched notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending watched notification",
    });
  }
});

// POST /api/notifications/dismissed (analytics)
router.post("/dismissed", (req, res) => {
  // Log notification dismissal for analytics
  console.log("Notification dismissed:", req.body);
  res.json({ success: true });
});

module.exports = router;
