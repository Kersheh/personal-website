'use client';

import { useEffect, useRef, useState } from 'react';
import { useDesktopApplicationStore } from '@/app/store/desktopApplicationStore';
import { resolveAppId, AppId } from '@/app/components/applications/appRegistry';
import github from '@/app/utils/commands/github';
import linkedin from '@/app/utils/commands/linkedin';
import email from '@/app/utils/commands/email';
import {
  GitHubIcon,
  LinkedInIcon,
  EmailIcon,
  PowerIcon,
  WrenchIcon
} from '@/app/components/atomic/icons';

interface MenuBarProps {
  onPowerOff: () => void;
  onCloseWindow: (id: string) => void;
  onOpenWindow: (appId: AppId) => void;
}

const MENU_ITEM_CLASS =
  "w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white font-['Courier_new','Courier',monospace] transition-colors cursor-pointer";
const MENU_ITEM_WITH_ICON_CLASS = `flex items-center gap-3 ${MENU_ITEM_CLASS}`;
const MENU_ITEM_WITH_WHITESPACE_CLASS = `${MENU_ITEM_CLASS} whitespace-nowrap`;

const MenuBar = ({ onPowerOff, onCloseWindow, onOpenWindow }: MenuBarProps) => {
  const focusedApp = useDesktopApplicationStore((state) => state.focusedApp);
  const focusedWindowId = useDesktopApplicationStore(
    (state) => state.focusedWindowId
  );
  const getWindowsForApp = useDesktopApplicationStore(
    (state) => state.getWindowsForApp
  );
  const [dropdowns, setDropdowns] = useState({
    file: false,
    app: false,
    social: false
  });
  const fileDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socialDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        fileDropdownRef.current &&
        !fileDropdownRef.current.contains(e.target as Node)
      ) {
        setDropdowns((prev) => ({ ...prev, file: false }));
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdowns((prev) => ({ ...prev, app: false }));
      }
      if (
        socialDropdownRef.current &&
        !socialDropdownRef.current.contains(e.target as Node)
      ) {
        setDropdowns((prev) => ({ ...prev, social: false }));
      }
    };

    if (dropdowns.file || dropdowns.app || dropdowns.social) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [dropdowns]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDropdowns({ file: false, app: false, social: false });
  }, [focusedApp]);

  return (
    <div
      data-menu-bar
      className="h-8 bg-black/65 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 relative z-[3000]"
    >
      {/* Left side - App menu */}
      <div className="flex items-center gap-6 relative">
        {/* System dropdown */}
        <div ref={socialDropdownRef} className="relative">
          <button
            onClick={() =>
              setDropdowns((prev) => ({ ...prev, social: !prev.social }))
            }
            className="flex items-center justify-center h-8 w-8 hover:opacity-80 transition-opacity select-none p-1 cursor-pointer"
            aria-label="System menu and social links"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="Logo" className="w-5 h-5" />
          </button>
          {dropdowns.social && (
            <div className="absolute top-full left-0 mt-1 bg-black/90 backdrop-blur-md border border-white/20 rounded-sm shadow-lg min-w-[160px] z-[3000]">
              <a
                href={github()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  setDropdowns((prev) => ({ ...prev, social: false }))
                }
                className={MENU_ITEM_WITH_ICON_CLASS}
              >
                <GitHubIcon />
                GitHub
              </a>
              <a
                href={linkedin()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  setDropdowns((prev) => ({ ...prev, social: false }))
                }
                className={MENU_ITEM_WITH_ICON_CLASS}
              >
                <LinkedInIcon />
                LinkedIn
              </a>
              <button
                onClick={() => {
                  window.location.href = email();
                  setDropdowns((prev) => ({ ...prev, social: false }));
                }}
                className={MENU_ITEM_WITH_ICON_CLASS}
              >
                <EmailIcon />
                Email
              </button>

              {process.env.NODE_ENV === 'development' && (
                <>
                  <div className="border-t border-white/10 my-1" />

                  <button
                    onClick={() => {
                      onOpenWindow('DEVTOOLS');
                      setDropdowns((prev) => ({ ...prev, social: false }));
                    }}
                    className={MENU_ITEM_WITH_ICON_CLASS}
                  >
                    <WrenchIcon className="w-4 h-4" />
                    Devtools
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {focusedApp && (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() =>
                setDropdowns((prev) => ({ ...prev, app: !prev.app }))
              }
              className="inline-flex items-center h-8 text-white/80 text-sm font-semibold font-['Courier_new','Courier',monospace] leading-none select-none hover:text-white cursor-pointer"
            >
              {focusedApp}
            </button>
            {dropdowns.app && (
              <div className="absolute top-full left-0 mt-1 bg-black/90 backdrop-blur-md border border-white/20 rounded-sm shadow-lg min-w-[160px] z-[3000]">
                <button
                  onClick={() => {
                    const appId = resolveAppId(focusedApp || '');
                    if (!appId) {
                      return;
                    }
                    const windowIds = getWindowsForApp(appId);
                    windowIds.forEach((id) => onCloseWindow(id));
                    setDropdowns((prev) => ({ ...prev, app: false }));
                  }}
                  className={MENU_ITEM_WITH_WHITESPACE_CLASS}
                >
                  Close Application
                </button>
              </div>
            )}
          </div>
        )}
        {focusedWindowId && (
          <div ref={fileDropdownRef} className="relative">
            <button
              onClick={() =>
                setDropdowns((prev) => ({ ...prev, file: !prev.file }))
              }
              className="inline-flex items-center h-8 text-white/80 text-sm font-['Courier_new','Courier',monospace] leading-none select-none hover:text-white cursor-pointer"
            >
              File
            </button>
            {dropdowns.file && (
              <div className="absolute top-full left-0 mt-1 bg-black/90 backdrop-blur-md border border-white/20 rounded-sm shadow-lg min-w-[160px] z-[3000]">
                <button
                  onClick={() => {
                    const currentId =
                      useDesktopApplicationStore.getState().focusedWindowId;
                    if (currentId) {
                      onCloseWindow(currentId);
                      setDropdowns((prev) => ({ ...prev, file: false }));
                    }
                  }}
                  className={MENU_ITEM_CLASS}
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
          className="text-white/70 hover:text-white/90 transition-colors p-1 cursor-pointer"
          aria-label="Power off"
        >
          <PowerIcon />
        </button>
      </div>
    </div>
  );
};
export default MenuBar;
