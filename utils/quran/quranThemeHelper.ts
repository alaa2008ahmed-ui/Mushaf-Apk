import { THEMES, getLinkedQuranThemeForHomeVariant } from '../../components/QuranReader/constants';

export type QuranLayoutMode = 'modern';

export function getQuranLayoutMode(_navParams?: any): QuranLayoutMode {
  return 'modern';
}

export function isNightModeForLayout(_layout: QuranLayoutMode = 'modern'): boolean {
  try {
    const saved = localStorage.getItem('night_mode_active_modern');
    if (saved !== null) return saved === 'true';
    return localStorage.getItem('night_mode_active') === 'true';
  } catch {
    return false;
  }
}

const resolveOrient = (modeSuffix: string = '_v'): '_h' | '_v' => {
  return modeSuffix.endsWith('_h') ? '_h' : '_v';
};

const resolveScopedSuffix = (mKey: string, orient: '_h' | '_v', modeSuffix?: string): string => {
  if (modeSuffix && (modeSuffix.startsWith('_wird_') || modeSuffix.startsWith('_memorization_'))) {
    return modeSuffix;
  }
  return mKey === 'mushaf' ? orient : `_${mKey}${orient}`;
};

export function getQuranThemeIdForLayout(modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): string {
  const layout = getQuranLayoutMode(navParams);
  const isNight = isNightModeForLayout(layout);
  const mKey = readingMode || 'mushaf';
  const orient = resolveOrient(modeSuffix);

  if (isNight) {
    const scopedNightKey = `current_theme_id_${layout}_${mKey}_night`;
    const savedNight =
      localStorage.getItem(scopedNightKey + modeSuffix) ||
      localStorage.getItem(scopedNightKey + orient) ||
      localStorage.getItem(`current_theme_id_${mKey}_night${modeSuffix}`) ||
      localStorage.getItem(`current_theme_id_${mKey}_night${orient}`) ||
      (orient === '_v'
        ? (localStorage.getItem(scopedNightKey) || localStorage.getItem(`current_theme_id_${mKey}_night`))
        : null);
    if (savedNight && THEMES[savedNight as keyof typeof THEMES]) {
      return savedNight;
    }
    return 'deep_black';
  }

  const scopedModeKey = `current_theme_id_${layout}_${mKey}`;
  const altKey = `quran_layout_${layout}_${mKey}_theme${orient}`;
  const altLegacyKey = `quran_layout_${layout}__${mKey}_theme${orient}`;

  const saved =
    localStorage.getItem(scopedModeKey + modeSuffix) ||
    localStorage.getItem(scopedModeKey + orient) ||
    localStorage.getItem(`quran_layout_${layout}_${mKey}_theme${modeSuffix}`) ||
    localStorage.getItem(altKey) ||
    localStorage.getItem(altLegacyKey) ||
    localStorage.getItem(`current_theme_id_${mKey}${modeSuffix}`) ||
    localStorage.getItem(`current_theme_id_${mKey}${orient}`) ||
    (orient === '_v'
      ? (localStorage.getItem(scopedModeKey) || localStorage.getItem(`current_theme_id_${mKey}`))
      : null);

  if (saved && THEMES[saved as keyof typeof THEMES]) {
    return saved;
  }
  return getLinkedQuranThemeForHomeVariant();
}

export function setQuranThemeIdForLayout(themeId: string, modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): void {
  const layout = getQuranLayoutMode(navParams);
  const isNight = isNightModeForLayout(layout);
  const mKey = readingMode || 'mushaf';
  const orient = resolveOrient(modeSuffix);

  if (isNight) {
    const scopedNightKey = `current_theme_id_${layout}_${mKey}_night`;
    localStorage.setItem(scopedNightKey + orient, themeId);
    localStorage.setItem(`current_theme_id_${mKey}_night${orient}`, themeId);
    if (modeSuffix && modeSuffix !== orient) {
      localStorage.setItem(scopedNightKey + modeSuffix, themeId);
      localStorage.setItem(`current_theme_id_${mKey}_night${modeSuffix}`, themeId);
    }
  } else {
    const scopedModeKey = `current_theme_id_${layout}_${mKey}`;
    localStorage.setItem(scopedModeKey + orient, themeId);
    localStorage.setItem(`quran_layout_${layout}_${mKey}_theme${orient}`, themeId);
    localStorage.setItem(`current_theme_id_${mKey}${orient}`, themeId);
    if (modeSuffix && modeSuffix !== orient) {
      localStorage.setItem(scopedModeKey + modeSuffix, themeId);
      localStorage.setItem(`quran_layout_${layout}_${mKey}_theme${modeSuffix}`, themeId);
      localStorage.setItem(`current_theme_id_${mKey}${modeSuffix}`, themeId);
    }
  }
  localStorage.setItem(`quran_user_chosen_theme_${layout}_${mKey}${orient}`, themeId);
  localStorage.setItem('quran_theme_changed', 'true');
}

export function getQuranToolbarColorsForLayout(modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): any {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  const orient = resolveOrient(modeSuffix);
  const scopedSuffix = resolveScopedSuffix(mKey, orient, modeSuffix);
  const layoutKey = `quran_layout_${layout}_${mKey}_toolbar_colors${orient}`;
  const saved =
    localStorage.getItem(`toolbar_colors_v2${scopedSuffix}`) ||
    localStorage.getItem(layoutKey) ||
    localStorage.getItem(`quran_layout_${layout}_${mKey}_toolbar_colors${modeSuffix}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  const themeId = getQuranThemeIdForLayout(modeSuffix, navParams, readingMode);
  const theme = THEMES[themeId as keyof typeof THEMES] || THEMES['black'];
  return {
    'top-toolbar': { bg: theme.barBg, border: theme.barBorder },
    'bottom-toolbar': { bg: theme.barBg, border: theme.barBorder },
    'surah': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font },
    'juz': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font },
    'page': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder, font: theme.font },
    'audio': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-settings': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-home': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-bookmark': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-bookmarks-list': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-themes': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-autoscroll': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-menu': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-search': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder },
    'btn-share': { bg: theme.btnBg, text: theme.btnText, border: (theme as any).btnBorder || theme.barBorder }
  };
}

export function setQuranToolbarColorsForLayout(colors: any, modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): void {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  const orient = resolveOrient(modeSuffix);
  const scopedSuffix = resolveScopedSuffix(mKey, orient, modeSuffix);
  const serialized = JSON.stringify(colors);

  localStorage.setItem(`quran_layout_${layout}_${mKey}_toolbar_colors${orient}`, serialized);
  localStorage.setItem(`toolbar_colors_v2${scopedSuffix}`, serialized);
}

export function getQuranSettingsForLayout(modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): any {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  const orient = resolveOrient(modeSuffix);
  const orientKey = orient === '_h' ? 'h' : 'v';
  const scopedSuffix = resolveScopedSuffix(mKey, orient, modeSuffix);

  const keysToCheck = mKey === 'madinah'
    ? [
        `quran_settings_modern_madinah_${orientKey}`,
        `quran_settings_madinah_${orientKey}`,
        `quran_settings${scopedSuffix}`,
        `quran_layout_${layout}_madinah_settings_${orientKey}`,
        ...(orient === '_v' ? ['quran_settings_madinah'] : []),
      ]
    : [
        `quran_settings_modern_${mKey}_${orientKey}`,
        `quran_settings_${mKey}_${orientKey}`,
        `quran_settings${scopedSuffix}`,
        `quran_layout_${layout}_${mKey}_settings_${orientKey}`,
      ];

  let parsedBase: any = null;
  for (const key of keysToCheck) {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        parsedBase = JSON.parse(saved);
        break;
      } catch (e) {}
    }
  }

  if (isNightModeForLayout(layout)) {
    const scopedCustomFlag = localStorage.getItem(`quran_settings_${mKey}_night_colors_custom_${orientKey}`);
    const hasCustomNight = scopedCustomFlag !== null
      ? scopedCustomFlag === 'true'
      : (mKey === 'madinah' && orient === '_v' && localStorage.getItem('quran_settings_madinah_night_colors_custom') === 'true');
    let nightSaved: any = null;
    try {
      const rawNight =
        localStorage.getItem(`quran_settings_${mKey}_night_${orientKey}`) ||
        (mKey === 'madinah' && orient === '_v' ? localStorage.getItem('quran_settings_madinah_night') : null);
      nightSaved = rawNight ? JSON.parse(rawNight) : null;
    } catch {}
    const deepBlack = THEMES.deep_black;
    return {
      ...(parsedBase || {}),
      bgColor: (hasCustomNight && nightSaved?.bgColor) ? nightSaved.bgColor : deepBlack.bg,
      textColor: (hasCustomNight && nightSaved?.textColor) ? nightSaved.textColor : deepBlack.text,
      highlightTextColor: (hasCustomNight && nightSaved?.highlightTextColor)
        ? nightSaved.highlightTextColor
        : (parsedBase?.lockHighlightColor ? parsedBase.highlightTextColor : deepBlack.highlightText),
      theme: (hasCustomNight && nightSaved?.theme) ? nightSaved.theme : deepBlack.id,
    };
  }
  return parsedBase;
}

export function setQuranSettingsForLayout(settings: any, modeSuffix: string = '_v', navParams?: any, readingMode: string = 'mushaf'): void {
  const layout = getQuranLayoutMode(navParams);
  const mKey = readingMode || 'mushaf';
  const orient = resolveOrient(modeSuffix);
  const orientKey = orient === '_h' ? 'h' : 'v';
  const scopedSuffix = resolveScopedSuffix(mKey, orient, modeSuffix);
  const serialized = JSON.stringify(settings);

  localStorage.setItem(`quran_layout_${layout}_${mKey}_settings_${orientKey}`, serialized);
  localStorage.setItem(`quran_settings_${mKey}_${orientKey}`, serialized);
  localStorage.setItem(`quran_settings_${layout}_${mKey}_${orientKey}`, serialized);
  localStorage.setItem(`quran_settings${scopedSuffix}`, serialized);
}
