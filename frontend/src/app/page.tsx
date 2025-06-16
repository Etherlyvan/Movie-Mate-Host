"use client";

import React, { useEffect, useState } from "react";
import { movieApi } from "@/lib/api";
import { Movie, Genre } from "@/types";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
import { TrendingUp, Star, Calendar, Info, ArrowRight, Sparkles, Brain } from "lucide-react";
import Link from "next/link";
import { MovieCard } from "@/components/movie/MovieCard";
import { useAuthStore } from "@/stores/authStore";
import { useWatchedStore } from "@/stores/watchedStore";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { AIRecommendationEngine } from "@/components/ai/RecommendationEngine";

interface HomePageData {
  popular: Movie[];
  trending: Movie[];
  topRated: Movie[];
  genres: Genre[];
}

export default function HomePage() {
  const [data, setData] = useState<HomePageData>({
    popular: [],
    trending: [],
    topRated: [],
    genres: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuthStore();
  const { watchedMovies } = useWatchedStore();
  const { bookmarks } = useBookmarkStore();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        const [popularRes, trendingRes, topRatedRes, genresRes] =
          await Promise.all([
            movieApi.getPopular(),
            movieApi.getTrending(),
            movieApi.getTopRated(),
            movieApi.getGenres(),
          ]);

        setData({
          popular: popularRes.data.data.results.slice(0, 10),
          trending: trendingRes.data.data.results.slice(0, 10),
          topRated: topRatedRes.data.data.results.slice(0, 10),
          genres: genresRes.data.data.genres,
        });
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  const featuredMovie = data.trending[0];

  // Get user's favorite movies for AI recommendations
  const getUserFavoriteMovies = (): string[] => {
    if (!watchedMovies || watchedMovies.length === 0) return [];
    
    return watchedMovies
      .filter(movie => movie.rating && movie.rating >= 8)
      .map(movie => movie.movieTitle)
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      {featuredMovie && <HeroSection movie={featuredMovie} />}

      {/* Main Content */}
      <div className="relative z-10 -mt-20 md:-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
          {/* Personalized Welcome Section for Authenticated Users */}
          {isAuthenticated && user && (
            <WelcomeSection 
              user={user} 
              watchedCount={watchedMovies?.length || 0}
              bookmarkedCount={bookmarks?.length || 0}
            />
          )}

          {/* AI Recommendations Section - Only for authenticated users */}
          {isAuthenticated && user && (
            <section className="space-y-8">
              <AIRecommendationEngine
                userGenres={user.profile?.favoriteGenres || []}
                userFavorites={getUserFavoriteMovies()}
              />
            </section>
          )}

          {/* Quick AI Recommendations CTA for Non-Authenticated Users */}
          {!isAuthenticated && (
            <section className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center mb-6">
                  <Brain className="h-12 w-12 text-purple-400 mr-4" />
                  <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  🤖 Try Our AI Movie Recommendations
                </h2>
                <p className="text-purple-200 text-lg mb-8 max-w-2xl mx-auto">
                  Experience the power of artificial intelligence! Get personalized movie recommendations 
                  based on your favorite genres and movies.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/recommendations"
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Try AI Recommendations
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
                  >
                    Sign Up for More Features
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </div>
                <div className="mt-6 text-sm text-purple-300">
                  ✨ No signup required to try AI recommendations
                </div>
              </div>
            </section>
          )}

          {/* Trending Movies */}
          <MovieSection
            title="Trending Now"
            movies={data.trending}
            icon={<TrendingUp className="h-6 w-6 text-red-500" />}
            viewAllLink="/movies/trending"
            showRanks={true}
            description="What's hot and trending right now"
          />

          {/* Popular Movies */}
          <MovieSection
            title="Popular Movies"
            movies={data.popular}
            icon={<Star className="h-6 w-6 text-yellow-500" />}
            viewAllLink="/movies?category=popular"
            description="Most loved movies by our community"
          />

          {/* Top Rated Movies */}
          <MovieSection
            title="Top Rated"
            movies={data.topRated}
            icon={<Star className="h-6 w-6 text-green-500" />}
            viewAllLink="/movies?category=top-rated"
            description="Highest rated movies of all time"
          />

          {/* Genres Section */}
          <GenreSection genres={data.genres} />

          {/* CTA Section */}
          <CTASection isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </div>
  );
}

// Welcome Section for Authenticated Users - Fixed with proper props
interface WelcomeSectionProps {
  user: any;
  watchedCount: number;
  bookmarkedCount: number;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ 
  user, 
  watchedCount, 
  bookmarkedCount 
}) => {
  const displayName = user.profile?.displayName || user.username;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <section className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-blue-500/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {user.profile?.avatar ? (
                  <img
                    src={user.profile.avatar}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Welcome back, {displayName}! 👋
                </h2>
                <p className="text-blue-200 text-lg">
                  Ready to discover your next favorite movie?
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              <span>📅 Member since {memberSince}</span>
              <span>🎬 {watchedCount} movies watched</span>
              <span>📚 {bookmarkedCount} bookmarked</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/recommendations"
              className="group bg-purple-600/80 hover:bg-purple-600 backdrop-blur-sm rounded-xl px-4 py-3 text-center transition-all duration-200 hover:scale-105 border border-purple-500/30"
            >
              <div className="text-lg font-bold text-white mb-1">🤖</div>
              <div className="text-xs text-purple-100">AI Recommendations</div>
              <div className="text-xs text-purple-200 mt-1">Personalized</div>
            </Link>
            
            <Link
              href="/bookmarks"
              className="group bg-yellow-600/80 hover:bg-yellow-600 backdrop-blur-sm rounded-xl px-4 py-3 text-center transition-all duration-200 hover:scale-105 border border-yellow-500/30"
            >
              <div className="text-lg font-bold text-white mb-1">📚</div>
              <div className="text-xs text-yellow-100">Watchlist</div>
              <div className="text-xs text-yellow-200 mt-1">{bookmarkedCount} movies</div>
            </Link>
            
            <Link
              href="/watched"
              className="group bg-green-600/80 hover:bg-green-600 backdrop-blur-sm rounded-xl px-4 py-3 text-center transition-all duration-200 hover:scale-105 border border-green-500/30"
            >
              <div className="text-lg font-bold text-white mb-1">🎬</div>
              <div className="text-xs text-green-100">Watched</div>
              <div className="text-xs text-green-200 mt-1">{watchedCount} movies</div>
            </Link>
            
            <Link
              href="/profile"
              className="group bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm rounded-xl px-4 py-3 text-center transition-all duration-200 hover:scale-105 border border-blue-500/30"
            >
              <div className="text-lg font-bold text-white mb-1">👤</div>
              <div className="text-xs text-blue-100">Profile</div>
              <div className="text-xs text-blue-200 mt-1">View stats</div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  icon: React.ReactNode;
  viewAllLink: string;
  showRanks?: boolean;
  description?: string;
}

const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  movies,
  icon,
  viewAllLink,
  showRanks = false,
  description,
}) => {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4">{icon}</div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
            {description && (
              <p className="text-gray-400 text-sm mt-1">{description}</p>
            )}
          </div>
        </div>

        <Link
          href={viewAllLink}
          className="group flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          View All
          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.slice(0, 5).map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              variant="default"
              showRank={showRanks}
              rank={showRanks ? index + 1 : undefined}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.slice(5, 10).map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              variant="default"
              showRank={showRanks}
              rank={showRanks ? index + 6 : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const HeroSection: React.FC<{ movie: Movie }> = ({ movie }) => {
  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={getImageUrl(movie.backdrop_path, "w1280")}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-600/90 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              #1 Trending Today
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              {movie.title}
            </h1>

            <div className="flex items-center space-x-6 mb-6 text-white/90">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-lg font-semibold">
                  {formatRating(movie.vote_average)}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{getYearFromDate(movie.release_date)}</span>
              </div>
              <div className="hidden sm:block px-3 py-1 bg-white/20 rounded-full text-sm">
                HD
              </div>
            </div>

            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
              {movie.overview.length > 150
                ? `${movie.overview.substring(0, 150)}...`
                : movie.overview}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/movies/${movie.id}`}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
              >
                <Info className="h-5 w-5 mr-3" />
                More Info
              </Link>
              
              <Link
                href="/movies/trending"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                <TrendingUp className="h-5 w-5 mr-3" />
                View All Trending
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GenreSection: React.FC<{ genres: Genre[] }> = ({ genres }) => {
  return (
    <section className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Browse by Genre
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover movies tailored to your taste. From action-packed adventures to heartwarming dramas.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {genres.slice(0, 12).map((genre, index) => {
          const colors = [
            "from-blue-600 to-purple-700",
            "from-green-600 to-teal-700", 
            "from-red-600 to-pink-700",
            "from-yellow-600 to-orange-700",
            "from-purple-600 to-indigo-700",
            "from-pink-600 to-rose-700"
          ];
          
          return (
            <Link
              key={genre.id}
              href={`/movies?genre=${genre.id}&name=${encodeURIComponent(
                genre.name
              )}`}
              className="group"
            >
              <div className={`relative overflow-hidden bg-gradient-to-br ${colors[index % colors.length]} hover:scale-105 text-white p-6 md:p-8 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-xl`}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <h3 className="relative font-bold text-sm md:text-base">
                  {genre.name}
                </h3>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"></div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const CTASection: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 mr-3" />
          <h2 className="text-3xl md:text-5xl font-bold">
            {isAuthenticated ? "Explore More Movies" : "Ready to Discover?"}
          </h2>
        </div>
        
        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {isAuthenticated 
            ? "Continue your movie journey with personalized recommendations and AI-powered suggestions."
            : "Join millions of movie lovers and start building your perfect watchlist today."
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link
                href="/recommendations"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
              >
                <Brain className="h-5 w-5 mr-2" />
                Get AI Recommendations
              </Link>
              <Link
                href="/movies/search"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                Discover Movies
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                href="/recommendations"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                <Brain className="h-5 w-5 mr-2" />
                Try AI Recommendations
              </Link>
            </>
          )}
        </div>

        {/* Features list */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-center text-blue-100">
            <span className="mr-2">🤖</span>
            AI-Powered Recommendations
          </div>
          <div className="flex items-center justify-center text-blue-100">
            <span className="mr-2">📊</span>
            Personal Movie Stats
          </div>
          <div className="flex items-center justify-center text-blue-100">
            <span className="mr-2">🔔</span>
            Smart Notifications
          </div>
        </div>
      </div>
    </section>
  );
};

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="flex flex-col justify-center items-center py-24">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-t-2 border-pink-600 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
        </div>
        <p className="text-gray-400 text-lg mb-2">Loading amazing movies...</p>
        <p className="text-gray-500 text-sm">This might take a moment</p>
      </div>
    </div>
  );
};

const ErrorScreen: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h2 className="text-white text-2xl font-bold mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-400 mb-8 text-lg">{error}</p>
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/movies"
            className="block w-full px-8 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </div>
  );
};