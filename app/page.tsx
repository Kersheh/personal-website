'use client';

import { useState } from 'react';
import Desktop from './components/Desktop/Desktop';
import ButtonPower from './components/ButtonPower/ButtonPower';

const Home = () => {
  const [poweredOn, setPoweredOn] = useState(false);

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
