"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { movieApi } from "@/lib/api";
import { MovieDetails } from "@/types";
import {
  getImageUrl,
  formatRating,
  formatRuntime,
  getYearFromDate,
} from "@/lib/utils";
import {
  Calendar,
  Clock,
  Star,
  Play,
  Heart,
  Bookmark,
  Share,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await movieApi.getDetails(movieId);
        setMovie(response.data.data);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Movie not found"}</p>
          <Link
            href="/movies"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Link
          href="/movies"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Movies
        </Link>
      </div>

      {/* Hero Section with Backdrop */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        {movie.backdrop_path && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${getImageUrl(
                movie.backdrop_path,
                "w1280"
              )})`,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8 w-full">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className="w-48 md:w-64 rounded-lg shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder-movie.jpg";
                }}
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-lg md:text-xl text-gray-300 mb-4 italic">
                  &quot;{movie.tagline}&quot;
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="text-lg font-semibold">
                    {formatRating(movie.vote_average)}
                  </span>
                  <span className="text-gray-300 ml-1">
                    ({movie.vote_count.toLocaleString()} votes)
                  </span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-300 mr-1" />
                  <span>{getYearFromDate(movie.release_date)}</span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-300 mr-1" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-blue-600 bg-opacity-80 rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  onClick={() => console.log("Watch trailer clicked")}
                  aria-label="Watch movie trailer"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Trailer
                </button>
                <button
                  className="flex items-center px-6 py-3 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-lg font-medium transition-colors"
                  onClick={() => console.log("Add to watchlist clicked")}
                  aria-label="Add movie to watchlist"
                >
                  <Bookmark className="h-5 w-5 mr-2" />
                  Add to Watchlist
                </button>
                <button
                  className="flex items-center px-4 py-3 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-lg font-medium transition-colors"
                  onClick={() => console.log("Add to favorites clicked")}
                  aria-label="Add to favorites"
                >
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Add to favorites</span>
                </button>
                <button
                  className="flex items-center px-4 py-3 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-lg font-medium transition-colors"
                  onClick={() => console.log("Share movie clicked")}
                  aria-label="Share movie"
                >
                  <Share className="h-5 w-5" />
                  <span className="sr-only">Share movie</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Overview
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {movie.overview || "No overview available for this movie."}
              </p>
            </section>

            {/* Cast */}
            {movie.credits?.cast && movie.credits.cast.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Cast
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.credits.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="text-center">
                      <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-2">
                        {actor.profile_path ? (
                          <img
                            src={getImageUrl(actor.profile_path, "w185")}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xs">No Photo</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {actor.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        {actor.character}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Similar Movies */}
            {movie.similar?.results && movie.similar.results.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Similar Movies
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {movie.similar.results.slice(0, 6).map((similarMovie) => (
                    <Link
                      key={similarMovie.id}
                      href={`/movies/${similarMovie.id}`}
                      className="group"
                    >
                      <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                        <img
                          src={getImageUrl(similarMovie.poster_path)}
                          alt={similarMovie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600">
                        {similarMovie.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Movie Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Movie Details
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {movie.status}
                  </span>
                </div>

                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Release Date:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {new Date(movie.release_date).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Original Language:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white uppercase">
                    {movie.original_language}
                  </span>
                </div>

                {movie.homepage && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Homepage:
                    </span>
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Production Companies */}
            {movie.production_companies &&
              movie.production_companies.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Production
                  </h3>
                  <div className="space-y-2">
                    {movie.production_companies.slice(0, 5).map((company) => (
                      <div
                        key={company.id}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {company.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
