'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Icon.module.scss';

interface IconProps {
  iconName: string;
  onDoubleClickHandler: () => void;
}

export default function Icon({ iconName, onDoubleClickHandler }: IconProps) {
  const [isSelected, setIsSelected] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const onClick = () => {
    setIsSelected(true);
  };

  const onDoubleClick = () => {
    onDoubleClickHandler();
  };

  return (
    <div
      className={`${styles.icon} ${styles[`icon-${iconName}`]}${isSelected ? ` ${styles.active}` : ''}`}
      ref={nodeRef}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    />
  );
}
