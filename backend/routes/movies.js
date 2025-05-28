const express = require("express");
const router = express.Router();
const MovieController = require("../controllers/movieController");
const auth = require("../middleware/auth");

// Optional auth middleware - authenticates if token present but doesn't require it
const optionalAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Continue without auth if token is invalid
    }
  }
  next();
};

// Movie routes
router.get("/search", MovieController.searchMovies);
router.get("/popular", MovieController.getPopularMovies);
router.get("/trending", MovieController.getTrendingMovies);
router.get("/top-rated", MovieController.getTopRatedMovies);
router.get("/upcoming", MovieController.getUpcomingMovies);
router.get("/genres", MovieController.getGenres);
router.get("/genre/:genreId", MovieController.getMoviesByGenre);
router.get("/:id/recommendations", MovieController.getMovieRecommendations);

// Movie details with optional auth to check bookmark status
router.get("/:id", optionalAuth, MovieController.getMovieDetails);

module.exports = router;
