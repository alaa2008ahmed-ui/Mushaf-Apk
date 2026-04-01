import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { presetThemes } from '../context/themes';

export interface WidgetData {
  hijri: string;
  gregorian: string;
  day: string;
  city: string;
  next_prayer_name: string;
  next_prayer_id: string;
  remaining_time: string;
  target_time_millis?: number;
  midnight: string;
  last_third: string;
  times: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  theme?: {
    themeKey: string;
    primaryColor: string;
    secondaryColor: string;
    bgColor: string;
    textColor: string;
  } | null;
}

/**
 * Updates the Android App Widget with the latest prayer times data.
 * This function stores the data in Capacitor's default SharedPreferences
 * which the native Android Widget reads from.
 */
export const updateAndroidWidget = async (data: WidgetData, syncTheme: boolean = true) => {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    let themeData = null;
    if (syncTheme) {
        try {
            const savedTheme = localStorage.getItem('theme_settings_v1');
            if (savedTheme) {
                const parsed = JSON.parse(savedTheme);
                const theme = presetThemes[parsed.themeKey] || presetThemes.default;
                themeData = {
                    themeKey: parsed.themeKey,
                    primaryColor: theme.palette[0],
                    secondaryColor: theme.palette[1] || theme.palette[0],
                    bgColor: theme.bgColor || '#0D1B2A',
                    textColor: theme.textColor
                };
            }
        } catch (e) {
            console.error('Failed to parse theme for widget', e);
        }
    }

    const finalData = {
        ...data,
        theme: themeData
    };

    // We use the default group name 'CapacitorStorage' which matches the Java side
    await Preferences.set({
      key: 'widget_prayer_data',
      value: JSON.stringify(finalData)
    });
    
    console.log('Android Widget data updated successfully');
  } catch (error) {
    console.error('Failed to update Android Widget data:', error);
  }
};
