const axios = require("axios");

class TMDBApi {
  constructor() {
    this.baseURL = process.env.TMDB_BASE_URL;
    this.apiKey = process.env.TMDB_API_KEY;
    this.imageBaseURL = process.env.TMDB_IMAGE_BASE_URL;

    if (!this.apiKey) {
      throw new Error("TMDB_API_KEY is required");
    }
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          api_key: this.apiKey,
          ...params,
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error("TMDB API Error:", error.response?.data || error.message);
      throw new Error(
        `TMDB API Error: ${
          error.response?.data?.status_message || error.message
        }`
      );
    }
  }

  // Search movies
  async searchMovies(query, page = 1) {
    return await this.makeRequest("/search/movie", {
      query,
      page,
      include_adult: false,
    });
  }

  // Get movie details
  async getMovieDetails(movieId) {
    return await this.makeRequest(`/movie/${movieId}`, {
      append_to_response: "credits,videos,reviews,similar,recommendations",
    });
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    return await this.makeRequest("/movie/popular", { page });
  }

  // Get trending movies
  async getTrendingMovies(timeWindow = "week") {
    return await this.makeRequest(`/trending/movie/${timeWindow}`);
  }

  // Get top rated movies
  async getTopRatedMovies(page = 1) {
    return await this.makeRequest("/movie/top_rated", { page });
  }

  // Get upcoming movies
  async getUpcomingMovies(page = 1) {
    return await this.makeRequest("/movie/upcoming", { page });
  }

  // Get movies by genre - DIPERBAIKI
  async getMoviesByGenre(genreId, page = 1, sortBy = "popularity.desc") {
    return await this.makeRequest("/discover/movie", {
      with_genres: genreId,
      page,
      sort_by: sortBy, // Parameter ini yang penting!
    });
  }

  // Get genres list
  async getGenres() {
    return await this.makeRequest("/genre/movie/list");
  }

  // Get movie recommendations
  async getMovieRecommendations(movieId, page = 1) {
    return await this.makeRequest(`/movie/${movieId}/recommendations`, {
      page,
    });
  }

  // Helper method to get full image URL
  getImageURL(path, size = "w500") {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  // Helper method to get multiple image sizes
  getImageURLs(path) {
    if (!path) return {};
    return {
      small: this.getImageURL(path, "w200"),
      medium: this.getImageURL(path, "w500"),
      large: this.getImageURL(path, "w780"),
      original: this.getImageURL(path, "original"),
    };
  }
}

module.exports = new TMDBApi();