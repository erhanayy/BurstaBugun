import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.burstabugun.app',
  appName: 'BurstaBugun',
  webDir: 'public',
  server: {
    url: 'http://192.168.1.35:3001',
    cleartext: true
  }
};

export default config;
