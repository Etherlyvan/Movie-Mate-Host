// frontend/src/stores/userStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UserPreferences } from "@/types";
import { userApi, ProfileData } from "@/lib/api";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchUser: () => Promise<void>;
  updateProfile: (profileData: ProfileData) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<{ url: string }>;
  updateAvatar: (avatar: string) => Promise<void>;

  // NEW: Push notification methods
  updatePushSubscription: (subscription: any) => Promise<void>;
  removePushSubscription: () => Promise<void>;

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

      updateProfile: async (profileData: ProfileData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await userApi.updateProfile(profileData);
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

      uploadAvatar: async (file: File): Promise<{ url: string }> => {
        set({ isLoading: true, error: null });

        try {
          const formData = new FormData();
          formData.append("avatar", file);

          const response = await userApi.uploadAvatar(formData);

          // Update user with new avatar URL
          const currentUser = get().user;
          if (currentUser) {
            const newAvatarUrl =
              response.data.data?.avatarUrl || response.data.url;
            set({
              user: {
                ...currentUser,
                profile: {
                  ...currentUser.profile,
                  avatar: newAvatarUrl,
                },
              },
              isLoading: false,
              lastFetched: Date.now(),
            });

            return { url: newAvatarUrl };
          }

          return { url: response.data.data?.avatarUrl || response.data.url };
        } catch (error: any) {
          console.error("Upload avatar error:", error);
          set({
            error: error.response?.data?.message || "Failed to upload avatar",
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

      // NEW: Push notification methods
      updatePushSubscription: async (subscription: any) => {
        const currentUser = get().user;
        if (currentUser) {
          // Update local state immediately for better UX
          set({
            user: {
              ...currentUser,
              pushSubscription: subscription,
              preferences: {
                ...currentUser.preferences,
                notifications: {
                  ...currentUser.preferences?.notifications,
                  push: true,
                },
              },
            },
            lastFetched: Date.now(),
          });
        }
      },

      removePushSubscription: async () => {
        const currentUser = get().user;
        if (currentUser) {
          // Update local state immediately for better UX
          const updatedUser = { ...currentUser };
          delete updatedUser.pushSubscription;

          set({
            user: {
              ...updatedUser,
              preferences: {
                ...currentUser.preferences,
                notifications: {
                  ...currentUser.preferences?.notifications,
                  push: false,
                },
              },
            },
            lastFetched: Date.now(),
          });
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
