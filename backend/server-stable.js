const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

console.log("🚀 Starting stable server...");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    express: require("express/package.json").version,
    node: process.version,
  });
});

// Simple test routes
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

app.get("/api/test/:id", (req, res) => {
  res.json({
    message: "Parameter route working!",
    id: req.params.id,
  });
});

// Movies routes - inline untuk testing
app.get("/api/movies/popular", (req, res) => {
  res.json({
    success: true,
    message: "Popular movies endpoint",
    data: { movies: [] },
  });
});

app.get("/api/movies/search", (req, res) => {
  res.json({
    success: true,
    message: "Search movies endpoint",
    query: req.query.q || req.query.query,
  });
});

app.get("/api/movies/:id", (req, res) => {
  res.json({
    success: true,
    message: "Movie details endpoint",
    movieId: req.params.id,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🎉 Stable server running!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`📽️ Movies: http://localhost:${PORT}/api/movies/popular\n`);
});
