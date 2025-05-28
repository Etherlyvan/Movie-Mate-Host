"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
import Link from "next/link";
import { Search } from "lucide-react";

// Create a separate component for the search functionality
function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Simple search function without debounce for now
  const searchMovies = useCallback(
    async (searchQuery: string, searchPage: number = 1) => {
      if (!searchQuery.trim()) {
        setMovies([]);
        setTotalResults(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await movieApi.search(searchQuery, searchPage);
        const data = response.data.data;

        if (searchPage === 1) {
          setMovies(data.results);
        } else {
          setMovies((prev) => [...prev, ...data.results]);
        }

        setTotalPages(data.total_pages);
        setTotalResults(data.total_results);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search movies");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Search when query changes with delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      searchMovies(query, 1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, searchMovies]);

  // Initial search on page load
  useEffect(() => {
    if (initialQuery) {
      searchMovies(initialQuery, 1);
    }
  }, [initialQuery, searchMovies]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchMovies(query, nextPage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Search Movies
        </h1>

        {/* Search Input */}
        <div className="relative max-w-2xl items-center mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search for movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Search Results Info */}
        {query && !loading && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {totalResults > 0
              ? `Found ${totalResults.toLocaleString()} results for "${query}"`
              : `No results found for "${query}"`}
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && movies.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => searchMovies(query, 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search Results */}
      {movies.length > 0 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700">
                    <img
                      src={getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder-movie.jpg";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{getYearFromDate(movie.release_date)}</span>
                      <span className="flex items-center">
                        ⭐ {formatRating(movie.vote_average)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {page < totalPages && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {loading ? "Loading..." : "Load More Movies"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!query && !loading && (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Search for Movies
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a movie title to start searching
          </p>
        </div>
      )}
    </div>
  );
}

// Main component with Suspense wrapper
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
