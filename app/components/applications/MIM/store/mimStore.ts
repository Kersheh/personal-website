'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  username: string | null;
  id: string | null;
}

interface PreferencesState {
  use24HourFormat: boolean;
  theme: string;
}

interface MIMState {
  user: UserState;
  preferences: PreferencesState;
  setUsername: (username: string) => void;
  setUserId: (id: string) => void;
  setUse24HourFormat: (value: boolean) => void;
  toggleUse24HourFormat: () => void;
  setTheme: (theme: string) => void;
}

export const useMIMStore = create<MIMState>()(
  persist(
    (set) => ({
      user: {
        username: null,
        id: null
      },
      preferences: {
        use24HourFormat: false,
        theme: 'slate'
      },
      setUsername: (username) =>
        set((state) => ({
          user: { ...state.user, username }
        })),
      setUserId: (id) =>
        set((state) => ({
          user: { ...state.user, id }
        })),
      setUse24HourFormat: (value) =>
        set((state) => ({
          preferences: { ...state.preferences, use24HourFormat: value }
        })),
      toggleUse24HourFormat: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            use24HourFormat: !state.preferences.use24HourFormat
          }
        })),
      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme }
        }))
    }),
    {
      name: 'mim-store'
    }
  )
);
