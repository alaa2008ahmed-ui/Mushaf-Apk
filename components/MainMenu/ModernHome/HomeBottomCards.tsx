import React, { useMemo } from 'react';
import {
  Calendar,
  Check,
  Copy,
  ExternalLink,
  GripVertical,
  QrCode,
  RotateCcw,
  ScrollText,
  Share2,
  Sparkles,
  ZoomIn,
} from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import moment from 'moment-hijri';
import { toArabic } from '../../QuranReader/constants';
import { ISLAMIC_WISDOMS } from '../../../data/prayerAndApp/wisdomData';
import UnifiedEventZoomModal from '../UnifiedEventZoomModal';
import { useTheme } from '../../../context/ThemeContext';
import { getThemeEditModeStyles } from '../../../utils/styles/themeEditStyles';
import { ModernCardId, WEB_APP_URL } from './modernHomeConstants';

interface HomeReflectionsCardProps {
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  activeEventTab: 'event' | 'memory' | 'occasions' | 'wisdom';
  setActiveEventTab: (tab: 'event' | 'memory' | 'occasions' | 'wisdom') => void;
  currentWisdom: any;
  setWisdomIndex: React.Dispatch<React.SetStateAction<number>>;
  showWisdomZoomModal: boolean;
  setShowWisdomZoomModal: React.Dispatch<React.SetStateAction<boolean>>;
  onThisDayEvent: any;
  handleNextEvent?: (e?: any) => void;
  handleShareHighlight?: (e?: any) => void | Promise<void>;
  handleCopyHighlight?: (e?: any) => void | Promise<void>;
  setShowExpandedEventsModal: (show: boolean) => void;
  currentHistoryMemoryEvent: any;
  handleNextHistoryMemoryEvent?: (e?: any) => void | Promise<void>;
  handleShareHistoryMemory?: (e?: any) => void | Promise<void>;
  handleCopyHistoryMemory?: (e?: any) => void | Promise<void>;
  setShowExpandedHistoryMemoryModal: (show: boolean) => void;
  upcomingEvents: any[];
  currentOccasion: any;
  setEventIndex: React.Dispatch<React.SetStateAction<number>>;
  handleShareUpcomingEvent?: (e?: any) => void | Promise<void>;
  handleCopyUpcomingEvent?: (e?: any) => void | Promise<void>;
  setShowExpandedUpcomingEventModal: (show: boolean) => void;
  formatNumber: (n: number | string) => string;
  translateEventName: (name: string) => string;
  setToastMessage: (msg: string) => void;
  shareTextAr?: string;
}

export const HomeReflectionsCard: React.FC<HomeReflectionsCardProps> = ({
  isEn,
  isNightMode,
  isBlackTheme,
  activeEventTab,
  setActiveEventTab,
  currentWisdom,
  setWisdomIndex,
  showWisdomZoomModal,
  setShowWisdomZoomModal,
  onThisDayEvent,
  handleNextEvent,
  handleShareHighlight,
  handleCopyHighlight,
  setShowExpandedEventsModal,
  currentHistoryMemoryEvent,
  handleNextHistoryMemoryEvent,
  handleShareHistoryMemory,
  handleCopyHistoryMemory,
  setShowExpandedHistoryMemoryModal,
  upcomingEvents,
  currentOccasion,
  setEventIndex,
  handleShareUpcomingEvent,
  handleCopyUpcomingEvent,
  setShowExpandedUpcomingEventModal,
  formatNumber,
  translateEventName,
  setToastMessage,
  shareTextAr,
}) => (
  <>
    <div className="w-full golden-3d-card p-3.5 sm:p-5 select-none transition-all">
      <div className="flex flex-col w-full mb-3 gap-2.5">
        <div className="flex items-center justify-start w-full">
          <span className="card-header-title text-sm font-bold text-[#451A03] font-cairo text-start">
            {isEn ? 'Reflections & Memory of the Day' : 'إشراقات وذاكرة اليوم'}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-center gap-0.5 sm:gap-1.5 w-full font-bold pt-1 pb-2">
          {([
            { id: 'occasions', labelEn: 'Occasions', labelAr: 'المناسبات' },
            { id: 'wisdom', labelEn: 'Wisdom', labelAr: 'حكمة اليوم' },
            { id: 'memory', labelEn: 'Islamic Memory', labelAr: 'ذاكرة الإسلام' },
            { id: 'event', labelEn: 'Event of the Day', labelAr: 'حدث اليوم' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveEventTab(tab.id)}
              style={{
                fontSize: isEn ? 'clamp(8.5px, 2.5vw, 12px)' : 'clamp(9.5px, 2.8vw, 12px)',
                paddingInline: 'clamp(4px, 1.6vw, 10px)',
              }}
              className={`py-1 rounded-full transition-all cursor-pointer flex items-center justify-center whitespace-nowrap min-w-0 ${
                activeEventTab === tab.id
                  ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] font-extrabold text-white shadow-none')
                  : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
              }`}
            >
              <span style={activeEventTab === tab.id && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
                {isEn ? tab.labelEn : tab.labelAr}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 my-1 min-h-[128px]">
        <div
          aria-hidden={activeEventTab !== 'wisdom'}
          className={`col-start-1 row-start-1 flex flex-col transition-opacity duration-200 ${
            activeEventTab === 'wisdom'
              ? 'opacity-100 pointer-events-auto z-10'
              : 'opacity-0 invisible pointer-events-none select-none'
          }`}
        >
          {currentWisdom && (
            <>
              <div className="flex items-center justify-center gap-2 mb-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg golden-3d-inset text-[#451A03] font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                  <span>{isEn ? currentWisdom.categoryEn : currentWisdom.categoryAr}</span>
                </div>
                <span className="px-2 py-0.5 rounded-lg golden-3d-inset text-amber-950 font-extrabold text-xs">
                  {isEn ? currentWisdom.authorEn : currentWisdom.authorAr}
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-center my-1 text-start">
                <div className="flex flex-col gap-1">
                  <span className={`text-xs sm:text-sm font-bold font-cairo ${isNightMode || isBlackTheme ? 'text-white' : 'text-[#451A03]'}`}>
                    {isEn ? currentWisdom.titleEn : currentWisdom.titleAr}
                  </span>
                  <p className={`text-xs sm:text-sm font-semibold leading-relaxed line-clamp-3 ${isNightMode || isBlackTheme ? 'text-white' : 'text-[#3B1703]'}`}>
                    "{isEn ? currentWisdom.textEn : currentWisdom.textAr}"
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          aria-hidden={activeEventTab !== 'event'}
          className={`col-start-1 row-start-1 flex flex-col transition-opacity duration-200 ${
            activeEventTab === 'event'
              ? 'opacity-100 pointer-events-auto z-10'
              : 'opacity-0 invisible pointer-events-none select-none'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg golden-3d-inset text-[#451A03] font-bold text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              <span>{onThisDayEvent?.dateStr || moment().format(isEn ? 'dddd, D MMMM' : 'dddd، D MMMM')}</span>
            </div>
            {onThisDayEvent?.year ? (
              <span className="px-2 py-0.5 rounded-lg golden-3d-inset text-amber-950 font-extrabold text-xs">
                {isEn ? `Year ${onThisDayEvent.year} AD` : `عام ${toArabic(onThisDayEvent.year)} م`}
              </span>
            ) : null}
          </div>
          <div className="flex-1 flex flex-col justify-center my-1 text-start">
            <p className={`text-xs sm:text-sm font-semibold leading-relaxed line-clamp-4 ${isNightMode || isBlackTheme ? 'text-white' : 'text-[#3B1703]'}`}>
              {isEn ? (onThisDayEvent?.textEn || onThisDayEvent?.text) : onThisDayEvent?.text || (isEn ? 'Events on this day in history' : 'حدث في مثل هذا اليوم من التاريخ الإسلامي والعالمي')}
            </p>
          </div>
        </div>

        <div
          aria-hidden={activeEventTab !== 'memory'}
          className={`col-start-1 row-start-1 flex flex-col transition-opacity duration-200 ${
            activeEventTab === 'memory'
              ? 'opacity-100 pointer-events-auto z-10'
              : 'opacity-0 invisible pointer-events-none select-none'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg golden-3d-inset text-[#451A03] font-bold text-xs">
              <ScrollText className="w-3.5 h-3.5 text-amber-800" />
              <span>{isEn ? 'Islamic History' : 'ذاكرة التاريخ الإسلامي'}</span>
            </div>
            {(currentHistoryMemoryEvent?.hijriYearAr || currentHistoryMemoryEvent?.gregorianYearAr) && (
              <span className="px-2 py-0.5 rounded-lg golden-3d-inset text-amber-950 font-extrabold text-xs">
                {isEn
                  ? `${currentHistoryMemoryEvent.hijriYearEn} • ${currentHistoryMemoryEvent.gregorianYearEn}`
                  : `${currentHistoryMemoryEvent.hijriYearAr} • ${currentHistoryMemoryEvent.gregorianYearAr}`}
              </span>
            )}
          </div>
          {currentHistoryMemoryEvent && (
            <div className="flex-1 flex flex-col justify-center my-1 text-start">
              <div className="flex flex-col gap-1">
                <span className={`text-xs sm:text-sm font-bold font-cairo ${isNightMode || isBlackTheme ? 'text-white' : 'text-[#451A03]'}`}>
                  {isEn ? currentHistoryMemoryEvent.titleEn : currentHistoryMemoryEvent.titleAr}
                </span>
                <p className={`text-xs sm:text-sm font-semibold leading-relaxed line-clamp-3 ${isNightMode || isBlackTheme ? 'text-white' : 'text-[#3B1703]'}`}>
                  {isEn ? currentHistoryMemoryEvent.descriptionEn : currentHistoryMemoryEvent.descriptionAr}
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          aria-hidden={activeEventTab !== 'occasions'}
          className={`col-start-1 row-start-1 flex flex-col transition-opacity duration-200 ${
            activeEventTab === 'occasions'
              ? 'opacity-100 pointer-events-auto z-10'
              : 'opacity-0 invisible pointer-events-none select-none'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg golden-3d-inset text-[#451A03] font-bold text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              <span>{currentOccasion?.dateStr || moment().format(isEn ? 'dddd, D MMMM' : 'dddd، D MMMM')}</span>
            </div>
            {currentOccasion && (
              <span className="px-2 py-0.5 rounded-lg golden-3d-inset text-[#451A03] font-extrabold text-xs">
                {currentOccasion.isToday
                  ? (isEn ? 'Today' : 'اليوم')
                  : (currentOccasion.daysRemaining > 0
                      ? (isEn ? `Remaining: ${formatNumber(currentOccasion.daysRemaining)} days` : `المتبقي: ${toArabic(currentOccasion.daysRemaining)} يوم`)
                      : (isEn ? `Passed: ${formatNumber(Math.abs(currentOccasion.daysRemaining))} days` : `مرت: ${toArabic(Math.abs(currentOccasion.daysRemaining))} يوم`))}
              </span>
            )}
          </div>
          {currentOccasion && (
            <div className="flex-1 flex flex-col justify-center my-1 text-start">
              <div className="flex flex-col gap-1">
                <span className={`text-xs sm:text-sm font-bold font-cairo ${isNightMode || isBlackTheme ? 'text-white' : 'text-[#451A03]'}`}>
                  {translateEventName(currentOccasion.name)}
                </span>
                {(currentOccasion.historicalYearAr || currentOccasion.historicalYearEn) && (
                  <span className={`text-[11px] sm:text-xs font-extrabold ${isNightMode || isBlackTheme ? 'text-amber-300' : 'text-amber-900'}`}>
                    {isEn
                      ? `Historical Event Date: ${currentOccasion.historicalYearEn || currentOccasion.historicalYearAr}`
                      : `تاريخ الحدث الأصلي: ${currentOccasion.historicalYearAr}`}
                  </span>
                )}
                <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isNightMode || isBlackTheme ? 'text-white/90' : 'text-amber-950/80'}`}>
                  {currentOccasion.dateStr} • {currentOccasion.gregorianDateStr}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-amber-300/60">
        <button
          type="button"
          onClick={(e) => {
            if (activeEventTab === 'wisdom') {
              setWisdomIndex(prev => (prev + 1) % ISLAMIC_WISDOMS.length);
            } else if (activeEventTab === 'event') {
              handleNextEvent?.(e);
            } else if (activeEventTab === 'memory') {
              handleNextHistoryMemoryEvent?.(e);
            } else {
              setEventIndex(prev => (prev + 1) % (upcomingEvents.length || 1));
            }
          }}
          className="gold-accent-text flex items-center gap-1.5 text-xs font-bold text-[#78350F] hover:text-[#451A03] active:scale-95 transition-all cursor-pointer"
        >
          <span className="gold-accent-icon inline-flex items-center">
            <RotateCcw className="w-3.5 h-3.5" />
          </span>
          <span className="gold-accent-text">
            {activeEventTab === 'wisdom'
              ? (isEn ? 'Another Wisdom' : 'حكمة أخرى')
              : (activeEventTab === 'event'
                  ? (isEn ? 'Another Event' : 'حدث آخر')
                  : (activeEventTab === 'memory'
                      ? (isEn ? 'Another Memory' : 'ذكرى أخرى')
                      : (isEn ? 'Another Occasion' : 'مناسبة أخرى')))}
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (typeof document !== 'undefined') {
                document.body.classList.add('zoom-modal-active');
                document.body.setAttribute('data-zoom-modal', 'true');
                window.dispatchEvent(new CustomEvent('modal-state-changed', { detail: { isOpen: true, type: 'zoom' } }));
              }
              if (activeEventTab === 'wisdom') setShowWisdomZoomModal(true);
              else if (activeEventTab === 'event') setShowExpandedEventsModal(true);
              else if (activeEventTab === 'memory') setShowExpandedHistoryMemoryModal(true);
              else setShowExpandedUpcomingEventModal(true);
            }}
            className="w-8 h-8 rounded-full golden-3d-btn-light text-amber-950 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
            title={isEn ? 'Zoom' : 'تكبير'}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              if (activeEventTab === 'wisdom' && currentWisdom) {
                const shareText = `💡 ${currentWisdom.titleAr}\n\n"${currentWisdom.textAr}"\n\n— ${currentWisdom.authorAr}\n\nتطبيق مصحف أحمد وليلى\n${shareTextAr || 'https://mushaf-ahmed-laila.vercel.app/'}`;
                if (navigator.share) {
                  navigator.share({ title: currentWisdom.titleAr, text: shareText }).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(shareText);
                  setToastMessage?.(isEn ? 'Wisdom copied to clipboard!' : 'تم نسخ الحكمة إلى الحافظة!');
                }
              } else if (activeEventTab === 'event') handleShareHighlight?.(e);
              else if (activeEventTab === 'memory') handleShareHistoryMemory?.(e);
              else handleShareUpcomingEvent?.(e);
            }}
            className="w-8 h-8 rounded-full golden-3d-btn-light text-amber-950 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
            title={isEn ? 'Share' : 'مشاركة'}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              if (activeEventTab === 'wisdom' && currentWisdom) {
                const copyText = `💡 ${currentWisdom.titleAr}\n\n"${currentWisdom.textAr}"\n\n— ${currentWisdom.authorAr}`;
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(copyText);
                  setToastMessage?.(isEn ? 'Wisdom copied to clipboard!' : 'تم نسخ الحكمة بنجاح!');
                }
              } else if (activeEventTab === 'event') handleCopyHighlight?.(e);
              else if (activeEventTab === 'memory') handleCopyHistoryMemory?.(e);
              else handleCopyUpcomingEvent?.(e);
            }}
            className="w-8 h-8 rounded-full golden-3d-btn-light text-amber-950 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
            title={isEn ? 'Copy' : 'نسخ'}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    {currentWisdom && (
      <UnifiedEventZoomModal
        isOpen={showWisdomZoomModal}
        onClose={() => setShowWisdomZoomModal(false)}
        categoryTitle={isEn ? 'Wisdom of the Day' : 'حكمة اليوم'}
        text={isEn ? currentWisdom.textEn : currentWisdom.textAr}
        subtitle={isEn ? currentWisdom.titleEn : currentWisdom.titleAr}
        source={isEn ? currentWisdom.authorEn : currentWisdom.authorAr}
        setToastMessage={setToastMessage}
        isGolden={true}
        onNextEvent={() => setWisdomIndex(prev => (prev + 1) % ISLAMIC_WISDOMS.length)}
      />
    )}
  </>
);

interface HomeShareCardProps {
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  activeBottomCardTab: 'share' | 'browse' | 'support';
  setActiveBottomCardTab: (tab: 'share' | 'browse' | 'support') => void;
  t: (key: string, fallback?: string) => string;
  handleShareAppGeneral: () => Promise<void>;
  setShowQrModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleCopyShareAppText: () => Promise<void>;
  copiedShare: boolean;
  handleCopyWebUrl: (e: React.MouseEvent) => Promise<void>;
  copiedWebLink: boolean;
  handleShareWebUrl: (e: React.MouseEvent) => Promise<void>;
}

export const HomeShareCard: React.FC<HomeShareCardProps> = ({
  isEn,
  isNightMode,
  isBlackTheme,
  activeBottomCardTab,
  setActiveBottomCardTab,
  t,
  handleShareAppGeneral,
  setShowQrModal,
  handleCopyShareAppText,
  copiedShare,
  handleCopyWebUrl,
  copiedWebLink,
  handleShareWebUrl,
}) => (
  <div className="w-full golden-3d-card p-4 sm:p-5 select-none transition-all">
    <div className="grid grid-cols-3 gap-1.5 mb-4 pt-1 pb-2">
      {([
        { id: 'share', labelEn: 'Share App', labelAr: 'شارك التطبيق' },
        { id: 'browse', labelEn: 'Browse App', labelAr: 'تصفح التطبيق' },
        { id: 'support', labelEn: 'Tech Support', labelAr: 'الدعم الفني' },
      ] as const).map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveBottomCardTab(tab.id)}
          className={`py-1.5 px-1 rounded-full text-[11px] sm:text-xs font-bold font-cairo flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
            activeBottomCardTab === tab.id
              ? (isNightMode || isBlackTheme ? 'night-white-surface bg-white text-black font-extrabold' : 'active-tab-pill-selected bg-[#c25e00] text-white font-extrabold shadow-none')
              : 'bg-transparent text-[#78350F] hover:text-[#451A03] font-bold active:scale-95'
          }`}
        >
          <span style={activeBottomCardTab === tab.id && !isNightMode && !isBlackTheme ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
            {isEn ? tab.labelEn : tab.labelAr}
          </span>
        </button>
      ))}
    </div>

    <div className="grid grid-cols-1">
      <div
        aria-hidden={activeBottomCardTab !== 'share'}
        className={`col-start-1 row-start-1 flex flex-col justify-between gap-3 transition-opacity duration-200 ${
          activeBottomCardTab === 'share'
            ? 'opacity-100 pointer-events-auto z-10'
            : 'opacity-0 invisible pointer-events-none select-none'
        }`}
      >
        <div className="w-full p-3.5 rounded-2xl golden-3d-inset text-center flex flex-col items-center gap-1">
          <p className="gold-accent-text font-cairo text-sm sm:text-base font-bold text-[#451A03]">
            {t('app_share.ayah', 'قال تعالى: ( وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ )')}
          </p>
          <p className="text-xs font-semibold text-amber-950 font-cairo">
            {t('app_share.hadith', '« مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ »')}
          </p>
        </div>

        <p className="text-xs text-amber-900/90 font-medium leading-relaxed text-center px-2 font-cairo">
          {t('app_share.desc', 'اذا اعجبك التطبيق قم بنشره على وسائل التواصل ليكون لك الاجر ولمن تحب ان شاء الله .')}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={handleShareAppGeneral}
            className="py-2.5 px-3 rounded-2xl golden-3d-btn font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all font-cairo cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isEn ? 'Share' : 'مشاركة'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="py-2.5 px-3 rounded-2xl golden-3d-btn font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all font-cairo cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{isEn ? 'QR Code' : 'الكيو ار'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyShareAppText}
            className="py-2.5 px-3 rounded-2xl golden-3d-btn font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all font-cairo cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-900" />
                <span>{isEn ? 'Copied' : 'تم'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isEn ? 'Copy' : 'نسخ'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div
        aria-hidden={activeBottomCardTab !== 'browse'}
        className={`col-start-1 row-start-1 flex flex-col justify-between gap-3 transition-opacity duration-200 ${
          activeBottomCardTab === 'browse'
            ? 'opacity-100 pointer-events-auto z-10'
            : 'opacity-0 invisible pointer-events-none select-none'
        }`}
      >
        <div className="flex-1 flex items-center justify-center px-3">
          <p className="text-base sm:text-lg text-[#451A03] font-bold leading-loose text-center py-2 font-cairo max-w-[270px] sm:max-w-[315px] text-balance">
            {isEn ? 'To open the app on your browser or iPhone, tap the link' : 'لمشاهدة التطبيق على المتصفح او الايفون اضغط على الرابط'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2.5 pt-1">
          <a
            href={WEB_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-2xl golden-3d-btn font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>{isEn ? 'Open Link' : 'فتح الرابط'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={handleCopyWebUrl}
            className="w-10 h-10 rounded-2xl golden-3d-btn-light flex items-center justify-center active:scale-90 transition-all cursor-pointer"
            title={isEn ? 'Copy Link' : 'نسخ الرابط'}
          >
            {copiedWebLink ? <Check className="w-4 h-4 text-amber-800" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleShareWebUrl}
            className="w-10 h-10 rounded-2xl golden-3d-btn-light flex items-center justify-center active:scale-90 transition-all cursor-pointer"
            title={isEn ? 'Share Link' : 'مشاركة الرابط'}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        aria-hidden={activeBottomCardTab !== 'support'}
        className={`col-start-1 row-start-1 flex flex-col justify-between gap-3 transition-opacity duration-200 ${
          activeBottomCardTab === 'support'
            ? 'opacity-100 pointer-events-auto z-10'
            : 'opacity-0 invisible pointer-events-none select-none'
        }`}
      >
        <div className="w-full p-3.5 rounded-2xl golden-3d-inset text-center flex flex-col items-center gap-1">
          <div className={`modern-gold-icon-box w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center mb-1 text-emerald-700 dark:text-emerald-400 ${(isNightMode || isBlackTheme) ? '' : 'border border-emerald-500/30'}`}>
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <h4 className="gold-accent-text font-cairo text-sm sm:text-base font-bold text-[#451A03]">
            {isEn ? 'Direct Support & Suggestions' : 'للتواصل المباشر والاقتراحات'}
          </h4>
          <p className="text-xs font-bold text-amber-900 font-cairo">
            {isEn ? 'Alaa Ahmed Elmorshedy' : 'علاء أحمد المرشدى'}
          </p>
          <p className="gold-accent-text text-[11px] font-mono font-bold text-amber-800/80 dir-ltr">
            +966 59 216 6023
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              window.open('https://wa.me/966592166023', '_blank');
            }}
            className="w-full py-3 px-4 rounded-2xl golden-3d-btn font-extrabold text-xs sm:text-sm text-white flex items-center justify-center gap-2 active:scale-98 transition-all font-cairo cursor-pointer shadow-none"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>{isEn ? 'Start WhatsApp Chat' : 'محادثة عبر الواتساب'}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface ReorderableCardItemProps {
  cardId: ModernCardId;
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  children: React.ReactNode;
}

export const ReorderableCardItem: React.FC<ReorderableCardItemProps> = ({
  cardId,
  isEn,
  isNightMode,
  isBlackTheme,
  children
}) => {
  const dragControls = useDragControls();
  const { homeThemeVariant } = useTheme();

  const editStyles = useMemo(() => {
    return getThemeEditModeStyles(isNightMode, homeThemeVariant, isBlackTheme);
  }, [isNightMode, homeThemeVariant, isBlackTheme]);

  if (!children) return null;

  return (
    <Reorder.Item
      id={`modern-card-container-${cardId}`}
      value={cardId}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0, top: 0.1, bottom: 0.1 }}
      layout
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      whileDrag={{
        scale: 1,
        x: 0,
        zIndex: 50,
        boxShadow: isNightMode
          ? '0 12px 32px rgba(0,0,0,0.85), 0 0 12px rgba(245,158,11,0.3)'
          : '0 12px 32px rgba(180,83,9,0.25)',
      }}
      className="w-full relative select-none rounded-3xl"
      style={{ x: 0 }}
    >
      {cardId !== 'seasonal' && (
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="absolute top-2.5 start-2.5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl shadow-lg cursor-grab active:cursor-grabbing touch-none select-none active:scale-95 transition-transform"
          style={editStyles.dragBadge}
          title={isEn ? 'Hold and drag to reorder' : 'اضغط واسحب لإعادة الترتيب'}
        >
          <GripVertical className="w-4 h-4" />
          <span className="text-xs font-black font-cairo">
            {isEn ? 'Drag' : 'اسحب'}
          </span>
        </div>
      )}

      <div className="w-full">
        {children}
      </div>
    </Reorder.Item>
  );
};
