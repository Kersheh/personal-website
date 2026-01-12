import { create } from 'zustand';
import { AppId } from '@/app/components/applications/appRegistry';

export interface DesktopApplicationState {
  focusedApp: string | null;
  focusedWindowId: string | null;
  windowsByApp: Record<AppId, Set<string>>;
  setFocusedApp: (appName: string | null, windowId?: string | null) => void;
  registerWindow: (appId: AppId, windowId: string) => void;
  unregisterWindow: (appId: AppId, windowId: string) => void;
  getWindowsForApp: (appId: AppId) => Array<string>;
}

export const useDesktopApplicationStore = create<DesktopApplicationState>(
  (set, get) => ({
    focusedApp: null,
    focusedWindowId: null,
    windowsByApp: {
      TERMINAL: new Set(),
      PDF_VIEWER: new Set()
    },
    setFocusedApp: (appName, windowId = null) =>
      set((state) => {
        if (
          state.focusedApp === appName &&
          state.focusedWindowId === windowId
        ) {
          return state;
        }
        return { focusedApp: appName, focusedWindowId: windowId };
      }),
    registerWindow: (appId: AppId, windowId: string) =>
      set((state) => {
        const newWindowsByApp = { ...state.windowsByApp };
        if (!newWindowsByApp[appId]) {
          newWindowsByApp[appId] = new Set();
        }
        newWindowsByApp[appId].add(windowId);
        return { windowsByApp: newWindowsByApp };
      }),
    unregisterWindow: (appId: AppId, windowId: string) =>
      set((state) => {
        const newWindowsByApp = { ...state.windowsByApp };
        if (newWindowsByApp[appId]) {
          newWindowsByApp[appId].delete(windowId);
        }
        return { windowsByApp: newWindowsByApp };
      }),
    getWindowsForApp: (appId: AppId) => {
      const windows = get().windowsByApp[appId];
      return windows ? Array.from(windows) : [];
    }
  })
);
