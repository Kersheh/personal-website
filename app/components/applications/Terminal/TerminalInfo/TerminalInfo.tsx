'use client';

import { useState } from 'react';

const TerminalInfo = () => {
  const [host] = useState(() =>
    typeof window !== 'undefined' ? window.location.host : 'matthewbreckon.com'
  );

  return <span className="font-semibold pr-2.5">guest@{host} $</span>;
};

export default TerminalInfo;
