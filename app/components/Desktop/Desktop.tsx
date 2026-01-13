'use client';

import { useState, useRef, useEffect } from 'react';
import { get } from 'lodash';
import Window from '../Window/Window';
import Icon from './Icon/Icon';
import MenuBar from './MenuBar/MenuBar';
import { useDesktopApplicationStore } from '@/app/store/desktopApplicationStore';
import { isFeatureEnabled, FeatureFlag } from '@/app/utils/featureFlags';
import { AppId, APP_CONFIGS } from '@/app/components/applications/appRegistry';

let windowIdCounter = 0;

interface WindowItem {
  name: AppId;
  isFocused: boolean;
  id: string;
  fileData?: {
    fileName: string;
    filePath: string;
  };
}

interface DesktopApplicationItem {
  type: 'application';
  id: string;
  iconName: string;
  label: string;
  appName: AppId;
  featureFlag?: FeatureFlag;
}

interface DesktopFileItem {
  type: 'file';
  id: string;
  iconName: string;
  label: string;
  fileName: string;
  filePath: string;
  opensWith: AppId;
  featureFlag?: FeatureFlag;
}

type DesktopItem = DesktopApplicationItem | DesktopFileItem;

interface DesktopProps {
  powerOff: () => void;
}

const DESKTOP_ITEMS: Array<DesktopItem> = [
  {
    type: 'application',
    id: 'app-terminal',
    iconName: APP_CONFIGS.TERMINAL.iconName,
    label: APP_CONFIGS.TERMINAL.displayName,
    appName: 'TERMINAL'
  },
  {
    type: 'application',
    id: 'app-mim',
    iconName: APP_CONFIGS.MIM.iconName,
    label: APP_CONFIGS.MIM.displayName,
    appName: 'MIM',
    featureFlag: FeatureFlag.DESKTOP_APP_MIM
  },
  {
    type: 'file',
    id: 'file-resume',
    iconName: APP_CONFIGS.PDF_VIEWER.iconName,
    label: 'resume.pdf',
    fileName: 'resume.pdf',
    filePath: '/documents/resume.pdf',
    opensWith: 'PDF_VIEWER'
  }
];

const Desktop = ({ powerOff }: DesktopProps) => {
  const [windows, setWindows] = useState<Array<WindowItem | null>>([]);
  const [powerOn, setPowerOn] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const setFocusedApp = useDesktopApplicationStore(
    (state) => state.setFocusedApp
  );
  const registerWindow = useDesktopApplicationStore(
    (state) => state.registerWindow
  );
  const unregisterWindow = useDesktopApplicationStore(
    (state) => state.unregisterWindow
  );
  const iconPositions = useDesktopApplicationStore(
    (state) => state.iconPositions
  );
  const updateIconPosition = useDesktopApplicationStore(
    (state) => state.updateIconPosition
  );

  // calculate default positions for icons that don't have saved positions
  const getDefaultPosition = (index: number) => {
    const ICON_WIDTH = 104; // 80px + padding + gap
    const ICON_HEIGHT = 120; // 80px + text + padding + gap
    const START_X = 20;
    const START_Y = 20;
    const ICONS_PER_COLUMN = 4;

    const col = Math.floor(index / ICONS_PER_COLUMN);
    const row = index % ICONS_PER_COLUMN;

    return {
      x: START_X + col * ICON_WIDTH,
      y: START_Y + row * ICON_HEIGHT
    };
  };

  const openNewWindow = (name: AppId, fileData?: WindowItem['fileData']) => {
    const updatedWindows = windows.map((window) =>
      window !== null ? { ...window, isFocused: false } : null
    );

    const newWindowId = `window-${++windowIdCounter}`;
    updatedWindows.push({
      name,
      isFocused: true,
      id: newWindowId,
      fileData
    });
    setWindows(updatedWindows);

    // defer the store update to after the component finishes updating
    queueMicrotask(() => {
      registerWindow(name, newWindowId);
    });
  };

  const handleOpenApp = (appId: AppId) => {
    const appConfig = APP_CONFIGS[appId];

    if (appConfig.featureFlag && !isFeatureEnabled(appConfig.featureFlag)) {
      return;
    }

    // if app is unique, check if window already exists
    if (appConfig.unique) {
      const existingWindowIndex = windows.findIndex(
        (w) => w && w.name === appId
      );

      if (existingWindowIndex !== -1) {
        // focus existing window
        updateWindows(existingWindowIndex);
        return;
      }
    }

    openNewWindow(appId);
  };

  useEffect(() => {
    const hasAnyFocusedWindow = windows.some((window) => window?.isFocused);
    if (!hasAnyFocusedWindow) {
      setFocusedApp(null);
    }
  }, [windows, setFocusedApp]);

  const handleCloseWindow = (id: string) => {
    const { focusedWindowId } = useDesktopApplicationStore.getState();
    const windowToClose = windows.find((window) => window && window.id === id);

    // defer the store update to after the component finishes updating
    queueMicrotask(() => {
      if (windowToClose) {
        unregisterWindow(windowToClose.name, id);
      }
    });

    setWindows((currentWindows) => {
      return currentWindows.map((window) =>
        id === get(window, 'id') ? null : window
      );
    });

    if (focusedWindowId === id) {
      setFocusedApp(null);
    }
  };

  const updateWindows = (i: number) => {
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
  };

  const visibleDesktopItems = DESKTOP_ITEMS.filter(
    (item) => !item.featureFlag || isFeatureEnabled(item.featureFlag)
  );

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
        className="absolute inset-0 pointer-events-none no-print"
        style={{
          background:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%'
        }}
      />
      {/* CRT Flicker */}
      <div className="absolute inset-0 bg-onyx/10 opacity-0 pointer-events-none animate-flicker no-print" />

      <MenuBar
        onPowerOff={() => {
          setPowerOn(false);
          setTimeout(powerOff, 550);
        }}
        onCloseWindow={handleCloseWindow}
        onOpenWindow={handleOpenApp}
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
        <div className="relative w-full h-full">
          {visibleDesktopItems.map((item, index) => {
            const handleDoubleClick = () => {
              if (item.type === 'application') {
                const appConfig = APP_CONFIGS[item.appName];

                // if app is unique, check if window already exists
                if (appConfig.unique) {
                  const existingWindowIndex = windows.findIndex(
                    (w) => w && w.name === item.appName
                  );

                  if (existingWindowIndex !== -1) {
                    // Focus existing window
                    updateWindows(existingWindowIndex);
                    return;
                  }
                }

                openNewWindow(item.appName);
              } else {
                openNewWindow(item.opensWith, {
                  fileName: item.fileName,
                  filePath: item.filePath
                });
              }
            };

            const position =
              iconPositions[item.id] || getDefaultPosition(index);

            // build list of all occupied positions except current icon's position
            const occupiedPositions = visibleDesktopItems.map((desktopItem) => {
              if (desktopItem.id === item.id) {
                return null;
              }
              return (
                iconPositions[desktopItem.id] ||
                getDefaultPosition(visibleDesktopItems.indexOf(desktopItem))
              );
            }).filter((pos): pos is { x: number; y: number } => pos !== null);

            return (
              <Icon
                key={item.id}
                iconName={item.iconName}
                label={item.label}
                onDoubleClickHandler={handleDoubleClick}
                position={position}
                onPositionChange={(newPosition) =>
                  updateIconPosition(item.id, newPosition)
                }
                occupiedPositions={occupiedPositions}
                currentIconId={item.id}
              />
            );
          })}
        </div>

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
              closeWindow={handleCloseWindow}
              fileData={item.fileData}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Desktop;
