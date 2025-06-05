import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function RatingDisplay({
  rating,
  maxRating = 10,
  showLabel = true,
  size = "md",
  className = "",
}: RatingDisplayProps) {
  const getRatingLabel = (rating: number) => {
    if (rating === 0) return "Not Rated";
    if (rating <= 2) return "Terrible";
    if (rating <= 4) return "Bad";
    if (rating <= 5) return "Poor";
    if (rating <= 6) return "Okay";
    if (rating <= 7) return "Good";
    if (rating <= 8) return "Great";
    if (rating <= 9) return "Excellent";
    return "Masterpiece";
  };

  const getRatingColor = (rating: number) => {
    if (rating === 0) return "text-gray-400";
    if (rating <= 3) return "text-red-400";
    if (rating <= 5) return "text-orange-400";
    if (rating <= 7) return "text-yellow-400";
    if (rating <= 8) return "text-green-400";
    return "text-emerald-400";
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const starSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Star
        className={`${starSizeClasses[size]} ${getRatingColor(
          rating
        )} fill-current`}
      />
      <span
        className={`font-semibold ${getRatingColor(rating)} ${
          sizeClasses[size]
        }`}
      >
        {rating > 0 ? `${rating}/${maxRating}` : "Not Rated"}
      </span>
      {showLabel && rating > 0 && (
        <span className={`text-gray-400 ${sizeClasses[size]}`}>
          ({getRatingLabel(rating)})
        </span>
      )}
    </div>
  );
}
