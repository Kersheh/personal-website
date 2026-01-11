'use client';

import { useState, useEffect, useRef } from 'react';
import { useDesktopApplicationStore } from '../../../store/desktopApplicationStore';

interface MenuBarProps {
  onPowerOff: () => void;
  onCloseWindow: (id: string) => void;
}

const MenuBar = ({ onPowerOff, onCloseWindow }: MenuBarProps) => {
  const focusedApp = useDesktopApplicationStore((state) => state.focusedApp);
  const focusedWindowId = useDesktopApplicationStore(
    (state) => state.focusedWindowId
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [dropdownOpen]);

  return (
    <div
      data-menu-bar
      className="h-8 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 relative z-50"
    >
      {/* Left side - App menu */}
      <div className="flex items-center gap-6 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.ico" alt="Logo" className="w-5 h-5 select-none" />
        {focusedApp && (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-white/70 text-sm font-['Courier_new',_'Courier',_monospace] select-none hover:text-white/90 transition-colors"
            >
              {focusedApp}
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-black/90 backdrop-blur-md border border-white/20 rounded shadow-lg min-w-[160px] py-1">
                <button
                  onClick={() => {
                    if (focusedWindowId) {
                      onCloseWindow(focusedWindowId);
                      setDropdownOpen(false);
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white font-['Courier_new',_'Courier',_monospace] transition-colors"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side - System controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onPowerOff}
          className="text-white/70 hover:text-white/90 transition-colors p-1"
          aria-label="Power off"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MenuBar;
