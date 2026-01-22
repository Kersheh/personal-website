'use client';

import { useState, useEffect } from 'react';
import Desktop from './core/Desktop/Desktop';
import ButtonPower from './components/ButtonPower/ButtonPower';
import { useFileSystemStore } from './store/fileSystemStore';

const Home = () => {
  const [poweredOn, setPoweredOn] = useState(
    process.env.NODE_ENV === 'development'
  );
  const ensureTerminalExists = useFileSystemStore(
    (state) => state.ensureTerminalExists
  );

  useEffect(() => {
    console.log(`v${process.env.APP_VERSION}`);
  }, []);

  return (
    <div className="h-full overflow-hidden">
      {poweredOn ? (
        <Desktop powerOff={() => setPoweredOn(false)} />
      ) : (
        <div className="h-full flex items-center justify-center animate-fadein">
          <ButtonPower
            on={true}
            onClickHandler={() => {
              ensureTerminalExists();
              setPoweredOn(true);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
