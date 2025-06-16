"use client";

import React, { useState } from 'react';
import { aiApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Sparkles, Loader2, Star, Calendar } from 'lucide-react';
import Link from 'next/link';

interface AIRecommendationProps {
  userGenres?: string[];
  userFavorites?: string[];
}

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

export const AIRecommendationEngine: React.FC<AIRecommendationProps> = ({
  userGenres = [],
  userFavorites = []
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const getRecommendations = async () => {
    if (userGenres.length === 0 && userFavorites.length === 0) {
      setError('Please provide at least one genre or favorite movie');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.getRecommendations({
        genres: userGenres,
        favorites: userFavorites,
        top_n: 6
      });

      const data: AIRecommendationResponse = response.data;
      setRecommendations(data.recommendations);
      setProcessingTime(data.processing_time_ms);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'bg-green-600';
    if (similarity >= 0.6) return 'bg-blue-600';
    if (similarity >= 0.4) return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.8) return 'Excellent Match';
    if (similarity >= 0.6) return 'Good Match';
    if (similarity >= 0.4) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <div>
            <h2 className="text-xl font-bold text-white">AI Recommendations</h2>
            <p className="text-gray-400 text-sm">Powered by machine learning</p>
          </div>
        </div>
        
        <Button
          onClick={getRecommendations}
          disabled={loading}
          variant="primary"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Get Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Input Summary */}
      {(userGenres.length > 0 || userFavorites.length > 0) && (
        <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
          <h3 className="text-white font-medium mb-2">Based on your preferences:</h3>
          <div className="space-y-2">
            {userGenres.length > 0 && (
              <div>
                <span className="text-gray-400 text-sm">Genres: </span>
                <span className="text-blue-400">{userGenres.join(', ')}</span>
              </div>
            )}
            {userFavorites.length > 0 && (
              <div>
                <span className="text-gray-400 text-sm">Favorites: </span>
                <span className="text-green-400">{userFavorites.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Processing Time */}
      {processingTime && (
        <div className="mb-4 text-center">
          <span className="text-gray-400 text-sm">
            ⚡ Generated in {processingTime.toFixed(0)}ms
          </span>
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((movie, index) => (
            <Link 
              key={movie.movieId} 
              href={`/movies/${movie.movieId}`}
              className="group"
            >
              <div className="relative bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700/70 transition-all duration-300 group-hover:scale-105 border border-gray-600/50 hover:border-purple-500/50">
                {/* Rank Badge */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>

                {/* Similarity Score */}
                <div className="absolute top-2 right-2">
                  <div className={`${getSimilarityColor(movie.similarity)} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                    {(movie.similarity * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Movie Info */}
                <div className="mt-4">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {movie.title}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-300 text-sm">
                        {getSimilarityLabel(movie.similarity)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">{movie.genres}</span>
                    </div>
                  </div>

                  {/* Similarity Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Match Score</span>
                      <span className="text-xs text-white font-medium">
                        {(movie.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`${getSimilarityColor(movie.similarity)} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${movie.similarity * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">
            Ready for AI Magic?
          </h3>
          <p className="text-gray-400 mb-6">
            Click the button above to get personalized movie recommendations based on your preferences.
          </p>
          <div className="text-xs text-gray-500">
            Our AI analyzes your favorite genres and movies to find perfect matches
          </div>
        </div>
      )}

      {/* Footer Info */}
      {recommendations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>🤖 Powered by Machine Learning</span>
            <span>📊 Real-time similarity computation</span>
          </div>
        </div>
      )}
    </div>
  );
};