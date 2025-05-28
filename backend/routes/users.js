const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const {
  validateBookmark,
  handleValidationErrors,
} = require("../middleware/validation");

// GET /api/users/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// PUT /api/users/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const allowedUpdates = [
      "profile.bio",
      "profile.favoriteGenres",
      "profile.country",
      "preferences",
    ];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach((key) => {
      if (
        allowedUpdates.some((allowed) => key.startsWith(allowed.split(".")[0]))
      ) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: user.toJSON() },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/users/bookmarks
router.get("/bookmarks", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("watchlist");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      data: {
        bookmarks: user.watchlist || [],
        total: user.watchlist?.length || 0,
      },
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get bookmarks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Check if movie is bookmarked - HARUS SEBELUM /:movieId routes
router.get("/bookmarks/check/:movieId", auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id).select("watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isBookmarked = user.watchlist.some(
      (item) => item.movieId.toString() === movieId
    );

    res.json({
      success: true,
      data: {
        isBookmarked,
        movieId: parseInt(movieId),
      },
    });
  } catch (error) {
    console.error("Check bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check bookmark status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// POST /api/users/bookmarks/:movieId
router.post(
  "/bookmarks/:movieId",
  auth,
  validateBookmark,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { movieId } = req.params;
      const { movieTitle, moviePoster } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if movie is already bookmarked
      const existingBookmark = user.watchlist.find(
        (item) => item.movieId.toString() === movieId
      );

      if (existingBookmark) {
        return res.status(400).json({
          success: false,
          message: "Movie already bookmarked",
        });
      }

      // Add to watchlist (bookmark)
      const newBookmark = {
        movieId: parseInt(movieId),
        movieTitle,
        moviePoster: moviePoster || "",
        dateAdded: new Date(),
      };

      user.watchlist.push(newBookmark);
      await user.save();

      res.status(201).json({
        success: true,
        message: "Movie bookmarked successfully",
        data: {
          bookmark: newBookmark,
        },
      });
    } catch (error) {
      console.error("Add bookmark error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bookmark movie",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// DELETE /api/users/bookmarks/:movieId
router.delete("/bookmarks/:movieId", auth, async (req, res) => {
  try {
    const { movieId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find and remove bookmark
    const bookmarkIndex = user.watchlist.findIndex(
      (item) => item.movieId.toString() === movieId
    );

    if (bookmarkIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    user.watchlist.splice(bookmarkIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove bookmark",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Legacy watchlist endpoint for backward compatibility
router.get("/watchlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("watchlist");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      data: {
        watchlist: user.watchlist || [],
        total: user.watchlist?.length || 0,
      },
    });
  } catch (error) {
    console.error("Get watchlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get watchlist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
