// frontend/src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  profile: {
    avatar?: string;
    bio?: string;
    favoriteGenres: string[];
    dateOfBirth?: string;
    country?: string;
  };
  preferences: {
    theme: string;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  createdAt: string;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL ||
              "http://localhost:3001/api"
            }/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Login failed");
          }

          // Store token in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("token", data.data.token);
          }

          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Login failed",
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL ||
              "http://localhost:3001/api"
            }/auth/register`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username, email, password }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            // Handle validation errors
            if (data.errors && Array.isArray(data.errors)) {
              const errorMessages = data.errors
                .map((err: any) => err.message)
                .join(", ");
              throw new Error(errorMessages);
            }
            throw new Error(data.message || "Registration failed");
          }

          // Store token in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("token", data.data.token);
          }

          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Registration failed",
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: () => {
        // Remove token from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          // Check localStorage for token
          if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) return;

            set({ token: storedToken });
          } else {
            return;
          }
        }

        try {
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL ||
              "http://localhost:3001/api"
            }/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${
                  token || localStorage.getItem("token")
                }`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.data.user,
              isAuthenticated: true,
              error: null,
            });
          } else {
            // Token is invalid
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
            }
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
