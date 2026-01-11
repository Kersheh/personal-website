'use client';

import { useState } from 'react';

interface WindowButtonProps {
  color: string;
  onButtonClick: () => void;
}

export default function WindowButton({ color, onButtonClick }: WindowButtonProps) {
  const [hover, setHover] = useState(false);

  const colorClasses = {
    red: 'bg-carnation',
    yellow: 'bg-pastel-orange',
    green: 'bg-dull-lime',
  }[color] || 'bg-gray-500';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onButtonClick();
  };

  return (
    <span
      className={`border border-black/20 h-3.5 w-3.5 rounded-full inline-block m-2 cursor-pointer relative ${colorClasses}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
    >
      {hover && color === 'red' && (
        <>
          <span className="absolute w-[9px] h-[1px] bg-black/70 top-[7px] left-[2.5px] rotate-45 shadow-[0_0_2px_0_#ccc]" />
          <span className="absolute w-[9px] h-[1px] bg-black/70 top-[7px] right-[2.5px] -rotate-45 shadow-[0_0_2px_0_#ccc]" />
        </>
      )}
    </span>
  );
}
