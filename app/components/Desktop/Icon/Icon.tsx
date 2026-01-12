'use client';

import { useState, useEffect, useRef } from 'react';

interface IconProps {
  iconName: string;
  label: string;
  onDoubleClickHandler: () => void;
}

const Icon = ({ iconName, label, onDoubleClickHandler }: IconProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [lastTap, setLastTap] = useState(0);
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
      className={`w-fit flex flex-col items-center p-0.5 border-2 rounded-[5%] cursor-pointer ${
        isSelected ? 'border-[#3f3f3f]' : 'border-transparent'
      }`}
      ref={nodeRef}
      onClick={() => setIsSelected(true)}
      onDoubleClick={onDoubleClickHandler}
      onTouchEnd={(e: React.TouchEvent) => {
        const now = Date.now();
        const timeSinceLastTap = now - lastTap;

        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
          e.preventDefault();
          onDoubleClickHandler();
        } else {
          setIsSelected(true);
        }

        setLastTap(now);
      }}
    >
      <div
        className="w-20 h-20 bg-no-repeat bg-cover rounded-[5%]"
        style={{
          backgroundImage: `url(/images/icons/icon-${iconName})`
        }}
      />
      <span className="text-white/80 text-xs text-center max-w-18 break-words font-['Courier_new',_'Courier',_monospace] drop-shadow-lg mt-1 select-none">
        {label}
      </span>
    </div>
  );
};

export default Icon;
