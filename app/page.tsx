'use client';

import { useState, useEffect } from 'react';
import Desktop from './components/Desktop/Desktop';
import ButtonPower from './components/ButtonPower/ButtonPower';

const Home = () => {
  const [poweredOn, setPoweredOn] = useState(false);

  useEffect(() => {
    console.log(`v${process.env.APP_VERSION}`);
  }, []);

  return (
    <div className="h-full overflow-hidden">
      {poweredOn ? (
        <Desktop powerOff={() => setPoweredOn(false)} />
      ) : (
        <div className="h-full flex items-center justify-center animate-fadein">
          <ButtonPower on={true} onClickHandler={() => setPoweredOn(true)} />
        </div>
      )}
    </div>
  );
};

export default Home;
