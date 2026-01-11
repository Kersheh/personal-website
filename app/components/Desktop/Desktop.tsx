'use client';

import { useState, useRef } from 'react';
import { get } from 'lodash';
import Window from '../Window/Window';
import Icon from '../Icon/Icon';
import ButtonPower from '../ButtonPower/ButtonPower';

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

  return (
    <div
      className={`h-full relative overflow-hidden bg-cover bg-no-repeat ${
        powerOn ? 'animate-turn-on' : 'animate-turn-off'
      }`}
      style={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundColor: '#282936'
      }}
      ref={nodeRef}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%'
        }}
      />
      {/* Flicker */}
      <div className="absolute inset-0 bg-onyx/10 opacity-0 pointer-events-none animate-flicker" />

      <div className="h-full p-5 overflow-hidden">
        <ButtonPower
          on={false}
          onClickHandler={() => {
            setPowerOn(false);
            setTimeout(powerOff, 550);
          }}
        />
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
              isFocused={item.isFocused}
              updateWindows={(i: number) => {
                const updatedWindows = windows.map((window) =>
                  window !== null ? { ...window, isFocused: false } : null
                );

                if (updatedWindows[i]) {
                  updatedWindows[i]!.isFocused = true;
                }

                setWindows(updatedWindows);
              }}
              parentNode={nodeRef.current}
              windowsCount={windows.length}
              closeWindow={(id: string) => {
                const updatedWindows = windows.map((window) =>
                  id === get(window, 'id') ? null : window
                );

                setWindows(updatedWindows);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Desktop;
