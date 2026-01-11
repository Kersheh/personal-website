'use client';

import { useState, useRef, useEffect } from 'react';
import { get } from 'lodash';
import Window from '../Window/Window';
import Icon from './Icon/Icon';
import MenuBar from './MenuBar/MenuBar';
import { useDesktopApplicationStore } from '../../store/desktopApplicationStore';

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
  const [windows, setWindows] = useState<(WindowItem | null)[]>([]);
  const [powerOn, setPowerOn] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);
  const setFocusedApp = useDesktopApplicationStore(
    (state) => state.setFocusedApp
  );
  const focusedWindowId = useDesktopApplicationStore(
    (state) => state.focusedWindowId
  );

  const openNewWindow = (name: string) => {
    const updatedWindows = windows.map((window) =>
      window !== null ? { ...window, isFocused: false } : null
    );

    updatedWindows.push({
      name: name,
      isFocused: true,
      id: `window-${++windowIdCounter}`
    });

    setWindows(updatedWindows);
  };

  useEffect(() => {
    const hasAnyFocusedWindow = windows.some((window) => window?.isFocused);
    if (!hasAnyFocusedWindow) {
      setFocusedApp(null);
    }
  }, [windows, setFocusedApp]);

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
        onPowerOff={() => {
          setPowerOn(false);
          setTimeout(powerOff, 550);
        }}
        onCloseWindow={(id) => {
          const updatedWindows = windows.map((window) =>
            id === get(window, 'id') ? null : window
          );
          setWindows(updatedWindows);
          setFocusedApp(null);
        }}
      />

      <div
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

        {windows.map((item, i) => {
          return item === null ? null : (
            <Window
              key={i}
              index={i}
              id={item.id}
              name={item.name}
              isFocused={item.isFocused}
              updateWindows={(i) => {
                const updatedWindows = windows.map((window) =>
                  window !== null ? { ...window, isFocused: false } : null
                );

                // if i is -1, this is an unfocus-all signal (clicking outside windows)
                if (i >= 0 && updatedWindows[i]) {
                  updatedWindows[i]!.isFocused = true;
                }

                setWindows(updatedWindows);
              }}
              parentNode={nodeRef.current}
              windowsCount={windows.length}
              closeWindow={(id) => {
                const updatedWindows = windows.map((window) =>
                  id === get(window, 'id') ? null : window
                );

                setWindows(updatedWindows);

                // clear focused app if the closed window was the focused one
                if (id === focusedWindowId) {
                  setFocusedApp(null);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Desktop;
