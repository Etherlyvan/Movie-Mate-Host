const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    profile: {
      avatar: {
        type: String,
        default: null,
      },
      displayName: {
        type: String,
        maxlength: [50, "Display name cannot exceed 50 characters"],
      },
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
        default: "",
      },
      favoriteGenres: [
        {
          type: String,
        },
      ],
      dateOfBirth: Date,
      country: String,
      location: String,
      website: String,
      socialLinks: {
        twitter: String,
        instagram: String,
        facebook: String,
      },
      isPublic: {
        type: Boolean,
        default: true,
      },
      joinedDate: {
        type: Date,
        default: Date.now,
      },
    },
    movieLogs: [
      {
        movieId: {
          type: Number,
          required: true,
        },
        movieTitle: String,
        moviePoster: String,
        status: {
          type: String,
          enum: ["watched", "watching", "want_to_watch", "dropped"],
          default: "want_to_watch",
        },
        rating: {
          type: Number,
          min: 1,
          max: 10,
        },
        review: String,
        dateAdded: {
          type: Date,
          default: Date.now,
        },
        dateWatched: Date,
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
    watchlist: [
      {
        movieId: {
          type: Number,
          required: true,
        },
        movieTitle: String,
        moviePoster: String,
        dateAdded: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "dark",
      },
      language: {
        type: String,
        default: "en",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        newReleases: {
          type: Boolean,
          default: true,
        },
        recommendations: {
          type: Boolean,
          default: true,
        },
      },
      privacy: {
        showProfile: {
          type: Boolean,
          default: true,
        },
        showWatchlist: {
          type: Boolean,
          default: true,
        },
        showActivity: {
          type: Boolean,
          default: true,
        },
      },
      display: {
        moviesPerPage: {
          type: Number,
          default: 20,
          min: 10,
          max: 50,
        },
        defaultView: {
          type: String,
          enum: ["grid", "list"],
          default: "grid",
        },
      },
    },
    statistics: {
      totalMoviesWatched: {
        type: Number,
        default: 0,
      },
      totalWatchTime: {
        type: Number,
        default: 0, // in minutes
      },
      averageRating: {
        type: Number,
        default: 0,
      },
      favoriteGenre: String,
      watchingStreak: {
        type: Number,
        default: 0,
      },
      lastActivityDate: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ "movieLogs.movieId": 1 });
userSchema.index({ "watchlist.movieId": 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update statistics before saving
userSchema.pre("save", function (next) {
  if (this.isModified("movieLogs")) {
    const watchedMovies = this.movieLogs.filter(
      (log) => log.status === "watched"
    );
    this.statistics.totalMoviesWatched = watchedMovies.length;

    if (watchedMovies.length > 0) {
      const totalRating = watchedMovies.reduce(
        (sum, movie) => sum + (movie.rating || 0),
        0
      );
      const ratedMovies = watchedMovies.filter((movie) => movie.rating > 0);
      this.statistics.averageRating =
        ratedMovies.length > 0 ? totalRating / ratedMovies.length : 0;
    }

    this.statistics.lastActivityDate = new Date();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// Get user without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.__v;
  return user;
};

// Get user statistics
userSchema.methods.getStatistics = function () {
  const watchedMovies = this.movieLogs.filter(
    (log) => log.status === "watched"
  );
  const bookmarkedMovies = this.watchlist;

  // Calculate genre preferences
  const genreCount = {};
  watchedMovies.forEach((movie) => {
    // This would need genre data from movie details
    // For now, we'll use favoriteGenres from profile
  });

  return {
    totalMoviesWatched: watchedMovies.length,
    totalBookmarked: bookmarkedMovies.length,
    averageRating: this.statistics.averageRating,
    joinedDate: this.profile.joinedDate,
    lastActivity: this.statistics.lastActivityDate,
    favoriteGenres: this.profile.favoriteGenres,
  };
};

module.exports = mongoose.model("User", userSchema);
