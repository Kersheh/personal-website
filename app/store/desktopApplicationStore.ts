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
      set({ focusedApp: appName, focusedWindowId: windowId })
  })
);
