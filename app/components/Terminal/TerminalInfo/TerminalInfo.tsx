'use client';

import styles from '../Terminal.module.scss';

export default function TerminalInfo() {
  return (
    <span className={styles['terminal-row__info']}>guest@matthewbreckon.com $</span>
  );
}
