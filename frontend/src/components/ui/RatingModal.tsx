"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review?: string) => Promise<void>;
  movieTitle: string;
  moviePoster: string;
  isLoading?: boolean;
}

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  movieTitle,
  moviePoster,
  isLoading = false,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    try {
      await onSubmit(rating, review.trim() || undefined);
      // Reset form
      setRating(0);
      setHoverRating(0);
      setReview("");
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleSkip = async () => {
    try {
      await onSubmit(0); // Submit without rating
      setRating(0);
      setHoverRating(0);
      setReview("");
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  if (!isOpen) return null;

  // Rating labels for 1-10 scale
  const getRatingLabel = (rating: number) => {
    if (rating === 0) return "";
    if (rating <= 2) return "Terrible";
    if (rating <= 4) return "Bad";
    if (rating <= 5) return "Poor";
    if (rating <= 6) return "Okay";
    if (rating <= 7) return "Good";
    if (rating <= 8) return "Great";
    if (rating <= 9) return "Excellent";
    return "Masterpiece";
  };

  // Get color based on rating
  const getRatingColor = (rating: number) => {
    if (rating === 0) return "text-gray-400";
    if (rating <= 3) return "text-red-400";
    if (rating <= 5) return "text-orange-400";
    if (rating <= 7) return "text-yellow-400";
    if (rating <= 8) return "text-green-400";
    return "text-emerald-400";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full mx-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Rate This Movie</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
            title="Close"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Movie Info */}
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={moviePoster || "/images/placeholder-movie.jpg"}
              alt={movieTitle}
              className="w-16 h-24 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder-movie.jpg";
              }}
            />
            <div>
              <h3 className="font-semibold text-white text-lg line-clamp-2">
                {movieTitle}
              </h3>
              <p className="text-gray-400 text-sm">Rate this movie from 1-10</p>
            </div>
          </div>

          {/* Rating Scale 1-10 */}
          <div className="mb-6">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setRating(number)}
                  onMouseEnter={() => setHoverRating(number)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`
                    h-12 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105
                    ${
                      number <= (hoverRating || rating)
                        ? `${getRatingColor(
                            number
                          )} bg-gray-700 border-2 border-current`
                        : "text-gray-500 bg-gray-800 border-2 border-gray-600 hover:border-gray-500"
                    }
                  `}
                  disabled={isLoading}
                >
                  {number}
                </button>
              ))}
            </div>

            {/* Rating Scale Legend */}
            <div className="mt-4 text-xs text-gray-400 text-center">
              <div className="grid grid-cols-2 gap-2">
                <div>1-2: Terrible</div>
                <div>3-4: Bad</div>
                <div>5: Poor</div>
                <div>6: Okay</div>
                <div>7: Good</div>
                <div>8: Great</div>
                <div>9: Excellent</div>
                <div>10: Masterpiece</div>
              </div>
            </div>
          </div>

          {/* Optional Review */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this movie..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {review.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding..." : "Skip Rating"}
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                "Add to Watched"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
