// frontend/src/components/ui/BookmarkButton.tsx
"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "react-hot-toast";

interface BookmarkButtonProps {
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
  className?: string;
}

export default function BookmarkButton({
  movieId,
  movieTitle,
  moviePoster,
  size = "md",
  variant = "icon",
  className = "",
}: BookmarkButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const {
    addBookmark,
    removeBookmark,
    isBookmarked,
    isLoading,
    checkBookmarkStatus,
  } = useBookmarkStore();

  const [bookmarked, setBookmarked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && movieId) {
      const checkStatus = async () => {
        setChecking(true);
        try {
          const status = await checkBookmarkStatus(movieId);
          setBookmarked(status);
        } catch (error) {
          console.error("Error checking bookmark status:", error);
          // Fallback to store state
          setBookmarked(isBookmarked(movieId));
        } finally {
          setChecking(false);
        }
      };
      checkStatus();
    } else if (mounted) {
      setChecking(false);
      setBookmarked(false);
    }
  }, [movieId, isAuthenticated, mounted, checkBookmarkStatus, isBookmarked]);

  // Update local state when store changes
  useEffect(() => {
    if (mounted) {
      setBookmarked(isBookmarked(movieId));
    }
  }, [movieId, isBookmarked, mounted]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to bookmark movies");
      return;
    }

    if (!movieTitle) {
      toast.error("Movie information is incomplete");
      return;
    }

    try {
      if (bookmarked) {
        await removeBookmark(movieId);
        setBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await addBookmark(movieId, movieTitle, moviePoster || "");
        setBookmarked(true);
        toast.success("Added to bookmarks");
      }
    } catch (error: any) {
      console.error("Bookmark toggle error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    }
  };

  // Don't render on server or if not authenticated
  if (!mounted || !isAuthenticated) {
    return null;
  }

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const buttonSizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  if (checking) {
    return (
      <div className={`${buttonSizeClasses[size]} ${className}`}>
        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded-full h-full w-full"></div>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleToggleBookmark}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${
            bookmarked
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {bookmarked ? (
          <BookmarkCheck className={sizeClasses[size]} />
        ) : (
          <Bookmark className={sizeClasses[size]} />
        )}
        {isLoading ? "..." : bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={`
        ${buttonSizeClasses[size]} rounded-full transition-all
        ${
          bookmarked
            ? "bg-yellow-500 text-white hover:bg-yellow-600"
            : "bg-white/80 text-gray-700 hover:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        backdrop-blur-sm shadow-lg hover:shadow-xl
        ${className}
      `}
      title={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : bookmarked ? (
        <BookmarkCheck className={`${sizeClasses[size]} fill-current`} />
      ) : (
        <Bookmark className={sizeClasses[size]} />
      )}
    </button>
  );
}
