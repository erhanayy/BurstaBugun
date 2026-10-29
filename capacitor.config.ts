import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.fbiadvakfi.burs',
  appName: 'FBİAD Vakfı',
  webDir: 'public',
  server: {
    url: 'https://burs.fbiadvakfi.org',
    cleartext: true
  }
};

export default config;
