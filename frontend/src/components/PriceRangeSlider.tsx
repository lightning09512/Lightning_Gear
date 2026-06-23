import React, { useState, useEffect } from 'react';
import { formatPrice } from '../utils/formatPrice';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ min, max, step = 100000, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= localValue.max - step) {
      setLocalValue({ ...localValue, min: newMin });
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= localValue.min + step) {
      setLocalValue({ ...localValue, max: newMax });
    }
  };

  const handleMouseUp = () => {
    onChange(localValue);
  };

  return (
    <div className="range-slider">
      <div style={{ position: 'relative', height: 20 }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue.min}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          style={{ position: 'absolute', width: '100%', zIndex: localValue.min > max - 100 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue.max}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          style={{ position: 'absolute', width: '100%', zIndex: 4 }}
        />
      </div>
      <div className="range-values">
        <span>{formatPrice(localValue.min)}</span>
        <span>{formatPrice(localValue.max)}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
