import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.burstabugun.app',
  appName: 'BurstaBugun',
  webDir: 'public',
  server: {
    url: 'http://localhost:3004',
    cleartext: true
  }
};

export default config;
