"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Bookmark,
  Calendar,
  Clock,
  Filter,
  X,
  Star,
  Eye,
  Heart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { getImageUrl } from "@/lib/utils";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import type { Bookmark as BookmarkType } from "@/types";

interface BookmarksTabProps {
  bookmarks: BookmarkType[];
  viewType: "grid" | "list";
  onViewTypeChange: (type: "grid" | "list") => void;
}

type SortOption = "date" | "title";
type SortDirection = "asc" | "desc";

interface FilterState {
  search: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
  dateRange: "all" | "week" | "month" | "year";
}

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time", days: null },
  { value: "week", label: "This Week", days: 7 },
  { value: "month", label: "This Month", days: 30 },
  { value: "year", label: "This Year", days: 365 },
] as const;

const SORT_OPTIONS: Array<{
  value: SortOption;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "date", label: "Date Added", icon: Calendar },
  { value: "title", label: "Title", icon: SortAsc },
];

export const BookmarksTab: React.FC<BookmarksTabProps> = ({
  bookmarks,
  viewType,
  onViewTypeChange,
}) => {
  const { removeBookmark, isLoading } = useBookmarkStore();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sortBy: "date",
    sortDirection: "desc",
    dateRange: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<number>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const ITEMS_PER_PAGE = viewType === "grid" ? 24 : 12;

  // Memoized filtered and sorted bookmarks
  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((bookmark) =>
        bookmark.movieTitle.toLowerCase().includes(searchTerm)
      );
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const dateRangeOption = DATE_RANGE_OPTIONS.find(
        (option) => option.value === filters.dateRange
      );
      if (dateRangeOption?.days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - dateRangeOption.days);

        filtered = filtered.filter(
          (bookmark) => new Date(bookmark.dateAdded) >= cutoffDate
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "date":
          comparison =
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
        case "title":
          comparison = a.movieTitle.localeCompare(b.movieTitle);
          break;
      }

      return filters.sortDirection === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [bookmarks, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredBookmarks.length / ITEMS_PER_PAGE);
  const paginatedBookmarks = filteredBookmarks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Statistics
  const stats = useMemo(() => {
    const total = filteredBookmarks.length;
    const thisWeek = filteredBookmarks.filter((bookmark) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(bookmark.dateAdded) >= weekAgo;
    }).length;

    return { total, thisWeek };
  }, [filteredBookmarks]);

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
      sortBy: "date",
      sortDirection: "desc",
      dateRange: "all",
    });
    setCurrentPage(1);
  }, []);

  const handleRemoveBookmark = useCallback(
    async (movieId: number) => {
      try {
        await removeBookmark(movieId);
      } catch (error) {
        console.error("Failed to remove bookmark:", error);
      }
    },
    [removeBookmark]
  );

  const handleBulkRemove = useCallback(async () => {
    if (selectedBookmarks.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedBookmarks).map((movieId) => removeBookmark(movieId))
      );
      setSelectedBookmarks(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Failed to remove bookmarks:", error);
    }
  }, [selectedBookmarks, removeBookmark]);

  const toggleBookmarkSelection = useCallback((movieId: number) => {
    setSelectedBookmarks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedBookmarks.size === paginatedBookmarks.length) {
      setSelectedBookmarks(new Set());
    } else {
      setSelectedBookmarks(new Set(paginatedBookmarks.map((b) => b.movieId)));
    }
  }, [selectedBookmarks.size, paginatedBookmarks]);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Bookmarks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.thisWeek}
            </div>
            <div className="text-sm text-gray-400">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {bookmarks.length}
            </div>
            <div className="text-sm text-gray-400">All Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round((stats.thisWeek / Math.max(stats.total, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Weekly Growth</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="space-y-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookmarked movies..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* View Type and Selection Toggle */}
            <div className="flex items-center gap-2">
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

              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSelectionMode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {isSelectionMode ? "Cancel" : "Select"}
              </button>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-3">
            {/* Date Range Filter */}
            <select
              aria-label="Filter by date range"
              value={filters.dateRange}
              onChange={(e) =>
                handleFilterChange(
                  "dateRange",
                  e.target.value as FilterState["dateRange"]
                )
              }
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            {SORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    filters.sortBy === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                  {filters.sortBy === option.value &&
                    (filters.sortDirection === "desc" ? (
                      <SortDesc className="h-3 w-3" />
                    ) : (
                      <SortAsc className="h-3 w-3" />
                    ))}
                </button>
              );
            })}

            {/* Clear Filters */}
            {(filters.search || filters.dateRange !== "all") && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          {/* Bulk Actions */}
          {isSelectionMode && (
            <div className="flex items-center justify-between p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  {selectedBookmarks.size === paginatedBookmarks.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <span className="text-gray-400 text-sm">
                  {selectedBookmarks.size} selected
                </span>
              </div>

              {selectedBookmarks.size > 0 && (
                <button
                  onClick={handleBulkRemove}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove ({selectedBookmarks.size})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bookmarks Display */}
      {paginatedBookmarks.length > 0 ? (
        <div
          className={
            viewType === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              : "space-y-4"
          }
        >
          {paginatedBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.movieId}
              bookmark={bookmark}
              viewType={viewType}
              isSelectionMode={isSelectionMode}
              isSelected={selectedBookmarks.has(bookmark.movieId)}
              onToggleSelection={() =>
                toggleBookmarkSelection(bookmark.movieId)
              }
              onRemove={() => handleRemoveBookmark(bookmark.movieId)}
              isLoading={isLoading}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          hasFilters={filters.search !== "" || filters.dateRange !== "all"}
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

// Bookmark Card Component
const BookmarkCard: React.FC<{
  bookmark: BookmarkType;
  viewType: "grid" | "list";
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  onRemove: () => void;
  isLoading: boolean;
}> = ({
  bookmark,
  viewType,
  isSelectionMode,
  isSelected,
  onToggleSelection,
  onRemove,
  isLoading,
}) => {
  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onRemove();
    },
    [onRemove]
  );

  const handleSelectionClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelection();
    },
    [onToggleSelection]
  );

  if (viewType === "list") {
    return (
      <div
        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <div className="flex items-center space-x-4">
          {/* Selection Checkbox */}
          {isSelectionMode && (
            <button
              onClick={handleSelectionClick}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-500 hover:border-blue-500"
              }`}
            >
              {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
            </button>
          )}

          <Link href={`/movies/${bookmark.movieId}`} className="flex-shrink-0">
            <img
              src={getImageUrl(bookmark.moviePoster, "w154")}
              alt={bookmark.movieTitle}
              className="h-20 w-14 object-cover rounded-lg ring-2 ring-gray-700 hover:ring-gray-600 transition-all"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              href={`/movies/${bookmark.movieId}`}
              className="text-white font-semibold text-lg truncate hover:text-blue-400 transition-colors block"
            >
              {bookmark.movieTitle}
            </Link>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Added{" "}
                {formatDistanceToNow(new Date(bookmark.dateAdded), {
                  addSuffix: true,
                })}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {format(new Date(bookmark.dateAdded), "MMM dd, yyyy")}
            </div>
          </div>

          {/* Remove Button */}
          {!isSelectionMode && (
            <button
              onClick={handleRemoveClick}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10 disabled:opacity-50"
              title="Remove bookmark"
              aria-label="Remove bookmark"
            >
              <Bookmark className="h-5 w-5 fill-current" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative ${
        isSelected ? "ring-2 ring-blue-500 rounded-lg" : ""
      }`}
    >
      <Link
        href={`/movies/${bookmark.movieId}`}
        className={isSelectionMode ? "pointer-events-none" : ""}
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 group-hover:scale-105">
          <div className="aspect-[2/3] relative">
            <img
              src={getImageUrl(bookmark.moviePoster, "w342")}
              alt={bookmark.movieTitle}
              className="w-full h-full object-cover"
            />

            {/* Selection Overlay */}
            {isSelectionMode && (
              <div
                className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                onClick={handleSelectionClick}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-blue-600 border-blue-600"
                      : "border-white hover:border-blue-500"
                  }`}
                >
                  {isSelected && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
              </div>
            )}

            {/* Remove Button */}
            {!isSelectionMode && (
              <button
                onClick={handleRemoveClick}
                disabled={isLoading}
                className="absolute top-2 right-2 p-2 bg-black/80 backdrop-blur-sm rounded-full text-yellow-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Remove bookmark"
                aria-label="Remove bookmark"
              >
                <Bookmark className="h-4 w-4 fill-current" />
              </button>
            )}

            {/* Date Badge */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="text-white text-xs">
                {formatDistanceToNow(new Date(bookmark.dateAdded), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>

          <div className="p-3">
            <h3 className="text-white font-medium text-sm truncate">
              {bookmark.movieTitle}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{
  hasFilters: boolean;
  onClearFilters: () => void;
}> = ({ hasFilters, onClearFilters }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 text-center">
    <Bookmark className="h-16 w-16 text-gray-600 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2">
      {hasFilters ? "No bookmarks match your filters" : "No bookmarks yet"}
    </h3>
    <p className="text-gray-400 mb-6">
      {hasFilters
        ? "Try adjusting your search criteria or filters"
        : "Start bookmarking movies to see them here"}
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
        <Heart className="h-4 w-4 mr-2" />
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

export type { BookmarksTabProps  };
