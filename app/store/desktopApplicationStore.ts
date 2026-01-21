import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppId,
  ChildWindowId
} from '@/app/components/applications/appRegistry';

const APP_VERSION = process.env.APP_VERSION ?? '0.0.0';

const parseAppVersion = (version: string) => {
  const [major = 0, minor = 0, patch = 0] = version
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);

  return { major, minor, patch };
};

const APP_VERSION_PARTS = parseAppVersion(APP_VERSION);
const APP_VERSION_MAJOR_MINOR =
  APP_VERSION_PARTS.major * 1_000 + APP_VERSION_PARTS.minor;

export interface ChildWindowState {
  childWindowId: ChildWindowId;
  windowId: string;
}

const baseState = () => ({
  appVersion: APP_VERSION,
  focusedApp: null,
  focusedWindowId: null,
  windowsByApp: {},
  childWindowsByApp: {},
  iconPositions: {}
});

type PersistedDesktopState = {
  appVersion?: string;
  iconPositions: Record<string, IconPosition>;
};

export interface IconPosition {
  x: number;
  y: number;
}

export interface DesktopApplicationState {
  appVersion?: string;
  focusedApp: string | null;
  focusedWindowId: string | null;
  windowsByApp: Partial<Record<AppId, Set<string>>>;
  childWindowsByApp: Partial<Record<AppId, Set<ChildWindowState>>>;
  iconPositions: Record<string, IconPosition>;
  setFocusedApp: (appName: string | null, windowId?: string | null) => void;
  registerWindow: (appId: AppId, windowId: string) => void;
  unregisterWindow: (appId: AppId, windowId: string) => void;
  getWindowsForApp: (appId: AppId) => Array<string>;
  registerChildWindow: (
    parentAppId: AppId,
    childWindowId: ChildWindowId,
    windowId: string
  ) => void;
  unregisterChildWindow: (parentAppId: AppId, windowId: string) => void;
  getChildWindowsForApp: (appId: AppId) => Array<ChildWindowState>;
  isChildWindowOpen: (
    parentAppId: AppId,
    childWindowId: ChildWindowId
  ) => boolean;
  updateIconPosition: (iconId: string, position: IconPosition) => void;
  getIconPosition: (iconId: string) => IconPosition | undefined;
  resetIconPositions: () => void;
}

export const useDesktopApplicationStore = create<DesktopApplicationState>()(
  persist(
    (set, get) => ({
      ...baseState(),
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
      registerWindow: (appId, windowId) =>
        set((state) => {
          const newWindowsByApp = { ...state.windowsByApp };
          if (!newWindowsByApp[appId]) {
            newWindowsByApp[appId] = new Set();
          }
          newWindowsByApp[appId]?.add(windowId);
          return { windowsByApp: newWindowsByApp };
        }),
      unregisterWindow: (appId, windowId) =>
        set((state) => {
          const newWindowsByApp = { ...state.windowsByApp };
          newWindowsByApp[appId]?.delete(windowId);
          return { windowsByApp: newWindowsByApp };
        }),
      getWindowsForApp: (appId) => {
        const windows = get().windowsByApp[appId];
        return windows ? Array.from(windows) : [];
      },
      registerChildWindow: (parentAppId, childWindowId, windowId) =>
        set((state) => {
          const newChildWindowsByApp = { ...state.childWindowsByApp };
          if (!newChildWindowsByApp[parentAppId]) {
            newChildWindowsByApp[parentAppId] = new Set();
          }
          newChildWindowsByApp[parentAppId]?.add({ childWindowId, windowId });
          return { childWindowsByApp: newChildWindowsByApp };
        }),
      unregisterChildWindow: (parentAppId, windowId) =>
        set((state) => {
          const newChildWindowsByApp = { ...state.childWindowsByApp };
          const childWindows = newChildWindowsByApp[parentAppId];
          if (childWindows) {
            const toDelete = Array.from(childWindows).find(
              (cw) => cw.windowId === windowId
            );
            if (toDelete) {
              childWindows.delete(toDelete);
            }
          }
          return { childWindowsByApp: newChildWindowsByApp };
        }),
      getChildWindowsForApp: (appId) => {
        const childWindows = get().childWindowsByApp[appId];
        return childWindows ? Array.from(childWindows) : [];
      },
      isChildWindowOpen: (parentAppId, childWindowId) => {
        const childWindows = get().childWindowsByApp[parentAppId];
        if (!childWindows) {
          return false;
        }
        return Array.from(childWindows).some(
          (cw) => cw.childWindowId === childWindowId
        );
      },
      updateIconPosition: (iconId, position) =>
        set((state) => ({
          iconPositions: { ...state.iconPositions, [iconId]: position }
        })),
      getIconPosition: (iconId) => {
        return get().iconPositions[iconId];
      },
      resetIconPositions: () => set({ iconPositions: {} })
    }),
    {
      name: 'desktop-storage',
      partialize: (state) => ({
        appVersion: state.appVersion,
        iconPositions: state.iconPositions
      }),
      migrate: (persistedState, version) => {
        if (version !== APP_VERSION_MAJOR_MINOR) {
          return {
            appVersion: APP_VERSION,
            iconPositions: {}
          } as PersistedDesktopState;
        }

        const stateAsRecord = persistedState as Partial<PersistedDesktopState>;
        return {
          appVersion: APP_VERSION,
          iconPositions: stateAsRecord.iconPositions ?? {}
        } as PersistedDesktopState;
      },
      version: APP_VERSION_MAJOR_MINOR
    }
  )
);
