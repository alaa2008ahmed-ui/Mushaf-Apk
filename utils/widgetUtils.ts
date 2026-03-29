import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export interface WidgetData {
  hijri: string;
  gregorian: string;
  day: string;
  city: string;
  next_prayer_name: string;
  next_prayer_id: string;
  remaining_time: string;
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
}

/**
 * Updates the Android App Widget with the latest prayer times data.
 * This function stores the data in Capacitor's default SharedPreferences
 * which the native Android Widget reads from.
 */
export const updateAndroidWidget = async (data: WidgetData) => {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    // We use the default group name 'CapacitorStorage' which matches the Java side
    await Preferences.set({
      key: 'widget_prayer_data',
      value: JSON.stringify(data)
    });
    
    console.log('Android Widget data updated successfully');
  } catch (error) {
    console.error('Failed to update Android Widget data:', error);
  }
};
