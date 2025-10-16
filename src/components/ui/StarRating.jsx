import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  messageId, 
  currentRating = 0, 
  onRate, 
  disabled = false,
  size = 'sm'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  const handleRate = async (rating) => {
    if (disabled || isRating) return;
    
    setIsRating(true);
    try {
      await onRate(messageId, rating);
    } catch (error) {
      console.error('Failed to rate message:', error);
    } finally {
      setIsRating(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || currentRating);
        return (
          <button
            key={star}
            className={`
              ${sizeClasses[size]}
              transition-colors duration-150
              ${disabled || isRating 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:scale-110'
              }
              ${isFilled 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-400 hover:text-yellow-300'
              }
            `}
            onMouseEnter={() => !disabled && !isRating && setHoverRating(star)}
            onMouseLeave={() => !disabled && !isRating && setHoverRating(0)}
            onClick={() => handleRate(star)}
            disabled={disabled || isRating}
            title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star className={`${sizeClasses[size]} ${isFilled ? 'fill-current' : ''}`} />
          </button>
        );
      })}
      {isRating && (
        <span className="text-xs text-gray-500 ml-2">Rating...</span>
      )}
      {currentRating > 0 && !isRating && (
        <span className="text-xs text-gray-500 ml-2">
          Rated {currentRating}/5
        </span>
      )}
    </div>
  );
};

export default StarRating;
