// if needed, @todo implement real feature flag system
const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

export enum FeatureFlag {
  DESKTOP_APP_MIM = 'DESKTOP_APP_MIM'
}

const featureFlags: Record<FeatureFlag, boolean> = {
  [FeatureFlag.DESKTOP_APP_MIM]: isDevelopment
};

export const isFeatureEnabled = (flag: FeatureFlag) => featureFlags[flag];
