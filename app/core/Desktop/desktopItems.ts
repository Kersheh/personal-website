import { FeatureFlag } from '@/app/utils/featureFlags';
import { AppId, APP_CONFIGS } from '@/app/components/applications/appRegistry';

interface DesktopBaseItem {
  id: string;
  iconName: string;
  iconScale?: number;
  label: string;
  featureFlag?: FeatureFlag;
}

interface DesktopApplicationItem extends DesktopBaseItem {
  type: 'application';
  appName: AppId;
}

interface DesktopFileItem extends DesktopBaseItem {
  type: 'file';
  fileName: string;
  filePath: string;
  opensWith: AppId;
}

export type DesktopItem = DesktopApplicationItem | DesktopFileItem;

export const DESKTOP_ITEMS: Array<DesktopItem> = [
  {
    type: 'application',
    id: 'app-mim',
    iconName: APP_CONFIGS.MIM.iconName,
    iconScale: APP_CONFIGS.MIM.iconScale,
    label: APP_CONFIGS.MIM.displayName,
    appName: 'MIM',
    featureFlag: FeatureFlag.DESKTOP_APP_MIM
  },
  {
    type: 'application',
    id: 'app-paint',
    iconName: APP_CONFIGS.PAINT.iconName,
    iconScale: APP_CONFIGS.PAINT.iconScale,
    label: APP_CONFIGS.PAINT.displayName,
    appName: 'PAINT'
  },
  {
    type: 'application',
    id: 'app-dino-jump',
    iconName: APP_CONFIGS.DINO_JUMP.iconName,
    iconScale: APP_CONFIGS.DINO_JUMP.iconScale,
    label: APP_CONFIGS.DINO_JUMP.displayName,
    appName: 'DINO_JUMP'
  },
  {
    type: 'application',
    id: 'app-terminal',
    iconName: APP_CONFIGS.TERMINAL.iconName,
    iconScale: APP_CONFIGS.TERMINAL.iconScale,
    label: APP_CONFIGS.TERMINAL.displayName,
    appName: 'TERMINAL'
  },
  {
    type: 'file',
    id: 'file-resume',
    iconName: APP_CONFIGS.PDF_VIEWER.iconName,
    label: 'resume.pdf',
    fileName: 'resume.pdf',
    filePath: '/documents/resume.pdf',
    opensWith: 'PDF_VIEWER'
  }
];
