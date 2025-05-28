const express = require("express");
const router = express.Router();

// GET /api/users/profile
router.get("/profile", (req, res) => {
  res.json({
    success: true,
    message: "Profile endpoint working",
    endpoint: "GET /api/users/profile",
  });
});

// PUT /api/users/profile
router.put("/profile", (req, res) => {
  res.json({
    success: true,
    message: "Update profile endpoint working",
    endpoint: "PUT /api/users/profile",
  });
});

// GET /api/users/watchlist
router.get("/watchlist", (req, res) => {
  res.json({
    success: true,
    message: "Watchlist endpoint working",
    endpoint: "GET /api/users/watchlist",
  });
});

module.exports = router;
