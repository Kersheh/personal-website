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
      className={`border border-black/20 h-3.5 w-3.5 rounded-full inline-block m-2 cursor-pointer relative ${colorClasses}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();

        if (onButtonClick) {
          onButtonClick();
        }
      }}
    >
      {hover && color === 'red' && (
        <>
          <span className="absolute w-[9px] h-[1px] bg-black/70 top-[7px] left-[2.5px] rotate-45 shadow-[0_0_2px_0_#ccc]" />
          <span className="absolute w-[9px] h-[1px] bg-black/70 top-[7px] right-[2.5px] -rotate-45 shadow-[0_0_2px_0_#ccc]" />
        </>
      )}
    </span>
  );
};

export default WindowButton;
