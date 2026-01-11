'use client';

import { useState, useRef } from 'react';
import { get } from 'lodash';
import Window from '../Window/Window';
import Icon from '../Icon/Icon';
import ButtonPower from '../ButtonPower/ButtonPower';
import styles from './Desktop.module.scss';

let windowIdCounter = 0;

interface WindowItem {
  name: string;
  isFocused: boolean;
  id: string;
}

interface DesktopProps {
  powerOff: () => void;
}

export default function Desktop({ powerOff }: DesktopProps) {
  const [windows, setWindows] = useState<(WindowItem | null)[]>([]);
  const [powerOn, setPowerOn] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);

  const updateWindows = (i: number) => {
    const updatedWindows = windows.map((window) =>
      window !== null ? { ...window, isFocused: false } : null
    );

    if (updatedWindows[i]) {
      updatedWindows[i]!.isFocused = true;
    }

    setWindows(updatedWindows);
  };

  const openNewWindow = (name: string) => {
    const updatedWindows = windows.map((window) =>
      window !== null ? { ...window, isFocused: false } : null
    );

    updatedWindows.push({
      name: name,
      isFocused: true,
      id: `window-${++windowIdCounter}`,
    });

    setWindows(updatedWindows);
  };

  const closeWindow = (id: string) => {
    const updatedWindows = windows.map((window) =>
      id === get(window, 'id') ? null : window
    );

    setWindows(updatedWindows);
  };

  const timedPowerOff = () => {
    setPowerOn(false);
    setTimeout(powerOff, 550);
  };

  return (
    <div
      className={`${styles.desktop}${powerOn ? '' : ` ${styles['turn-off']}`}`}
      ref={nodeRef}
    >
      <div className={styles.content}>
        <ButtonPower on={false} onClickHandler={timedPowerOff} />
        <Icon
          iconName="iterm"
          onDoubleClickHandler={() => openNewWindow('iterm')}
        />

        {windows.map((item, i) => {
          return item === null ? null : (
            <Window
              key={i}
              index={i}
              id={item.id}
              isFocused={item.isFocused}
              updateWindows={updateWindows}
              parentNode={nodeRef.current}
              windowsCount={windows.length}
              closeWindow={closeWindow}
            />
          );
        })}
      </div>
    </div>
  );
}
