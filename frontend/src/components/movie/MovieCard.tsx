"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Movie } from "@/types";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
import {
  Star,
  Play,
  Bookmark,
  Info,
  Calendar,
  Heart,
  Check,
  Plus,
} from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  variant?: "default" | "featured" | "compact" | "large" | "hero";
  showRank?: boolean;
  rank?: number;
  className?: string;
  showHoverActions?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  variant = "default",
  showRank = false,
  rank,
  className = "",
  showHoverActions = true,
}) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const cardVariants = {
    default: {
      container: "w-48 md:w-52",
      poster: "aspect-[2/3]",
      title: "text-sm md:text-base",
      info: "text-xs md:text-sm",
    },
    featured: {
      container: "w-52 md:w-60",
      poster: "aspect-[2/3]",
      title: "text-base md:text-lg",
      info: "text-sm",
    },
    compact: {
      container: "w-40 md:w-44",
      poster: "aspect-[2/3]",
      title: "text-xs md:text-sm",
      info: "text-xs",
    },
    large: {
      container: "w-56 md:w-64",
      poster: "aspect-[2/3]",
      title: "text-base md:text-xl",
      info: "text-sm md:text-base",
    },
    hero: {
      container: "w-64 md:w-72",
      poster: "aspect-[2/3]",
      title: "text-lg md:text-2xl",
      info: "text-base md:text-lg",
    },
  };

  const currentVariant = cardVariants[variant];

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWatchlist(!isInWatchlist);
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Play movie:", movie.title);
  };

  return (
    <div
      className={`group flex-shrink-0 ${currentVariant.container} ${className}`}
    >
      <div className="relative">
        {/* Main Card Link */}
        <Link href={`/movies/${movie.id}`} className="block">
          {/* Poster Container */}
          <div
            className={`relative ${currentVariant.poster} bg-gray-800 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2`}
          >
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 animate-pulse" />
            )}

            {/* Movie Poster */}
            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
              } group-hover:scale-110`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder-movie.jpg";
                setImageLoaded(true);
              }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Rank Badge */}
            {showRank && rank && (
              <div className="absolute top-4 left-4 z-10">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 text-white text-sm font-black rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20">
                    {rank}
                  </div>
                  <div className="absolute -inset-1 bg-red-600/50 rounded-full blur opacity-75" />
                </div>
              </div>
            )}

            {/* Rating Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                <Star className="h-3 w-3 inline text-yellow-400 mr-1" />
                {formatRating(movie.vote_average)}
              </div>
            </div>

            {/* Quality Badge */}
            <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                HD
              </div>
            </div>

            {/* Hover Actions */}
            {showHoverActions && (
              <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                {/* Main Action Button */}
                <button
                  onClick={handlePlayClick}
                  className="w-full bg-white/95 hover:bg-white text-gray-900 font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Play Now
                </button>

                {/* Secondary Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleWatchlistToggle}
                    className={`flex-1 backdrop-blur-md font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center border ${
                      isInWatchlist
                        ? "bg-green-600/90 text-white border-green-500/50"
                        : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                    }`}
                  >
                    {isInWatchlist ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-xs">List</span>
                  </button>

                  <button
                    onClick={handleLikeToggle}
                    className={`flex-1 backdrop-blur-md font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center border ${
                      isLiked
                        ? "bg-red-600/90 text-white border-red-500/50"
                        : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${
                        isLiked ? "fill-current" : ""
                      }`}
                    />
                    <span className="text-xs">Like</span>
                  </button>

                  <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center border border-white/30">
                    <Info className="h-4 w-4 mr-1" />
                    <span className="text-xs">Info</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Movie Info */}
        <div className="mt-4 px-1 space-y-2">
          <Link href={`/movies/${movie.id}`}>
            <h3
              className={`font-bold text-white mb-1 line-clamp-2 group-hover:text-red-400 transition-colors duration-200 ${currentVariant.title}`}
            >
              {movie.title}
            </h3>
          </Link>

          <div
            className={`flex items-center justify-between text-gray-400 ${currentVariant.info}`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 opacity-70" />
                <span>{getYearFromDate(movie.release_date)}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-400" />
                <span>{formatRating(movie.vote_average)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleWatchlistToggle}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Add to Watchlist"
              >
                <Bookmark
                  className={`h-3 w-3 ${
                    isInWatchlist
                      ? "fill-current text-green-400"
                      : "text-gray-400"
                  }`}
                />
              </button>
              <button
                onClick={handleLikeToggle}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Like"
              >
                <Heart
                  className={`h-3 w-3 ${
                    isLiked ? "fill-current text-red-400" : "text-gray-400"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Genres (for larger variants) */}
          {(variant === "large" || variant === "hero") && movie.genre_ids && (
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genre_ids.slice(0, 2).map((genreId) => (
                <span
                  key={genreId}
                  className="px-2 py-1 text-xs bg-gray-800/50 text-gray-300 rounded-full"
                >
                  Genre {genreId}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Movie Grid Component (Enhanced)
interface MovieGridProps {
  movies: Movie[];
  variant?: "default" | "featured" | "compact" | "large" | "hero";
  showRanks?: boolean;
  className?: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  variant = "default",
  showRanks = false,
  className = "",
}) => {
  const gridCols = {
    default:
      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    featured: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
    compact:
      "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8",
    large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    hero: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  };

  return (
    <div className={`grid ${gridCols[variant]} gap-6 md:gap-8 ${className}`}>
      {movies.map((movie, index) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          variant={variant}
          showRank={showRanks}
          rank={showRanks ? index + 1 : undefined}
        />
      ))}
    </div>
  );
};

// Movie Row Component (Enhanced)
interface MovieRowProps {
  movies: Movie[];
  variant?: "default" | "featured" | "compact" | "large" | "hero";
  showRanks?: boolean;
  className?: string;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  movies,
  variant = "default",
  showRanks = false,
  className = "",
}) => {
  return (
    <div className={`overflow-x-auto scrollbar-hide ${className}`}>
      <div className="flex space-x-6 md:space-x-8 pb-6 px-1">
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            variant={variant}
            showRank={showRanks}
            rank={showRanks ? index + 1 : undefined}
          />
        ))}
      </div>
    </div>
  );
};
