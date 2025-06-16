"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { aiApi, movieApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { MovieCard } from "@/components/movie/MovieCard";
import {
  Sparkles,
  Loader2,
  Star,
  Calendar,
  Plus,
  X,
  Search,
  Brain,
  TrendingUp,
  Film,
  Info,
  Bookmark,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Movie, Genre } from "@/types";
import { toast } from "react-hot-toast";
import { getImageUrl, formatRating, getYearFromDate } from "@/lib/utils";
import Link from "next/link";

interface AIRecommendation {
  movieId: number;
  title: string;
  genres: string;
  similarity: number;
}

interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
  status: string;
  total_results: number;
  processing_time_ms: number;
  model_info: any;
}

// Fixed interface - changed null to undefined
interface EnhancedRecommendation extends AIRecommendation {
  movieDetails?: Movie | undefined;
  loading?: boolean;
}

export default function RecommendationsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<string[]>([]);
  const [movieSearch, setMovieSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Load genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await movieApi.getGenres();
        setGenres(response.data.data.genres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };

    fetchGenres();
  }, []);

  // Load user preferences if authenticated
  useEffect(() => {
    if (isAuthenticated && user?.profile?.favoriteGenres) {
      setSelectedGenres(user.profile.favoriteGenres);
    }
  }, [isAuthenticated, user]);

  // Search movies for favorites
  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await movieApi.search(query, 1);
      setSearchResults(response.data.data.results.slice(0, 8));
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search movies");
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle genre selection
  const toggleGenre = (genreName: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : [...prev, genreName]
    );
  };

  // Handle favorite movie selection
  const addFavoriteMovie = (movieTitle: string) => {
    if (!favoriteMovies.includes(movieTitle)) {
      setFavoriteMovies((prev) => [...prev, movieTitle]);
      setMovieSearch("");
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const removeFavoriteMovie = (movieTitle: string) => {
    setFavoriteMovies((prev) => prev.filter((title) => title !== movieTitle));
  };

  // Fetch movie details for recommendations - Fixed return type
  const fetchMovieDetails = async (movieId: number): Promise<Movie | undefined> => {
    try {
      const response = await movieApi.getDetails(movieId.toString());
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch details for movie ${movieId}:`, error);
      return undefined; // Changed from null to undefined
    }
  };

  // Check if requirements are met for generating recommendations
  const canGenerateRecommendations = () => {
    return selectedGenres.length > 0 && favoriteMovies.length > 0;
  };

  // Get AI recommendations with movie details - Fixed type issues
  const getRecommendations = async () => {
    // Enhanced validation with specific error messages
    if (selectedGenres.length === 0 && favoriteMovies.length === 0) {
      toast.error("Please select at least one genre AND add at least one favorite movie");
      return;
    }
    
    if (selectedGenres.length === 0) {
      toast.error("Please select at least one genre from the list");
      return;
    }
    
    if (favoriteMovies.length === 0) {
      toast.error("Please add at least one favorite movie");
      return;
    }

    setLoading(true);
    try {
      const response = await aiApi.getRecommendations({
        genres: selectedGenres,
        favorites: favoriteMovies,
        top_n: 12,
      });

      const data: AIRecommendationResponse = response.data;
      const initialRecommendations: EnhancedRecommendation[] = data.recommendations.map(rec => ({
        ...rec,
        movieDetails: undefined, // Changed from null to undefined
        loading: true,
      }));
      
      setRecommendations(initialRecommendations);
      setProcessingTime(data.processing_time_ms);
      
      // Fetch movie details for each recommendation - Fixed mapping
      const enhancedRecommendations: EnhancedRecommendation[] = await Promise.all(
        data.recommendations.map(async (rec): Promise<EnhancedRecommendation> => {
          const movieDetails = await fetchMovieDetails(rec.movieId);
          return {
            ...rec,
            movieDetails, // This is now Movie | undefined
            loading: false,
          };
        })
      );

      setRecommendations(enhancedRecommendations);
      toast.success(`Found ${data.recommendations.length} recommendations!`);
    } catch (error: any) {
      console.error("AI recommendation error:", error);
      toast.error(
        error.response?.data?.detail || "Failed to get recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return "bg-green-600";
    if (similarity >= 0.6) return "bg-blue-600";
    if (similarity >= 0.4) return "bg-yellow-600";
    return "bg-gray-600";
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.8) return "Excellent Match";
    if (similarity >= 0.6) return "Good Match";
    if (similarity >= 0.4) return "Fair Match";
    return "Poor Match";
  };

  const getSimilarityTextColor = (similarity: number) => {
    if (similarity >= 0.8) return "text-green-400";
    if (similarity >= 0.6) return "text-blue-400";
    if (similarity >= 0.4) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Brain className="h-16 w-16 text-purple-500 mr-4" />
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              AI Movie Recommendations
            </h1>
          </div>
          <p className="text-gray-400 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto">
            Get personalized movie recommendations powered by advanced machine
            learning algorithms
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
          {/* Requirements Notice */}
          <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-200 font-medium mb-1">Requirements for AI Recommendations:</p>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Select at least 1 genre you enjoy</li>
                  <li>• Add at least 1 favorite movie</li>
                  <li>• Both requirements must be met to generate recommendations</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Genre Selection */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Film className="h-5 w-5 mr-2 text-blue-500" />
                Select Your Favorite Genres
                <span className="ml-2 text-red-400">*</span>
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Choose genres you enjoy watching (Required)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.name)}
                    className={`genre-button p-3 text-sm rounded-lg border transition-all duration-200 ${
                      selectedGenres.includes(genre.name)
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400"
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
              {selectedGenres.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">
                    Selected genres ({selectedGenres.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGenres.map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                      >
                        {genre}
                        <button
                          onClick={() => toggleGenre(genre)}
                          className="ml-2 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedGenres.length === 0 && (
                <div className="mt-4 text-red-400 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please select at least one genre
                </div>
              )}
            </div>

            {/* Favorite Movies */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Add Your Favorite Movies
                <span className="ml-2 text-red-400">*</span>
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Search and add movies you love (Required)
              </p>

              {/* Movie Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for movies..."
                  value={movieSearch}
                  onChange={(e) => {
                    setMovieSearch(e.target.value);
                    searchMovies(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                )}
              </div>

              {/* Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="bg-gray-700 rounded-lg border border-gray-600 mb-4 max-h-48 overflow-y-auto">
                  {searchResults.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => addFavoriteMovie(movie.title)}
                      className="search-result-item w-full p-3 text-left hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-b-0 flex items-center"
                      disabled={favoriteMovies.includes(movie.title)}
                    >
                      <div className="w-8 h-12 bg-gray-600 rounded mr-3 flex-shrink-0 overflow-hidden">
                        <img
                          src={getImageUrl(movie.poster_path, "w92")}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getImageUrl(null);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">
                          {movie.title}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {new Date(movie.release_date).getFullYear()} • ⭐ {formatRating(movie.vote_average)}
                        </div>
                      </div>
                      {favoriteMovies.includes(movie.title) ? (
                        <span className="text-green-400 text-xs px-2 py-1 bg-green-600/20 rounded">Added</span>
                      ) : (
                        <Plus className="h-4 w-4 text-green-400 ml-2 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Favorite Movies */}
              {favoriteMovies.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Your favorite movies ({favoriteMovies.length}):
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {favoriteMovies.map((movie, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-700 p-2 rounded-lg"
                      >
                        <span className="text-white text-sm">{movie}</span>
                        <button
                          onClick={() => removeFavoriteMovie(movie)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {favoriteMovies.length === 0 && (
                <div className="mt-4 text-red-400 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Please add at least one favorite movie
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={getRecommendations}
              disabled={loading || !canGenerateRecommendations()}
              variant="primary"
              size="lg"
              className={`px-8 py-4 text-lg ${
                !canGenerateRecommendations() && !loading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Your Preferences...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Recommendations
                </>
              )}
            </Button>
            
            {/* Requirements Status */}
            {!canGenerateRecommendations() && (
              <div className="mt-4 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Missing requirements: 
                {selectedGenres.length === 0 && " Select genres"}
                {selectedGenres.length === 0 && favoriteMovies.length === 0 && " • "}
                {favoriteMovies.length === 0 && " Add favorite movies"}
              </div>
            )}
          </div>
        </div>

        {/* Processing Time */}
        {processingTime && (
          <div className="text-center mb-8">
            <div className="processing-indicator inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-600/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-green-400 text-sm">
                ⚡ Generated in {processingTime.toFixed(0)}ms using advanced AI
              </span>
            </div>
          </div>
        )}

        {/* Recommendations Results */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Your Personalized Recommendations
                </h2>
                <p className="text-gray-400">
                  Based on your selected preferences, here are{" "}
                  {recommendations.length} movies you might love
                </p>
              </div>
            </div>

            {/* FIXED: Grid dengan ukuran card yang sama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((movie, index) => (
                <RecommendationCard
                  key={movie.movieId}
                  recommendation={movie}
                  rank={index + 1}
                  getSimilarityColor={getSimilarityColor}
                  getSimilarityLabel={getSimilarityLabel}
                  getSimilarityTextColor={getSimilarityTextColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recommendations.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <Brain className="h-24 w-24 text-gray-600 mx-auto mb-4" />
              <Sparkles className="absolute top-0 right-1/2 transform translate-x-8 h-8 w-8 text-purple-500 animate-pulse" />
            </div>
            <h3 className="text-white font-semibold text-2xl mb-4">
              Ready for AI-Powered Recommendations?
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
              Select your favorite genres and add some movies you love. Our
              advanced AI will analyze your preferences and find perfect matches
              for you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800/30 p-6 rounded-xl">
                <Film className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h4 className="text-white font-medium mb-2">Choose Genres</h4>
                <p className="text-gray-400 text-sm">
                  Select genres you enjoy watching
                </p>
              </div>
              <div className="bg-gray-800/30 p-6 rounded-xl">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <h4 className="text-white font-medium mb-2">Add Favorites</h4>
                <p className="text-gray-400 text-sm">
                  Search and add movies you love
                </p>
              </div>
              <div className="bg-gray-800/30 p-6 rounded-xl">
                <Brain className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h4 className="text-white font-medium mb-2">Get AI Results</h4>
                <p className="text-gray-400 text-sm">
                  Receive personalized recommendations
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <div className="text-center">
            <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              How Our AI Recommendation Engine Works
            </h3>
            <p className="text-gray-300 text-lg mb-6 max-w-3xl mx-auto">
              Our advanced machine learning algorithms analyze your preferences,
              movie features, and similarity patterns to deliver highly
              personalized recommendations in real-time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-purple-200">
                <strong>🧠 Machine Learning:</strong> Advanced algorithms
                analyze movie features
              </div>
              <div className="text-purple-200">
                <strong>⚡ Real-time:</strong> Instant recommendations without
                pre-computed data
              </div>
              <div className="text-purple-200">
                <strong>🎯 Personalized:</strong> Based on your unique
                preferences
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Recommendation Card Component - FIXED dengan ukuran yang konsisten
interface RecommendationCardProps {
  recommendation: EnhancedRecommendation;
  rank: number;
  getSimilarityColor: (similarity: number) => string;
  getSimilarityLabel: (similarity: number) => string;
  getSimilarityTextColor: (similarity: number) => string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  rank,
  getSimilarityColor,
  getSimilarityLabel,
  getSimilarityTextColor,
}) => {
  const { movieDetails, loading } = recommendation;

  if (loading) {
    return (
      <div className="relative group h-full">
        <div className="rank-badge absolute -top-3 -left-3 z-10 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
          {rank}
        </div>
        <div className="recommendation-skeleton bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 animate-pulse h-full flex flex-col">
          <div className="aspect-[2/3] bg-gray-700 flex-shrink-0"></div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="mt-auto h-10 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-card relative group h-full">
      {/* Rank Badge */}
      <div className="rank-badge absolute -top-3 -left-3 z-20 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
        {rank}
      </div>

      {/* Movie Card - FIXED: Menggunakan flexbox untuk ukuran konsisten */}
      <div className="ai-recommendation-card bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 group-hover:scale-105 border border-gray-700/50 hover:border-purple-500/50 relative h-full flex flex-col">
        {/* Movie Poster - FIXED: Ukuran tetap */}
        <div className="movie-poster-container relative aspect-[2/3] bg-gray-700 overflow-hidden flex-shrink-0">
          <img
            src={getImageUrl(movieDetails?.poster_path || null, "w500")}
            alt={recommendation.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getImageUrl(null);
            }}
          />
          
          {/* Similarity Score Overlay */}
          <div className="absolute top-3 right-3">
            <div className={`${getSimilarityColor(recommendation.similarity)} text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg`}>
              {(recommendation.similarity * 100).toFixed(0)}%
            </div>
          </div>

          {/* Rating Badge */}
          {movieDetails?.vote_average && (
            <div className="absolute bottom-3 left-3">
              <div className="bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full border border-white/20 shadow-lg flex items-center">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                {formatRating(movieDetails.vote_average)}
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <Link
                href={`/movies/${recommendation.movieId}`}
                className="w-full bg-white/95 hover:bg-white text-gray-900 font-bold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center mb-2"
              >
                <Info className="h-4 w-4 mr-2" />
                View Details
              </Link>
              <div className="flex gap-2">
                <button className="flex-1 bg-yellow-600/90 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center">
                  <Bookmark className="h-4 w-4" />
                </button>
                <button className="flex-1 bg-green-600/90 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Info - FIXED: Menggunakan flex-1 untuk mengisi sisa ruang */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title - FIXED: Tinggi tetap dengan line-clamp */}
          <h3 className="text-white font-semibold text-lg mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors min-h-[3.5rem]">
            {recommendation.title}
          </h3>

          {/* Movie Details - FIXED: Ukuran tetap */}
          <div className="space-y-2 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm">
                {movieDetails?.release_date 
                  ? getYearFromDate(movieDetails.release_date)
                  : "Unknown"
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-purple-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm line-clamp-1">
                {recommendation.genres}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <span className={`text-sm font-medium ${getSimilarityTextColor(recommendation.similarity)}`}>
                {getSimilarityLabel(recommendation.similarity)}
              </span>
            </div>
          </div>

          {/* Similarity Progress Bar - FIXED: Ukuran tetap */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">AI Match Score</span>
              <span className="text-xs text-white font-medium">
                {(recommendation.similarity * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
              <div 
                className={`similarity-progress ${getSimilarityColor(recommendation.similarity)} h-2 rounded-full transition-all duration-1000 ease-out`}
                style={{ 
                  width: `${recommendation.similarity * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Movie Overview - FIXED: Tinggi tetap dengan line-clamp */}
          {movieDetails?.overview && (
            <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-shrink-0 min-h-[4.5rem]">
              {movieDetails.overview}
            </p>
          )}

          {/* Action Button - FIXED: Selalu di bawah dengan mt-auto */}
          <div className="mt-auto">
            <Link
              href={`/movies/${recommendation.movieId}`}
              className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105"
            >
              <Info className="h-4 w-4 inline mr-2" />
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};