"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
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
        // For now, we'll use the discover endpoint simulation
        // In a real app, you'd have a specific genre endpoint
        const response = await movieApi.getPopular(page);
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
  }, [genreId, page, sortBy]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {genreName} Movies
          </h1>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600 dark:text-gray-400 mr-2">
              Sort by:
            </span>
            <select
              aria-label="Sort movies"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && movies.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Movies Display */}
      {movies.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {movies.map((movie) => (
                <MovieListItem key={movie.id} movie={movie} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {page < totalPages && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Loading..." : "Load More Movies"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No movies found in this genre.
          </p>
        </div>
      )}
    </div>
  );
}

// Movie Card Component
const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  return (
    <Link href={`/movies/${movie.id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 relative">
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
            ⭐ {formatRating(movie.vote_average)}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {movie.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {getYearFromDate(movie.release_date)}
          </p>
        </div>
      </div>
    </Link>
  );
};

// Movie List Item Component
const MovieListItem: React.FC<{ movie: Movie }> = ({ movie }) => {
  return (
    <Link href={`/movies/${movie.id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 p-4">
        <div className="flex space-x-4">
          <div className="flex-shrink-0 w-20 h-30 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {movie.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
              {movie.overview}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{getYearFromDate(movie.release_date)}</span>
              <span className="flex items-center">
                ⭐ {formatRating(movie.vote_average)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Main component with Suspense
export default function GenrePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <GenreContent />
    </Suspense>
  );
}
