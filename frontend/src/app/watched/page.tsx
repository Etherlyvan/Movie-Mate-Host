"use client";

import { useEffect, useState } from "react";
import { useWatchedStore } from "@/stores/watchedStore";
import { useAuthStore } from "@/stores/authStore";
import { getImageUrl, formatDate } from "@/lib/utils";
import { Eye, Trash2, Play, Star, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function WatchedMoviesPage() {
  const { isAuthenticated, user } = useAuthStore();
  const {
    watchedMovies,
    isLoading,
    error,
    fetchWatchedMovies,
    removeWatchedMovie,
    clearError,
  } = useWatchedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchWatchedMovies();
    }
  }, [mounted, isAuthenticated, fetchWatchedMovies]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleRemoveWatched = async (movieId: number, movieTitle: string) => {
    if (confirm(`Remove "${movieTitle}" from watched list?`)) {
      try {
        await removeWatchedMovie(movieId);
        toast.success("Removed from watched list");
      } catch (error) {
        toast.error("Failed to remove from watched list");
      }
    }
  };

  // Sort watched movies by date (newest first)
  const sortedWatchedMovies = [...watchedMovies].sort((a, b) => {
    const dateA = new Date(a.dateWatched || a.dateAdded || 0);
    const dateB = new Date(b.dateWatched || b.dateAdded || 0);
    return dateB.getTime() - dateA.getTime();
  });

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Login Required
            </h2>
            <p className="text-gray-400 mb-6">
              Please login to view your watched movies
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-8 w-8 text-green-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Watched Movies
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              {watchedMovies.length > 0
                ? `You have watched ${watchedMovies.length} movie${
                    watchedMovies.length !== 1 ? "s" : ""
                  }`
                : "No watched movies yet"}
            </p>
            {user && (
              <div className="text-sm text-gray-500">
                Welcome back, {user.username}!
              </div>
            )}
          </div>
        </div>

        {/* Movies List */}
        {watchedMovies.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full"></div>
              </div>
              <Eye className="relative h-16 w-16 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No watched movies yet
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start watching movies and mark them as watched to keep track of
              your viewing history!
            </p>
            <Link
              href="/movies"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <Play className="h-5 w-5 mr-2" />
              Discover Movies
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* FIXED: Use sorted movies instead of original array */}
            {sortedWatchedMovies.map((movie) => (
              <div
                key={movie.movieId}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0 relative">
                    <Link href={`/movies/${movie.movieId}`}>
                      <div className="w-full sm:w-32 h-48 sm:h-40 relative overflow-hidden">
                        <img
                          src={getImageUrl(movie.moviePoster)}
                          alt={movie.movieTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = getImageUrl(null);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <Link href={`/movies/${movie.movieId}`}>
                          <h3 className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors duration-200 line-clamp-2">
                            {movie.movieTitle}
                          </h3>
                        </Link>
                        <button
                          onClick={() =>
                            handleRemoveWatched(movie.movieId, movie.movieTitle)
                          }
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 ml-4"
                          title="Remove from watched list"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Watched{" "}
                            {formatDate(movie.dateWatched || movie.dateAdded)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-green-400" />
                          <span>Completed</span>
                        </div>
                        {movie.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>Your rating: {movie.rating}/10</span>
                          </div>
                        )}
                      </div>

                      {movie.review && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">
                            Your Review:
                          </h4>
                          <p className="text-sm text-gray-400 italic">
                            "{movie.review}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/movies/${movie.movieId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <Play className="h-4 w-4" />
                        View Details
                      </Link>
                      <button
                        onClick={() =>
                          handleRemoveWatched(movie.movieId, movie.movieTitle)
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {watchedMovies.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl">
              <span className="text-gray-400">Quick actions:</span>
              <Link
                href="/movies"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                Discover More Movies
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                href="/bookmarks"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                View Bookmarks
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
