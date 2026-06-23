import React from 'react';
import { MdStar, MdStarBorder, MdStarHalf } from 'react-icons/md';

interface StarRatingProps {
  rating: number;
  size?: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 20, 
  readonly = false,
  onChange 
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let Icon = MdStarBorder;
      let className = 'star';

      if (rating >= i) {
        Icon = MdStar;
        className = 'star filled';
      } else if (rating >= i - 0.5) {
        Icon = MdStarHalf;
        className = 'star filled';
      }

      stars.push(
        <Icon
          key={i}
          size={size}
          className={className}
          onClick={() => !readonly && onChange?.(i)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        />
      );
    }
    return stars;
  };

  return <div className="stars">{renderStars()}</div>;
};

export default StarRating;
