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
        window.location.href = "/login";
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
  username?: string;
  email?: string;
  bio?: string;
  favoriteGenres?: string[];
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

  // Get genres
  getGenres: () => api.get("/movies/genres"),
};

export const authApi = {
  register: (userData: RegisterData) => api.post("/auth/register", userData),

  login: (credentials: LoginCredentials) =>
    api.post("/auth/login", credentials),

  logout: () => api.post("/auth/logout"),
};

export const userApi = {
  getProfile: () => api.get("/users/profile"),

  updateProfile: (profileData: ProfileData) =>
    api.put("/users/profile", profileData),

  getWatchlist: () => api.get("/users/watchlist"),
};

// Export types for use in components
export type { RegisterData, LoginCredentials, ProfileData };
