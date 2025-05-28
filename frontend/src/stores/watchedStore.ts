import { create } from "zustand";
import { userApi } from "@/lib/api";

interface WatchedMovie {
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  status: string;
  rating?: number;
  review?: string;
  dateAdded: string;
  dateWatched: string;
  progress: number;
}

interface WatchedState {
  watchedMovies: WatchedMovie[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWatchedMovies: () => Promise<void>;
  addWatchedMovie: (
    movieId: number,
    movieTitle: string,
    moviePoster: string,
    rating?: number,
    review?: string
  ) => Promise<void>;
  removeWatchedMovie: (movieId: number) => Promise<void>;
  isWatched: (movieId: number) => boolean;
  checkWatchedStatus: (movieId: number) => Promise<boolean>;
  clearError: () => void;
}

export const useWatchedStore = create<WatchedState>((set, get) => ({
  watchedMovies: [],
  isLoading: false,
  error: null,

  fetchWatchedMovies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.getWatchedMovies();
      set({
        watchedMovies: response.data.data.watched || [],
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Fetch watched movies error:", error);
      set({
        error:
          error.response?.data?.message || "Failed to fetch watched movies",
        isLoading: false,
        watchedMovies: [],
      });
    }
  },

  addWatchedMovie: async (
    movieId: number,
    movieTitle: string,
    moviePoster: string,
    rating?: number,
    review?: string
  ) => {
    if (!movieTitle) {
      throw new Error("Movie title is required");
    }

    set({ isLoading: true, error: null });
    try {
      const response = await userApi.addWatchedMovie(movieId, {
        movieTitle,
        moviePoster: moviePoster || "",
        rating,
        review,
      });

      const newWatchedMovie = response.data.data.watched;
      set((state) => {
        // Remove existing entry if any and add new one
        const filteredMovies = state.watchedMovies.filter(
          (movie) => movie.movieId !== movieId
        );
        return {
          watchedMovies: [...filteredMovies, newWatchedMovie],
          isLoading: false,
        };
      });
    } catch (error: any) {
      console.error("Add watched movie error:", error);
      set({
        error:
          error.response?.data?.message || "Failed to mark movie as watched",
        isLoading: false,
      });
      throw error;
    }
  },

  removeWatchedMovie: async (movieId: number) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.removeWatchedMovie(movieId);
      set((state) => ({
        watchedMovies: state.watchedMovies.filter(
          (movie) => movie.movieId !== movieId
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Remove watched movie error:", error);
      set({
        error:
          error.response?.data?.message || "Failed to remove watched movie",
        isLoading: false,
      });
      throw error;
    }
  },

  isWatched: (movieId: number) => {
    const { watchedMovies } = get();
    return watchedMovies.some((movie) => movie.movieId === movieId);
  },

  checkWatchedStatus: async (movieId: number) => {
    try {
      const response = await userApi.checkWatchedMovie(movieId);
      return response.data.data.isWatched;
    } catch (error: any) {
      console.error("Check watched status error:", error);
      return get().isWatched(movieId);
    }
  },

  clearError: () => set({ error: null }),
}));
