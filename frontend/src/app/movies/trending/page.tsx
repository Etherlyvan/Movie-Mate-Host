"use client";

import { useState, useEffect } from "react";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { MovieGrid } from "@/components/movie/MovieCard";
import { TrendingUp, Flame, Clock, Calendar } from "lucide-react";

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
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Hero Header - Much more spacious */}
        <div className="mb-20">
          <div className="text-center max-w-5xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <TrendingUp className="h-16 w-16 text-red-500 mr-4" />
                <Flame className="absolute -top-2 -right-2 h-8 w-8 text-orange-500 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                Trending Movies
              </h1>
            </div>
            <p className="text-gray-400 text-xl md:text-2xl leading-relaxed mb-12">
              Discover what&apos;s hot and trending right now across the globe
            </p>

            {/* Time Window Toggle - Larger and more spaced */}
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => setTimeWindow("day")}
                className={`px-10 py-5 rounded-2xl font-semibold transition-all duration-300 text-lg ${
                  timeWindow === "day"
                    ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-2xl transform scale-105"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 backdrop-blur-sm"
                }`}
              >
                <Clock className="h-5 w-5 inline mr-3" />
                Today&apos;s Hottest
              </button>
              <button
                onClick={() => setTimeWindow("week")}
                className={`px-10 py-5 rounded-2xl font-semibold transition-all duration-300 text-lg ${
                  timeWindow === "week"
                    ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-2xl transform scale-105"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 backdrop-blur-sm"
                }`}
              >
                <Calendar className="h-5 w-5 inline mr-3" />
                This Week&apos;s Best
              </button>
            </div>
          </div>
        </div>

        {/* Loading State - More spacious */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-red-600"></div>
              <Flame className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-orange-500" />
            </div>
            <p className="text-gray-400 text-xl">Loading trending movies...</p>
            <p className="text-gray-500 text-sm mt-2">
              This might take a moment
            </p>
          </div>
        ) : (
          <>
            {/* Stats Section - More prominent */}
            <div className="mb-16 p-8 bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-3xl backdrop-blur-sm border border-red-500/20">
              <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left space-y-4 md:space-y-0">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {movies.length} Trending Movies
                  </h3>
                  <p className="text-red-400 text-lg">
                    {timeWindow === "day"
                      ? "Updated every hour"
                      : "Updated daily"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-red-400">
                    <TrendingUp className="h-6 w-6" />
                    <span className="font-semibold text-lg">
                      {timeWindow === "day" ? "Today" : "This Week"}
                    </span>
                  </div>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Movies Grid - More spacing and larger cards */}
            <div className="mb-20">
              <MovieGrid
                movies={movies}
                variant="featured"
                showRanks={true}
                className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 md:gap-12"
              />
            </div>

            {/* Call to Action Section - Much more spacious */}
            <div className="text-center py-20 border-t border-gray-800/50">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Want to explore more?
                </h3>
                <p className="text-gray-400 mb-12 text-xl leading-relaxed">
                  Dive deeper into our vast collection of movies and discover
                  your next favorite film
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <a
                    href="/movies"
                    className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold shadow-2xl"
                  >
                    🎬 Browse All Movies
                  </a>
                  <a
                    href="/movies?category=top-rated"
                    className="px-10 py-4 bg-gray-800/50 text-gray-300 rounded-2xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm text-lg font-semibold"
                  >
                    🏆 Top Rated Movies
                  </a>
                  <a
                    href="/movies?category=popular"
                    className="px-10 py-4 bg-gray-800/50 text-gray-300 rounded-2xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm text-lg font-semibold"
                  >
                    ⭐ Popular Movies
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
