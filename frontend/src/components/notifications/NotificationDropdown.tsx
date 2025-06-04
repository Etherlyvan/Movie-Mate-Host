// frontend/src/components/notifications/NotificationDropdown.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Check, X, Film, Star, Clock } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Notification {
  id: string;
  type: "new-release" | "recommendation" | "reminder" | "system";
  title: string;
  message: string;
  movieId?: number;
  moviePoster?: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isSubscribed, permission } = useNotifications();

  // Mock notifications for demo
  useEffect(() => {
    // In real app, fetch from API
    setNotifications([
      {
        id: "1",
        type: "new-release",
        title: "New Movie Released!",
        message: "Spider-Man: No Way Home is now available",
        movieId: 634649,
        moviePoster: "/poster1.jpg",
        isRead: false,
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        type: "recommendation",
        title: "Movie Recommendation",
        message: 'Based on your preferences, you might like "Inception"',
        movieId: 27205,
        moviePoster: "/poster2.jpg",
        isRead: false,
        createdAt: "2024-01-14T15:20:00Z",
      },
      {
        id: "3",
        type: "reminder",
        title: "Watchlist Reminder",
        message: "You have 5 movies in your watchlist waiting to be watched",
        isRead: true,
        createdAt: "2024-01-13T09:15:00Z",
      },
    ]);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new-release":
        return <Film className="h-4 w-4 text-blue-400" />;
      case "recommendation":
        return <Star className="h-4 w-4 text-yellow-400" />;
      case "reminder":
        return <Clock className="h-4 w-4 text-green-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        title="Notifications"
        aria-label="Notifications"
      >
        {isSubscribed && permission === "granted" ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5" />
        )}

        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-800 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Mark all read
                </Button>
              )}
            </div>

            {(!isSubscribed || permission !== "granted") && (
              <div className="mt-2 p-2 bg-yellow-600/20 border border-yellow-600/30 rounded text-xs text-yellow-400">
                <Link href="/settings" className="hover:underline">
                  Enable push notifications in settings
                </Link>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative px-4 py-3 hover:bg-gray-800/50 transition-colors border-l-2 ${
                      notification.isRead
                        ? "border-transparent"
                        : "border-blue-500 bg-blue-500/5"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                notification.isRead
                                  ? "text-gray-300"
                                  : "text-white"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                notification.isRead
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                removeNotification(notification.id)
                              }
                              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Movie Link */}
                        {notification.movieId && (
                          <Link
                            href={`/movies/${notification.movieId}`}
                            onClick={() => {
                              markAsRead(notification.id);
                              setIsOpen(false);
                            }}
                            className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            View Movie →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-blue-400 hover:text-blue-300 hover:underline"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
