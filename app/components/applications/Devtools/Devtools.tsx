'use client';

import { useDesktopApplicationStore } from '@/app/store/desktopApplicationStore';
import { useState } from 'react';

interface DevtoolsProps {
  height?: number;
}

const Devtools = ({ height }: DevtoolsProps) => {
  const [clearStatus, setClearStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );
  const [clearMessage, setClearMessage] = useState('');
  const resetIconPositions = useDesktopApplicationStore(
    (state) => state.resetIconPositions
  );

  const contentHeight = Math.max(200, height ?? 400);

  return (
    <div
      className="bg-[#1e1e2e] text-white/90 font-['Courier_new','Courier',monospace] overflow-auto p-4"
      style={{ height: `${contentHeight}px` }}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white/90 mb-2">
            Desktop Icons
          </h3>
          <button
            onClick={() => resetIconPositions()}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-xs border border-white/20 transition-colors font-['Courier_new','Courier',monospace]"
          >
            Reset Icon Positions
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white/90 mb-2">
            MIM / Chat
          </h3>
          <button
            onClick={async () => {
              setClearStatus('idle');
              setClearMessage('');

              try {
                const response = await fetch('/api/chat/clear', {
                  method: 'POST'
                });
                const data = await response.json();

                if (!response.ok || !data.success) {
                  setClearStatus('error');
                  setClearMessage('Failed to clear (dev only).');
                  return;
                }

                setClearStatus('success');
                setClearMessage('Cleared chat messages.');
                window.dispatchEvent(new Event('mim:clear'));
              } catch (error) {
                console.error('Failed to clear chat messages:', error);
                setClearStatus('error');
                setClearMessage('Failed to clear (check console).');
              }
            }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-xs border border-white/20 transition-colors font-['Courier_new','Courier',monospace]"
          >
            Clear Chat Messages
          </button>
          {clearStatus !== 'idle' && (
            <div
              className={`mt-2 text-xs ${
                clearStatus === 'success' ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {clearMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Devtools;
