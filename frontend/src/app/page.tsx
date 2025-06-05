"use client";

import React, { useEffect, useState } from "react";
import { movieApi } from "@/lib/api";
import { Movie, Genre } from "@/types";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
import { TrendingUp, Star, Calendar, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MovieCard } from "@/components/movie/MovieCard";
import { useAuthStore } from "@/stores/authStore";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      {featuredMovie && <HeroSection movie={featuredMovie} />}

      {/* Main Content */}
      <div className="relative z-10 -mt-20 md:-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
          {/* Personalized Welcome Section for Authenticated Users */}
          {isAuthenticated && user && <WelcomeSection user={user} />}

          {/* Trending Movies */}
          <MovieSection
            title="Trending Now"
            movies={data.trending}
            icon={<TrendingUp className="h-6 w-6 text-red-500" />}
            viewAllLink="/movies/trending"
            showRanks={true}
          />

          {/* Popular Movies */}
          <MovieSection
            title="Popular Movies"
            movies={data.popular}
            icon={<Star className="h-6 w-6 text-yellow-500" />}
            viewAllLink="/movies?category=popular"
          />

          {/* Top Rated Movies */}
          <MovieSection
            title="Top Rated"
            movies={data.topRated}
            icon={<Star className="h-6 w-6 text-green-500" />}
            viewAllLink="/movies?category=top-rated"
          />

          {/* Genres Section */}
          <GenreSection genres={data.genres} />

          {/* CTA Section */}
          <CTASection />
        </div>
      </div>
    </div>
  );
}

// Welcome Section for Authenticated Users
const WelcomeSection: React.FC<{ user: any }> = ({ user }) => {
  const displayName = user.profile?.displayName || user.username;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <section className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-blue-500/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome back, {displayName}! 👋
          </h2>
          <p className="text-blue-200 text-lg">
            Ready to discover your next favorite movie?
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
          <Link
            href="/bookmarks"
            className="bg-yellow-600/80 hover:bg-yellow-600 backdrop-blur-sm rounded-lg px-4 py-2 text-center transition-colors"
          >
            <div className="text-lg font-bold text-white">📚</div>
            <div className="text-xs text-yellow-100">Watchlist</div>
          </Link>
          <Link
            href="/watched"
            className="bg-green-600/80 hover:bg-green-600 backdrop-blur-sm rounded-lg px-4 py-2 text-center transition-colors"
          >
            <div className="text-lg font-bold text-white">🎬</div>
            <div className="text-xs text-green-100">Watched</div>
          </Link>
          <Link
            href="/settings"
            className="bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm rounded-lg px-4 py-2 text-center transition-colors"
          >
            <div className="text-lg font-bold text-white">⚙️</div>
            <div className="text-xs text-blue-100">Settings</div>
          </Link>
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
}

const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  movies,
  icon,
  viewAllLink,
  showRanks = false,
}) => {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4">{icon}</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
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
      <h2 className="text-2xl md:text-3xl font-bold text-white">
        Browse by Genre
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {genres.slice(0, 12).map((genre) => (
          <Link
            key={genre.id}
            href={`/movies?genre=${genre.id}&name=${encodeURIComponent(
              genre.name
            )}`}
            className="group"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white p-6 md:p-8 rounded-xl text-center transition-all duration-300 group-hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h3 className="relative font-bold text-sm md:text-base">
                {genre.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const CTASection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
      <h2 className="text-3xl md:text-5xl font-bold mb-4">
        Ready to Discover?
      </h2>
      <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
        Join millions of movie lovers and start building your perfect watchlist
        today.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/movies/search"
          className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
        >
          Start Exploring
          <ArrowRight className="h-5 w-5 ml-2" />
        </Link>
        <Link
          href="/movies"
          className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
        >
          Browse Movies
        </Link>
      </div>
    </section>
  );
};

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="flex flex-col justify-center items-center py-24">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-6"></div>
        <p className="text-gray-400 text-lg">Loading amazing movies...</p>
      </div>
    </div>
  );
};

const ErrorScreen: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-white text-2xl font-bold mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
