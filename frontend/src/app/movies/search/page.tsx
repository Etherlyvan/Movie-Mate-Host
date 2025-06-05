"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { MovieGrid } from "@/components/movie/MovieCard";
import { Search, Grid, List, Filter } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search function
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    searchMovies(query, 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8 mt-20">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
            🔍 Search Movies
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <input
                type="text"
                placeholder="Search for movies, actors, directors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Search Results Info & Controls */}
          {query && !loading && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="text-gray-400">
                {totalResults > 0 ? (
                  <p>
                    Found{" "}
                    <span className="text-white font-semibold">
                      {totalResults.toLocaleString()}
                    </span>{" "}
                    results for{" "}
                    <span className="text-blue-400 font-medium">"{query}"</span>
                  </p>
                ) : (
                  <p>
                    No results found for{" "}
                    <span className="text-red-400">"{query}"</span>
                  </p>
                )}
              </div>

              {/* View Mode Toggle */}
              {movies.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm mr-2">View:</span>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400 hover:text-white"
                    }`}
                    title="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400 hover:text-white"
                    }`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && movies.length === 0 && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-400 text-lg">Searching movies...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Search Failed</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => searchMovies(query, 1)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search Results */}
        {movies.length > 0 && (
          <div>
            {/* Grid View */}
            {viewMode === "grid" && (
              <MovieGrid
                movies={movies}
                variant="default"
                className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
              />
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {movies.map((movie) => (
                  <SearchMovieListItem key={movie.id} movie={movie} />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {page < totalPages && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    `Load More Movies (${movies.length} of ${totalResults})`
                  )}
                </button>
              </div>
            )}

            {/* Results Summary */}
            <div className="text-center mt-8 text-gray-400 text-sm">
              Showing {movies.length} of {totalResults.toLocaleString()} results
            </div>
          </div>
        )}

        {/* Empty State */}
        {!query && !loading && (
          <div className="text-center py-20">
            <div className="mb-8">
              <Search className="mx-auto h-24 w-24 text-gray-600 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Discover Amazing Movies
              </h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                Search through millions of movies to find your next favorite
                film
              </p>
            </div>

            {/* Popular Search Suggestions */}
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-500 text-sm mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Avengers",
                  "Batman",
                  "Star Wars",
                  "Marvel",
                  "Disney",
                  "Horror",
                  "Comedy",
                  "Action",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full text-sm transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {query && !loading && movies.length === 0 && totalResults === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-500 text-6xl mb-6">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              No Movies Found
            </h3>
            <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto">
              We couldn't find any movies matching "{query}". Try adjusting your
              search terms.
            </p>
            <div className="space-y-3">
              <p className="text-gray-500 text-sm">Suggestions:</p>
              <ul className="text-gray-400 text-sm space-y-1 max-w-md mx-auto">
                <li>• Check your spelling</li>
                <li>• Try more general terms</li>
                <li>• Use movie titles instead of descriptions</li>
                <li>• Search for actors or directors</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom List Item Component for Search Results
const SearchMovieListItem: React.FC<{ movie: Movie }> = ({ movie }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 p-6 group hover:scale-[1.01]">
      <div className="flex space-x-6">
        {/* Poster */}
        <div className="flex-shrink-0 w-20 h-30 sm:w-24 sm:h-36 bg-gray-700 rounded-lg overflow-hidden relative">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/placeholder-movie.jpg";
            }}
          />
        </div>

        {/* Movie Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-xl mb-3 group-hover:text-blue-400 transition-colors duration-200 line-clamp-1">
            {movie.title}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {movie.overview || "No overview available for this movie."}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center text-gray-400">
              <span className="mr-2">📅</span>
              <span>
                {movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "TBA"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⭐</span>
              <span className="text-yellow-400 font-medium">
                {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
              </span>
            </div>
            <div className="flex items-center text-gray-400">
              <span className="mr-2">👥</span>
              <span>
                {movie.vote_count ? movie.vote_count.toLocaleString() : "0"}{" "}
                votes
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <a
            href={`/movies/${movie.id}`}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-4 group-hover:translate-x-0"
          >
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense wrapper
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-400 text-lg">Loading search...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
