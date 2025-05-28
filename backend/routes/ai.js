const express = require("express");
const router = express.Router();

// POST /api/ai/recommendations
router.post("/recommendations", (req, res) => {
  res.json({
    success: true,
    message: "AI recommendations endpoint working",
    endpoint: "POST /api/ai/recommendations",
  });
});

// POST /api/ai/sentiment
router.post("/sentiment", (req, res) => {
  res.json({
    success: true,
    message: "Sentiment analysis endpoint working",
    endpoint: "POST /api/ai/sentiment",
  });
});

module.exports = router;
