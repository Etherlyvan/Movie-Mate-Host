// frontend/src/stores/notificationStore.ts - Support movie notifications
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Notification {
  id: string;
  type: "bookmark" | "watched" | "rating" | "system";
  title: string;
  message: string;
  movieId?: number;
  movieTitle?: string;
  rating?: number;
  isRead: boolean;
  createdAt: string;
  url?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  // Actions
  addNotification: (
    notification: Omit<Notification, "id" | "isRead" | "createdAt">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const newNotifications = [notification, ...state.notifications].slice(
            0,
            50 // Keep only last 50 notifications
          );
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter((n) => !n.isRead).length,
          };
        });

        // No browser notification to prevent duplicates with push notifications
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(
            (n) => n.id !== id
          );
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: "notification-storage",
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
