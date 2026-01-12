import { FeatureFlag } from '../../utils/featureFlags';

export type AppId = 'TERMINAL' | 'PDF_VIEWER';

interface AppSize {
  width: number;
  height: number;
}

export interface AppConfig {
  id: AppId;
  displayName: string;
  iconName: string;
  initialSize: AppSize;
  minSize: AppSize;
  featureFlag?: FeatureFlag;
}

export const APP_CONFIGS: Record<AppId, AppConfig> = {
  TERMINAL: {
    id: 'TERMINAL',
    displayName: 'Terminal',
    iconName: 'iterm.png',
    initialSize: { width: 900, height: 540 },
    minSize: { width: 700, height: 400 }
  },
  PDF_VIEWER: {
    id: 'PDF_VIEWER',
    displayName: 'PDF Viewer',
    iconName: 'pdf.svg',
    initialSize: { width: 600, height: 780 },
    minSize: { width: 700, height: 400 },
    featureFlag: FeatureFlag.DESKTOP_APP_PDF_VIEWER
  }
};

export const getAppConfig = (appId: AppId): AppConfig => APP_CONFIGS[appId];

export const resolveAppId = (name: string): AppId => {
  const normalized = name.toUpperCase().replace(/\s+/g, '_');
  if (normalized in APP_CONFIGS) {
    return normalized as AppId;
  }

  const match = Object.values(APP_CONFIGS).find(
    (config) => config.displayName.toUpperCase() === name.toUpperCase()
  );

  return (match?.id ?? 'TERMINAL') as AppId;
};
