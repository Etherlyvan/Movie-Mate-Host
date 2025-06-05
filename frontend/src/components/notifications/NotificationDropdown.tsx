// frontend/src/components/notifications/NotificationDropdown.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  X,
  Film,
  Star,
  Bookmark,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNotificationStore } from "@/stores/notificationStore";
import Link from "next/link";

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationStore();

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "bookmark":
        return <Bookmark className="h-4 w-4 text-yellow-400" />;
      case "watched":
        return <Eye className="h-4 w-4 text-green-400" />;
      case "rating":
        return <Star className="h-4 w-4 text-blue-400" />;
      case "system":
        return <Bell className="h-4 w-4 text-gray-400" />;
      default:
        return <Film className="h-4 w-4 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "bookmark":
        return "border-yellow-500";
      case "watched":
        return "border-green-500";
      case "rating":
        return "border-blue-500";
      case "system":
        return "border-gray-500";
      default:
        return "border-blue-500";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
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
        <Bell className="h-5 w-5" />

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
            <p className="text-xs text-gray-400 mt-1">
              Your movie activity updates
            </p>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-xs mt-1">
                  Bookmark or watch movies to get notifications!
                </p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative px-4 py-3 hover:bg-gray-800/50 transition-colors border-l-2 ${
                      notification.isRead
                        ? "border-transparent"
                        : getNotificationColor(notification.type) +
                          " bg-gray-800/20"
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

                            {/* Movie Info */}
                            {notification.movieTitle && (

                                <div className="flex-1">
                                  <p className="text-white font-medium">
                                    {notification.movieTitle}
                                  </p>
                                  {notification.rating && (
                                    <div className="flex items-center mt-1">
                                      <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                      <span className="text-yellow-400">
                                        {notification.rating}/10
                                      </span>
                                    </div>
                                  )}
                                </div>
                              
                            )}

                            <p className="text-xs text-gray-500 mt-2">
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
            <div className="p-3 border-t border-gray-800 space-y-2">
              <button
                onClick={() => {
                  clearAll();
                  setIsOpen(false);
                }}
                className="block w-full text-center text-sm text-gray-400 hover:text-gray-300 hover:underline"
              >
                Clear all notifications
              </button>

              <div className="text-xs text-gray-500 text-center">
                Push notifications are also sent to your device
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
