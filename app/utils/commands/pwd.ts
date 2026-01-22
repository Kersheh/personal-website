import { useFileSystemStore } from '@/app/store/fileSystemStore';

const pwd = () => {
  const currentDirectory = useFileSystemStore.getState().currentDirectory;
  return currentDirectory;
};

export default pwd;
