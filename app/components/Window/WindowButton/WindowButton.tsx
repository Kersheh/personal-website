'use client';

import { useState } from 'react';

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
      className={`border border-black/20 h-3.5 w-3.5 rounded-full inline-block m-2 cursor-pointer relative ${colorClasses} min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (onButtonClick) {
          onButtonClick();
        }
      }}
      onTouchStart={() => setHover(true)}
      onTouchEnd={() => setHover(false)}
    >
      {hover && color === 'red' && (
        <svg
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'rgba(0, 0, 0, 0.5)' }}
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      {hover && color === 'green' && (
        <svg
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'rgba(0, 0, 0, 0.5)' }}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
    </span>
  );
};

export default WindowButton;
