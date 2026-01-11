import { create } from 'zustand';

interface DesktopApplicationState {
  focusedApp: string | null;
  focusedWindowId: string | null;
  setFocusedApp: (appName: string | null, windowId?: string | null) => void;
}

export const useDesktopApplicationStore = create<DesktopApplicationState>(
  (set) => ({
    focusedApp: null,
    focusedWindowId: null,
    setFocusedApp: (appName, windowId = null) =>
      set((state) => {
        if (
          state.focusedApp === appName &&
          state.focusedWindowId === windowId
        ) {
          return state;
        }
        return { focusedApp: appName, focusedWindowId: windowId };
      })
  })
);
