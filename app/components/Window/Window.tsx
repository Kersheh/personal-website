'use client';

import { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import Terminal from '../Terminal/Terminal';
import WindowButton from './WindowButton/WindowButton';
import styles from './Window.module.scss';

interface WindowProps {
  index: number;
  id: string;
  isFocused: boolean;
  parentNode: HTMLDivElement | null;
  windowsCount: number;
  updateWindows: (index: number) => void;
  closeWindow: (id: string) => void;
}

export default function Window({
  index,
  id,
  isFocused: initialFocused,
  parentNode,
  windowsCount,
  updateWindows,
  closeWindow,
}: WindowProps) {
  const [isFocused, setIsFocused] = useState(initialFocused);
  const [initX] = useState(() => 
    Math.floor(Math.random() * (parentNode?.offsetHeight ?? 600) * 0.5)
  );
  const [initY] = useState(() => 
    Math.floor(Math.random() * (parentNode?.offsetWidth ?? 800) * 0.5)
  );
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const onFocus = () => {
    setIsFocused(true);
    updateWindows(index);
  };

  const handleButtonClick = () => {
    // TODO: functionality on button click
  };

  const handleCloseWindow = () => {
    closeWindow(id);
  };

  return (
    <Draggable handle=".window-bar" nodeRef={nodeRef}>
      <div
        className={styles.window}
        ref={nodeRef}
        onClick={onFocus}
        style={{
          zIndex: isFocused ? windowsCount + 1 : index,
          top: initX,
          left: initY,
        }}
      >
        <div className={`${styles['window-bar']} window-bar`}>
          <WindowButton color="red" onButtonClick={handleCloseWindow} />
          <WindowButton color="yellow" onButtonClick={handleButtonClick} />
          <WindowButton color="green" onButtonClick={handleButtonClick} />
        </div>

        <Terminal autoFocus={isFocused} />
      </div>
    </Draggable>
  );
}
