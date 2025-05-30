"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Movie } from "@/types";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useWatchedStore } from "@/stores/watchedStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "react-hot-toast";
import {
  Star,
  Info,
  Calendar,
  Eye,
  EyeOff,
  Bookmark,
  BookmarkCheck,
  Play,
} from "lucide-react";

// [MovieCardProps dan MovieCard component tetap sama seperti sebelumnya]
interface MovieCardProps {
  movie: Movie;
  variant?: "default" | "featured" | "compact" | "large" | "hero";
  showRank?: boolean;
  rank?: number;
  className?: string;
  showHoverActions?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  variant = "default",
  showRank = false,
  rank,
  className = "",
  showHoverActions = true,
}) => {
  // [Semua kode MovieCard tetap sama]
  const [imageLoaded, setImageLoaded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [watched, setWatched] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [watchedLoading, setWatchedLoading] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { addBookmark, removeBookmark, isBookmarked, checkBookmarkStatus } =
    useBookmarkStore();

  const { addWatchedMovie, removeWatchedMovie, isWatched, checkWatchedStatus } =
    useWatchedStore();

  const cardVariants = {
    default: {
      container: "w-48 md:w-52",
      poster: "aspect-[2/3]",
      title: "text-sm md:text-base",
      info: "text-xs md:text-sm",
    },
    featured: {
      container: "w-52 md:w-60",
      poster: "aspect-[2/3]",
      title: "text-base md:text-lg",
      info: "text-sm",
    },
    compact: {
      container: "w-40 md:w-44",
      poster: "aspect-[2/3]",
      title: "text-xs md:text-sm",
      info: "text-xs",
    },
    large: {
      container: "w-56 md:w-64",
      poster: "aspect-[2/3]",
      title: "text-base md:text-xl",
      info: "text-sm md:text-base",
    },
    hero: {
      container: "w-64 md:w-72",
      poster: "aspect-[2/3]",
      title: "text-lg md:text-2xl",
      info: "text-base md:text-lg",
    },
  };

  const currentVariant = cardVariants[variant];

  // Check bookmark and watched status on mount
  useEffect(() => {
    if (isAuthenticated && movie.id) {
      const checkStatuses = async () => {
        try {
          const [bookmarkStatus, watchedStatus] = await Promise.all([
            checkBookmarkStatus(movie.id),
            checkWatchedStatus(movie.id),
          ]);
          setBookmarked(bookmarkStatus);
          setWatched(watchedStatus);
        } catch (error) {
          setBookmarked(isBookmarked(movie.id));
          setWatched(isWatched(movie.id));
        }
      };
      checkStatuses();
    } else {
      setBookmarked(false);
      setWatched(false);
    }
  }, [
    movie.id,
    isAuthenticated,
    checkBookmarkStatus,
    checkWatchedStatus,
    isBookmarked,
    isWatched,
  ]);

  // Update local state when stores change
  useEffect(() => {
    setBookmarked(isBookmarked(movie.id));
    setWatched(isWatched(movie.id));
  }, [movie.id, isBookmarked, isWatched]);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Tambahkan ini

    if (!isAuthenticated) {
      toast.error("Please login to bookmark movies");
      return;
    }

    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(movie.id);
        setBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await addBookmark(movie.id, movie.title, movie.poster_path || "");
        setBookmarked(true);
        toast.success("Added to bookmarks");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleWatchedToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Tambahkan ini

    if (!isAuthenticated) {
      toast.error("Please login to mark movies as watched");
      return;
    }

    setWatchedLoading(true);
    try {
      if (watched) {
        await removeWatchedMovie(movie.id);
        setWatched(false);
        toast.success("Removed from watched list");
      } else {
        await addWatchedMovie(movie.id, movie.title, movie.poster_path || "");
        setWatched(true);
        toast.success("Marked as watched");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setWatchedLoading(false);
    }
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Tambahkan ini

    // Use router.push instead of window.location.href
    window.location.href = `/movies/${movie.id}`;
  };

  return (
    <div
      className={`group flex-shrink-0 ${currentVariant.container} ${className}`}
    >
      <div className="relative">
        {/* Wrapper Link - Handle click only when not interacting with buttons */}
        <Link
          href={`/movies/${movie.id}`}
          className="block"
          onClick={(e) => {
            // Prevent navigation if clicking on buttons
            const target = e.target as HTMLElement;
            if (target.closest("button")) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div
            className={`relative ${currentVariant.poster} bg-gray-800 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2`}
          >
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 animate-pulse" />
            )}

            {/* Movie Poster */}
            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } group-hover:scale-110`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getImageUrl(null);
                setImageLoaded(true);
              }}
            />

            {/* Rank Badge */}
            {showRank && rank && (
              <div className="absolute top-3 left-3 z-20">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                  {rank}
                </div>
              </div>
            )}

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 z-20">
              <div className="bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20 shadow-lg">
                <Star className="h-3 w-3 inline text-yellow-400 mr-1" />
                {formatRating(movie.vote_average)}
              </div>
            </div>

            {/* Status Badges - Hide on hover */}
            {isAuthenticated && (bookmarked || watched) && (
              <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1.5 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                {bookmarked && (
                  <div className="bg-yellow-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-lg">
                    <Bookmark className="h-3 w-3 mr-1" />
                    Saved
                  </div>
                )}
                {watched && (
                  <div className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-lg">
                    <Eye className="h-3 w-3 mr-1" />
                    Watched
                  </div>
                )}
              </div>
            )}

            {/* Watched Overlay */}
            {watched && (
              <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                <div className="bg-green-600/90 backdrop-blur-sm text-white p-2 rounded-full">
                  <Eye className="h-6 w-6" />
                </div>
              </div>
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Hover Actions - IMPROVED EVENT HANDLING */}
            {showHoverActions && (
              <div
                className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
                onClick={(e) => {
                  // Prevent any click events from bubbling up
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {/* Main Action Button - View Details */}
                <button
                  onClick={handleInfoClick}
                  className="w-full bg-white/95 hover:bg-white text-gray-900 font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transform hover:scale-105 z-30"
                  type="button"
                >
                  <Info className="h-4 w-4 mr-2" />
                  View Details
                </button>

                {/* Secondary Actions */}
                {isAuthenticated && (
                  <div
                    className="flex space-x-2 z-30"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <button
                      onClick={handleBookmarkToggle}
                      disabled={bookmarkLoading}
                      type="button"
                      className={`flex-1 backdrop-blur-md font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center border ${
                        bookmarked
                          ? "bg-yellow-600/90 text-white border-yellow-500/50"
                          : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                      } ${
                        bookmarkLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {bookmarkLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                      ) : bookmarked ? (
                        <BookmarkCheck className="h-4 w-4 mr-1 fill-current" />
                      ) : (
                        <Bookmark className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-xs">
                        {bookmarked ? "Saved" : "Save"}
                      </span>
                    </button>

                    <button
                      onClick={handleWatchedToggle}
                      disabled={watchedLoading}
                      type="button"
                      className={`flex-1 backdrop-blur-md font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center border ${
                        watched
                          ? "bg-green-600/90 text-white border-green-500/50"
                          : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                      } ${
                        watchedLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {watchedLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                      ) : watched ? (
                        <Eye className="h-4 w-4 mr-1" />
                      ) : (
                        <EyeOff className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-xs">
                        {watched ? "Watched" : "Watch"}
                      </span>
                    </button>
                  </div>
                )}

                {/* Login prompt */}
                {!isAuthenticated && (
                  <div className="text-center mt-2">
                    <Link
                      href="/login"
                      className="text-xs text-blue-300 hover:text-blue-100 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Login to bookmark & track
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </Link>

        {/* Movie Info - Outside the link to prevent conflicts */}
        <div className="mt-4 px-1 space-y-2">
          <Link href={`/movies/${movie.id}`}>
            <h3
              className={`font-bold text-white mb-1 line-clamp-2 group-hover:text-red-400 transition-colors duration-200 ${currentVariant.title}`}
            >
              {movie.title}
            </h3>
          </Link>

          <div
            className={`flex items-center justify-between text-gray-400 ${currentVariant.info}`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 opacity-70" />
                <span>{getYearFromDate(movie.release_date)}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-400" />
                <span>{formatRating(movie.vote_average)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            {isAuthenticated && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  type="button"
                  className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                  title={
                    bookmarked ? "Remove from bookmarks" : "Add to bookmarks"
                  }
                >
                  <Bookmark
                    className={`h-3 w-3 ${
                      bookmarked
                        ? "fill-current text-yellow-400"
                        : "text-gray-400"
                    }`}
                  />
                </button>
                <button
                  onClick={handleWatchedToggle}
                  disabled={watchedLoading}
                  type="button"
                  className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                  title={watched ? "Mark as unwatched" : "Mark as watched"}
                >
                  <Eye
                    className={`h-3 w-3 ${
                      watched ? "text-green-400" : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Status Indicators */}
          {(bookmarked || watched) && (
            <div className="flex gap-2 text-xs">
              {bookmarked && (
                <div className="flex items-center text-yellow-400">
                  <BookmarkCheck className="h-3 w-3 mr-1" />
                  <span>Bookmarked</span>
                </div>
              )}
              {watched && (
                <div className="flex items-center text-green-400">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>Watched</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Movie List Item Component - NEW ADDITION
interface MovieListItemProps {
  movie: Movie;
  showActions?: boolean;
}

export const MovieListItem: React.FC<MovieListItemProps> = ({
  movie,
  showActions = true,
}) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [watched, setWatched] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [watchedLoading, setWatchedLoading] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { addBookmark, removeBookmark, isBookmarked, checkBookmarkStatus } =
    useBookmarkStore();
  const { addWatchedMovie, removeWatchedMovie, isWatched, checkWatchedStatus } =
    useWatchedStore();

  // Check bookmark and watched status on mount
  useEffect(() => {
    if (isAuthenticated && movie.id) {
      const checkStatuses = async () => {
        try {
          const [bookmarkStatus, watchedStatus] = await Promise.all([
            checkBookmarkStatus(movie.id),
            checkWatchedStatus(movie.id),
          ]);
          setBookmarked(bookmarkStatus);
          setWatched(watchedStatus);
        } catch (error) {
          setBookmarked(isBookmarked(movie.id));
          setWatched(isWatched(movie.id));
        }
      };
      checkStatuses();
    }
  }, [
    movie.id,
    isAuthenticated,
    checkBookmarkStatus,
    checkWatchedStatus,
    isBookmarked,
    isWatched,
  ]);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to bookmark movies");
      return;
    }

    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(movie.id);
        setBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await addBookmark(movie.id, movie.title, movie.poster_path || "");
        setBookmarked(true);
        toast.success("Added to bookmarks");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleWatchedToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to mark movies as watched");
      return;
    }

    setWatchedLoading(true);
    try {
      if (watched) {
        await removeWatchedMovie(movie.id);
        setWatched(false);
        toast.success("Removed from watched list");
      } else {
        await addWatchedMovie(movie.id, movie.title, movie.poster_path || "");
        setWatched(true);
        toast.success("Marked as watched");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setWatchedLoading(false);
    }
  };

  return (
    <Link href={`/movies/${movie.id}`} className="group">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 p-4 group-hover:scale-[1.02]">
        <div className="flex space-x-4">
          {/* Poster */}
          <div className="flex-shrink-0 w-24 h-36 bg-gray-700 rounded-lg overflow-hidden relative">
            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getImageUrl(null);
              }}
            />
            {/* Watched Overlay */}
            {watched && (
              <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                <div className="bg-green-600/90 backdrop-blur-sm text-white p-1 rounded-full">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-purple-400 transition-colors duration-200 line-clamp-1">
              {movie.title}
            </h3>

            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {movie.overview || "No overview available."}
            </p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{getYearFromDate(movie.release_date)}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-white font-medium">
                  {formatRating(movie.vote_average)}
                </span>
              </div>
              {/* Status Badges */}
              {bookmarked && (
                <div className="flex items-center text-yellow-400">
                  <Bookmark className="h-4 w-4 mr-1 fill-current" />
                  <span className="text-xs">Saved</span>
                </div>
              )}
              {watched && (
                <div className="flex items-center text-green-400">
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="text-xs">Watched</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleBookmarkToggle}
                    disabled={bookmarkLoading}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      bookmarked
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600"
                    } ${
                      bookmarkLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title={bookmarked ? "Remove bookmark" : "Add bookmark"}
                  >
                    {bookmarkLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    ) : (
                      <Bookmark
                        className={`h-5 w-5 ${
                          bookmarked ? "fill-current" : ""
                        }`}
                      />
                    )}
                  </button>
                  <button
                    onClick={handleWatchedToggle}
                    disabled={watchedLoading}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      watched
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600"
                    } ${watchedLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={watched ? "Mark as unwatched" : "Mark as watched"}
                  >
                    {watchedLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    ) : watched ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>
                </>
              ) : (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="p-3 bg-purple-600 rounded-lg text-white">
                    <Play className="h-5 w-5" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Movie Grid Component
interface MovieGridProps {
  movies: Movie[];
  variant?: "default" | "featured" | "compact" | "large" | "hero";
  showRanks?: boolean;
  className?: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  variant = "default",
  showRanks = false,
  className = "",
}) => {
  const defaultGridCols =
    "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 md:gap-10";

  const gridCols = {
    default: defaultGridCols,
    featured:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 md:gap-12",
    compact:
      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 md:gap-8",
    large:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 md:gap-16",
    hero: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16 md:gap-20",
  };

  return (
    <div className={`grid ${className || gridCols[variant]}`}>
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          variant={variant}
          showRank={showRanks}
          rank={showRanks ? index + 1 : undefined}
        />
      ))}
    </div>
  );
};

// Movie List Component - NEW ADDITION
interface MovieListProps {
  movies: Movie[];
  showActions?: boolean;
  className?: string;
}

export const MovieList: React.FC<MovieListProps> = ({
  movies,
  showActions = true,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {movies.map((movie) => (
        <MovieListItem key={movie.id} movie={movie} showActions={showActions} />
      ))}
    </div>
  );
};

// Movie Row Component
interface MovieRowProps {
  movies: Movie[];
  variant?: "default" | "featured" | "compact" | "large" | "hero";
  showRanks?: boolean;
  className?: string;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  movies,
  variant = "default",
  showRanks = false,
  className = "",
}) => {
  return (
    <div className={`overflow-x-auto scrollbar-hide ${className}`}>
      <div className="flex space-x-6 md:space-x-8 pb-6 px-1">
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            variant={variant}
            showRank={showRanks}
            rank={showRanks ? index + 1 : undefined}
          />
        ))}
      </div>
    </div>
  );
};
