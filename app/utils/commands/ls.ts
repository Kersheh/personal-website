import { useFileSystemStore } from '@/app/store/fileSystemStore';
import { DESKTOP_ITEMS } from '@/app/core/Desktop/desktopItems';

const ls = () => {
  const { currentDirectory, desktopItems } = useFileSystemStore.getState();

  if (currentDirectory === '~') {
    return 'Desktop';
  } else if (currentDirectory === '~/Desktop') {
    const itemMap = DESKTOP_ITEMS.reduce<Record<string, string>>(
      (acc, item) => {
        acc[item.id] = item.label;
        return acc;
      },
      {}
    );

    const visibleItems = desktopItems.map((id) => itemMap[id] || id);

    return visibleItems.length > 0 ? visibleItems.join('\n') : '';
  }

  return '';
};

export default ls;
