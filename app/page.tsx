'use client';

import { useState } from 'react';
import Desktop from './components/Desktop/Desktop';
import ButtonPower from './components/ButtonPower/ButtonPower';
import styles from './page.module.scss';

export default function Home() {
  const [poweredOn, setPoweredOn] = useState(false);

  const powerOn = () => {
    setPoweredOn(true);
  };

  const powerOff = () => {
    setPoweredOn(false);
  };

  return (
    <div className={styles.app}>
      {poweredOn ? (
        <Desktop powerOff={powerOff} />
      ) : (
        <div className={styles['app--off']}>
          <ButtonPower on={true} onClickHandler={powerOn} />
        </div>
      )}
    </div>
  );
}
