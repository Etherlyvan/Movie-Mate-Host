"use client";

import { useState, useEffect } from "react";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { MovieGrid } from "@/components/movie/MovieCard";
import { TrendingUp, Star, Award } from "lucide-react";

export default function MoviesPage() {
  const [activeTab, setActiveTab] = useState<
    "popular" | "trending" | "top-rated"
  >("popular");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const tabs = [
    {
      id: "popular",
      label: "Popular",
      icon: <Star className="h-4 w-4" />,
      description: "Most popular movies right now",
    },
    {
      id: "trending",
      label: "Trending",
      icon: <TrendingUp className="h-4 w-4" />,
      description: "What's hot this week",
    },
    {
      id: "top-rated",
      label: "Top Rated",
      icon: <Award className="h-4 w-4" />,
      description: "Highest rated movies of all time",
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

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header Section - More spacious */}
        <div className="mb-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Movies
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl leading-relaxed">
              Explore the latest and greatest movies from around the world
            </p>
          </div>
        </div>

        {/* Tabs Section - More spacing */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl transform scale-105"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white backdrop-blur-sm"
                }`}
              >
                {tab.icon}
                <span className="ml-3 text-lg">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Description - Centered */}
          {currentTab && (
            <div className="text-center">
              <p className="text-gray-400 text-lg">{currentTab.description}</p>
            </div>
          )}
        </div>

        {/* Movies Section */}
        {loading && movies.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-6"></div>
            <p className="text-gray-400 text-lg">Loading amazing movies...</p>
          </div>
        ) : (
          <>
            {/* Stats Bar - More spacious */}
            <div className="mb-12 p-6 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700/50">
              <div className="flex items-center justify-between text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="text-lg">
                    Showing{" "}
                    <span className="text-white font-semibold">
                      {movies.length}
                    </span>{" "}
                    {activeTab.replace("-", " ")} movies
                  </span>
                  {totalPages > 1 && (
                    <span className="text-sm bg-gray-700/50 px-3 py-1 rounded-full">
                      Page {page} of {totalPages}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {currentTab?.icon}
                  <span className="text-purple-400 font-medium text-lg">
                    {currentTab?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Movies Grid - Increased spacing */}
            <div className="mb-20">
              <MovieGrid
                movies={movies}
                variant="default"
                className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 md:gap-10"
              />
            </div>

            {/* Load More Section - More spacious */}
            {page < totalPages && (
              <div className="text-center py-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 text-lg shadow-2xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Loading more amazing movies...
                    </div>
                  ) : (
                    `Load More Movies (${movies.length}/${totalPages * 20})`
                  )}
                </button>
              </div>
            )}

            {/* End of Results - More spacious */}
            {page >= totalPages && movies.length > 0 && (
              <div className="text-center py-16 border-t border-gray-800/50">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    You&apos;ve explored all {activeTab.replace("-", " ")}{" "}
                    movies!
                  </h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    Ready to discover more? Check out other categories
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {activeTab !== "trending" && (
                      <button
                        onClick={() => handleTabChange("trending")}
                        className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm"
                      >
                        🔥 Check Trending
                      </button>
                    )}
                    {activeTab !== "top-rated" && (
                      <button
                        onClick={() => handleTabChange("top-rated")}
                        className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm"
                      >
                        🏆 View Top Rated
                      </button>
                    )}
                    {activeTab !== "popular" && (
                      <button
                        onClick={() => handleTabChange("popular")}
                        className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm"
                      >
                        ⭐ Popular Movies
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
