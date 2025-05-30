"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Grid,
  List,
  Star,
  Calendar,
  Clock,
  Film,
  SortAsc,
  SortDesc,
  Eye,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { getImageUrl } from "@/lib/utils";
import type { WatchedTabProps } from "./types";
import type { MovieLog } from "@/types";

type SortOption = "date" | "rating" | "title" | "dateWatched";
type SortDirection = "asc" | "desc";
type FilterRating = "all" | "9+" | "8+" | "7+" | "6+" | "unrated";

interface FilterState {
  search: string;
  rating: FilterRating;
  hasReview: boolean | null;
  sortBy: SortOption;
  sortDirection: SortDirection;
}

const RATING_FILTERS: Array<{
  value: FilterRating;
  label: string;
  minRating?: number;
}> = [
  { value: "all", label: "All Ratings" },
  { value: "9+", label: "9+ Stars", minRating: 9 },
  { value: "8+", label: "8+ Stars", minRating: 8 },
  { value: "7+", label: "7+ Stars", minRating: 7 },
  { value: "6+", label: "6+ Stars", minRating: 6 },
  { value: "unrated", label: "Unrated" },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "date", label: "Date Added" },
  { value: "dateWatched", label: "Date Watched" },
  { value: "rating", label: "Rating" },
  { value: "title", label: "Title" },
];

export const WatchedTab: React.FC<WatchedTabProps> = ({
  movies,
  viewType,
  onViewTypeChange,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    rating: "all",
    hasReview: null,
    sortBy: "date",
    sortDirection: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = viewType === "grid" ? 24 : 12;

  // Memoized filtered and sorted movies
  const filteredMovies = useMemo(() => {
    let filtered = [...movies];

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.movieTitle.toLowerCase().includes(searchTerm)
      );
    }

    // Apply rating filter
    if (filters.rating !== "all") {
      const ratingFilter = RATING_FILTERS.find(
        (f) => f.value === filters.rating
      );
      if (ratingFilter?.minRating) {
        filtered = filtered.filter(
          (movie) => movie.rating && movie.rating >= ratingFilter.minRating!
        );
      } else if (filters.rating === "unrated") {
        filtered = filtered.filter((movie) => !movie.rating);
      }
    }

    // Apply review filter
    if (filters.hasReview !== null) {
      filtered = filtered.filter((movie) =>
        filters.hasReview ? !!movie.review?.trim() : !movie.review?.trim()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "date":
          comparison =
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
        case "dateWatched":
          const aDate = new Date(a.dateWatched || a.dateAdded).getTime();
          const bDate = new Date(b.dateWatched || b.dateAdded).getTime();
          comparison = aDate - bDate;
          break;
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case "title":
          comparison = a.movieTitle.localeCompare(b.movieTitle);
          break;
      }

      return filters.sortDirection === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [movies, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Statistics
  const stats = useMemo(() => {
    const totalMovies = filteredMovies.length;
    const ratedMovies = filteredMovies.filter((m) => m.rating);
    const reviewedMovies = filteredMovies.filter((m) => m.review?.trim());
    const avgRating =
      ratedMovies.length > 0
        ? ratedMovies.reduce((sum, m) => sum + (m.rating || 0), 0) /
          ratedMovies.length
        : 0;

    return {
      total: totalMovies,
      rated: ratedMovies.length,
      reviewed: reviewedMovies.length,
      avgRating: avgRating.toFixed(1),
    };
  }, [filteredMovies]);

  // Event handlers
  const handleFilterChange = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const handleSortChange = useCallback((sortBy: SortOption) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortDirection:
        prev.sortBy === sortBy && prev.sortDirection === "desc"
          ? "asc"
          : "desc",
    }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      rating: "all",
      hasReview: null,
      sortBy: "date",
      sortDirection: "desc",
    });
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Movies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.avgRating}
            </div>
            <div className="text-sm text-gray-400">Avg Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.rated}
            </div>
            <div className="text-sm text-gray-400">Rated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats.reviewed}
            </div>
            <div className="text-sm text-gray-400">Reviewed</div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="space-y-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search watched movies..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* View Type Toggle */}
            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => onViewTypeChange("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewType === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewTypeChange("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewType === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                title="List view"
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Rating Filter */}
            <select
              aria-label="Filter by rating"
              value={filters.rating}
              onChange={(e) =>
                handleFilterChange("rating", e.target.value as FilterRating)
              }
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {RATING_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Review Filter */}
            <select
              aria-label="Filter by review status"
              value={
                filters.hasReview === null
                  ? "all"
                  : filters.hasReview
                  ? "reviewed"
                  : "unreviewed"
              }
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange(
                  "hasReview",
                  value === "all" ? null : value === "reviewed"
                );
              }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Movies</option>
              <option value="reviewed">With Review</option>
              <option value="unreviewed">No Review</option>
            </select>

            {/* Sort Options */}
            <div className="flex items-center gap-1">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    filters.sortBy === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {option.label}
                  {filters.sortBy === option.value &&
                    (filters.sortDirection === "desc" ? (
                      <SortDesc className="h-3 w-3" />
                    ) : (
                      <SortAsc className="h-3 w-3" />
                    ))}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {(filters.search ||
              filters.rating !== "all" ||
              filters.hasReview !== null) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Movies Display */}
      {paginatedMovies.length > 0 ? (
        <div
          className={
            viewType === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              : "space-y-4"
          }
        >
          {paginatedMovies.map((movie, index) => (
            <WatchedMovieCard
              key={`${movie.movieId}-${index}`}
              movie={movie}
              viewType={viewType}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          hasFilters={
            !!filters.search ||
            filters.rating !== "all" ||
            filters.hasReview !== null
          }
          onClearFilters={clearFilters}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

// Movie Card Component
const WatchedMovieCard: React.FC<{
  movie: MovieLog;
  viewType: "grid" | "list";
}> = ({ movie, viewType }) => {
  if (viewType === "list") {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group">
        <div className="flex items-start space-x-4">
          <Link href={`/movies/${movie.movieId}`} className="flex-shrink-0">
            <img
              src={getImageUrl(movie.moviePoster, "w154")}
              alt={movie.movieTitle}
              className="h-24 w-16 object-cover rounded-lg ring-2 ring-gray-700 group-hover:ring-gray-600 transition-all"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/movies/${movie.movieId}`}>
              <h3 className="text-white font-semibold text-lg truncate hover:text-blue-400 transition-colors">
                {movie.movieTitle}
              </h3>
            </Link>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              {movie.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                  <span className="text-white font-medium">
                    {movie.rating}/10
                  </span>
                </div>
              )}

              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDistanceToNow(
                  new Date(movie.dateWatched || movie.dateAdded),
                  { addSuffix: true }
                )}
              </div>

              {movie.review && (
                <div className="flex items-center text-purple-400">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>Reviewed</span>
                </div>
              )}
            </div>

            {movie.review && (
              <div className="mt-3 p-3 bg-gray-700/30 rounded-lg border-l-4 border-purple-500">
                <p className="text-gray-300 text-sm italic line-clamp-2">
                  "{movie.review}"
                </p>
              </div>
            )}

            <div className="mt-3 text-xs text-gray-500">
              Watched{" "}
              {format(
                new Date(movie.dateWatched || movie.dateAdded),
                "MMM dd, yyyy"
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/movies/${movie.movieId}`} className="group">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group-hover:scale-105">
        <div className="aspect-[2/3] relative">
          <img
            src={getImageUrl(movie.moviePoster, "w342")}
            alt={movie.movieTitle}
            className="w-full h-full object-cover"
          />

          {/* Rating Badge */}
          {movie.rating && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
              <Star className="h-3 w-3 text-yellow-400 mr-1 fill-current" />
              <span className="text-white text-xs font-medium">
                {movie.rating}
              </span>
            </div>
          )}

          {/* Review Indicator */}
          {movie.review && (
            <div className="absolute top-2 left-2 bg-purple-600/80 backdrop-blur-sm rounded-full p-1.5">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
          )}

          {/* Watch Date Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="text-white text-xs">
              {formatDistanceToNow(
                new Date(movie.dateWatched || movie.dateAdded),
                { addSuffix: true }
              )}
            </div>
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-white font-medium text-sm truncate">
            {movie.movieTitle}
          </h3>
        </div>
      </div>
    </Link>
  );
};

// Empty State Component
const EmptyState: React.FC<{
  hasFilters: boolean;
  onClearFilters: () => void;
}> = ({ hasFilters, onClearFilters }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 text-center">
    <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">
      {hasFilters ? "No movies match your filters" : "No watched movies yet"}
    </h3>
    <p className="text-gray-400 mb-6">
      {hasFilters
        ? "Try adjusting your search criteria or filters"
        : "Start watching movies to see them here"}
    </p>
    <div className="flex items-center justify-center gap-4">
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      )}
      <Link
        href="/movies"
        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <Eye className="h-4 w-4 mr-2" />
        Discover Movies
      </Link>
    </div>
  </div>
);

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-gray-400">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Next
      </button>
    </div>
  );
};
