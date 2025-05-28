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

      // Add image URLs to each movie
      results.results = results.results.map((movie) => ({
        ...movie,
        poster_url: tmdbApi.getImageURL(movie.poster_path),
        backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
        poster_urls: tmdbApi.getImageURLs(movie.poster_path),
        backdrop_urls: tmdbApi.getImageURLs(movie.backdrop_path),
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
  }

  // Get movie details
  static async getMovieDetails(req, res) {
    try {
      const { id } = req.params;
      const movie = await tmdbApi.getMovieDetails(id);

      // Add image URLs
      movie.poster_urls = tmdbApi.getImageURLs(movie.poster_path);
      movie.backdrop_urls = tmdbApi.getImageURLs(movie.backdrop_path);
      movie.poster_url = tmdbApi.getImageURL(movie.poster_path);
      movie.backdrop_url = tmdbApi.getImageURL(movie.backdrop_path);

      // If user is authenticated, check if movie is bookmarked
      let isBookmarked = false;
      if (req.user) {
        const user = await User.findById(req.user.id).select("watchlist");
        if (user) {
          isBookmarked = user.watchlist.some(
            (item) => item.movieId.toString() === id
          );
        }
      }

      res.json({
        success: true,
        data: {
          ...movie,
          isBookmarked,
        },
      });
    } catch (error) {
      console.error("Movie details error:", error.message);
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

      // Add image URLs to each movie
      results.results = results.results.map((movie) => ({
        ...movie,
        poster_url: tmdbApi.getImageURL(movie.poster_path),
        backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
        poster_urls: tmdbApi.getImageURLs(movie.poster_path),
        backdrop_urls: tmdbApi.getImageURLs(movie.backdrop_path),
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
  }

  // Get trending movies
  static async getTrendingMovies(req, res) {
    try {
      const { timeWindow = "week" } = req.query;
      const results = await tmdbApi.getTrendingMovies(timeWindow);

      // Add image URLs to each movie
      results.results = results.results.map((movie) => ({
        ...movie,
        poster_url: tmdbApi.getImageURL(movie.poster_path),
        backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
        poster_urls: tmdbApi.getImageURLs(movie.poster_path),
        backdrop_urls: tmdbApi.getImageURLs(movie.backdrop_path),
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
  }

  // Get top rated movies
  static async getTopRatedMovies(req, res) {
    try {
      const { page = 1 } = req.query;
      const results = await tmdbApi.getTopRatedMovies(page);

      // Add image URLs to each movie
      results.results = results.results.map((movie) => ({
        ...movie,
        poster_url: tmdbApi.getImageURL(movie.poster_path),
        backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
        poster_urls: tmdbApi.getImageURLs(movie.poster_path),
        backdrop_urls: tmdbApi.getImageURLs(movie.backdrop_path),
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
      console.error("Top rated movies error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get upcoming movies
  static async getUpcomingMovies(req, res) {
    try {
      const { page = 1 } = req.query;
      const results = await tmdbApi.getUpcomingMovies(page);

      // Add image URLs to each movie
      results.results = results.results.map((movie) => ({
        ...movie,
        poster_url: tmdbApi.getImageURL(movie.poster_path),
        backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
        poster_urls: tmdbApi.getImageURLs(movie.poster_path),
        backdrop_urls: tmdbApi.getImageURLs(movie.backdrop_path),
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
      console.error("Upcoming movies error:", error.message);
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
      console.error("Genres error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get movies by genre
  static async getMoviesByGenre(req, res) {
    try {
      const { genreId } = req.params;
      const { page = 1 } = req.query;
      const results = await tmdbApi.getMoviesByGenre(genreId, page);

      // Add image URLs to each movie
      results.results = results.results.map((movie) => ({
        ...movie,
        poster_url: tmdbApi.getImageURL(movie.poster_path),
        backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
        poster_urls: tmdbApi.getImageURLs(movie.poster_path),
        backdrop_urls: tmdbApi.getImageURLs(movie.backdrop_path),
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
      console.error("Movies by genre error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get movie recommendations
  static async getMovieRecommendations(req, res) {
    try {
      const { id } = req.params;
      const { page = 1 } = req.query;
      const results = await tmdbApi.getMovieRecommendations(id, page);

      // Add image URLs to each movie
      results.results = results.results.map((movie) => ({
        ...movie,
        poster_url: tmdbApi.getImageURL(movie.poster_path),
        backdrop_url: tmdbApi.getImageURL(movie.backdrop_path),
        poster_urls: tmdbApi.getImageURLs(movie.poster_path),
        backdrop_urls: tmdbApi.getImageURLs(movie.backdrop_path),
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
      console.error("Movie recommendations error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = MovieController;
