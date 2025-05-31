"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { movieApi } from "@/lib/api";
import { Movie } from "@/types";
import { MovieGrid, MovieList } from "@/components/movie/MovieCard";
import { TrendingUp, Star, Award, Filter, Grid, List } from "lucide-react";

// Separate component to handle search params
const MoviesContent = () => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const genreParam = searchParams.get("genre");
  const genreNameParam = searchParams.get("name");

  // Debug: Log parameters
  console.log("URL Parameters:", {
    category: categoryParam,
    genre: genreParam,
    genreName: genreNameParam,
  });

  // Determine if this is a genre view
  const isGenreView = !!(genreParam && genreNameParam);

  // Determine initial tab based on URL params
  const getInitialTab = (): "popular" | "top-rated" => {
    if (categoryParam === "top-rated") return "top-rated";
    return "popular";
  };

  const [activeTab, setActiveTab] = useState<"popular" | "top-rated">(
    getInitialTab()
  );
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Add sort and view mode states
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const tabs = [
    {
      id: "popular",
      label: "Popular",
      icon: <Star className="h-4 w-4" />,
      description: "Most popular movies right now",
    },
    {
      id: "top-rated",
      label: "Top Rated",
      icon: <Award className="h-4 w-4" />,
      description: "Highest rated movies of all time",
    },
  ] as const;

  // Reset state when URL params change
  useEffect(() => {
    console.log("URL params changed, resetting state");
    setPage(1);
    setMovies([]);
    setError(null);
    setSortBy("popularity.desc"); // Reset sort when changing views

    // Update activeTab only if not in genre view
    if (!isGenreView && categoryParam) {
      const newTab = getInitialTab();
      setActiveTab(newTab);
    }
  }, [categoryParam, genreParam, genreNameParam, isGenreView]);

  // Fetch movies effect - FIXED to include sortBy dependency
  useEffect(() => {
    const fetchMovies = async () => {
      console.log("Fetching movies:", {
        isGenreView,
        genreParam,
        activeTab,
        page,
        sortBy,
      });

      setLoading(true);
      setError(null);

      try {
        let response;

        if (isGenreView && genreParam) {
          console.log("Fetching by genre:", genreParam, "with sortBy:", sortBy);
          // Fetch movies by genre with sortBy
          response = await movieApi.getByGenre(genreParam, page, sortBy);
        } else {
          console.log("Fetching by category:", activeTab);
          // Fetch movies by category (only popular and top-rated)
          switch (activeTab) {
            case "top-rated":
              response = await movieApi.getTopRated(page);
              break;
            default:
              response = await movieApi.getPopular(page);
          }
        }

        console.log("API Response:", response.data);

        const data = response.data.data;
        if (page === 1) {
          setMovies(data.results);
        } else {
          // Fix: Properly append new movies for pagination
          setMovies((prev) => [...prev, ...data.results]);
        }
        setTotalPages(data.total_pages || 1);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Failed to load movies. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [activeTab, page, isGenreView, genreParam, sortBy]); // Added sortBy to dependencies

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setPage(1);
    setMovies([]);

    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set("category", tab);
    url.searchParams.delete("genre");
    url.searchParams.delete("name");
    window.history.pushState({}, "", url.toString());
  };

  const handleSortChange = (newSortBy: string) => {
    console.log("Sort changed to:", newSortBy);
    setSortBy(newSortBy);
    setPage(1);
    setMovies([]);
  };

  const loadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const getPageTitle = () => {
    if (isGenreView && genreNameParam) {
      return `${genreNameParam} Movies`;
    }
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    return `${currentTab?.label} Movies`;
  };

  const getPageDescription = () => {
    if (isGenreView && genreNameParam) {
      return `Discover the best ${genreNameParam.toLowerCase()} movies`;
    }
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    return currentTab?.description || "";
  };

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header Section */}
        <div className="mb-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {getPageTitle()}
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl leading-relaxed">
              {getPageDescription()}
            </p>
          </div>
        </div>

        {/* Trending Banner */}
        <div className="mb-12">
          <a
            href="/movies/trending"
            className="block p-6 bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-2xl backdrop-blur-sm border border-red-500/20 hover:border-red-500/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-red-500 mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    🔥 Trending Movies
                  </h3>
                  <p className="text-red-400">
                    See what's hot and trending right now
                  </p>
                </div>
              </div>
              <div className="text-red-400 group-hover:translate-x-2 transition-transform">
                →
              </div>
            </div>
          </a>
        </div>

        {/* Tabs Section - Hide when viewing genre */}
        {!isGenreView && (
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

            {/* Tab Description */}
            {currentTab && (
              <div className="text-center">
                <p className="text-gray-400 text-lg">
                  {currentTab.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Genre View Navigation with Controls */}
        {isGenreView && (
          <div className="mb-16">
            <div className="space-y-6">
              {/* Genre Badge */}
              <div className="text-center">
                <div className="inline-flex items-center gap-4 bg-gray-800/30 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Star className="h-5 w-5" />
                    <span className="font-medium">Genre:</span>
                  </div>
                  <span className="text-white text-lg font-semibold">
                    {genreNameParam}
                  </span>
                </div>
              </div>

              {/* Sort and View Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Sort By */}
                <div className="flex items-center bg-gray-800/50 rounded-lg px-4 py-2">
                  <Filter className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-400 mr-3">Sort by:</span>
                  <select
                    aria-label="Sort movies"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-transparent text-white focus:outline-none cursor-pointer"
                  >
                    <option value="popularity.desc" className="bg-gray-800">Most Popular</option>
                    <option value="release_date.desc" className="bg-gray-800">Newest First</option>
                    <option value="release_date.asc" className="bg-gray-800">Oldest First</option>
                    <option value="vote_average.desc" className="bg-gray-800">Highest Rated</option>
                    <option value="title.asc" className="bg-gray-800">A-Z</option>
                  </select>
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
            </div>
          </div>
        )}

        {/* Movies Section */}
        {loading && movies.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-6"></div>
            <p className="text-gray-400 text-lg">Loading amazing movies...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Error Loading Movies
            </h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="mb-12 p-6 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700/50">
              <div className="flex items-center justify-between text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="text-lg">
                    Showing{" "}
                    <span className="text-white font-semibold">
                      {movies.length}
                    </span>{" "}
                    {isGenreView
                      ? genreNameParam?.toLowerCase()
                      : activeTab.replace("-", " ")}{" "}
                    movies
                  </span>
                  {totalPages > 1 && (
                    <span className="text-sm bg-gray-700/50 px-3 py-1 rounded-full">
                      Page {page} of {totalPages}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isGenreView ? (
                    <Star className="h-4 w-4" />
                  ) : (
                    currentTab?.icon
                  )}
                  <span className="text-purple-400 font-medium text-lg">
                    {isGenreView ? genreNameParam : currentTab?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Movies Grid/List */}
            <div className="mb-20">
              {movies.length > 0 ? (
                viewMode === "grid" ? (
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
                )
              ) : (
                <div className="text-center py-20">
                  <div className="text-gray-500 text-6xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Movies Found
                  </h3>
                  <p className="text-gray-400 mb-6">
                    We couldn't find any movies in this category.
                  </p>
                  <button
                    onClick={() => {
                      window.location.href = "/movies?category=popular";
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Popular Movies
                  </button>
                </div>
              )}
            </div>

            {/* Load More Section */}
            {page < totalPages && movies.length > 0 && (
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
                    `Load More Movies (${movies.length} of ${totalPages * 20})`
                  )}
                </button>
              </div>
            )}

            {/* End of Results */}
            {page >= totalPages && movies.length > 0 && (
              <div className="text-center py-16 border-t border-gray-800/50">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    You&apos;ve explored all{" "}
                    {isGenreView
                      ? genreNameParam?.toLowerCase()
                      : activeTab.replace("-", " ")}{" "}
                    movies!
                  </h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    Ready to discover more? Check out other categories
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href="/movies/trending"
                      className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 backdrop-blur-sm"
                    >
                      🔥 Check Trending
                    </a>
                    {!isGenreView && activeTab !== "top-rated" && (
                      <button
                        onClick={() => handleTabChange("top-rated")}
                        className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm"
                      >
                        🏆 View Top Rated
                      </button>
                    )}
                    {!isGenreView && activeTab !== "popular" && (
                      <button
                        onClick={() => handleTabChange("popular")}
                        className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm"
                      >
                        ⭐ Popular Movies
                      </button>
                    )}
                    {isGenreView && (
                      <button
                        onClick={() => {
                          window.location.href = "/movies?category=popular";
                        }}
                        className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/70 transition-all duration-300 backdrop-blur-sm"
                      >
                        🎬 Browse All Movies
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
};

// Main component with Suspense wrapper
export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 pt-20">
          <div className="flex flex-col justify-center items-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-6"></div>
            <p className="text-gray-400 text-lg">Loading movies...</p>
          </div>
        </div>
      }
    >
      <MoviesContent />
    </Suspense>
  );
}