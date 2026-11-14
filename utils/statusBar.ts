import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { AutoSilentMode } from './silentMode';

let lastSyncedIsDark: boolean | null = null;
let lastSyncedThemeColor: string | null = null;

/**
 * Synchronizes the native Android/iOS status bar & navigation bar icon colors
 * and browser/PWA theme-color metadata with the active app theme.
 *
 * - isDarkTheme = true  (Black / Night / Dark theme) -> WHITE icons (light content / SystemBarsStyle.Dark)
 * - isDarkTheme = false (All Light themes)           -> BLACK icons (dark content  / SystemBarsStyle.Light)
 */
export function syncSystemStatusBar(isDarkTheme: boolean, lightThemeColor = '#FFFFFF'): void {
  if (typeof document !== 'undefined') {
    try {
      const targetColor = isDarkTheme ? '#000000' : (lightThemeColor || '#FFFFFF');

      if (lastSyncedThemeColor !== targetColor || lastSyncedIsDark !== isDarkTheme) {
        let themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
        if (!themeMeta) {
          themeMeta = document.createElement('meta');
          themeMeta.name = 'theme-color';
          document.head.appendChild(themeMeta);
        }
        themeMeta.content = targetColor;

        let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement | null;
        if (!appleMeta) {
          appleMeta = document.createElement('meta');
          appleMeta.name = 'apple-mobile-web-app-status-bar-style';
          document.head.appendChild(appleMeta);
        }
        appleMeta.content = isDarkTheme ? 'black-translucent' : 'default';

        document.documentElement.style.colorScheme = isDarkTheme ? 'dark' : 'light';
        lastSyncedThemeColor = targetColor;
      }
    } catch {
      // Ignore DOM metadata errors in restricted environments
    }
  }

  if (lastSyncedIsDark === isDarkTheme) {
    return;
  }
  lastSyncedIsDark = isDarkTheme;

  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const targetStyle = isDarkTheme ? SystemBarsStyle.Dark : SystemBarsStyle.Light;

  try {
    void SystemBars.setStyle({ style: targetStyle }).catch(() => {});
  } catch {
    // SystemBars plugin unavailable on older shells
  }

  try {
    if (AutoSilentMode && typeof AutoSilentMode.setStatusBarStyle === 'function') {
      void AutoSilentMode.setStatusBarStyle({ isDark: isDarkTheme }).catch(() => {});
    }
  } catch {
    // AutoSilentMode fallback unavailable
  }
}
