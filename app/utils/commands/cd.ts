import { CommandOptions } from '@/app/utils/types';
import { useFileSystemStore } from '@/app/store/fileSystemStore';

const cd = ({ args = [] }: CommandOptions = {}) => {
  const { currentDirectory, setCurrentDirectory } =
    useFileSystemStore.getState();

  const target = args[0];

  if (!target) {
    // no argument, go to home
    setCurrentDirectory('~');
    return '';
  }

  if (target === '~' || target === '..') {
    setCurrentDirectory('~');
    return '';
  }

  if (target === 'Desktop') {
    if (currentDirectory === '~') {
      setCurrentDirectory('~/Desktop');
      return '';
    }
  }

  return `cd: ${target}: No such file or directory`;
};

export default cd;
