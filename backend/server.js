// backend/server.js - Perbaiki CORS configuration
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

console.log("🚀 Starting Movie Tracker API Server...");

// CORS configuration - PERBAIKAN UTAMA
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["set-cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Security middleware (update helmet config)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Add CORS headers manually as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma"
  );

  if (req.method === "OPTIONS") {
    res.status(204).send();
    return;
  }
  next();
});

// Database connection - sama seperti sebelumnya
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
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

connectDB();

// Health check
app.get("/health", async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: { status: dbStatus },
  });
});

// Import routes
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const userRoutes = require("./routes/users");
const notificationRoutes = require("./routes/notifications");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Movie Tracker API",
    version: "1.0.0",
    status: "active",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`\n🎉 Movie Tracker API Server Started!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}\n`);
});

module.exports = app;
