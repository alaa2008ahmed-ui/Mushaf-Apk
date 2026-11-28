export type SmartTimeWindow = 'fajr_morning' | 'day' | 'evening' | 'night';

export type SmartThemeVariant = 'gold' | 'sky' | 'emerald' | 'burgundy';

export type SmartInterestDomain =
  | 'quran'
  | 'tafseer'
  | 'memorization'
  | 'adia'
  | 'adhkar'
  | 'tasbeeh'
  | 'listen'
  | 'seerah'
  | 'wird';

export interface SmartEngineSettings {
  /** Master enable/disable switch for the Smart Adaptive Engine */
  enabled: boolean;
  /** Learn & propagate preferred colors / theme variants across the entire app */
  autoColorSync: boolean;
  /** Open contextual Surah during recurring day/time windows without losing Khatma position */
  smartQuranContext: boolean;
  /** Open Adia page directly on the user's most loved / frequent supplications */
  smartAdiaOpening: boolean;
  /** Tailor notifications & gentle nudges to the user's dominant spiritual interests */
  smartNotifications: boolean;
}

export interface SurahContextPattern {
  surah: number;
  dayOfWeek: number; // 0 = Sunday ... 5 = Friday ... 6 = Saturday
  timeWindow: SmartTimeWindow;
  count: number;
  lastReadAt: number;
}

export interface PrimaryKhatmaBackup {
  s: number;
  a: number;
  page?: number;
  juz?: number;
  isExplicit?: boolean;
  readingMode?: string;
  ts: number;
  contextualSurah: number;
  contextualReasonAr: string;
  contextualReasonEn: string;
  contextualWindowKey: string;
  expiresAt: number;
}

export interface SmartColorMemory {
  variantCounts: Record<SmartThemeVariant, number>;
  lastSelectedVariant?: SmartThemeVariant;
  lastCustomHex?: string | null;
  nightToggleHours: number[];
  dayToggleHours: number[];
}

export interface SmartDuaMemoryItem {
  count: number;
  categoryId: string;
  lastAt: number;
  favorited?: boolean;
}

export interface SmartBehaviorProfile {
  colorMemory: SmartColorMemory;
  surahPatterns: Record<string, SurahContextPattern>;
  primaryKhatmaBackup: PrimaryKhatmaBackup | null;
  lastSurahLogKey?: string;
  lastSurahLogAt?: number;
  dismissedContextualWindowKey?: string;
  adiaItemCounts: Record<string, SmartDuaMemoryItem>;
  adiaCategoryCounts: Record<string, { count: number; lastAt: number }>;
  interestScores: Record<SmartInterestDomain, number>;
  lastInAppNudgeDate?: string;
  updatedAt: number;
}

export interface ContextualQuranResolution {
  action: 'none' | 'contextual' | 'restored';
  surah?: number;
  ayah?: number;
  page?: number;
  reasonAr?: string;
  reasonEn?: string;
  windowKey?: string;
  primaryBackup?: PrimaryKhatmaBackup;
}

export interface SmartAdiaResolution {
  shouldAutoOpen: boolean;
  initialCategory: string;
  topDuaaIds: string[];
  topCategoryId: string | null;
  reasonAr: string;
  reasonEn: string;
}

export interface SmartLearnedInsight {
  id: string;
  category: 'color' | 'quran' | 'adia' | 'notifications';
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  icon: string;
  deletablePatternKey?: string;
}

export interface SmartPersonalizedNotificationSpec {
  id: number;
  domain: SmartInterestDomain;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  page: string;
  params?: Record<string, any>;
  hour: number;
  minute: number;
}
