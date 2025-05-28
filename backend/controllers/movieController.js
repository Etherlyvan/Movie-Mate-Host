const tmdbApi = require("../utils/tmdbApi");
const User = require("../models/User");

class MovieController {
  // Search movies
  static async searchMovies(req, res) {
    try {
      const { query, page = 1 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Query parameter is required",
        });
      }

      const results = await tmdbApi.searchMovies(query, page);

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
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get movie details
  static async getMovieDetails(req, res) {
    try {
      const { id } = req.params;
      const movie = await tmdbApi.getMovieDetails(id);

      // Add image URLs
      movie.poster_urls = tmdbApi.getImageURLs(movie.poster_path);
      movie.backdrop_urls = tmdbApi.getImageURLs(movie.backdrop_path);

      res.json({
        success: true,
        data: movie,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get popular movies
  static async getPopularMovies(req, res) {
    try {
      const { page = 1 } = req.query;
      const results = await tmdbApi.getPopularMovies(page);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get trending movies
  static async getTrendingMovies(req, res) {
    try {
      const { timeWindow = "week" } = req.query;
      const results = await tmdbApi.getTrendingMovies(timeWindow);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get genres
  static async getGenres(req, res) {
    try {
      const results = await tmdbApi.getGenres();

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = MovieController;
