"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { MovieGrid, MovieList } from "@/components/movie/MovieCard";
import { Filter, Grid, List } from "lucide-react";
import Link from "next/link";

function GenreContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const genreId = params.id as string;
  const genreName = searchParams.get("name") || "Movies";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popularity.desc");

  const sortOptions = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "release_date.desc", label: "Newest First" },
    { value: "release_date.asc", label: "Oldest First" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "title.asc", label: "A-Z" },
  ];

useEffect(() => {
  const fetchGenreMovies = async () => {
    setLoading(true);
    try {
      // Pastikan parameter diteruskan dengan benar
      const response = await movieApi.getByGenre(genreId, page, sortBy);
      const data = response.data.data;

      if (page === 1) {
        setMovies(data.results);
      } else {
        setMovies((prev) => [...prev, ...data.results]);
      }
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching genre movies:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchGenreMovies();
}, [genreId, page, sortBy]); // Pastikan sortBy ada di dependency array

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {genreName} Movies
              </h1>
              <p className="text-gray-400 mt-2">
                Discover the best {genreName.toLowerCase()} movies
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
                aria-label="Grid view"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-gray-800/50 rounded-lg px-4 py-2">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-400 mr-3">Sort by:</span>
              <select
                aria-label="Sort movies"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                  setMovies([]);
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-gray-800"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results count */}
            {movies.length > 0 && (
              <div className="text-gray-400">
                Showing {movies.length} of {totalPages * 20} movies
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && movies.length === 0 && (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-6"></div>
            <p className="text-gray-400 text-lg">
              Loading {genreName.toLowerCase()} movies...
            </p>
          </div>
        )}

        {/* Movies Display - Using imported components */}
        {movies.length > 0 && (
          <>
            <div className="mb-20">
              {viewMode === "grid" ? (
                <MovieGrid
                  movies={movies}
                  variant="default"
                  className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 md:gap-10"
                />
              ) : (
                <MovieList
                  movies={movies}
                  showActions={true}
                  className="max-w-5xl mx-auto"
                />
              )}
            </div>

            {/* Load More Button */}
            {page < totalPages && (
              <div className="text-center py-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 text-lg shadow-2xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Loading more {genreName.toLowerCase()} movies...
                    </div>
                  ) : (
                    `Load More Movies (${movies.length}/${totalPages * 20})`
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && movies.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎬</div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              No movies found
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We couldn't find any {genreName.toLowerCase()} movies. Try
              exploring other genres!
            </p>
            <Link
              href="/movies"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              Browse All Movies
            </Link>
          </div>
        )}

        {/* End of Results */}
        {page >= totalPages && movies.length > 0 && (
          <div className="text-center py-16 border-t border-gray-800/50">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-white mb-4">
                You've explored all {genreName.toLowerCase()} movies!
              </h3>
              <p className="text-gray-400 mb-8 text-lg">
                Discover more amazing movies in other genres
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm"
                >
                  🏠 Back to Home
                </Link>
                <Link
                  href="/movies"
                  className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm"
                >
                  🎬 All Movies
                </Link>
                <Link
                  href="/movies/trending"
                  className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm"
                >
                  🔥 Trending Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense
export default function GenrePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <GenreContent />
    </Suspense>
  );
}
