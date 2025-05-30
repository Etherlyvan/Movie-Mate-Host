"use client";

import { useEffect, useState } from "react";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useAuthStore } from "@/stores/authStore";
import { getImageUrl, formatDate } from "@/lib/utils";
import { Bookmark, Trash2, Play, Star, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function BookmarksPage() {
  const { isAuthenticated, user } = useAuthStore();
  const {
    bookmarks,
    isLoading,
    error,
    fetchBookmarks,
    removeBookmark,
    clearError,
  } = useBookmarkStore();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchBookmarks();
    }
  }, [mounted, isAuthenticated, fetchBookmarks]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleRemoveBookmark = async (movieId: number, movieTitle: string) => {
    if (confirm(`Remove "${movieTitle}" from bookmarks?`)) {
      try {
        await removeBookmark(movieId);
        toast.success("Removed from bookmarks");
      } catch (error) {
        toast.error("Failed to remove bookmark");
      }
    }
  };

  // Sort bookmarks by dateAdded (newest first)
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    const dateA = new Date(a.dateAdded || 0);
    const dateB = new Date(b.dateAdded || 0);
    return dateB.getTime() - dateA.getTime();
  });

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Login Required
            </h2>
            <p className="text-gray-400 mb-6">
              Please login to view your bookmarks
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
            <Bookmark className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              My Bookmarks
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              {bookmarks.length > 0
                ? `You have ${bookmarks.length} bookmarked movie${
                    bookmarks.length !== 1 ? "s" : ""
                  }`
                : "No bookmarks yet"}
            </p>
            {user && (
              <div className="text-sm text-gray-500">
                Welcome back, {user.username}!
              </div>
            )}
          </div>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full"></div>
              </div>
              <Bookmark className="relative h-16 w-16 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No bookmarks yet
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start exploring movies and bookmark your favorites to keep track
              of what you want to watch!
            </p>
            <Link
              href="/movies"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              <Play className="h-5 w-5 mr-2" />
              Discover Movies
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* FIXED: Use sorted bookmarks instead of original array */}
            {sortedBookmarks.map((bookmark) => (
              <div
                key={bookmark.movieId}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0 relative">
                    <Link href={`/movies/${bookmark.movieId}`}>
                      <div className="w-full sm:w-32 h-48 sm:h-40 relative overflow-hidden">
                        <img
                          src={
                            getImageUrl(bookmark.moviePoster) ||
                            "/placeholder-movie.jpg"
                          }
                          alt={bookmark.movieTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-movie.jpg";
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
                        <Link href={`/movies/${bookmark.movieId}`}>
                          <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors duration-200 line-clamp-2">
                            {bookmark.movieTitle}
                          </h3>
                        </Link>
                        <button
                          onClick={() =>
                            handleRemoveBookmark(
                              bookmark.movieId,
                              bookmark.movieTitle
                            )
                          }
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 ml-4"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Bookmarked {formatDate(bookmark.dateAdded)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bookmark className="h-4 w-4 text-purple-400" />
                          <span>Saved</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/movies/${bookmark.movieId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <Play className="h-4 w-4" />
                        View Details
                      </Link>
                      <button
                        onClick={() =>
                          handleRemoveBookmark(
                            bookmark.movieId,
                            bookmark.movieTitle
                          )
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
        {bookmarks.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl">
              <span className="text-gray-400">Quick actions:</span>
              <Link
                href="/movies"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Discover More Movies
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                href="/movies/trending"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Trending Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
