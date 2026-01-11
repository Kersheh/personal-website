'use client';

import { useState, useEffect, useRef } from 'react';

interface IconProps {
  iconName: string;
  onDoubleClickHandler: () => void;
}

const Icon = ({ iconName, onDoubleClickHandler }: IconProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div
      className={`w-20 h-20 p-0.5 bg-no-repeat bg-cover cursor-pointer border-2 rounded-[5%] ${
        isSelected ? 'border-[#3f3f3f]' : 'border-transparent'
      }`}
      style={{ backgroundImage: `url(/images/icons/icon-${iconName}.png)` }}
      ref={nodeRef}
      onClick={() => setIsSelected(true)}
      onDoubleClick={onDoubleClickHandler}
    />
  );
};

export default Icon;
