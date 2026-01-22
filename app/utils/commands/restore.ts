import { dispatchWindowEvent } from '@/app/hooks/useWindowEvent';

const restore = () => {
  dispatchWindowEvent('system-restore');
  return 'Restoring system to last backup...';
};

export default restore;
