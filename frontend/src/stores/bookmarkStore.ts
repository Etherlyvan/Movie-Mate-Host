// frontend/src/stores/bookmarkStore.ts
import { create } from "zustand";
import { userApi } from "@/lib/api";

interface Bookmark {
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  dateAdded: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBookmarks: () => Promise<void>;
  addBookmark: (
    movieId: number,
    movieTitle: string,
    moviePoster: string
  ) => Promise<void>;
  removeBookmark: (movieId: number) => Promise<void>;
  isBookmarked: (movieId: number) => boolean;
  checkBookmarkStatus: (movieId: number) => Promise<boolean>;
  clearError: () => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  error: null,

  fetchBookmarks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.getBookmarks();
      set({
        bookmarks: response.data.data.bookmarks || [],
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Fetch bookmarks error:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch bookmarks",
        isLoading: false,
        bookmarks: [], // Reset on error
      });
    }
  },

  addBookmark: async (
    movieId: number,
    movieTitle: string,
    moviePoster: string
  ) => {
    if (!movieTitle) {
      throw new Error("Movie title is required");
    }

    set({ isLoading: true, error: null });
    try {
      const response = await userApi.addBookmark(movieId, {
        movieTitle,
        moviePoster: moviePoster || "",
      });

      const newBookmark = response.data.data.bookmark;
      set((state) => ({
        bookmarks: [...state.bookmarks, newBookmark],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Add bookmark error:", error);
      set({
        error: error.response?.data?.message || "Failed to add bookmark",
        isLoading: false,
      });
      throw error;
    }
  },

  removeBookmark: async (movieId: number) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.removeBookmark(movieId);
      set((state) => ({
        bookmarks: state.bookmarks.filter(
          (bookmark) => bookmark.movieId !== movieId
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("Remove bookmark error:", error);
      set({
        error: error.response?.data?.message || "Failed to remove bookmark",
        isLoading: false,
      });
      throw error;
    }
  },

  isBookmarked: (movieId: number) => {
    const { bookmarks } = get();
    return bookmarks.some((bookmark) => bookmark.movieId === movieId);
  },

  checkBookmarkStatus: async (movieId: number) => {
    try {
      const response = await userApi.checkBookmark(movieId);
      return response.data.data.isBookmarked;
    } catch (error: any) {
      console.error("Check bookmark status error:", error);
      // Fallback to local state
      return get().isBookmarked(movieId);
    }
  },

  clearError: () => set({ error: null }),
}));
