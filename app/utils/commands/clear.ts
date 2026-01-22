import { CommandOptions } from '@/app/utils/types';

const clear = ({ clearHistory }: CommandOptions = {}) => {
  if (clearHistory) {
    clearHistory();
  }

  return '';
};

export default clear;
