const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const User = require("../models/User");
const {
  validateBookmark,
  handleValidationErrors,
} = require("../middleware/validation");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Upload avatar function
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // For now, we'll convert to base64 (in production, use cloud storage like Cloudinary)
    const base64Avatar = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "profile.avatar": base64Avatar },
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
      message: "Avatar uploaded successfully",
      data: {
        avatarUrl: base64Avatar,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

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

// PUT /api/users/profile - Updated to handle all profile fields
router.put("/profile", auth, async (req, res) => {
  try {
    const {
      profile,
      displayName,
      bio,
      country,
      website,
      dateOfBirth,
      favoriteGenres,
      socialLinks,
      avatar,
    } = req.body;

    const updateData = {};

    // Handle nested profile object or individual fields
    if (profile) {
      Object.keys(profile).forEach((key) => {
        if (key !== "joinedDate" && profile[key] !== undefined) {
          updateData[`profile.${key}`] = profile[key];
        }
      });
    } else {
      // Handle individual fields for backward compatibility
      if (displayName !== undefined)
        updateData["profile.displayName"] = displayName;
      if (bio !== undefined) updateData["profile.bio"] = bio;
      if (country !== undefined) updateData["profile.country"] = country;
      if (website !== undefined) updateData["profile.website"] = website;
      if (avatar !== undefined) updateData["profile.avatar"] = avatar;
      if (dateOfBirth !== undefined)
        updateData["profile.dateOfBirth"] = dateOfBirth;
      if (favoriteGenres !== undefined)
        updateData["profile.favoriteGenres"] = favoriteGenres;
      if (socialLinks !== undefined)
        updateData["profile.socialLinks"] = socialLinks;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
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

// POST /api/users/avatar - Upload avatar route
router.post("/avatar", auth, upload.single("avatar"), uploadAvatar);

// PUT /api/users/profile/avatar - Update avatar URL
router.put("/profile/avatar", auth, async (req, res) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "profile.avatar": avatar },
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
      message: "Avatar updated successfully",
      data: { user: user.toJSON() },
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update avatar",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// PUT /api/users/settings
router.put("/settings", auth, async (req, res) => {
  try {
    const { preferences, profile } = req.body;
    const updateData = {};

    if (preferences) {
      Object.keys(preferences).forEach((key) => {
        updateData[`preferences.${key}`] = preferences[key];
      });
    }

    if (profile) {
      Object.keys(profile).forEach((key) => {
        if (key !== "joinedDate") {
          updateData[`profile.${key}`] = profile[key];
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
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
      message: "Settings updated successfully",
      data: { user: user.toJSON() },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
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
router.get("/watched", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("movieLogs");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter only watched movies
    const watchedMovies = user.movieLogs.filter(
      (log) => log.status === "watched"
    );

    res.json({
      success: true,
      data: {
        watched: watchedMovies || [],
        total: watchedMovies?.length || 0,
      },
    });
  } catch (error) {
    console.error("Get watched movies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get watched movies",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Check if movie is watched
router.get("/watched/check/:movieId", auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id).select("movieLogs");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isWatched = user.movieLogs.some(
      (log) => log.movieId.toString() === movieId && log.status === "watched"
    );

    res.json({
      success: true,
      data: {
        isWatched,
        movieId: parseInt(movieId),
      },
    });
  } catch (error) {
    console.error("Check watched status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check watched status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// POST /api/users/watched/:movieId
router.post("/watched/:movieId", auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { movieTitle, moviePoster, rating, review } = req.body;

    if (!movieTitle) {
      return res.status(400).json({
        success: false,
        message: "Movie title is required",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if movie is already in logs
    const existingLogIndex = user.movieLogs.findIndex(
      (log) => log.movieId.toString() === movieId
    );

    const watchedMovie = {
      movieId: parseInt(movieId),
      movieTitle,
      moviePoster: moviePoster || "",
      status: "watched",
      rating: rating || null,
      review: review || "",
      dateAdded: new Date(),
      dateWatched: new Date(),
      progress: 100,
    };

    if (existingLogIndex !== -1) {
      // Update existing log
      user.movieLogs[existingLogIndex] = {
        ...user.movieLogs[existingLogIndex],
        ...watchedMovie,
      };
    } else {
      // Add new log
      user.movieLogs.push(watchedMovie);
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: "Movie marked as watched successfully",
      data: {
        watched: watchedMovie,
      },
    });
  } catch (error) {
    console.error("Add watched movie error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark movie as watched",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// DELETE /api/users/watched/:movieId
router.delete("/watched/:movieId", auth, async (req, res) => {
  try {
    const { movieId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find and remove or update watched status
    const logIndex = user.movieLogs.findIndex(
      (log) => log.movieId.toString() === movieId && log.status === "watched"
    );

    if (logIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Watched movie not found",
      });
    }

    user.movieLogs.splice(logIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: "Movie removed from watched list successfully",
    });
  } catch (error) {
    console.error("Remove watched movie error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove watched movie",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/profile/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const stats = user.getStatistics();

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error("Get profile stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/users/activity
router.get("/activity", auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const user = await User.findById(req.user.id).select("movieLogs watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Combine and sort recent activities
    const activities = [];

    // Add recent watched movies
    user.movieLogs
      .filter((log) => log.status === "watched")
      .sort(
        (a, b) =>
          new Date(b.dateWatched || b.dateAdded) -
          new Date(a.dateWatched || a.dateAdded)
      )
      .slice(0, limit)
      .forEach((log) => {
        activities.push({
          type: "watched",
          movieId: log.movieId,
          movieTitle: log.movieTitle,
          moviePoster: log.moviePoster,
          rating: log.rating,
          date: log.dateWatched || log.dateAdded,
        });
      });

    // Add recent bookmarks
    user.watchlist
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, limit)
      .forEach((bookmark) => {
        activities.push({
          type: "bookmarked",
          movieId: bookmark.movieId,
          movieTitle: bookmark.movieTitle,
          moviePoster: bookmark.moviePoster,
          date: bookmark.dateAdded,
        });
      });

    // Sort all activities by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        activities: activities.slice(0, limit),
        total: activities.length,
      },
    });
  } catch (error) {
    console.error("Get activity error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user activity",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
