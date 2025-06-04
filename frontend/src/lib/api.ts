// frontend/src/lib/api.ts
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Define proper types for API requests
interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface ProfileData {
  displayName?: string;
  bio?: string;
  country?: string;
  website?: string;
  dateOfBirth?: string;
  favoriteGenres?: string[];
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  avatar?: string;
}

interface BookmarkData {
  movieTitle: string;
  moviePoster: string;
}

interface WatchedMovieData {
  movieTitle: string;
  moviePoster: string;
  rating?: number;
  review?: string;
}

// API functions
export const movieApi = {
  // Get popular movies
  getPopular: (page = 1) => api.get(`/movies/popular?page=${page}`),

  // Search movies
  search: (query: string, page = 1) =>
    api.get(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`),

  // Get movie details
  getDetails: (id: string | number) => api.get(`/movies/${id}`),

  // Get trending movies
  getTrending: (timeWindow: "day" | "week" = "week") =>
    api.get(`/movies/trending?timeWindow=${timeWindow}`),

  // Get top rated movies
  getTopRated: (page = 1) => api.get(`/movies/top-rated?page=${page}`),

  // Get upcoming movies
  getUpcoming: (page = 1) => api.get(`/movies/upcoming?page=${page}`),

  // Get genres
  getGenres: () => api.get("/movies/genres"),

  // Get movies by genre
  getByGenre: (
    genreId: string | number,
    page = 1,
    sortBy = "popularity.desc"
  ) => api.get(`/movies/genre/${genreId}?page=${page}&sort_by=${sortBy}`),

  // Get movie recommendations
  getRecommendations: (id: string | number, page = 1) =>
    api.get(`/movies/${id}/recommendations?page=${page}`),
};

export const authApi = {
  register: (userData: RegisterData) => api.post("/auth/register", userData),

  login: (credentials: LoginCredentials) =>
    api.post("/auth/login", credentials),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get("/auth/me"),

  refreshToken: () => api.post("/auth/refresh"),
};

export const userApi = {
  // Profile functions - Fixed endpoints
  getProfile: () => api.get("/users/profile"),

  updateProfile: (profileData: ProfileData) =>
    api.put("/users/profile", profileData),

  getProfileStats: () => api.get("/users/profile/stats"),

  // Avatar functions - Fixed endpoints to match backend
  uploadAvatar: (formData: FormData) =>
    api.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  updateAvatar: (avatar: string) =>
    api.put("/users/profile/avatar", { avatar }),

  // Settings function - Fixed endpoint
  updateSettings: (settings: any) => api.put("/users/settings", settings),

  // Activity function
  getUserActivity: (limit = 10) => api.get(`/users/activity?limit=${limit}`),

  // Bookmark functions
  getBookmarks: () => api.get("/users/bookmarks"),

  addBookmark: (movieId: string | number, bookmarkData: BookmarkData) =>
    api.post(`/users/bookmarks/${movieId}`, bookmarkData),

  removeBookmark: (movieId: string | number) =>
    api.delete(`/users/bookmarks/${movieId}`),

  checkBookmark: (movieId: string | number) =>
    api.get(`/users/bookmarks/check/${movieId}`),

  // Watched movie functions
  getWatchedMovies: () => api.get("/users/watched"),

  addWatchedMovie: (movieId: string | number, watchedData: WatchedMovieData) =>
    api.post(`/users/watched/${movieId}`, watchedData),

  removeWatchedMovie: (movieId: string | number) =>
    api.delete(`/users/watched/${movieId}`),

  checkWatchedMovie: (movieId: string | number) =>
    api.get(`/users/watched/check/${movieId}`),
};

export const notificationApi = {
  subscribe: (subscription: any) => 
    api.post('/notifications/subscribe', { subscription }),
    
  unsubscribe: (endpoint: string) => 
    api.post('/notifications/unsubscribe', { endpoint }),
    
  sendTest: () => 
    api.post('/notifications/test'),
    
  sendBulk: (userIds: string[], notification: any) => 
    api.post('/notifications/bulk', { userIds, notification }),
};

// Export types for use in components
export type {
  RegisterData,
  LoginCredentials,
  ProfileData,
  BookmarkData,
  WatchedMovieData,
};
