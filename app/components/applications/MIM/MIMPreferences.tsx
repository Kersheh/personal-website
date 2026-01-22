'use client';

import { useMemo, useState } from 'react';
import { useMIMStore } from './store/mimStore';
import { getTheme, getThemeList } from './themes';

const EXAMPLE_TIMESTAMP = Date.now();

interface MIMPreferencesProps {
  height?: number;
}

const MIMPreferences = ({ height }: MIMPreferencesProps) => {
  const use24HourFormat = useMIMStore(
    (state) => state.preferences.use24HourFormat
  );
  const toggleUse24HourFormat = useMIMStore(
    (state) => state.toggleUse24HourFormat
  );
  const themeId = useMIMStore((state) => state.preferences.theme);
  const setTheme = useMIMStore((state) => state.setTheme);
  const username = useMIMStore((state) => state.user.username);
  const [isChanging, setIsChanging] = useState(false);

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
      className="font-mono text-sm p-4 overflow-y-auto flex flex-col"
      style={{
        height: `${contentHeight}px`,
        backgroundColor: theme.colors.bg,
        color: theme.colors.text
      }}
    >
      <div className="space-y-6 flex-shrink-0">
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

        <div>
          <h3
            className="text-sm font-semibold mb-4 pb-2"
            style={{
              color: theme.colors.textHeader,
              borderBottom: `1px solid ${theme.colors.borderHeader}`
            }}
          >
            User
          </h3>
          {username && (
            <p
              className="text-xs mb-3"
              style={{ color: theme.colors.textTimestamp }}
            >
              Current username:{' '}
              <span style={{ color: theme.colors.text, fontWeight: 'bold' }}>
                {username}
              </span>
            </p>
          )}
          <button
            onClick={async () => {
              setIsChanging(true);

              try {
                const response = await fetch('/api/chat/join', {
                  method: 'POST'
                });
                const data = await response.json();

                if (data.success) {
                  useMIMStore.setState((state) => ({
                    user: {
                      ...state.user,
                      username: data.username,
                      id: data.userId
                    }
                  }));
                }
              } catch (error) {
                console.error('Failed to change username:', error);
              } finally {
                setIsChanging(false);
              }
            }}
            disabled={isChanging}
            className="px-3 py-1 text-xs rounded transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.bg
            }}
          >
            {isChanging ? 'Changing...' : 'Change Username'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MIMPreferences;
