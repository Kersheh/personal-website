import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DESKTOP_ITEMS } from '@/app/core/Desktop/desktopItems';

interface FileSystemState {
  currentDirectory: string;
  desktopItems: Array<string>;
  setCurrentDirectory: (path: string) => void;
  removeDesktopItem: (id: string) => void;
  restoreAllDesktopItems: () => void;
  ensureTerminalExists: () => void;
}

const getDefaultDesktopItems = () => DESKTOP_ITEMS.map((item) => item.id);

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set) => ({
      currentDirectory: '~',
      desktopItems: getDefaultDesktopItems(),
      setCurrentDirectory: (path: string) => set({ currentDirectory: path }),
      removeDesktopItem: (id: string) =>
        set((state) => ({
          desktopItems: state.desktopItems.filter((item) => item !== id)
        })),
      restoreAllDesktopItems: () =>
        set({ desktopItems: getDefaultDesktopItems() }),
      ensureTerminalExists: () =>
        set((state) => {
          if (!state.desktopItems.includes('app-terminal')) {
            return { desktopItems: [...state.desktopItems, 'app-terminal'] };
          }
          return state;
        })
    }),
    {
      name: 'file-system-storage'
    }
  )
);
