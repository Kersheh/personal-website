'use client';

import { useState } from 'react';
import Desktop from './components/Desktop/Desktop';
import ButtonPower from './components/ButtonPower/ButtonPower';

export default function Home() {
  const [poweredOn, setPoweredOn] = useState(false);

  const powerOn = () => {
    setPoweredOn(true);
  };

  const powerOff = () => {
    setPoweredOn(false);
  };

  return (
    <div className="h-full">
      {poweredOn ? (
        <Desktop powerOff={powerOff} />
      ) : (
        <div className="h-full flex items-center justify-center animate-fadein">
          <ButtonPower on={true} onClickHandler={powerOn} />
        </div>
      )}
    </div>
  );
}
