import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mushaf.ahmedandlayla',
  appName: 'مصحف أحمد وليلى',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_name",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
