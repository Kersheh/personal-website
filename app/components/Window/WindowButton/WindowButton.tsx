'use client';

import { useState } from 'react';
import styles from '../Window.module.scss';

interface WindowButtonProps {
  color: string;
  onButtonClick: () => void;
}

export default function WindowButton({ color, onButtonClick }: WindowButtonProps) {
  const [hover, setHover] = useState(false);

  const className = `${styles.button} ${styles[`button--${color}`]}${hover ? ` ${styles.hover}` : ''}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onButtonClick();
  };

  return (
    <span
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
    />
  );
}
