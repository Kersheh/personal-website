'use client';

import { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Terminal from '../applications/Terminal/Terminal';
import WindowButton from './WindowButton/WindowButton';
import { useDesktopApplicationStore } from '../../store/desktopApplicationStore';

const APP_NAME_MAP: Record<string, string> = {
  iterm: 'Terminal'
};

const getAppDisplayName = (appName: string): string => {
  return APP_NAME_MAP[appName] || appName;
};

interface WindowProps {
  index: number;
  id: string;
  name: string;
  isFocused: boolean;
  parentNode: HTMLDivElement | null;
  windowsCount: number;
  updateWindows: (index: number) => void;
  closeWindow: (id: string) => void;
}

const Window = ({
  index,
  id,
  name,
  isFocused: initialFocused,
  parentNode,
  windowsCount,
  updateWindows,
  closeWindow
}: WindowProps) => {
  const setFocusedApp = useDesktopApplicationStore(
    (state) => state.setFocusedApp
  );
  const [isFocused, setIsFocused] = useState(initialFocused);
  const [initX] = useState(() =>
    Math.floor(Math.random() * (parentNode?.offsetHeight ?? 600) * 0.5)
  );
  const [initY] = useState(() =>
    Math.floor(Math.random() * (parentNode?.offsetWidth ?? 800) * 0.5)
  );
  const [size, setSize] = useState({
    width: Math.min(900, parentNode?.offsetWidth ?? 900),
    height: 540
  });
  const [position, setPosition] = useState({ x: initY, y: initX });
  const [resizing, setResizing] = useState<{
    dir: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialFocused) {
      setFocusedApp(getAppDisplayName(name), id);
    }
  }, [initialFocused, name, id, setFocusedApp]);

  const MIN_WIDTH = Math.min(700, parentNode?.offsetWidth ?? 700);
  const MIN_HEIGHT = 400;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isMenuBarClick = (target as Element).closest?.('[data-menu-bar]');

      if (
        nodeRef.current &&
        !nodeRef.current.contains(target) &&
        !isMenuBarClick
      ) {
        setIsFocused(false);
        // unfocus all windows in Desktop state
        updateWindows(-1);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [updateWindows]);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;

      setSize(() => {
        const clampWidth = (w: number) => Math.max(MIN_WIDTH, w);
        const clampHeight = (h: number) => Math.max(MIN_HEIGHT, h);

        let nextWidth = resizing.startWidth;
        let nextHeight = resizing.startHeight;
        let nextPosX = resizing.startPosX;
        let nextPosY = resizing.startPosY;

        if (resizing.dir.includes('e')) {
          nextWidth = clampWidth(resizing.startWidth + deltaX);
        }

        if (resizing.dir.includes('w')) {
          const rawWidth = resizing.startWidth - deltaX;
          nextWidth = clampWidth(rawWidth);
          const applied = resizing.startWidth - nextWidth;
          const shift = Math.min(deltaX, applied);
          nextPosX = resizing.startPosX + shift;
        }

        if (resizing.dir.includes('s')) {
          const rawHeight = resizing.startHeight + deltaY;
          nextHeight = clampHeight(rawHeight);
        }

        if (resizing.dir.includes('n')) {
          const rawHeight = resizing.startHeight - deltaY;
          nextHeight = clampHeight(rawHeight);
          const applied = resizing.startHeight - nextHeight;
          const shift = Math.min(deltaY, applied);
          nextPosY = resizing.startPosY + shift;
        }

        setPosition({ x: nextPosX, y: nextPosY });
        return { width: nextWidth, height: nextHeight };
      });
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, MIN_WIDTH, MIN_HEIGHT]);

  return (
    <Draggable
      handle=".window-bar"
      nodeRef={nodeRef}
      position={position}
      onDrag={(_, data) => {
        setPosition({ x: data.x, y: data.y });
      }}
    >
      <div
        className={`bg-daintree border border-black/10 rounded-lg absolute top-0 transition-opacity duration-200 ${
          isFocused ? 'opacity-100' : 'opacity-60'
        }`}
        ref={nodeRef}
        onClick={() => {
          setIsFocused(true);
          updateWindows(index);
          setFocusedApp(getAppDisplayName(name), id);
        }}
        style={{
          zIndex: isFocused ? windowsCount + 1 : index,
          width: size.width,
          height: size.height
        }}
      >
        <div className="bg-mystic h-[30px] rounded-t-lg pl-2.5 text-left window-bar">
          <WindowButton color="red" onButtonClick={() => closeWindow(id)} />
          <WindowButton color="yellow" />
          <WindowButton color="green" />
        </div>

        <Terminal
          autoFocus={isFocused}
          closeWindow={closeWindow}
          windowId={id}
          height={size.height - 30}
        />

        {/* Resize handles */}
        <div
          className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsFocused(true);
            updateWindows(index);
            setResizing({
              dir: 'e',
              startX: e.clientX,
              startY: e.clientY,
              startWidth: size.width,
              startHeight: size.height,
              startPosX: position.x,
              startPosY: position.y
            });
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsFocused(true);
            updateWindows(index);
            setResizing({
              dir: 's',
              startX: e.clientX,
              startY: e.clientY,
              startWidth: size.width,
              startHeight: size.height,
              startPosX: position.x,
              startPosY: position.y
            });
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsFocused(true);
            updateWindows(index);
            setResizing({
              dir: 'se',
              startX: e.clientX,
              startY: e.clientY,
              startWidth: size.width,
              startHeight: size.height,
              startPosX: position.x,
              startPosY: position.y
            });
          }}
        />
        <div
          className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsFocused(true);
            updateWindows(index);
            setResizing({
              dir: 'w',
              startX: e.clientX,
              startY: e.clientY,
              startWidth: size.width,
              startHeight: size.height,
              startPosX: position.x,
              startPosY: position.y
            });
          }}
        />
        <div
          className="absolute top-0 left-0 w-full h-2 cursor-ns-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsFocused(true);
            updateWindows(index);
            setResizing({
              dir: 'n',
              startX: e.clientX,
              startY: e.clientY,
              startWidth: size.width,
              startHeight: size.height,
              startPosX: position.x,
              startPosY: position.y
            });
          }}
        />
        <div
          className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsFocused(true);
            updateWindows(index);
            setResizing({
              dir: 'nw',
              startX: e.clientX,
              startY: e.clientY,
              startWidth: size.width,
              startHeight: size.height,
              startPosX: position.x,
              startPosY: position.y
            });
          }}
        />
        <div
          className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsFocused(true);
            updateWindows(index);
            setResizing({
              dir: 'ne',
              startX: e.clientX,
              startY: e.clientY,
              startWidth: size.width,
              startHeight: size.height,
              startPosX: position.x,
              startPosY: position.y
            });
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsFocused(true);
            updateWindows(index);
            setResizing({
              dir: 'sw',
              startX: e.clientX,
              startY: e.clientY,
              startWidth: size.width,
              startHeight: size.height,
              startPosX: position.x,
              startPosY: position.y
            });
          }}
        />
      </div>
    </Draggable>
  );
};

export default Window;
