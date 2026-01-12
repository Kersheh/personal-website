'use client';

import { useState } from 'react';
import { CloseIcon, MaximizeIcon } from '@/app/components/atomic/icons';

interface WindowButtonProps {
  color: 'red' | 'yellow' | 'green';
  onButtonClick?: () => void;
}

const WindowButton = ({ color, onButtonClick }: WindowButtonProps) => {
  const [hover, setHover] = useState(false);

  const colorClasses =
    {
      red: 'bg-carnation',
      yellow: 'bg-pastel-orange',
      green: 'bg-dull-lime'
    }[color] || 'bg-gray-500';

  return (
    <span
      className={`border border-black/20 h-4 w-4 rounded-full inline-block mx-1.5 my-2 cursor-pointer relative ${colorClasses}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (onButtonClick) {
          onButtonClick();
        }
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setHover(false);
        if (onButtonClick) {
          onButtonClick();
        }
      }}
    >
      {hover && color === 'red' && (
        <CloseIcon style={{ color: 'rgba(0, 0, 0, 0.5)' }} />
      )}
      {hover && color === 'green' && (
        <MaximizeIcon style={{ color: 'rgba(0, 0, 0, 0.5)' }} />
      )}
    </span>
  );
};

export default WindowButton;
