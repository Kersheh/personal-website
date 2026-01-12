'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { get } from 'lodash';
import Window, { APP_NAME_MAP } from '../Window/Window';
import Icon from './Icon/Icon';
import MenuBar from './MenuBar/MenuBar';
import { useDesktopApplicationStore } from '@/app/store/desktopApplicationStore';
import { isFeatureEnabled, FeatureFlag } from '@/app/utils/featureFlags';

let windowIdCounter = 0;

interface WindowItem {
  name: string;
  isFocused: boolean;
  id: string;
}

interface DesktopProps {
  powerOff: () => void;
}

const Desktop = ({ powerOff }: DesktopProps) => {
  const [windows, setWindows] = useState<Array<WindowItem | null>>([]);
  const [powerOn, setPowerOn] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const setFocusedApp = useDesktopApplicationStore(
    (state) => state.setFocusedApp
  );

  const openNewWindow = useCallback(
    (name: keyof typeof APP_NAME_MAP) => {
      const updatedWindows = windows.map((window) =>
        window !== null ? { ...window, isFocused: false } : null
      );

      updatedWindows.push({
        name: name,
        isFocused: true,
        id: `window-${++windowIdCounter}`
      });
      setWindows(updatedWindows);
    },
    [windows]
  );

  useEffect(() => {
    const hasAnyFocusedWindow = windows.some((window) => window?.isFocused);
    if (!hasAnyFocusedWindow) {
      setFocusedApp(null);
    }
  }, [windows, setFocusedApp]);

  const handleCloseWindow = useCallback(
    (id: string) => {
      const { focusedWindowId } = useDesktopApplicationStore.getState();

      setWindows((currentWindows) =>
        currentWindows.map((window) =>
          id === get(window, 'id') ? null : window
        )
      );

      if (focusedWindowId === id) {
        setFocusedApp(null);
      }
    },
    [setFocusedApp]
  );

  const updateWindows = useCallback((i: number) => {
    setWindows((currentWindows) => {
      const updatedWindows = currentWindows.map((window) =>
        window !== null ? { ...window, isFocused: false } : null
      );

      // if i is -1, this is an unfocus-all signal (clicking outside windows)
      if (i >= 0 && updatedWindows[i]) {
        updatedWindows[i]!.isFocused = true;
      }

      return updatedWindows;
    });
  }, []);

  return (
    <div
      className={`h-full relative overflow-hidden bg-cover bg-no-repeat flex flex-col ${
        powerOn ? 'animate-turn-on' : 'animate-turn-off'
      }`}
      style={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundColor: '#282936'
      }}
      ref={nodeRef}
    >
      {/* CRT Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%'
        }}
      />
      {/* CRT Flicker */}
      <div className="absolute inset-0 bg-onyx/10 opacity-0 pointer-events-none animate-flicker" />

      <MenuBar
        onPowerOff={useCallback(() => {
          setPowerOn(false);
          setTimeout(powerOff, 550);
        }, [powerOff])}
        onCloseWindow={handleCloseWindow}
      />

      <div
        ref={desktopRef}
        className="flex-1 p-5 overflow-hidden relative"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setFocusedApp(null);
          }
        }}
      >
        <Icon
          iconName="iterm"
          label="Terminal"
          onDoubleClickHandler={() => openNewWindow('iterm')}
        />

        {isFeatureEnabled(FeatureFlag.DESKTOP_APP_PDF_VIEWER) && (
          <Icon
            iconName="pdf"
            label="PDF Viewer"
            onDoubleClickHandler={() => openNewWindow('pdfViewer')}
          />
        )}

        {windows.map((item, i) => {
          return item === null ? null : (
            <Window
              key={i}
              index={i}
              id={item.id}
              name={item.name}
              isFocused={item.isFocused}
              updateWindows={updateWindows}
              parentNode={desktopRef.current}
              windowsCount={windows.length}
              closeWindow={handleCloseWindow}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Desktop;
