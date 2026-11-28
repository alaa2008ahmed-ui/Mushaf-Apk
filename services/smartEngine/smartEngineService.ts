import { SURAH_NAMES_AR, SURAH_NAMES_EN } from '../../components/QuranReader/constants';
import { quranData } from '../../utils/quran/quranData';
import { ALL_DUAA, DUAA_CATEGORIES } from '../../data/adhkarAndDuas/adiaData';
import { ADIA_EN_MAP } from '../../data/adhkarAndDuas/adiaTranslationsEn';
import type {
  SmartEngineSettings,
  SmartBehaviorProfile,
  SmartTimeWindow,
  SmartThemeVariant,
  SmartInterestDomain,
  PrimaryKhatmaBackup,
  ContextualQuranResolution,
  SmartAdiaResolution,
  SmartLearnedInsight,
  SmartPersonalizedNotificationSpec,
  SurahContextPattern,
} from './smartEngineTypes';

export const SMART_ENGINE_SETTINGS_KEY = 'mushaf_smart_engine_settings_v1';
export const SMART_ENGINE_PROFILE_KEY = 'mushaf_smart_engine_profile_v1';
export const SMART_ENGINE_CHANGED_EVENT = 'smart-engine-settings-changed';
export const SMART_COLOR_PROPAGATE_EVENT = 'smart-color-propagate';

export const DEFAULT_SMART_ENGINE_SETTINGS: SmartEngineSettings = {
  enabled: true,
  autoColorSync: true,
  smartQuranContext: true,
  smartAdiaOpening: true,
  smartNotifications: true,
};

const createEmptyProfile = (): SmartBehaviorProfile => ({
  colorMemory: {
    variantCounts: { gold: 0, sky: 0, emerald: 0, burgundy: 0 },
    lastSelectedVariant: undefined,
    lastCustomHex: null,
    nightToggleHours: [],
    dayToggleHours: [],
  },
  surahPatterns: {},
  primaryKhatmaBackup: null,
  adiaItemCounts: {},
  adiaCategoryCounts: {},
  interestScores: {
    quran: 0,
    tafseer: 0,
    memorization: 0,
    adia: 0,
    adhkar: 0,
    tasbeeh: 0,
    listen: 0,
    seerah: 0,
    wird: 0,
  },
  updatedAt: Date.now(),
});

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export function getSmartEngineSettings(): SmartEngineSettings {
  try {
    const raw = localStorage.getItem(SMART_ENGINE_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SMART_ENGINE_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled !== false,
      autoColorSync: parsed.autoColorSync !== false,
      smartQuranContext: parsed.smartQuranContext !== false,
      smartAdiaOpening: parsed.smartAdiaOpening !== false,
      smartNotifications: parsed.smartNotifications !== false,
    };
  } catch {
    return { ...DEFAULT_SMART_ENGINE_SETTINGS };
  }
}

export function isSmartFeatureActive(
  subKey?: keyof Omit<SmartEngineSettings, 'enabled'>
): boolean {
  const s = getSmartEngineSettings();
  if (!s.enabled) return false;
  if (!subKey) return true;
  return s[subKey] !== false;
}

export function saveSmartEngineSettings(
  updates: Partial<SmartEngineSettings>
): SmartEngineSettings {
  const current = getSmartEngineSettings();
  const next: SmartEngineSettings = {
    ...current,
    ...updates,
  };
  try {
    localStorage.setItem(SMART_ENGINE_SETTINGS_KEY, JSON.stringify(next));
  } catch {}

  // If smart engine or contextual Quran is turned off, restore any pending Khatma backup safely
  if (!next.enabled || !next.smartQuranContext) {
    try {
      const profile = getSmartBehaviorProfile();
      if (profile.primaryKhatmaBackup) {
        restoreKhatmaBackupToStorage(profile.primaryKhatmaBackup);
        profile.primaryKhatmaBackup = null;
        saveSmartBehaviorProfile(profile);
      }
    } catch {}
  }

  try {
    window.dispatchEvent(new CustomEvent(SMART_ENGINE_CHANGED_EVENT, { detail: next }));
  } catch {}
  return next;
}

export function subscribeSmartEngine(
  callback: (settings: SmartEngineSettings) => void
): () => void {
  const handler = () => callback(getSmartEngineSettings());
  window.addEventListener(SMART_ENGINE_CHANGED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(SMART_ENGINE_CHANGED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getSmartBehaviorProfile(): SmartBehaviorProfile {
  try {
    const raw = localStorage.getItem(SMART_ENGINE_PROFILE_KEY);
    if (!raw) return createEmptyProfile();
    const parsed = JSON.parse(raw);
    const empty = createEmptyProfile();
    return {
      ...empty,
      ...parsed,
      colorMemory: {
        ...empty.colorMemory,
        ...(parsed?.colorMemory || {}),
        variantCounts: {
          ...empty.colorMemory.variantCounts,
          ...(parsed?.colorMemory?.variantCounts || {}),
        },
        nightToggleHours: Array.isArray(parsed?.colorMemory?.nightToggleHours)
          ? parsed.colorMemory.nightToggleHours
          : [],
        dayToggleHours: Array.isArray(parsed?.colorMemory?.dayToggleHours)
          ? parsed.colorMemory.dayToggleHours
          : [],
      },
      surahPatterns: parsed?.surahPatterns || {},
      primaryKhatmaBackup: parsed?.primaryKhatmaBackup || null,
      adiaItemCounts: parsed?.adiaItemCounts || {},
      adiaCategoryCounts: parsed?.adiaCategoryCounts || {},
      interestScores: {
        ...empty.interestScores,
        ...(parsed?.interestScores || {}),
      },
    };
  } catch {
    return createEmptyProfile();
  }
}

export function saveSmartBehaviorProfile(profile: SmartBehaviorProfile): void {
  try {
    profile.updatedAt = Date.now();
    localStorage.setItem(SMART_ENGINE_PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function resetSmartEngineMemory(): void {
  try {
    const current = getSmartBehaviorProfile();
    if (current.primaryKhatmaBackup) {
      restoreKhatmaBackupToStorage(current.primaryKhatmaBackup);
    }
    const fresh = createEmptyProfile();
    localStorage.setItem(SMART_ENGINE_PROFILE_KEY, JSON.stringify(fresh));
    window.dispatchEvent(new CustomEvent(SMART_ENGINE_CHANGED_EVENT, { detail: getSmartEngineSettings() }));
  } catch {}
}

// ---------------------------------------------------------------------------
// Time Window Utilities
// ---------------------------------------------------------------------------

export function getCurrentTimeWindow(date: Date = new Date()): SmartTimeWindow {
  const h = date.getHours();
  if (h >= 4 && h < 12) return 'fajr_morning';
  if (h >= 12 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function getTimeWindowLabel(win: SmartTimeWindow, isEn: boolean): string {
  if (isEn) {
    if (win === 'fajr_morning') return 'Morning';
    if (win === 'day') return 'Afternoon';
    if (win === 'evening') return 'Evening';
    return 'Night';
  }
  if (win === 'fajr_morning') return 'الصباح';
  if (win === 'day') return 'النهار';
  if (win === 'evening') return 'المساء';
  return 'الليل';
}

export function getDayOfWeekLabel(day: number, isEn: boolean): string {
  const arDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return isEn ? (enDays[day] || '') : (arDays[day] || '');
}

export function getWindowExpiryTimestamp(date: Date, win: SmartTimeWindow, isAllDayFriday?: boolean): number {
  const end = new Date(date.getTime());
  if (isAllDayFriday) {
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  }
  if (win === 'fajr_morning') {
    end.setHours(12, 0, 0, 0);
  } else if (win === 'day') {
    end.setHours(17, 0, 0, 0);
  } else if (win === 'evening') {
    end.setHours(21, 0, 0, 0);
  } else {
    // 'night': 21:00..23:59 -> ends next day 04:00, 00:00..03:59 -> ends today 04:00
    if (end.getHours() >= 21) {
      end.setDate(end.getDate() + 1);
    }
    end.setHours(4, 0, 0, 0);
  }
  return end.getTime();
}

// ---------------------------------------------------------------------------
// 1. Color & Theme Intelligence + App-Wide Propagation
// ---------------------------------------------------------------------------

function parseHexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== 'string') return null;
  let clean = hex.trim().replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHue(r: number, g: number, b: number): { hue: number; sat: number; light: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const light = (max + min) / 2;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * light - 1));
  let hue = 0;
  if (d !== 0) {
    if (max === rn) hue = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) hue = ((bn - rn) / d + 2) * 60;
    else hue = ((rn - gn) / d + 4) * 60;
  }
  return { hue, sat, light };
}

export function mapHexToAppVariant(hex: string): SmartThemeVariant | null {
  const rgb = parseHexToRgb(hex);
  if (!rgb) return null;
  const { hue, sat } = rgbToHue(rgb.r, rgb.g, rgb.b);
  if (sat < 0.12) return null; // neutral black/white/gray does not override hue
  // Red / Rose / Crimson / Magenta -> burgundy
  if (hue >= 315 || hue < 22) return 'burgundy';
  // Orange / Amber / Gold / Yellow -> gold
  if (hue >= 22 && hue < 75) return 'gold';
  // Green / Emerald / Teal -> emerald
  if (hue >= 75 && hue < 175) return 'emerald';
  // Cyan / Blue / Indigo / Purple -> sky
  return 'sky';
}

export function mapQuranThemeIdToVariant(themeId: string): SmartThemeVariant | null {
  if (themeId === 'night_sky') return 'sky';
  if (themeId === 'green') return 'emerald';
  if (themeId === 'maroon') return 'burgundy';
  if (themeId === 'gold') return 'gold';
  return null;
}

export function recordSmartColorChoice(
  source: 'theme_variant' | 'night_mode' | 'quran_theme' | 'custom_color',
  value: string
): SmartThemeVariant | null {
  const profile = getSmartBehaviorProfile();
  const hour = new Date().getHours();

  let detectedVariant: SmartThemeVariant | null = null;

  if (source === 'theme_variant') {
    if (value === 'gold' || value === 'sky' || value === 'emerald' || value === 'burgundy') {
      detectedVariant = value;
    }
  } else if (source === 'night_mode') {
    if (value === 'true') {
      profile.colorMemory.nightToggleHours = [
        ...profile.colorMemory.nightToggleHours.slice(-14),
        hour,
      ];
    } else {
      profile.colorMemory.dayToggleHours = [
        ...profile.colorMemory.dayToggleHours.slice(-14),
        hour,
      ];
    }
    saveSmartBehaviorProfile(profile);
    return null;
  } else if (source === 'quran_theme') {
    detectedVariant = mapQuranThemeIdToVariant(value);
  } else if (source === 'custom_color') {
    profile.colorMemory.lastCustomHex = value;
    detectedVariant = mapHexToAppVariant(value);
  }

  if (detectedVariant) {
    profile.colorMemory.variantCounts[detectedVariant] =
      (profile.colorMemory.variantCounts[detectedVariant] || 0) + 1;
    profile.colorMemory.lastSelectedVariant = detectedVariant;
  }

  saveSmartBehaviorProfile(profile);
  return detectedVariant;
}

/**
 * When user picks a color (e.g., highlight color in Quran or Smart Color Bar),
 * if Auto Color Generalization is enabled, broadcast that color theme across the entire app.
 */
export function senseAndPropagateColorChoice(
  source: 'quran_theme' | 'custom_color',
  value: string
): { propagated: boolean; variant: SmartThemeVariant | null } {
  const detectedVariant = recordSmartColorChoice(source, value);
  if (!isSmartFeatureActive('autoColorSync') || !detectedVariant) {
    return { propagated: false, variant: detectedVariant };
  }

  try {
    window.dispatchEvent(
      new CustomEvent(SMART_COLOR_PROPAGATE_EVENT, {
        detail: {
          variant: detectedVariant,
          customHex: source === 'custom_color' ? value : null,
          source,
        },
      })
    );
  } catch {}

  return { propagated: true, variant: detectedVariant };
}

export function getDominantColorVariant(): {
  variant: SmartThemeVariant;
  count: number;
} | null {
  const profile = getSmartBehaviorProfile();
  const counts = profile.colorMemory.variantCounts;
  let best: SmartThemeVariant | null = null;
  let bestScore = 0;
  (['gold', 'sky', 'emerald', 'burgundy'] as SmartThemeVariant[]).forEach((v) => {
    const score = counts[v] || 0;
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  });
  if (!best || bestScore === 0) return null;
  return { variant: best, count: bestScore };
}

export function getVariantDisplayName(variant: SmartThemeVariant, isEn: boolean): string {
  const mapAr: Record<SmartThemeVariant, string> = {
    gold: 'الوضع الذهبي',
    sky: 'الوضع السماوي',
    emerald: 'الوضع الزمردي',
    burgundy: 'الوضع العنابي',
  };
  const mapEn: Record<SmartThemeVariant, string> = {
    gold: 'Gold Mode',
    sky: 'Sky Mode',
    emerald: 'Emerald Mode',
    burgundy: 'Burgundy Mode',
  };
  return isEn ? mapEn[variant] : mapAr[variant];
}

// ---------------------------------------------------------------------------
// 2. Contextual Surah Habit & Khatma Backup / Auto-Restore
// ---------------------------------------------------------------------------

function readCurrentPrimaryKhatmaPosition(): {
  s: number;
  a: number;
  page?: number;
  juz?: number;
  isExplicit?: boolean;
  ts: number;
} {
  const candidates = [
    localStorage.getItem('last_read_ayah_global'),
    localStorage.getItem('last_read_pos_mushaf'),
    localStorage.getItem('last_read_pos_madinah'),
    localStorage.getItem('last_pos_v'),
    localStorage.getItem('last_pos_h'),
    localStorage.getItem('last_pos_madinah_v'),
  ];
  for (const raw of candidates) {
    const parsed = safeParse<any>(raw, null);
    if (parsed && typeof parsed.s === 'number' && parsed.s >= 1 && parsed.s <= 114) {
      return {
        s: parsed.s,
        a: parsed.a || 1,
        page: parsed.page,
        juz: parsed.juz,
        isExplicit: parsed.isExplicit,
        ts: parsed.ts || Date.now(),
      };
    }
  }
  return { s: 1, a: 1, page: 1, juz: 1, ts: Date.now() };
}

export function restoreKhatmaBackupToStorage(backup: PrimaryKhatmaBackup): void {
  if (!backup || !backup.s) return;
  try {
    let page = backup.page;
    let juz = backup.juz;
    if (!page) {
      const surah = quranData?.surahs?.[backup.s - 1];
      const ayahObj = surah?.ayahs?.[(backup.a || 1) - 1];
      page = ayahObj?.page || 1;
      juz = ayahObj?.juz || 1;
    }
    const payload = JSON.stringify({
      s: backup.s,
      a: backup.a || 1,
      page,
      juz: juz || 1,
      isExplicit: backup.isExplicit ?? true,
      ts: Date.now(),
    });
    const modes = ['mushaf', 'madinah', 'tafseer', 'meanings', 'translation', 'bilingual'];
    modes.forEach((m) => {
      localStorage.setItem(`last_read_pos_${m}`, payload);
      localStorage.setItem(`last_pos_${m}_v`, payload);
      localStorage.setItem(`last_pos_${m}_h`, payload);
    });
    localStorage.setItem('last_read_ayah_global', payload);
    localStorage.setItem('last_pos_v', payload);
    localStorage.setItem('last_pos_h', payload);
    window.dispatchEvent(new Event('last_read_update'));
  } catch {}
}

export function recordSmartSurahRead(surah: number, date: Date = new Date()): void {
  if (!surah || surah < 1 || surah > 114) return;
  const profile = getSmartBehaviorProfile();

  // Do not count the contextual Surah while we are inside a contextual backup session unless user explicitly reads
  // Actually, recording normal reads reinforces habit, while preventing rapid-scroll inflation via 15-min cooldown
  const dayOfWeek = date.getDay();
  const timeWindow = getCurrentTimeWindow(date);
  const patternKey = `${dayOfWeek}_${timeWindow}_${surah}`;
  const now = date.getTime();

  // Prevent counting the exact same pattern key repeatedly within 15 minutes
  if (
    profile.lastSurahLogKey === patternKey &&
    profile.lastSurahLogAt &&
    now - profile.lastSurahLogAt < 15 * 60 * 1000
  ) {
    return;
  }

  const existing = profile.surahPatterns[patternKey];
  profile.surahPatterns[patternKey] = {
    surah,
    dayOfWeek,
    timeWindow,
    count: (existing?.count || 0) + 1,
    lastReadAt: now,
  };
  profile.lastSurahLogKey = patternKey;
  profile.lastSurahLogAt = now;
  profile.interestScores.quran = (profile.interestScores.quran || 0) + 1;

  saveSmartBehaviorProfile(profile);
}

/**
 * Evaluates on opening QuranReader whether:
 * 1) A previous contextual session's time window expired -> restore primary Khatma seamlessly.
 * 2) User has a strong habit for this day/time window -> open that Surah while preserving primary Khatma.
 */
export function resolveContextualQuranOpen(
  now: Date = new Date()
): ContextualQuranResolution {
  const profile = getSmartBehaviorProfile();
  const nowMs = now.getTime();

  // 1. Check expired contextual backup FIRST (even if contextual feature was temporarily disabled)
  if (profile.primaryKhatmaBackup) {
    if (nowMs >= profile.primaryKhatmaBackup.expiresAt) {
      const restored = { ...profile.primaryKhatmaBackup };
      restoreKhatmaBackupToStorage(restored);
      profile.primaryKhatmaBackup = null;
      profile.dismissedContextualWindowKey = undefined;
      saveSmartBehaviorProfile(profile);
      return {
        action: 'restored',
        surah: restored.s,
        ayah: restored.a,
        page: restored.page,
        primaryBackup: restored,
      };
    }
  }

  if (!isSmartFeatureActive('smartQuranContext')) {
    return { action: 'none' };
  }

  const dayOfWeek = now.getDay();
  const timeWindow = getCurrentTimeWindow(now);
  const dateStamp = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const currentWindowKey = `${dateStamp}_${dayOfWeek}_${timeWindow}`;

  // If user already tapped "Return to Khatma" during this exact window, don't force them back into the contextual Surah
  if (profile.dismissedContextualWindowKey === currentWindowKey) {
    return { action: 'none' };
  }

  // If an active backup is still valid inside the same window, reuse it cleanly!
  if (
    profile.primaryKhatmaBackup &&
    nowMs < profile.primaryKhatmaBackup.expiresAt
  ) {
    const b = profile.primaryKhatmaBackup;
    const surahObj = quranData?.surahs?.[b.contextualSurah - 1];
    const firstPage = surahObj?.ayahs?.[0]?.page || 1;
    return {
      action: 'contextual',
      surah: b.contextualSurah,
      ayah: 1,
      page: firstPage,
      reasonAr: b.contextualReasonAr,
      reasonEn: b.contextualReasonEn,
      windowKey: b.contextualWindowKey,
      primaryBackup: b,
    };
  }

  // Score candidate learned patterns matching current context
  const allPatterns = Object.values(profile.surahPatterns);

  // A. Exact (same weekday + same timeWindow) OR Friday Al-Kahf across Friday daytime
  let bestSurah = 0;
  let bestScore = 0;
  let matchType: 'weekday_window' | 'friday_kahf' | 'time_window' = 'weekday_window';

  // Aggregate per surah for:
  // 1) Exact dayOfWeek + timeWindow (need count >= 2)
  // 2) Same dayOfWeek (Friday Kahf surah 18 counts >= 2 across any Friday window)
  // 3) Recurring timeWindow across days (e.g. Al-Mulk 67 at night -> total >= 3 across that timeWindow)
  const weekdayWindowMap = new Map<number, number>();
  const fridayKahfCount = allPatterns
    .filter((p) => p.dayOfWeek === 5 && p.surah === 18)
    .reduce((acc, p) => acc + p.count, 0);

  const windowAcrossDaysMap = new Map<number, number>();

  for (const p of allPatterns) {
    if (p.dayOfWeek === dayOfWeek && p.timeWindow === timeWindow) {
      weekdayWindowMap.set(p.surah, (weekdayWindowMap.get(p.surah) || 0) + p.count);
    }
    if (p.timeWindow === timeWindow) {
      windowAcrossDaysMap.set(p.surah, (windowAcrossDaysMap.get(p.surah) || 0) + p.count);
    }
  }

  weekdayWindowMap.forEach((cnt, s) => {
    if (cnt >= 2 && cnt * 3 > bestScore) {
      bestScore = cnt * 3;
      bestSurah = s;
      matchType = 'weekday_window';
    }
  });

  if (dayOfWeek === 5 && fridayKahfCount >= 2 && fridayKahfCount * 3 >= bestScore) {
    bestScore = fridayKahfCount * 3;
    bestSurah = 18;
    matchType = 'friday_kahf';
  }

  if (bestSurah === 0) {
    windowAcrossDaysMap.forEach((cnt, s) => {
      if (cnt >= 3 && cnt > bestScore) {
        bestScore = cnt;
        bestSurah = s;
        matchType = 'time_window';
      }
    });
  }

  if (!bestSurah) {
    return { action: 'none' };
  }

  const primaryPos = readCurrentPrimaryKhatmaPosition();
  // If user's saved Khatma is already on this Surah, no contextual switch needed
  if (primaryPos.s === bestSurah) {
    return { action: 'none' };
  }

  const surahAr = SURAH_NAMES_AR[bestSurah - 1] || `سورة ${bestSurah}`;
  const surahEn = SURAH_NAMES_EN[bestSurah - 1] || `Surah ${bestSurah}`;
  const dayAr = getDayOfWeekLabel(dayOfWeek, false);
  const dayEn = getDayOfWeekLabel(dayOfWeek, true);
  const winAr = getTimeWindowLabel(timeWindow, false);
  const winEn = getTimeWindowLabel(timeWindow, true);

  let reasonAr = '';
  let reasonEn = '';
  if (matchType === 'friday_kahf') {
    reasonAr = `فُتحت سورة ${surahAr} تلقائياً لعادتك يوم الجمعة`;
    reasonEn = `Opened ${surahEn} for your Friday habit`;
  } else if (matchType === 'weekday_window') {
    reasonAr = `فُتحت سورة ${surahAr} لعادتك يوم ${dayAr} (${winAr})`;
    reasonEn = `Opened ${surahEn} for your ${dayEn} ${winEn.toLowerCase()} habit`;
  } else {
    reasonAr = `فُتحت سورة ${surahAr} لعادتك في وقت ${winAr}`;
    reasonEn = `Opened ${surahEn} for your ${winEn.toLowerCase()} reading habit`;
  }

  const isFridayKahf = matchType === 'friday_kahf';
  const expiresAt = getWindowExpiryTimestamp(now, timeWindow, isFridayKahf);
  const backup: PrimaryKhatmaBackup = {
    s: primaryPos.s,
    a: primaryPos.a || 1,
    page: primaryPos.page,
    juz: primaryPos.juz,
    isExplicit: primaryPos.isExplicit,
    ts: primaryPos.ts || Date.now(),
    contextualSurah: bestSurah,
    contextualReasonAr: reasonAr,
    contextualReasonEn: reasonEn,
    contextualWindowKey: currentWindowKey,
    expiresAt,
  };

  profile.primaryKhatmaBackup = backup;
  saveSmartBehaviorProfile(profile);

  const surahObj = quranData?.surahs?.[bestSurah - 1];
  const firstPage = surahObj?.ayahs?.[0]?.page || 1;

  return {
    action: 'contextual',
    surah: bestSurah,
    ayah: 1,
    page: firstPage,
    reasonAr,
    reasonEn,
    windowKey: currentWindowKey,
    primaryBackup: backup,
  };
}

export function clearContextualQuranSessionAndRestore(): {
  s: number;
  a: number;
  page?: number;
} | null {
  const profile = getSmartBehaviorProfile();
  const backup = profile.primaryKhatmaBackup;
  if (backup) {
    restoreKhatmaBackupToStorage(backup);
    profile.dismissedContextualWindowKey = backup.contextualWindowKey;
    profile.primaryKhatmaBackup = null;
    saveSmartBehaviorProfile(profile);
    return { s: backup.s, a: backup.a || 1, page: backup.page };
  }
  return null;
}

// ---------------------------------------------------------------------------
// 3. Smart Supplications (Adia) & Adhkar Personalization
// ---------------------------------------------------------------------------

export function recordSmartDuaInteraction(
  duaaId: string,
  categoryId: string,
  weight: number = 1,
  favorited?: boolean
): void {
  if (!duaaId) return;
  const profile = getSmartBehaviorProfile();
  const existingItem = profile.adiaItemCounts[duaaId];
  profile.adiaItemCounts[duaaId] = {
    count: (existingItem?.count || 0) + weight,
    categoryId: categoryId || existingItem?.categoryId || 'quran',
    lastAt: Date.now(),
    favorited: favorited !== undefined ? favorited : existingItem?.favorited,
  };

  if (categoryId) {
    const existingCat = profile.adiaCategoryCounts[categoryId];
    profile.adiaCategoryCounts[categoryId] = {
      count: (existingCat?.count || 0) + weight,
      lastAt: Date.now(),
    };
  }

  profile.interestScores.adia = (profile.interestScores.adia || 0) + weight;
  saveSmartBehaviorProfile(profile);
}

export function getSmartPreferredDuaaIds(limit: number = 25): string[] {
  const profile = getSmartBehaviorProfile();
  let savedFavs: string[] = [];
  try {
    savedFavs = safeParse<string[]>(localStorage.getItem('adia_favorites'), []);
  } catch {}

  const scores = new Map<string, number>();
  savedFavs.forEach((id) => {
    scores.set(id, (scores.get(id) || 0) + 5);
  });

  Object.entries(profile.adiaItemCounts).forEach(([id, item]) => {
    const favBoost = item.favorited ? 4 : 0;
    scores.set(id, (scores.get(id) || 0) + item.count + favBoost);
  });

  return Array.from(scores.entries())
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

export function resolveSmartAdiaInitialState(): SmartAdiaResolution {
  if (!isSmartFeatureActive('smartAdiaOpening')) {
    return {
      shouldAutoOpen: false,
      initialCategory: 'all',
      topDuaaIds: [],
      topCategoryId: null,
      reasonAr: '',
      reasonEn: '',
    };
  }

  const profile = getSmartBehaviorProfile();
  const topDuaaIds = getSmartPreferredDuaaIds(30);

  // Determine top category
  let topCategoryId: string | null = null;
  let topCategoryScore = 0;
  Object.entries(profile.adiaCategoryCounts).forEach(([catId, info]) => {
    if ((info?.count || 0) > topCategoryScore) {
      topCategoryScore = info.count;
      topCategoryId = catId;
    }
  });

  const totalItemScore = Object.values(profile.adiaItemCounts).reduce(
    (sum, item) => sum + (item?.count || 0),
    0
  );

  // If user has >= 2 favorite/interacted duas, open directly on 'smart' ("أدعيتك المحببة")
  // or if they have strong single-category habit (>= 4 interactions and few cross-category favs), open on that category
  let favCount = 0;
  try {
    favCount = safeParse<string[]>(localStorage.getItem('adia_favorites'), []).length;
  } catch {}

  if (topDuaaIds.length >= 2 && (totalItemScore >= 3 || favCount >= 2)) {
    return {
      shouldAutoOpen: true,
      initialCategory: 'smart',
      topDuaaIds,
      topCategoryId,
      reasonAr: 'فُتِحَت على أدعيتك المحببة والمفضلة تلقائياً',
      reasonEn: 'Opened on your preferred & frequent supplications',
    };
  }

  if (topCategoryId && topCategoryScore >= 3) {
    const cat = DUAA_CATEGORIES.find((c) => c.id === topCategoryId);
    const catAr = cat?.title || 'الأدعية';
    const catEn = cat?.titleEn || 'Supplications';
    return {
      shouldAutoOpen: true,
      initialCategory: topCategoryId,
      topDuaaIds,
      topCategoryId,
      reasonAr: `فُتِحَت على قسم "${catAr}" بناءً على تفضيلك`,
      reasonEn: `Opened "${catEn}" based on your preference`,
    };
  }

  return {
    shouldAutoOpen: false,
    initialCategory: 'all',
    topDuaaIds,
    topCategoryId,
    reasonAr: '',
    reasonEn: '',
  };
}

// ---------------------------------------------------------------------------
// 4. Interest Tracking & Personalized Notifications
// ---------------------------------------------------------------------------

export function recordSmartInterest(
  domain: SmartInterestDomain,
  weight: number = 1
): void {
  const profile = getSmartBehaviorProfile();
  profile.interestScores[domain] = (profile.interestScores[domain] || 0) + weight;
  saveSmartBehaviorProfile(profile);
}

export function recordSmartInterestForPage(pageId: string): void {
  const pageToDomain: Record<string, SmartInterestDomain> = {
    quran: 'quran',
    'quran-landscape': 'quran',
    'quran-horizontal': 'quran',
    memorization: 'memorization',
    'memorization-session': 'memorization',
    'memorization-studio': 'memorization',
    adia: 'adia',
    'hisn-muslim': 'adhkar',
    'sabah-masaa': 'adhkar',
    'salah-adhkar': 'adhkar',
    tasbeeh: 'tasbeeh',
    listen: 'listen',
    'prophetic-seerah': 'seerah',
    'daily-wird': 'wird',
  };
  const domain = pageToDomain[pageId];
  if (domain) {
    recordSmartInterest(domain, 1);
  }
}

export function getTopSmartInterests(
  limit: number = 3
): { domain: SmartInterestDomain; score: number }[] {
  const profile = getSmartBehaviorProfile();
  return (Object.entries(profile.interestScores) as [SmartInterestDomain, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain, score]) => ({ domain, score }));
}

export function getInterestLabel(domain: SmartInterestDomain, isEn: boolean): string {
  const ar: Record<SmartInterestDomain, string> = {
    quran: 'تلاوة القرآن الكريم',
    tafseer: 'التفسير والتدبر',
    memorization: 'حفظ ومراجعة القرآن',
    adia: 'الأدعية المأثورة',
    adhkar: 'الأذكار والتحصينات',
    tasbeeh: 'التسبيح والاستغفار',
    listen: 'الاستماع للتلاوات',
    seerah: 'السيرة النبوية',
    wird: 'الورد القرآني اليومي',
  };
  const en: Record<SmartInterestDomain, string> = {
    quran: 'Holy Quran Reading',
    tafseer: 'Tafseer & Reflection',
    memorization: 'Quran Memorization',
    adia: 'Prophetic Supplications',
    adhkar: 'Daily Adhkar',
    tasbeeh: 'Tasbeeh & Dhikr',
    listen: 'Quran Audio Recitations',
    seerah: 'Prophetic Seerah',
    wird: 'Daily Quran Wird',
  };
  return isEn ? en[domain] : ar[domain];
}

/**
 * Generates up to 2 tailored daily phone notification specs based on the user's learned interests.
 * Uses dedicated IDs 9501..9502 so prayer (1000..8999) and wird (9300..9399) IDs are never touched.
 */
export function buildSmartPersonalizedNotifications(
  isEn: boolean
): SmartPersonalizedNotificationSpec[] {
  if (!isSmartFeatureActive('smartNotifications')) return [];

  const topInterests = getTopSmartInterests(2);
  if (topInterests.length === 0) return [];

  const topDuaIds = getSmartPreferredDuaaIds(3);
  const favDuaItem = topDuaIds.length > 0 ? ALL_DUAA.find((d) => d.id === topDuaIds[0]) : null;
  const favDuaEnText = favDuaItem
    ? ADIA_EN_MAP[favDuaItem.id]?.text || favDuaItem.textEn || favDuaItem.text
    : '';

  const specs: SmartPersonalizedNotificationSpec[] = [];
  const slots = [
    { hour: 12, minute: 30, id: 9501 },
    { hour: 21, minute: 15, id: 9502 },
  ];

  topInterests.forEach((item, idx) => {
    if (item.score < 2) return; // Only notify once interest is genuinely observed
    const slot = slots[idx] || slots[0];
    const d = item.domain;

    if (d === 'adia') {
      specs.push({
        id: slot.id,
        domain: d,
        titleAr: 'دعاؤك المفضل • تذكير ذكي',
        titleEn: 'Your Preferred Supplication',
        bodyAr: favDuaItem
          ? favDuaItem.text
          : 'افتح صفحة الأدعية المأثورة لتكرار أدعيتك المحببة الآن.',
        bodyEn: favDuaItem
          ? favDuaEnText
          : 'Open Supplications to recite your favorite duas.',
        page: 'adia',
        params: favDuaItem ? { highlightId: favDuaItem.id, categoryId: 'smart' } : { categoryId: 'smart' },
        hour: slot.hour,
        minute: slot.minute,
      });
    } else if (d === 'tafseer') {
      specs.push({
        id: slot.id,
        domain: d,
        titleAr: 'تدبر وتفسير • اهتمامك المفضل',
        titleEn: 'Quran Reflection & Tafseer',
        bodyAr: 'خصّص دقائق هادئة لقراءة تفسير آية جديدة وتدبر معانيها.',
        bodyEn: 'Take a calm moment to reflect on a verse and read its Tafseer.',
        page: 'quran',
        hour: slot.hour,
        minute: slot.minute,
      });
    } else if (d === 'memorization') {
      specs.push({
        id: slot.id,
        domain: d,
        titleAr: 'رفيق الحفظ الذكي',
        titleEn: 'Smart Memorization Reminder',
        bodyAr: 'حان وقت تثبيت ومراجعة حفظك اليومي ولو بصفحة واحدة.',
        bodyEn: 'Time to review and strengthen your Quran memorization.',
        page: 'memorization',
        hour: slot.hour,
        minute: slot.minute,
      });
    } else if (d === 'tasbeeh') {
      specs.push({
        id: slot.id,
        domain: d,
        titleAr: 'ذكر وتسبيح • تذكير ذكي',
        titleEn: 'Smart Tasbeeh Reminder',
        bodyAr: 'سبحان الله وبحمده، سبحان الله العظيم — دقائق من الذكر تطمئن بها قلبك.',
        bodyEn: 'SubhanAllahi wa bihamdihi — take a moment for peaceful dhikr.',
        page: 'tasbeeh',
        hour: slot.hour,
        minute: slot.minute,
      });
    } else if (d === 'listen') {
      specs.push({
        id: slot.id,
        domain: d,
        titleAr: 'استماع وتلاوة خاشعة',
        titleEn: 'Calm Quran Recitation',
        bodyAr: 'استمع الآن إلى تلاوة هادئة من قارئك المفضل.',
        bodyEn: 'Listen to a peaceful Quran recitation from your favorite reciter.',
        page: 'listen',
        hour: slot.hour,
        minute: slot.minute,
      });
    } else if (d === 'seerah') {
      specs.push({
        id: slot.id,
        domain: d,
        titleAr: 'قبس من السيرة النبوية ﷺ',
        titleEn: 'From the Prophetic Seerah ﷺ',
        bodyAr: 'واصل رحلتك الإيمانية في السيرة النبوية الشريفة.',
        bodyEn: 'Continue reading highlights from the life of Prophet Muhammad ﷺ.',
        page: 'prophetic-seerah',
        hour: slot.hour,
        minute: slot.minute,
      });
    } else if (d === 'adhkar') {
      specs.push({
        id: slot.id,
        domain: d,
        titleAr: 'حصنك اليومي من الأذكار',
        titleEn: 'Your Daily Adhkar Fortress',
        bodyAr: 'حافظ على أذكارك اليومية لتنعم بالسكينة والتحصين.',
        bodyEn: 'Keep up with your daily Adhkar for peace and protection.',
        page: 'hisn-muslim',
        hour: slot.hour,
        minute: slot.minute,
      });
    } else if (d === 'wird') {
      specs.push({
        id: slot.id,
        domain: d,
        titleAr: 'متابعة وردك القرآني',
        titleEn: 'Daily Wird Follow-up',
        bodyAr: 'اقترب يومك من الاكتمال — لا تترك وردك القرآني اليوم.',
        bodyEn: 'Stay consistent with your daily Quran Wird portion today.',
        page: 'daily-wird',
        hour: slot.hour,
        minute: slot.minute,
      });
    } else {
      specs.push({
        id: slot.id,
        domain: d,
        titleAr: 'مصحفك ينتظرك الآن',
        titleEn: 'Your Quran Companion',
        bodyAr: 'اجعل لك نصيباً من تلاوة القرآن الكريم في هذه اللحظات.',
        bodyEn: 'Spend a blessed moment reading the Holy Quran now.',
        page: 'quran',
        hour: slot.hour,
        minute: slot.minute,
      });
    }
  });

  return specs;
}

// ---------------------------------------------------------------------------
// 5. Human-Readable Learned Insights for Settings UI
// ---------------------------------------------------------------------------

export function getSmartLearnedInsights(isEn: boolean): SmartLearnedInsight[] {
  const profile = getSmartBehaviorProfile();
  const insights: SmartLearnedInsight[] = [];

  // 1. Dominant color insight
  const domColor = getDominantColorVariant();
  if (domColor) {
    const colorName = getVariantDisplayName(domColor.variant, isEn);
    insights.push({
      id: 'insight-color',
      category: 'color',
      titleAr: `اللون المفضل: ${colorName}`,
      titleEn: `Preferred Color: ${colorName}`,
      detailAr: `تم اختيار هذا الطابع ${domColor.count} مرة ويتم تعميمه تلقائياً عند التفعيل.`,
      detailEn: `Selected ${domColor.count} times and synced across the app when enabled.`,
      icon: 'fa-palette',
    });
  }

  // 2. Contextual Surah patterns
  const strongPatterns = Object.entries(profile.surahPatterns)
    .filter(([, p]) => p.count >= 2)
    .sort((a, b) => b[1].count - a[1].count);

  strongPatterns.slice(0, 6).forEach(([key, p]: [string, SurahContextPattern]) => {
    const sAr = SURAH_NAMES_AR[p.surah - 1] || `سورة ${p.surah}`;
    const sEn = SURAH_NAMES_EN[p.surah - 1] || `Surah ${p.surah}`;
    const dayLabel = getDayOfWeekLabel(p.dayOfWeek, isEn);
    const winLabel = getTimeWindowLabel(p.timeWindow, isEn);
    insights.push({
      id: `insight-surah-${key}`,
      category: 'quran',
      titleAr: `سورة ${sAr} • ${dayLabel} (${winLabel})`,
      titleEn: `${sEn} • ${dayLabel} (${winLabel})`,
      detailAr: `تُفتح تلقائياً في هذا الوقت (${p.count} مرات) مع حفظ موضع ختمتك وإرجاعه لاحقاً.`,
      detailEn: `Auto-opens in this window (${p.count} sessions) while safely preserving your Khatma.`,
      icon: 'fa-book-quran',
      deletablePatternKey: key,
    });
  });

  // 3. Preferred Supplications
  const topDuaIds = getSmartPreferredDuaaIds(3);
  if (topDuaIds.length > 0) {
    const topCatEntry = Object.entries(profile.adiaCategoryCounts).sort(
      (a, b) => (b[1]?.count || 0) - (a[1]?.count || 0)
    )[0];
    const topCat = topCatEntry ? DUAA_CATEGORIES.find((c) => c.id === topCatEntry[0]) : null;
    const catLabel = topCat ? (isEn ? topCat.titleEn : topCat.title) : '';
    insights.push({
      id: 'insight-adia',
      category: 'adia',
      titleAr: `الأدعية المحببة (${topDuaIds.length} أدعية مميزة)`,
      titleEn: `Preferred Supplications (${topDuaIds.length} saved/frequent)`,
      detailAr: catLabel
        ? `تفتح صفحة الأدعية مباشرة على أدعيتك المحببة (أكثر قسم: ${catLabel}).`
        : 'تفتح صفحة الأدعية مباشرة على أدعيتك المحببة والأكثر تكراراً.',
      detailEn: catLabel
        ? `Supplications page opens on your favorites (top category: ${catLabel}).`
        : 'Supplications page opens directly on your most frequent duas.',
      icon: 'fa-hands-praying',
    });
  }

  // 4. Top Interest for Notifications
  const topInterests = getTopSmartInterests(2).filter((i) => i.score >= 2);
  if (topInterests.length > 0) {
    const labels = topInterests.map((i) => getInterestLabel(i.domain, isEn)).join(isEn ? ' & ' : ' و');
    insights.push({
      id: 'insight-interests',
      category: 'notifications',
      titleAr: `اهتماماتك الأبرز: ${labels}`,
      titleEn: `Top Interests: ${labels}`,
      detailAr: 'تُخصَّص الإشعارات الذكية والتنبيهات بما يتوافق مع اهتماماتك.',
      detailEn: 'Smart notifications are tailored around these active interests.',
      icon: 'fa-bell',
    });
  }

  return insights;
}

export function deleteSmartPatternByKey(patternKey: string): void {
  const profile = getSmartBehaviorProfile();
  if (profile.surahPatterns[patternKey]) {
    delete profile.surahPatterns[patternKey];
    if (
      profile.primaryKhatmaBackup &&
      patternKey.includes(`_${profile.primaryKhatmaBackup.contextualSurah}`)
    ) {
      restoreKhatmaBackupToStorage(profile.primaryKhatmaBackup);
      profile.primaryKhatmaBackup = null;
    }
    saveSmartBehaviorProfile(profile);
    window.dispatchEvent(new CustomEvent(SMART_ENGINE_CHANGED_EVENT, { detail: getSmartEngineSettings() }));
  }
}
