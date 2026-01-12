// if needed, @todo implement real feature flag system
const isDevelopment = process.env.NODE_ENV === 'development';

export enum FeatureFlag {
  DESKTOP_APP_PDF_VIEWER = 'DESKTOP_APP_PDF_VIEWER'
}

const featureFlags: Record<FeatureFlag, boolean> = {
  [FeatureFlag.DESKTOP_APP_PDF_VIEWER]: isDevelopment
};

export const isFeatureEnabled = (flag: FeatureFlag) => featureFlags[flag];
