"use client";

import React, { useEffect, useState } from "react";
import { movieApi } from "@/lib/api";
import { Movie, Genre } from "@/types";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
import {
  TrendingUp,
  Star,
  Calendar,
  Play,
  Info,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { MovieRow } from "@/components/movie/MovieCard";

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
          popular: popularRes.data.data.results.slice(0, 20),
          trending: trendingRes.data.data.results.slice(0, 20),
          topRated: topRatedRes.data.data.results.slice(0, 20),
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-16 pb-16">
          {/* Trending Movies */}
          <MovieSection
            title="Trending Now"
            movies={data.trending}
            icon={<TrendingUp className="h-6 w-6 text-red-500" />}
            viewAllLink="/movies/trending"
            variant="featured"
            showRanks={true}
          />

          {/* Popular Movies */}
          <MovieSection
            title="Popular Movies"
            movies={data.popular}
            icon={<Star className="h-6 w-6 text-yellow-500" />}
            viewAllLink="/movies/popular"
            variant="default"
          />

          {/* Top Rated Movies */}
          <MovieSection
            title="Top Rated"
            movies={data.topRated}
            icon={<Star className="h-6 w-6 text-green-500" />}
            viewAllLink="/movies/top-rated"
            variant="default"
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

// Movie Section Component
interface MovieSectionProps {
  title: string;
  movies: Movie[];
  icon: React.ReactNode;
  viewAllLink: string;
  variant?: "default" | "featured" | "compact" | "large";
  showRanks?: boolean;
}

const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  movies,
  icon,
  viewAllLink,
  variant = "default",
  showRanks = false,
}) => {
  return (
    <section className="space-y-6">
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

      <MovieRow
        movies={movies.slice(0, 12)}
        variant={variant}
        showRanks={showRanks}
      />
    </section>
  );
};

// Hero Section Component (Simplified)
const HeroSection: React.FC<{ movie: Movie }> = ({ movie }) => {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl(movie.backdrop_path, "w1280")}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-600/90 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              #1 Trending Today
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              {movie.title}
            </h1>

            {/* Meta Info */}
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

            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
              {movie.overview.length > 150
                ? `${movie.overview.substring(0, 150)}...`
                : movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/movies/${movie.id}`}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
              >
                <Play className="h-5 w-5 mr-3" />
                Watch Now
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30">
                <Info className="h-5 w-5 mr-3" />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Genre Section Component
const GenreSection: React.FC<{ genres: Genre[] }> = ({ genres }) => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white">
        Browse by Genre
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {genres.slice(0, 12).map((genre) => (
          <Link
            key={genre.id}
            href={`/movies/genre/${genre.id}?name=${encodeURIComponent(
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

// CTA Section Component
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

// Loading Screen Component
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-600/30 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-white text-lg font-medium">
          Loading amazing movies...
        </p>
      </div>
    </div>
  );
};

// Error Screen Component
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
