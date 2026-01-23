import { Capacitor } from '@capacitor/core';

export const platform = {
  isNative: () => Capacitor.isNativePlatform(),
  isIOS: () => Capacitor.getPlatform() === 'ios',
  isAndroid: () => Capacitor.getPlatform() === 'android',
  isWeb: () => Capacitor.getPlatform() === 'web',
  getPlatform: () => Capacitor.getPlatform(),
};

export const isMobile = () => platform.isNative();
