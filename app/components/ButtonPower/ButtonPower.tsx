'use client';

import styles from './ButtonPower.module.scss';

interface ButtonPowerProps {
  on: boolean;
  onClickHandler: () => void;
}

export default function ButtonPower({ on, onClickHandler }: ButtonPowerProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/icons/icon-power.svg"
      alt=""
      className={`${styles['button-power']} ${on ? styles.on : styles.off}`}
      onClick={onClickHandler}
    />
  );
}
