// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

console.log("🚀 Starting Movie Tracker API Server...");

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Database connection with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("⚠️ MongoDB URI not provided, running without database");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Don't exit, continue without database for development
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// Health check with database status
app.get("/health", async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    express: require("express/package.json").version,
    node: process.version,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbStatus,
      name: mongoose.connection.name || "none",
    },
  });
});

// Import routes
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const userRoutes = require("./routes/users");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);

// API documentation
app.get("/api", (req, res) => {
  res.json({
    message: "Movie Tracker API",
    version: "1.0.0",
    status: "active",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    endpoints: {
      health: "GET /health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        me: "GET /api/auth/me",
        refresh: "POST /api/auth/refresh",
      },
      movies: {
        popular: "GET /api/movies/popular?page=1",
        trending: "GET /api/movies/trending?timeWindow=week",
        topRated: "GET /api/movies/top-rated?page=1",
        search: "GET /api/movies/search?query=<term>&page=1",
        genres: "GET /api/movies/genres",
        details: "GET /api/movies/:id",
      },
      users: {
        profile: "GET /api/users/profile [Auth Required]",
        updateProfile: "PUT /api/users/profile [Auth Required]",
        bookmarks: "GET /api/users/bookmarks [Auth Required]",
        addBookmark: "POST /api/users/bookmarks/:movieId [Auth Required]",
        removeBookmark: "DELETE /api/users/bookmarks/:movieId [Auth Required]",
        checkBookmark:
          "GET /api/users/bookmarks/check/:movieId [Auth Required]",
      },
    },
    examples: {
      register: {
        url: "POST /api/auth/register",
        body: {
          username: "johndoe",
          email: "john@example.com",
          password: "Password123",
        },
      },
      login: {
        url: "POST /api/auth/login",
        body: {
          email: "john@example.com",
          password: "Password123",
        },
      },
      popularMovies: "GET /api/movies/popular",
      searchMovie: "GET /api/movies/search?query=avengers",
      movieDetails: "GET /api/movies/550",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: "/api",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`\n🎉 Movie Tracker API Server Started!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log(`🎬 Movies: http://localhost:${PORT}/api/movies/popular`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/register`);
  console.log(
    `🔍 Search: http://localhost:${PORT}/api/movies/search?query=avengers`
  );
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `📊 Database: ${
      mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected"
    }\n`
  );
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed.");

    mongoose.connection.close(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  gracefulShutdown("Unhandled Promise Rejection");
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  gracefulShutdown("Uncaught Exception");
});

module.exports = app;
