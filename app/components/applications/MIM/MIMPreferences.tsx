'use client';

import { useMemo } from 'react';
import { useMIMPreferencesStore } from './store/preferencesStore';

const EXAMPLE_TIMESTAMP = Date.now();

interface MIMPreferencesProps {
  height?: number;
}

const MIMPreferences = ({ height }: MIMPreferencesProps) => {
  const use24HourFormat = useMIMPreferencesStore(
    (state) => state.use24HourFormat
  );
  const toggleUse24HourFormat = useMIMPreferencesStore(
    (state) => state.toggleUse24HourFormat
  );
  const exampleTime = useMemo(
    () =>
      new Date(EXAMPLE_TIMESTAMP).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !use24HourFormat
      }),
    [use24HourFormat]
  );

  const contentHeight = Math.max(200, height ?? 250);

  return (
    <div
      className="bg-slate-900 text-slate-100 font-mono text-sm p-4 overflow-auto"
      style={{ height: `${contentHeight}px` }}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">
            Date & Time
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={use24HourFormat}
              onChange={toggleUse24HourFormat}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
            <span className="text-slate-200">Use 24-hour format</span>
          </label>
          <p className="text-xs text-slate-400 mt-2 ml-7">
            Times will display as {exampleTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MIMPreferences;
