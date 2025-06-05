"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useWatchedStore } from "@/stores/watchedStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "react-hot-toast";
import RatingModal from "./RatingModal";

interface WatchedButtonProps {
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
  className?: string;
}

export default function WatchedButton({
  movieId,
  movieTitle,
  moviePoster,
  size = "md",
  variant = "icon",
  className = "",
}: WatchedButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const {
    addWatchedMovie,
    removeWatchedMovie,
    isWatched,
    isLoading,
    checkWatchedStatus,
  } = useWatchedStore();

  const [watched, setWatched] = useState(false);
  const [checking, setChecking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && movieId) {
      const checkStatus = async () => {
        setChecking(true);
        try {
          const status = await checkWatchedStatus(movieId);
          setWatched(status);
        } catch (error) {
          console.error("Error checking watched status:", error);
          setWatched(isWatched(movieId));
        } finally {
          setChecking(false);
        }
      };
      checkStatus();
    } else if (mounted) {
      setChecking(false);
      setWatched(false);
    }
  }, [movieId, isAuthenticated, mounted, checkWatchedStatus, isWatched]);

  // Update local state when store changes
  useEffect(() => {
    if (mounted) {
      setWatched(isWatched(movieId));
    }
  }, [movieId, isWatched, mounted]);

  const handleToggleWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to mark movies as watched");
      return;
    }

    if (!movieTitle) {
      toast.error("Movie information is incomplete");
      return;
    }

    try {
      if (watched) {
        await removeWatchedMovie(movieId);
        setWatched(false);
        toast.success("Removed from watched list");
      } else {
        // Show rating modal instead of directly adding
        setShowRatingModal(true);
      }
    } catch (error: any) {
      console.error("Watched toggle error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    }
  };

  const handleRatingSubmit = async (rating: number, review?: string) => {
    try {
      await addWatchedMovie(
        movieId,
        movieTitle,
        moviePoster || "",
        rating,
        review
      );
      setWatched(true);
      setShowRatingModal(false);

      if (rating > 0) {
        toast.success(`Marked as watched with ${rating}/10 rating!`);
      } else {
        toast.success("Marked as watched!");
      }
    } catch (error: any) {
      console.error("Add watched movie error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
      throw error; // Re-throw to let modal handle it
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
      <>
        <button
          onClick={handleToggleWatched}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${
              watched
                ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        >
          {watched ? (
            <EyeOff className={sizeClasses[size]} />
          ) : (
            <Eye className={sizeClasses[size]} />
          )}
          {isLoading ? "..." : watched ? "Watched" : "Mark as Watched"}
        </button>

        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
          movieTitle={movieTitle}
          moviePoster={moviePoster}
          isLoading={isLoading}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleToggleWatched}
        disabled={isLoading}
        className={`
          ${buttonSizeClasses[size]} rounded-full transition-all
          ${
            watched
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-white/80 text-gray-700 hover:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          backdrop-blur-sm shadow-lg hover:shadow-xl
          ${className}
        `}
        title={watched ? "Remove from watched" : "Mark as watched"}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : watched ? (
          <EyeOff className={`${sizeClasses[size]} fill-current`} />
        ) : (
          <Eye className={sizeClasses[size]} />
        )}
      </button>

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        movieTitle={movieTitle}
        moviePoster={moviePoster}
        isLoading={isLoading}
      />
    </>
  );
}
