import { create } from "zustand";
import { userApi } from "@/lib/api";

interface ProfileStats {
  totalMoviesWatched: number;
  totalBookmarked: number;
  averageRating: number;
  joinedDate: string;
  lastActivity: string;
  favoriteGenres: string[];
}

interface Activity {
  type: "watched" | "bookmarked";
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  rating?: number;
  date: string;
}

interface ProfileState {
  stats: ProfileStats | null;
  activities: Activity[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfileStats: () => Promise<void>;
  fetchUserActivity: (limit?: number) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  stats: null,
  activities: [],
  isLoading: false,
  error: null,

  fetchProfileStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.getProfileStats();
      set({
        stats: response.data.data.stats,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Fetch profile stats error:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch profile stats",
        isLoading: false,
      });
    }
  },

  fetchUserActivity: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.getUserActivity(limit);
      set({
        activities: response.data.data.activities,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Fetch user activity error:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch user activity",
        isLoading: false,
      });
    }
  },

  updateAvatar: async (avatar: string) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.updateAvatar(avatar);
      set({ isLoading: false });
    } catch (error: any) {
      console.error("Update avatar error:", error);
      set({
        error: error.response?.data?.message || "Failed to update avatar",
        isLoading: false,
      });
      throw error;
    }
  },

  updateSettings: async (settings: any) => {
    set({ isLoading: true, error: null });
    try {
      await userApi.updateSettings(settings);
      set({ isLoading: false });
    } catch (error: any) {
      console.error("Update settings error:", error);
      set({
        error: error.response?.data?.message || "Failed to update settings",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
