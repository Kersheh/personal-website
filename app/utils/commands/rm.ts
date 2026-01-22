import { CommandOptions } from '@/app/utils/types';
import { useFileSystemStore } from '@/app/store/fileSystemStore';
import { DESKTOP_ITEMS } from '@/app/core/Desktop/desktopItems';

const rm = ({ args = [] }: CommandOptions = {}) => {
  const { currentDirectory, removeDesktopItem } = useFileSystemStore.getState();

  const target = args[0];

  if (!target) {
    return 'rm: missing operand';
  }

  if (currentDirectory !== '~/Desktop') {
    return `rm: cannot remove '${target}': Not in Desktop directory`;
  }

  const itemMap = DESKTOP_ITEMS.reduce<Record<string, string>>((acc, item) => {
    acc[item.label] = item.id;
    return acc;
  }, {});

  const itemId = itemMap[target];

  if (!itemId) {
    return `rm: cannot remove '${target}': No such file or directory`;
  }

  removeDesktopItem(itemId);

  return '';
};

export default rm;
