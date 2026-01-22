'use client';

import { useDesktopApplicationStore } from '@/app/store/desktopApplicationStore';
import { dispatchWindowEvent } from '@/app/hooks/useWindowEvent';

interface DevtoolsProps {
  height?: number;
}

const Devtools = ({ height }: DevtoolsProps) => {
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
          <h3 className="text-sm font-semibold text-white/90 mb-2">System</h3>
          <button
            onClick={() => dispatchWindowEvent('system-restore')}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-xs border border-white/20 transition-colors font-['Courier_new','Courier',monospace]"
          >
            Restore System to Last Backup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Devtools;
