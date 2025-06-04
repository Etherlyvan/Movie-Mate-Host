// backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  subscribe,
  unsubscribe,
  sendTestNotification,
  sendBulkNotification,
} = require("../controllers/notificationController");

// POST /api/notifications/subscribe
router.post("/subscribe", auth, subscribe);

// POST /api/notifications/unsubscribe
router.post("/unsubscribe", auth, unsubscribe);

// POST /api/notifications/test
router.post("/test", auth, sendTestNotification);

// POST /api/notifications/bulk (admin only)
router.post("/bulk", auth, sendBulkNotification);

// POST /api/notifications/dismissed (analytics)
router.post("/dismissed", (req, res) => {
  // Log notification dismissal for analytics
  console.log("Notification dismissed:", req.body);
  res.json({ success: true });
});

module.exports = router;
