// frontend/src/stores/userStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UserPreferences, UserProfile } from "@/types";
import { userApi } from "@/lib/api";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchUser: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  clearUser: () => void;
  clearError: () => void;

  // Cache management
  shouldRefresh: () => boolean;
  invalidateCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchUser: async () => {
        const { shouldRefresh, user } = get();

        // Return cached data if still valid
        if (user && !shouldRefresh()) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await userApi.getProfile();
          set({
            user: response.data.data.user,
            isLoading: false,
            lastFetched: Date.now(),
            error: null,
          });
        } catch (error: any) {
          console.error("Fetch user error:", error);
          set({
            error:
              error.response?.data?.message || "Failed to fetch user profile",
            isLoading: false,
          });
          throw error;
        }
      },

      updateProfile: async (profileData: Partial<UserProfile>) => {
        set({ isLoading: true, error: null });

        try {
          const response = await userApi.updateProfile({
            profile: profileData,
          });
          set({
            user: response.data.data.user,
            isLoading: false,
            lastFetched: Date.now(),
          });
        } catch (error: any) {
          console.error("Update profile error:", error);
          set({
            error: error.response?.data?.message || "Failed to update profile",
            isLoading: false,
          });
          throw error;
        }
      },

      updatePreferences: async (preferences: Partial<UserPreferences>) => {
        set({ isLoading: true, error: null });

        try {
          const response = await userApi.updateSettings({ preferences });
          set({
            user: response.data.data.user,
            isLoading: false,
            lastFetched: Date.now(),
          });
        } catch (error: any) {
          console.error("Update preferences error:", error);
          set({
            error:
              error.response?.data?.message || "Failed to update preferences",
            isLoading: false,
          });
          throw error;
        }
      },

      updateAvatar: async (avatar: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await userApi.updateAvatar(avatar);
          set({
            user: response.data.data.user,
            isLoading: false,
            lastFetched: Date.now(),
          });
        } catch (error: any) {
          console.error("Update avatar error:", error);
          set({
            error: error.response?.data?.message || "Failed to update avatar",
            isLoading: false,
          });
          throw error;
        }
      },

      clearUser: () =>
        set({
          user: null,
          error: null,
          lastFetched: null,
        }),

      clearError: () => set({ error: null }),

      shouldRefresh: () => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > CACHE_DURATION;
      },

      invalidateCache: () => set({ lastFetched: null }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
