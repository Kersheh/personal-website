'use client';

import { forwardRef, useState } from 'react';

const TerminalInfo = forwardRef<HTMLSpanElement>((_props, ref) => {
  const [host] = useState(() =>
    typeof window !== 'undefined' ? window.location.host : 'matthewbreckon.com'
  );

  return (
    <span ref={ref} className="font-semibold pointer-events-none no-underline">
      guest@{host} $
    </span>
  );
});

TerminalInfo.displayName = 'TerminalInfo';

export default TerminalInfo;
