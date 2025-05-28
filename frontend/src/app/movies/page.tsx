"use client";

import { useState, useEffect } from "react";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
import { TrendingUp, Star } from "lucide-react";
import Link from "next/link";

export default function MoviesPage() {
  const [activeTab, setActiveTab] = useState<
    "popular" | "trending" | "top-rated"
  >("popular");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const tabs = [
    { id: "popular", label: "Popular", icon: <Star className="h-4 w-4" /> },
    {
      id: "trending",
      label: "Trending",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: "top-rated",
      label: "Top Rated",
      icon: <Star className="h-4 w-4 text-yellow-500" />,
    },
  ] as const;

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let response;
        switch (activeTab) {
          case "trending":
            response = await movieApi.getTrending();
            break;
          case "top-rated":
            response = await movieApi.getTopRated(page);
            break;
          default:
            response = await movieApi.getPopular(page);
        }

        const data = response.data.data;
        if (page === 1) {
          setMovies(data.results);
        } else {
          setMovies((prev) => [...prev, ...data.results]);
        }
        setTotalPages(data.total_pages || 1);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [activeTab, page]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setPage(1);
    setMovies([]);
  };

  const loadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Discover Movies
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Explore the latest and greatest movies from around the world
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      {loading && movies.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group"
              >
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
            ))}
          </div>

          {/* Load More Button */}
          {page < totalPages && (
            <div className="text-center mt-12">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Loading..." : "Load More Movies"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
