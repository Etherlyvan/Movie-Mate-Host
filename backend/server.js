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

// Database connection
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
} else {
  console.log("⚠️ MongoDB URI not provided, running without database");
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    express: require("express/package.json").version,
    node: process.version,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Import TMDB API utility
const tmdbApi = require("./utils/tmdbApi");

// Movies API Routes with TMDB Integration
app.get("/api/movies/popular", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const results = await tmdbApi.getPopularMovies(page);

    // Add image URLs to each movie
    results.results = results.results.map((movie) => ({
      ...movie,
      poster_url: tmdbApi.getImageURL(movie.poster_path),
      backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
    }));

    res.json({
      success: true,
      data: results,
      pagination: {
        page: results.page,
        totalPages: results.total_pages,
        totalResults: results.total_results,
      },
    });
  } catch (error) {
    console.error("Popular movies error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/movies/trending", async (req, res) => {
  try {
    const { timeWindow = "week" } = req.query;
    const results = await tmdbApi.getTrendingMovies(timeWindow);

    // Add image URLs
    results.results = results.results.map((movie) => ({
      ...movie,
      poster_url: tmdbApi.getImageURL(movie.poster_path),
      backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
    }));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Trending movies error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/movies/search", async (req, res) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required",
      });
    }

    const results = await tmdbApi.searchMovies(query, page);

    // Add image URLs
    results.results = results.results.map((movie) => ({
      ...movie,
      poster_url: tmdbApi.getImageURL(movie.poster_path),
      backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
    }));

    res.json({
      success: true,
      data: results,
      pagination: {
        page: results.page,
        totalPages: results.total_pages,
        totalResults: results.total_results,
      },
    });
  } catch (error) {
    console.error("Search movies error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/movies/genres", async (req, res) => {
  try {
    const results = await tmdbApi.getGenres();

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Genres error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/movies/top-rated", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const results = await tmdbApi.getTopRatedMovies(page);

    // Add image URLs
    results.results = results.results.map((movie) => ({
      ...movie,
      poster_url: tmdbApi.getImageURL(movie.poster_path),
      backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
    }));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Top rated movies error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await tmdbApi.getMovieDetails(id);

    // Add image URLs
    movie.poster_urls = tmdbApi.getImageURLs(movie.poster_path);
    movie.backdrop_urls = tmdbApi.getImageURLs(movie.backdrop_path);
    movie.poster_url = tmdbApi.getImageURL(movie.poster_path);
    movie.backdrop_url = tmdbApi.getImageURL(movie.backdrop_path);

    res.json({
      success: true,
      data: movie,
    });
  } catch (error) {
    console.error("Movie details error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Auth placeholder routes
app.post("/api/auth/register", (req, res) => {
  res.json({
    success: true,
    message: "Register endpoint - coming soon",
    data: { endpoint: "POST /api/auth/register" },
  });
});

app.post("/api/auth/login", (req, res) => {
  res.json({
    success: true,
    message: "Login endpoint - coming soon",
    data: { endpoint: "POST /api/auth/login" },
  });
});

// User placeholder routes
app.get("/api/users/profile", (req, res) => {
  res.json({
    success: true,
    message: "Profile endpoint - coming soon",
    data: { endpoint: "GET /api/users/profile" },
  });
});

app.get("/api/users/watchlist", (req, res) => {
  res.json({
    success: true,
    message: "Watchlist endpoint - coming soon",
    data: { endpoint: "GET /api/users/watchlist" },
  });
});

// AI placeholder routes
app.post("/api/ai/recommendations", (req, res) => {
  res.json({
    success: true,
    message: "AI recommendations endpoint - coming soon",
    data: { endpoint: "POST /api/ai/recommendations" },
  });
});

// API documentation
app.get("/api", (req, res) => {
  res.json({
    message: "Movie Tracker API",
    version: "1.0.0",
    status: "active",
    endpoints: {
      health: "GET /health",
      movies: {
        popular: "GET /api/movies/popular?page=1",
        trending: "GET /api/movies/trending?timeWindow=week",
        topRated: "GET /api/movies/top-rated?page=1",
        search: "GET /api/movies/search?query=<term>&page=1",
        genres: "GET /api/movies/genres",
        details: "GET /api/movies/:id",
      },
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
      users: {
        profile: "GET /api/users/profile",
        watchlist: "GET /api/users/watchlist",
      },
      ai: {
        recommendations: "POST /api/ai/recommendations",
      },
    },
    examples: {
      popularMovies: "/api/movies/popular",
      searchMovie: "/api/movies/search?query=avengers",
      movieDetails: "/api/movies/550",
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
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🎉 Movie Tracker API Server Started!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log(`🎬 Movies: http://localhost:${PORT}/api/movies/popular`);
  console.log(
    `🔍 Search: http://localhost:${PORT}/api/movies/search?query=avengers`
  );
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}\n`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});
