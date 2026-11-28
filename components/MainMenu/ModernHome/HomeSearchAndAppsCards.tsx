import React from 'react';
import { ChevronDown, Mic, MicOff } from 'lucide-react';
import { markPageAsSeen } from '../../../utils/app/badgeManager';
import { recordAppVisit } from '../../../utils/app/favoriteAppsManager';
import { HomeServiceItem, get3DIconForService } from './modernHomeConstants';

interface HomeSearchCardProps {
  isEn: boolean;
  dir: 'rtl' | 'ltr';
  isNightMode: boolean;
  isSkyTheme: boolean;
  isEmeraldTheme: boolean;
  isBurgundyTheme: boolean;
  homeThemeVariant: string;
  showVoiceIcon: boolean;
  isEnabled: boolean;
  toggleEnabled: () => void;
  voiceIconColor: string;
  voicePingColor: string;
  setToastMessage: (msg: string) => void;
  favoriteServices: HomeServiceItem[];
  favScrollRef: React.RefObject<HTMLDivElement | null>;
  updateFavScrollFade: () => void;
  favScrollMask: string;
  onNavigate: (pageId: string, params?: any) => void;
  getResolvedEnglishQuranMode: (orient?: 'v' | 'h') => string;
}

export const HomeSearchCard: React.FC<HomeSearchCardProps> = ({
  isEn,
  dir,
  isNightMode,
  isSkyTheme,
  isEmeraldTheme,
  isBurgundyTheme,
  homeThemeVariant,
  showVoiceIcon,
  isEnabled,
  toggleEnabled,
  voiceIconColor,
  voicePingColor,
  setToastMessage,
  favoriteServices,
  favScrollRef,
  updateFavScrollFade,
  favScrollMask,
  onNavigate,
  getResolvedEnglishQuranMode,
}) => (
  <div className="w-full golden-3d-card p-3.5 sm:p-4 select-none">
    <div className="flex items-center gap-2 sm:gap-2.5">
      <div
        onClick={() => {
          recordAppVisit('search');
          onNavigate('search');
        }}
        className="flex-1 min-w-0 cursor-pointer flex items-center py-2.5 px-3.5 rounded-2xl sm:rounded-3xl white-3d-card-btn hover:brightness-[1.02] transition-all"
      >
        <div className="flex flex-col min-w-0 flex-1 text-start">
          <span className="text-[11px] min-[380px]:text-xs sm:text-sm font-bold text-[#451A03] font-cairo whitespace-normal leading-snug">
            {isEn ? 'Search Quran, all Adhkar & pages' : 'ابحث في القرآن وجميع الأذكار والصفحات'}
          </span>
          <span className="white-card-subtext text-[9.5px] min-[380px]:text-[10px] sm:text-[11px] text-amber-900/80 font-medium mt-0.5">
            {isEn ? 'Instant search across entire app content' : 'بحث فوري في كامل محتويات التطبيق'}
          </span>
        </div>
      </div>

      {showVoiceIcon && (
        <button
          id="modern-voice-control-btn"
          type="button"
          onClick={() => {
            toggleEnabled();
            if (!isEnabled) {
              setToastMessage(isEn ? 'Voice control activated 🎙️' : 'تم تفعيل التحكم الصوتي 🎙️');
            } else {
              setToastMessage(isEn ? 'Voice control disabled' : 'تم تعطيل التحكم الصوتي');
            }
          }}
          className="unified-3d-fab shrink-0 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer select-none relative overflow-hidden outline-none"
          style={
            isNightMode
              ? {
                  background: 'linear-gradient(180deg, #2b2b36 0%, #191921 100%)',
                  border: isEnabled ? '1px solid rgba(245, 158, 11, 0.55)' : '1px solid rgba(255, 255, 255, 0.22)',
                  boxShadow: isEnabled
                    ? '0 4.5px 0 #09090d, 0 8px 18px rgba(245, 158, 11, 0.28), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.24)'
                    : '0 4.5px 0 #09090d, 0 8px 16px rgba(0, 0, 0, 0.55), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.2)',
                }
              : {
                  background: homeThemeVariant === 'sky'
                    ? 'linear-gradient(180deg, #ffffff 0%, #ebf5fd 65%, #dbeafe 100%)'
                    : homeThemeVariant === 'emerald'
                      ? 'linear-gradient(180deg, #ffffff 0%, #ecfdf5 65%, #d1fae5 100%)'
                      : homeThemeVariant === 'burgundy'
                        ? 'linear-gradient(180deg, #ffffff 0%, #fff1f2 65%, #ffe4e6 100%)'
                        : 'linear-gradient(180deg, #ffffff 0%, #fffbeb 65%, #fef3c7 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.92)',
                  boxShadow: homeThemeVariant === 'sky'
                    ? '0 4.5px 0 rgba(3, 105, 161, 0.28), 0 8px 16px rgba(2, 132, 199, 0.16), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98)'
                    : homeThemeVariant === 'emerald'
                      ? '0 4.5px 0 rgba(4, 120, 87, 0.28), 0 8px 16px rgba(5, 150, 105, 0.16), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98)'
                      : homeThemeVariant === 'burgundy'
                        ? '0 4.5px 0 rgba(159, 18, 57, 0.28), 0 8px 16px rgba(159, 18, 57, 0.16), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98)'
                        : '0 4.5px 0 rgba(180, 83, 9, 0.28), 0 8px 16px rgba(180, 83, 9, 0.16), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98)',
                }
          }
          title={
            isEnabled
              ? (isEn ? 'Voice control is active (Tap to disable)' : 'التحكم الصوتي مفعّل (انقر للتعطيل)')
              : (isEn ? 'Voice control is disabled (Tap to enable)' : 'التحكم الصوتي معطّل (انقر للتفعيل)')
          }
        >
          <div className="absolute inset-x-1 top-0.5 h-[44%] rounded-t-full bg-gradient-to-b from-white/50 via-white/15 to-transparent pointer-events-none" />
          {isEnabled ? (
            <div className="relative z-10 flex items-center justify-center">
              <Mic className="w-5 h-5 sm:w-[22px] sm:h-[22px] drop-shadow-xs voice-control-icon-svg" color={voiceIconColor} style={{ color: voiceIconColor, stroke: voiceIconColor }} strokeWidth={2.4} />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: voicePingColor }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: voiceIconColor }}></span>
              </span>
            </div>
          ) : (
            <div className="relative z-10 flex items-center justify-center">
              <MicOff className="w-5 h-5 sm:w-[22px] sm:h-[22px] drop-shadow-xs voice-control-icon-svg" color={voiceIconColor} style={{ color: voiceIconColor, stroke: voiceIconColor }} strokeWidth={2.4} />
            </div>
          )}
        </button>
      )}
    </div>

    <div className="mt-2.5 pt-2 border-t border-amber-300/60 w-full">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center">
          <span className="card-header-title text-xs sm:text-[13px] font-black text-[#451A03] font-cairo">
            {isEn ? 'Your Daily Apps' : 'التطبيقات اليومية'}
          </span>
        </div>
        <span className="text-[10px] font-bold text-amber-900/75">
          {isEn ? 'Most used • Scroll' : 'الأكثر استخداماً • اسحب للتمرير'}
        </span>
      </div>

      <div className="w-full white-3d-container-card p-1 sm:p-2">
        <div
          ref={favScrollRef}
          onScroll={updateFavScrollFade}
          className="flex items-start gap-1.5 sm:gap-2.5 overflow-x-auto pb-1 pt-0.5 px-1 scrollbar-none snap-x"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            maskImage: favScrollMask,
            WebkitMaskImage: favScrollMask
          }}
          dir={dir}
        >
          {favoriteServices.map((service) => {
            const iconSrc = get3DIconForService(service.id);
            return (
              <button
                key={`fav-search-card-${service.id}`}
                type="button"
                onClick={() => {
                  markPageAsSeen(service.id);
                  recordAppVisit(service.id);
                  if (service.id === 'quran-horizontal') {
                    onNavigate('quran', { from: 'modern_home', readingMode: 'madinah' });
                  } else {
                    onNavigate(service.id, (service.id === 'quran' || service.id === 'quran-landscape') ? { from: 'modern_home', ...(isEn ? { readingMode: getResolvedEnglishQuranMode(service.id === 'quran-landscape' ? 'h' : 'v') } : {}) } : undefined);
                  }
                }}
                className="snap-start shrink-0 flex flex-col items-center justify-start p-0.5 group cursor-pointer active:scale-90 hover:scale-105 transition-all duration-200 w-[66px] sm:w-[74px] min-h-[66px] sm:min-h-[74px] select-none focus:outline-none"
              >
                <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-12 sm:h-12 flex items-center justify-center relative shrink-0">
                  <img
                    src={iconSrc}
                    alt={service.title}
                    className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_3px_5px_rgba(0,0,0,0.12)]"
                    loading="lazy"
                  />
                  {service.isNew && (
                    <span
                      className={`app-3d-badge new-app-badge absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-white font-black text-[8px] leading-none z-10 ${
                        isBurgundyTheme
                          ? 'bg-rose-900'
                          : isSkyTheme
                            ? 'bg-sky-800'
                            : isEmeraldTheme
                              ? 'bg-emerald-800'
                              : 'bg-amber-600'
                      }`}
                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                    >
                      {isEn ? 'NEW' : 'جديد'}
                    </span>
                  )}
                </div>
                <span
                  className="app-name-label text-[7.5px] min-[340px]:text-[8px] min-[370px]:text-[8.5px] min-[410px]:text-[9.5px] sm:text-[10.5px] font-black font-cairo text-center mt-1 leading-[1.15] tracking-tight select-none whitespace-normal break-words w-full px-0.5"
                  style={{
                    color: isNightMode ? '#FFFFFF' : '#1C1917',
                    textShadow: isNightMode ? 'none' : '0 1px 1px rgba(255,255,255,0.9)'
                  }}
                  title={service.title}
                >
                  {service.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

interface HomeAppsCardProps {
  isEn: boolean;
  dir: 'rtl' | 'ltr';
  isNightMode: boolean;
  isBlackTheme: boolean;
  isSkyTheme: boolean;
  isEmeraldTheme: boolean;
  isBurgundyTheme: boolean;
  activeTab: 'all' | 'library' | 'worship' | 'tools';
  setActiveTab: (tab: 'all' | 'library' | 'worship' | 'tools') => void;
  isAppsExpanded: boolean;
  setIsAppsExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
  displayedServices: HomeServiceItem[];
  onNavigate: (pageId: string, params?: any) => void;
  getResolvedEnglishQuranMode: (orient?: 'v' | 'h') => string;
}

export const HomeAppsCard: React.FC<HomeAppsCardProps> = ({
  isEn,
  dir,
  isNightMode,
  isBlackTheme,
  isSkyTheme,
  isEmeraldTheme,
  isBurgundyTheme,
  activeTab,
  setActiveTab,
  isAppsExpanded,
  setIsAppsExpanded,
  displayedServices,
  onNavigate,
  getResolvedEnglishQuranMode,
}) => (
  <div id="modern-islamic-apps-card" className="w-full golden-3d-card select-none">
    <div
      onClick={() => setIsAppsExpanded(!isAppsExpanded)}
      className="w-full p-4 sm:p-5 pb-3 flex items-center justify-between cursor-pointer transition-colors duration-150 hover:bg-black/[0.02]"
      role="button"
      tabIndex={0}
      aria-expanded={isAppsExpanded}
    >
      <div className="flex flex-col text-start">
        <span className="card-header-title text-sm sm:text-base font-bold text-[#451A03] font-cairo leading-tight">
          {isEn ? 'Islamic Apps' : 'التطبيقات الإسلامية'}
        </span>
        <span className="text-[11px] text-amber-900/85 font-medium mt-0.5">
          {isAppsExpanded
            ? (isEn ? 'Tap to collapse' : 'انقر لإغلاق الدرج')
            : (isEn ? 'Tap tabs to view apps' : 'انقر على أي تبويب لعرض التطبيقات')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 golden-3d-btn-light ${
          isAppsExpanded ? 'rotate-180' : ''
        }`}>
          <ChevronDown className="w-5 h-5 text-amber-900 stroke-[2.8]" />
        </div>
      </div>
    </div>

    <div className="px-4 sm:px-5 pb-3.5">
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs font-bold overflow-x-auto scrollbar-none max-w-full pt-1 pb-2">
        {([
          { id: 'all', labelEn: 'All', labelAr: 'الكل' },
          { id: 'library', labelEn: 'Library', labelAr: 'المكتبة' },
          { id: 'worship', labelEn: 'Worship', labelAr: 'العبادات' },
          { id: 'tools', labelEn: 'Other', labelAr: 'أخرى' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(tab.id);
              setIsAppsExpanded(true);
            }}
            className={`px-2.5 min-[380px]:px-3 py-1 rounded-full transition-all cursor-pointer text-[11px] min-[380px]:text-xs flex items-center justify-center shrink-0 ${
              activeTab === tab.id && isAppsExpanded
                ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none')
                : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
            }`}
          >
            <span style={activeTab === tab.id && isAppsExpanded && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
              {isEn ? tab.labelEn : tab.labelAr}
            </span>
          </button>
        ))}
      </div>
    </div>

    {isAppsExpanded && (
      <div className="px-3.5 sm:px-5 pb-4 pt-1 border-t border-amber-300/60 animate-fadeIn">
        <div className="w-full white-3d-container-card p-3 sm:p-4 mt-2">
          <div className="grid grid-cols-4 gap-y-3.5 sm:gap-y-4 gap-x-2 sm:gap-x-3 items-start justify-items-center" dir={dir}>
            {displayedServices.map((service) => {
              const iconSrc = get3DIconForService(service.id);
              return (
                <button
                  key={`apps-drawer-item-${service.id}`}
                  type="button"
                  onClick={() => {
                    markPageAsSeen(service.id);
                    recordAppVisit(service.id);
                    if (service.id === 'quran-horizontal') {
                      onNavigate('quran', { from: 'modern_home', readingMode: 'madinah' });
                    } else {
                      onNavigate(service.id, (service.id === 'quran' || service.id === 'quran-landscape') ? { from: 'modern_home', ...(isEn ? { readingMode: getResolvedEnglishQuranMode(service.id === 'quran-landscape' ? 'h' : 'v') } : {}) } : undefined);
                    }
                  }}
                  className="flex flex-col items-center justify-between p-1.5 sm:p-2 group cursor-pointer active:scale-90 hover:scale-105 transition-all duration-200 w-full min-h-[92px] select-none focus:outline-none"
                >
                  <div className="w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center relative">
                    <img
                      src={iconSrc}
                      alt={service.title}
                      className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)]"
                      loading="lazy"
                    />
                    {service.isNew && (
                      <span
                        className={`app-3d-badge new-app-badge absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-white font-black text-[9px] leading-none z-10 ${
                          isBurgundyTheme
                            ? 'bg-rose-900'
                            : isSkyTheme
                              ? 'bg-sky-800'
                              : isEmeraldTheme
                                ? 'bg-emerald-800'
                                : 'bg-amber-600'
                        }`}
                        style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                      >
                        {isEn ? 'NEW' : 'جديد'}
                      </span>
                    )}
                  </div>
                  <span
                    className="app-name-label text-[11px] sm:text-[12px] font-black text-center leading-tight whitespace-pre-line w-full font-cairo select-none mt-1"
                    style={{
                      color: isNightMode ? '#FFFFFF' : '#1C1917',
                      textShadow: isNightMode ? 'none' : '0 1px 1px rgba(255,255,255,0.9)'
                    }}
                  >
                    {(() => {
                      const parts = service.title.trim().split(/\s+/);
                      if (parts.length >= 2) {
                        return `${parts[0]}\n${parts.slice(1).join(' ')}`;
                      }
                      return service.title;
                    })()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    )}
  </div>
);
