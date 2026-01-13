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
  initialSize:
    | AppSize
    | ((parentWidth?: number, parentHeight?: number) => AppSize);
  minSize: AppSize;
  featureFlag?: FeatureFlag;
}

const getPDFViewerSize = (
  parentWidth?: number,
  parentHeight?: number
): AppSize => {
  const isMobile = (parentWidth ?? 800) < 768;

  if (isMobile) {
    return {
      width: parentWidth ?? 375,
      height: parentHeight ?? 667
    };
  }

  const desktopWidth = Math.max(600, (parentWidth ?? 1200) * 0.5);
  return {
    width: desktopWidth,
    height: 780
  };
};

export const APP_CONFIGS: Record<AppId, AppConfig> = {
  TERMINAL: {
    id: 'TERMINAL',
    displayName: 'Terminal',
    iconName: 'iterm.png',
    initialSize: { width: 900, height: 540 },
    minSize: { width: 375, height: 400 }
  },
  PDF_VIEWER: {
    id: 'PDF_VIEWER',
    displayName: 'PDF Viewer',
    iconName: 'pdf.svg',
    initialSize: getPDFViewerSize,
    minSize: { width: 375, height: 400 },
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
