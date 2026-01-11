import { CommandOptions } from '@/app/utils/types';

export default function clear({ clearHistory }: CommandOptions = {}): string {
  if (clearHistory) {
    clearHistory();
  }
  return '';
}
