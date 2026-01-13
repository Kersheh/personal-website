import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppId } from '@/app/components/applications/appRegistry';

export interface IconPosition {
  x: number;
  y: number;
}

export interface DesktopApplicationState {
  focusedApp: string | null;
  focusedWindowId: string | null;
  windowsByApp: Record<AppId, Set<string>>;
  iconPositions: Record<string, IconPosition>;
  setFocusedApp: (appName: string | null, windowId?: string | null) => void;
  registerWindow: (appId: AppId, windowId: string) => void;
  unregisterWindow: (appId: AppId, windowId: string) => void;
  getWindowsForApp: (appId: AppId) => Array<string>;
  updateIconPosition: (iconId: string, position: IconPosition) => void;
  getIconPosition: (iconId: string) => IconPosition | undefined;
}

export const useDesktopApplicationStore = create<DesktopApplicationState>()(
  persist(
    (set, get) => ({
      focusedApp: null,
      focusedWindowId: null,
      windowsByApp: {
        TERMINAL: new Set(),
        PDF_VIEWER: new Set()
      },
      iconPositions: {},
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
      },
      updateIconPosition: (iconId: string, position: IconPosition) =>
        set((state) => ({
          iconPositions: { ...state.iconPositions, [iconId]: position }
        })),
      getIconPosition: (iconId: string) => {
        return get().iconPositions[iconId];
      }
    }),
    {
      name: 'desktop-storage',
      partialize: (state) => ({ iconPositions: state.iconPositions })
    }
  )
);
