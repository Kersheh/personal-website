import { CommandOptions } from '@/app/utils/types';

const exit = (options?: CommandOptions) => {
  if (options?.closeWindow && options?.windowId) {
    setTimeout(() => options.closeWindow?.(options.windowId!), 0);
  }
  return '';
};

export default exit;
