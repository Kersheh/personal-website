'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MIMPreferencesState {
  use24HourFormat: boolean;
  setUse24HourFormat: (value: boolean) => void;
  toggleUse24HourFormat: () => void;
}

export const useMIMPreferencesStore = create<MIMPreferencesState>()(
  persist(
    (set) => ({
      use24HourFormat: false,
      setUse24HourFormat: (value) => set({ use24HourFormat: value }),
      toggleUse24HourFormat: () =>
        set((state) => ({ use24HourFormat: !state.use24HourFormat }))
    }),
    {
      name: 'mim-preferences'
    }
  )
);
