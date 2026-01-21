'use client';

import { useMemo } from 'react';
import { useMIMPreferencesStore } from './store/preferencesStore';
import { getTheme, getThemeList } from './themes';

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
  const themeId = useMIMPreferencesStore((state) => state.theme);
  const setTheme = useMIMPreferencesStore((state) => state.setTheme);

  const theme = getTheme(themeId);
  const themeList = getThemeList();

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
      className="font-mono text-sm p-4 overflow-auto"
      style={{
        height: `${contentHeight}px`,
        backgroundColor: theme.colors.bg,
        color: theme.colors.text
      }}
    >
      <div className="space-y-6">
        <div>
          <h3
            className="text-sm font-semibold mb-4 pb-2"
            style={{
              color: theme.colors.textHeader,
              borderBottom: `1px solid ${theme.colors.borderHeader}`
            }}
          >
            Appearance
          </h3>
          <label className="flex items-center gap-3">
            <span style={{ color: theme.colors.text }}>Theme</span>
            <select
              value={themeId}
              onChange={(e) => setTheme(e.target.value)}
              className="rounded px-2 py-1 cursor-pointer"
              style={{
                backgroundColor: theme.colors.bgInput,
                borderColor: theme.colors.borderInput,
                border: `1px solid ${theme.colors.borderInput}`,
                color: theme.colors.text
              }}
            >
              {themeList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <h3
            className="text-sm font-semibold mb-4 pb-2"
            style={{
              color: theme.colors.textHeader,
              borderBottom: `1px solid ${theme.colors.borderHeader}`
            }}
          >
            Date & Time
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={use24HourFormat}
              onChange={toggleUse24HourFormat}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: theme.colors.accent }}
            />
            <span style={{ color: theme.colors.text }}>Use 24-hour format</span>
          </label>
          <p
            className="text-xs mt-2 ml-7"
            style={{ color: theme.colors.textTimestamp }}
          >
            Times will display as {exampleTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MIMPreferences;
