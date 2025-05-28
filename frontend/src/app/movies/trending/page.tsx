"use client";

import { useState, useEffect } from "react";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function TrendingPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<"day" | "week">("week");

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      setLoading(true);
      try {
        const response = await movieApi.getTrending(timeWindow);
        setMovies(response.data.data.results);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingMovies();
  }, [timeWindow]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Trending Movies
          </h1>
        </div>

        {/* Time Window Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeWindow("day")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeWindow === "day"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeWindow("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeWindow === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {movies.map((movie, index) => (
            <Link key={movie.id} href={`/movies/${movie.id}`} className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative">
                {/* Trending Rank */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  #{index + 1}
                </div>

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
          ))}
        </div>
      )}
    </div>
  );
}
