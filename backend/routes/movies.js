const express = require("express");
const router = express.Router();

// GET /api/movies/search
router.get("/search", (req, res) => {
  res.json({
    success: true,
    message: "Search endpoint working",
    query: req.query,
    endpoint: "GET /api/movies/search",
  });
});

// GET /api/movies/popular
router.get("/popular", (req, res) => {
  res.json({
    success: true,
    message: "Popular movies endpoint working",
    endpoint: "GET /api/movies/popular",
  });
});

// GET /api/movies/trending
router.get("/trending", (req, res) => {
  res.json({
    success: true,
    message: "Trending movies endpoint working",
    endpoint: "GET /api/movies/trending",
  });
});

// GET /api/movies/genres
router.get("/genres", (req, res) => {
  res.json({
    success: true,
    message: "Genres endpoint working",
    endpoint: "GET /api/movies/genres",
  });
});

// GET /api/movies/:id (HARUS di paling bawah)
router.get("/:id", (req, res) => {
  res.json({
    success: true,
    message: "Movie details endpoint working",
    movieId: req.params.id,
    endpoint: "GET /api/movies/:id",
  });
});

module.exports = router;
