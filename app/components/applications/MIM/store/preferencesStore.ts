'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MIMPreferencesState {
  use24HourFormat: boolean;
  theme: string;
  setUse24HourFormat: (value: boolean) => void;
  toggleUse24HourFormat: () => void;
  setTheme: (theme: string) => void;
}

export const useMIMPreferencesStore = create<MIMPreferencesState>()(
  persist(
    (set) => ({
      use24HourFormat: false,
      theme: 'slate',
      setUse24HourFormat: (value) => set({ use24HourFormat: value }),
      toggleUse24HourFormat: () =>
        set((state) => ({ use24HourFormat: !state.use24HourFormat })),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'mim-preferences'
    }
  )
);
