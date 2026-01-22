'use client';

import {
  useState,
  useEffect,
  useRef,
  ReactNode,
  cloneElement,
  isValidElement
} from 'react';
import Draggable from 'react-draggable';
import WindowButton from './WindowButton/WindowButton';
import { useDesktopApplicationStore } from '@/app/store/desktopApplicationStore';
import {
  getChildWindowConfig,
  ChildWindowId,
  AppId,
  getAppConfig
} from '@/app/components/applications/appRegistry';

const WINDOW_Z_BASE = 2000;
const WINDOW_FOCUS_BUMP = 100;

interface ChildWindowProps {
  index: number;
  id: string;
  childWindowId: ChildWindowId;
  parentAppId: AppId;
  isFocused: boolean;
  parentNode: HTMLDivElement | null;
  updateWindows: (index: number) => void;
  closeWindow: (id: string) => void;
  children: ReactNode;
}

const ChildWindow = ({
  index,
  id,
  childWindowId,
  parentAppId,
  isFocused: initialFocused,
  parentNode,
  updateWindows,
  closeWindow,
  children
}: ChildWindowProps) => {
  const setFocusedApp = useDesktopApplicationStore(
    (state) => state.setFocusedApp
  );
  const childWindowConfig = getChildWindowConfig(childWindowId);
  const parentAppConfig = getAppConfig(parentAppId);
  const [isFocused, setIsFocused] = useState(initialFocused);

  useEffect(() => {
    setIsFocused(initialFocused);
  }, [initialFocused]);

  const initialWidth = Math.min(
    childWindowConfig.size.width,
    parentNode?.offsetWidth ?? childWindowConfig.size.width
  );
  const initialHeight = Math.min(
    childWindowConfig.size.height,
    parentNode?.offsetHeight ?? childWindowConfig.size.height
  );

  const maxX = Math.max(0, (parentNode?.offsetWidth ?? 800) - initialWidth);
  const maxY = Math.max(0, (parentNode?.offsetHeight ?? 600) - initialHeight);

  // center the child window
  const [initX] = useState(() => Math.floor(maxX / 2));
  const [initY] = useState(() => Math.floor(maxY / 2));

  const [size] = useState({
    width: initialWidth,
    height: initialHeight
  });
  const [position, setPosition] = useState({ x: initX, y: initY });
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialFocused && parentAppConfig) {
      // keep parent app as focused app
      setFocusedApp(parentAppConfig.displayName, id);
    }
  }, [initialFocused, parentAppConfig, id, setFocusedApp]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isMenuBarClick = (target as Element).closest?.('[data-menu-bar]');
      const isAnyWindowClick = (target as Element).closest?.('[data-window]');

      if (
        nodeRef.current &&
        !nodeRef.current.contains(target) &&
        !isMenuBarClick &&
        !isAnyWindowClick
      ) {
        setIsFocused(false);
        updateWindows(-1);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [updateWindows]);

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
        className={`bg-daintree border border-black/10 rounded-lg absolute top-0 transition-opacity duration-200 ${isFocused ? 'opacity-100' : 'opacity-60'}`}
        ref={nodeRef}
        data-window
        onClick={() => {
          setIsFocused(true);
          updateWindows(index);
          if (parentAppConfig) {
            // keep parent app as focused app
            setFocusedApp(parentAppConfig.displayName, id);
          }
        }}
        style={{
          zIndex:
            WINDOW_Z_BASE + (isFocused ? WINDOW_FOCUS_BUMP + index : index),
          width: size.width,
          height: size.height,
          willChange: 'opacity'
        }}
      >
        <div className="bg-mystic h-[30px] rounded-t-lg pl-2.5 text-left window-bar flex items-center">
          <WindowButton color="red" onButtonClick={() => closeWindow(id)} />
          <span className="ml-3 text-xs text-gray-600 font-['Courier_new','Courier',monospace] select-none">
            {childWindowConfig.displayName}
          </span>
        </div>

        <div
          style={{
            height: size.height - 30,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {isValidElement(children)
            ? cloneElement(children, { height: size.height - 30 } as never)
            : children}
        </div>
      </div>
    </Draggable>
  );
};

export default ChildWindow;
