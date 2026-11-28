import React, { FC, Dispatch, SetStateAction, MutableRefObject } from 'react';
import { Grid, Mic, BookOpen, Trophy, Play } from 'lucide-react';
import {
    ReadingMode,
    toArabic,
    READERS,
    MEMORIZATION_READERS,
    ARABIC_READERS,
    BILINGUAL_READER,
    TRANSLATION_READER,
    getValidReaderForMode,
    SURAH_NAMES_EN,
} from './constants';
import { normalizeMadinahFrameDesign, getSurahHeaderDesignForFrame } from './madinahFrameDesigns';
import {
    getClusterForLanguage,
    saveClusterPosition,
    syncClusterSettings,
    saveMadinahSettings,
} from '../../utils/quran/quranClusterSync';
import {
    getEmbeddedJalalaynSurahSync,
    getEmbeddedMeaningsSurahSync,
    getEmbeddedTranslationSurahSync,
} from '../../utils/quran/embeddedQuranExplanations';
import { quranData as quranJsonData } from '../../utils/quran/quranData';
import { memorizationService } from '../../services/memorizationService';
import AutoScrollSettingsModal from './AutoScrollSettingsModal';
import SurahJuzModal from './SurahJuzModal';
import BookmarksModal from './BookmarksModal';
import SearchModal from './SearchModal';
import ShareAyahModal from './ShareAyahModal';
import SettingsModal from './SettingsModal';
import SurahDesignPickerModal from './SurahDesignPickerModal';
import NotificationSettingsModal from './NotificationSettingsModal';
import FontSelectModal from './FontSelectModal';
import ScrollSpeedModal from './ScrollSpeedModal';
import ReciterSelectModal from './ReciterSelectModal';
import { QuranDownloadModal, TafsirDownloadModal } from './DownloadModals';
import TafseerModal from './TafseerModal';
import MultiTafseerModal from './MultiTafseerModal';
import EnglishTafseerModal from './EnglishTafseerModal';
import SurahExplanationModal from './SurahExplanationModal';
import WaqfGuideModal from './WaqfGuideModal';
import MutashabihatModal from './MutashabihatModal';
import AsbabNuzulModal from './AsbabNuzulModal';
import IrabModal from './IrabModal';
import ThematicEncyclopediaModal from './ThematicEncyclopediaModal';
import TafseerSelectionModal from './TafseerSelectionModal';
import SajdahCardModal from './SajdahCardModal';
import JuzNotification from './JuzNotification';
import Toast from './Toast';
import ReviewTestModal from './ReviewTestModal';
import { QuranSpotlightGuide } from './QuranSpotlightGuide';
import {
    QURAN_PAGE_STEPS,
    MADINAH_PAGE_STEPS,
    QURAN_SURAH_JUZ_STEPS,
} from './quranGuideSteps';
import QuranMicroHints from './QuranMicroHints';
import {
    AyahActionMenu,
    WirdCompletionModal,
    ResumeSessionModal,
} from './QuranReaderInlineModals';

interface QuranReaderModalsLayerProps {
    isAutoScrollSettingsOpen: boolean;
    setIsAutoScrollSettingsOpen: Dispatch<SetStateAction<boolean>>;
    settings: any;
    setSettings: Dispatch<SetStateAction<any>>;
    isWirdMode: boolean;
    localIsMemorizationMode: boolean;
    readingMode: ReadingMode;
    themeSuffix: string;
    language: string;
    isLandscape: boolean;
    isLandscapeRef: MutableRefObject<boolean>;
    isEn: boolean;
    showToast: (message: string) => void;
    currentTheme: any;
    showRapidScrollToast: boolean;
    activeModals: string[];
    closeModal: (modalName: string) => void;
    openModal: (modalName: string, params?: any) => void;
    modalParams: any;
    quranData: any;
    jumpToAyah: (s: number, a: number, isExplicitSelection?: boolean, retries?: number) => void;
    currentAyah: { s: number; a: number };
    setCurrentAyah: Dispatch<SetStateAction<{ s: number; a: number }>>;
    currentAyahRef: MutableRefObject<{ s: number; a: number }>;
    setIsSurahJuzGuideOpen: Dispatch<SetStateAction<boolean>>;
    isSurahJuzGuideOpen: boolean;
    bookmarks: any[];
    deleteBookmark: (s: number, a: number) => void;
    showWirdCompleteModal: boolean;
    setShowWirdCompleteModal: Dispatch<SetStateAction<boolean>>;
    handleMarkWirdCompleted: (action: 'continue' | 'daily-wird' | 'home') => void;
    initialSearchQuery: string;
    instantShareTarget: { s: number; a: number; nonce: number } | null;
    setInstantShareTarget: Dispatch<SetStateAction<{ s: number; a: number; nonce: number } | null>>;
    isSurahDesignPickerOpen: boolean;
    setIsSurahDesignPickerOpen: Dispatch<SetStateAction<boolean>>;
    localMemorizationSettings: any;
    memorizationSettingsRef: MutableRefObject<any>;
    isPlaying: boolean;
    stopAudio: () => void;
    playAudio: (s: number, a: number, isLinked?: boolean, targetAyah?: { s: number; a: number }, singleAyahOnly?: boolean) => Promise<void>;
    playSingleAyah: (s: number, a: number) => Promise<void>;
    playingAyah: { s: number; a: number } | null;
    shouldSkipSavePositionRef: MutableRefObject<boolean>;
    tafseerInfo: any;
    setTafseerInfo: Dispatch<SetStateAction<any>>;
    isTafseerLoading: boolean;
    setIsTafseerLoading: Dispatch<SetStateAction<boolean>>;
    tafseerName: string;
    multiTafseerInfo: any;
    setMultiTafseerInfo: Dispatch<SetStateAction<any>>;
    quranMeaningsInfo: any;
    setQuranMeaningsInfo: Dispatch<SetStateAction<any>>;
    isQuranMeaningsLoading: boolean;
    setIsQuranMeaningsLoading: Dispatch<SetStateAction<boolean>>;
    quranTranslationInfo: any;
    setQuranTranslationInfo: Dispatch<SetStateAction<any>>;
    isQuranTranslationLoading: boolean;
    setIsQuranTranslationLoading: Dispatch<SetStateAction<boolean>>;
    englishTafseerInfo: any;
    setEnglishTafseerInfo: Dispatch<SetStateAction<any>>;
    ayahActionMenu: any;
    setAyahActionMenu: Dispatch<SetStateAction<any>>;
    surahContentModal: any;
    setSurahContentModal: Dispatch<SetStateAction<any>>;
    waqfGuideInfo: any;
    setWaqfGuideInfo: Dispatch<SetStateAction<any>>;
    setIsFloatingMenuOpen: Dispatch<SetStateAction<boolean>>;
    mutashabihatInfo: any;
    setMutashabihatInfo: Dispatch<SetStateAction<any>>;
    asbabNuzulInfo: any;
    setAsbabNuzulInfo: Dispatch<SetStateAction<any>>;
    irabInfo: any;
    setIrabInfo: Dispatch<SetStateAction<any>>;
    isThematicEncyclopediaOpen: boolean;
    thematicEncyclopediaInfo: any;
    setThematicEncyclopediaInfo: Dispatch<SetStateAction<any>>;
    tafseerSelectionInfo: any;
    setTafseerSelectionInfo: Dispatch<SetStateAction<any>>;
    handleTafseerSelect: (tafseerId: string) => void;
    sajdahCardInfo: any;
    handleCloseSajdahCard: () => void;
    showResumeModal: boolean;
    setShowResumeModal: Dispatch<SetStateAction<boolean>>;
    savedSession: any;
    handleResumeSession: () => void;
    handleStartNewFromResume: () => void;
    juzNotification: { show: boolean; text: string };
    toast: { show: boolean; message: string };
    handleToastClose: () => void;
    isHideMode: boolean;
    setIsHideMode: Dispatch<SetStateAction<boolean>>;
    showReviewTest: boolean;
    setShowReviewTest: Dispatch<SetStateAction<boolean>>;
    isRecording: boolean;
    stopRecording: (isAutoMatched?: any) => Promise<void>;
    startRecording: () => Promise<void>;
    recordedAudio: string | null;
    playRecordedAudio: () => void;
    isMainGuideOpen: boolean;
    handleCloseMainGuide: () => void;
    handleMainGuideStepChange: (stepIndex: number, step: any) => void;
    isMadinahVertical: boolean;
    isLoading: boolean;
    isAnyMenuOpen: boolean;
    isPageInputActive: boolean;
    isBottomPageInputActive: boolean;
    autoScrollState: { isActive: boolean; isPaused: boolean; elapsedTime: number };
    setAutoScrollState: Dispatch<SetStateAction<{ isActive: boolean; isPaused: boolean; elapsedTime: number }>>;
    autoScrollPausedRef: MutableRefObject<boolean>;
    tafseerCache: MutableRefObject<any>;
    quranMeaningsCache: MutableRefObject<any>;
    quranMeaningsMapRef: MutableRefObject<Map<string, string> | null>;
    quranTranslationCache: MutableRefObject<any>;
}

const QuranReaderModalsLayer: FC<QuranReaderModalsLayerProps> = ({
    isAutoScrollSettingsOpen,
    setIsAutoScrollSettingsOpen,
    settings,
    setSettings,
    isWirdMode,
    localIsMemorizationMode,
    readingMode,
    themeSuffix,
    language,
    isLandscape,
    isLandscapeRef,
    isEn,
    showToast,
    currentTheme,
    showRapidScrollToast,
    activeModals,
    closeModal,
    openModal,
    modalParams,
    quranData,
    jumpToAyah,
    currentAyah,
    setCurrentAyah,
    currentAyahRef,
    setIsSurahJuzGuideOpen,
    isSurahJuzGuideOpen,
    bookmarks,
    deleteBookmark,
    showWirdCompleteModal,
    setShowWirdCompleteModal,
    handleMarkWirdCompleted,
    initialSearchQuery,
    instantShareTarget,
    setInstantShareTarget,
    isSurahDesignPickerOpen,
    setIsSurahDesignPickerOpen,
    localMemorizationSettings,
    memorizationSettingsRef,
    isPlaying,
    stopAudio,
    playAudio,
    playSingleAyah,
    playingAyah,
    shouldSkipSavePositionRef,
    tafseerInfo,
    setTafseerInfo,
    isTafseerLoading,
    setIsTafseerLoading,
    tafseerName,
    multiTafseerInfo,
    setMultiTafseerInfo,
    quranMeaningsInfo,
    setQuranMeaningsInfo,
    isQuranMeaningsLoading,
    setIsQuranMeaningsLoading,
    quranTranslationInfo,
    setQuranTranslationInfo,
    isQuranTranslationLoading,
    setIsQuranTranslationLoading,
    englishTafseerInfo,
    setEnglishTafseerInfo,
    ayahActionMenu,
    setAyahActionMenu,
    surahContentModal,
    setSurahContentModal,
    waqfGuideInfo,
    setWaqfGuideInfo,
    setIsFloatingMenuOpen,
    mutashabihatInfo,
    setMutashabihatInfo,
    asbabNuzulInfo,
    setAsbabNuzulInfo,
    irabInfo,
    setIrabInfo,
    isThematicEncyclopediaOpen,
    thematicEncyclopediaInfo,
    setThematicEncyclopediaInfo,
    tafseerSelectionInfo,
    setTafseerSelectionInfo,
    handleTafseerSelect,
    sajdahCardInfo,
    handleCloseSajdahCard,
    showResumeModal,
    setShowResumeModal,
    savedSession,
    handleResumeSession,
    handleStartNewFromResume,
    juzNotification,
    toast,
    handleToastClose,
    isHideMode,
    setIsHideMode,
    showReviewTest,
    setShowReviewTest,
    isRecording,
    stopRecording,
    startRecording,
    recordedAudio,
    playRecordedAudio,
    isMainGuideOpen,
    handleCloseMainGuide,
    handleMainGuideStepChange,
    isMadinahVertical,
    isLoading,
    isAnyMenuOpen,
    isPageInputActive,
    isBottomPageInputActive,
    autoScrollState,
    setAutoScrollState,
    autoScrollPausedRef,
    tafseerCache,
    quranMeaningsCache,
    quranMeaningsMapRef,
    quranTranslationCache,
}) => {
    return (
        <>
            {isAutoScrollSettingsOpen && (
            <AutoScrollSettingsModal
                isOpen={isAutoScrollSettingsOpen}
                onClose={() => setIsAutoScrollSettingsOpen(false)}
                onSelectTime={(minutes) => {
                    const newSettings = { ...settings, scrollMinutes: minutes };
                    setSettings(newSettings);
                    if (!isWirdMode && !localIsMemorizationMode) {
                        if (readingMode === 'madinah') {
                            saveMadinahSettings(newSettings, { isLandscape });
                        } else {
                            localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                            const cluster = getClusterForLanguage(language);
                            syncClusterSettings(cluster, newSettings, isLandscape, { readingMode });
                        }
                    } else {
                        localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                        window.dispatchEvent(new Event('settings-change'));
                    }
                    showToast(isEn ? `Scroll speed: ${minutes} min` : `سرعة التمرير: ${minutes} دقيقة`);
                }}
                currentMinutes={settings.scrollMinutes}
                isLandscape={isLandscape}
                isEn={isEn}
                currentTheme={currentTheme}
            />
        )}
        {showRapidScrollToast && (
            <div className="fixed inset-0 z-[1600] flex items-center justify-center pointer-events-none p-4">
                <div className="app-3d-toast px-6 py-5 rounded-3xl text-center max-w-sm border-0"
                     style={{
                         fontFamily: settings.fontFamily || currentTheme?.font,
                         backgroundColor: currentTheme?.id === 'gold' ? '#EAB308' : (currentTheme?.modalBg || 'rgba(0,0,0,0.85)'),
                         color: currentTheme?.id === 'gold' ? '#000000' : (currentTheme?.modalText || '#ffffff'),
                         border: 'none',
                         outline: 'none'
                     }}>
                    <div className="flex items-center justify-center gap-2 mb-2" style={{ color: currentTheme?.id === 'deep_black' ? '#ffffff' : currentTheme?.id === 'gold' ? '#78350F' : (currentTheme?.accent || '#f59e0b') }}>
                        <i className="fa-solid fa-triangle-exclamation text-2xl quran-3d-icon"></i>
                    </div>
                    <p className="text-base sm:text-lg font-bold leading-relaxed">
                        {isEn 
                            ? "Please slow down while reading."
                            : "يرجى التمهل أثناء القراءة والتدبر"}
                    </p>
                </div>
            </div>
        )}
        {activeModals.includes('surah-modal') && (
            <SurahJuzModal 
                type="surah" 
                quranData={quranData} 
                currentTheme={currentTheme} 
                onSelect={(s, a) => { closeModal('surah-modal'); jumpToAyah(s, a, true); }} 
                onClose={() => closeModal('surah-modal')} 
                isLandscape={isLandscape} 
                currentSelection={currentAyah.s} 
                currentAyah={currentAyah} 
                readingMode={readingMode} 
                onOpenGuide={!isLandscape ? () => setIsSurahJuzGuideOpen(true) : undefined}
                isGuideOpen={isSurahJuzGuideOpen}
            />
        )}
            {activeModals.includes('bookmarks-modal') && (
                <BookmarksModal 
                    bookmarks={bookmarks} 
                    quranData={quranData} 
                    isLandscape={isLandscape}
                    currentTheme={currentTheme}
                    onSelect={(s, a, isL) => {
                        jumpToAyah(s, a, true);
                    }} 
                    onDelete={deleteBookmark} 
                    onClose={() => {
                        closeModal('bookmarks-modal');
                    }} 
                />
            )}
            {showWirdCompleteModal && (
            <WirdCompletionModal 
                isOpen={true} 
                onClose={() => setShowWirdCompleteModal(false)} 
                onContinue={() => handleMarkWirdCompleted('continue')}
                onGoToWird={() => handleMarkWirdCompleted('daily-wird')}
                onGoHome={() => handleMarkWirdCompleted('home')}
                currentTheme={currentTheme} 
                isLandscape={isLandscape}
                isEn={isEn}
            />
            )}
            {activeModals.includes('search-modal') && <SearchModal quranData={quranData} onSelect={(s,a) => jumpToAyah(s,a, true)} onClose={() => closeModal('search-modal')} isLandscape={isLandscape} initialQuery={initialSearchQuery} readingMode={readingMode} currentTheme={currentTheme} />}
            {(activeModals.includes('share-ayah') || instantShareTarget !== null) && (
                <ShareAyahModal
                    key={!activeModals.includes('share-ayah') && instantShareTarget ? `instant-${instantShareTarget.nonce}` : 'share-studio'}
                    isOpen={true}
                    instantShareMode={!activeModals.includes('share-ayah') && instantShareTarget !== null}
                    instantShareNonce={instantShareTarget?.nonce}
                    onClose={() => {
                        if (activeModals.includes('share-ayah')) closeModal('share-ayah');
                        if (instantShareTarget !== null) setInstantShareTarget(null);
                    }}
                    currentAyah={instantShareTarget ? { s: instantShareTarget.s, a: instantShareTarget.a } : currentAyah}
                    quranData={quranData}
                    currentTheme={currentTheme}
                    readingMode={readingMode}
                    settings={settings}
                    showToast={showToast}
                />
            )}
            {activeModals.includes('settings-modal') && <SettingsModal onClose={() => closeModal('settings-modal')} onOpenModal={openModal} showToast={showToast} isLandscape={isLandscape} readingMode={readingMode} modeSuffix={themeSuffix} />}
            {(isSurahDesignPickerOpen || activeModals.includes('surah-design-picker')) && (
            <SurahDesignPickerModal
                isOpen={true}
                onClose={() => {
                    setIsSurahDesignPickerOpen(false);
                    closeModal('surah-design-picker');
                }}
                currentDesign={normalizeMadinahFrameDesign(settings.madinahFrameDesign)}
                onSelectDesign={(d) => {
                    const frameId = normalizeMadinahFrameDesign(d);
                    const newSettings = {
                        ...settings,
                        madinahFrameDesign: frameId,
                        surahHeaderDesign: getSurahHeaderDesignForFrame(frameId),
                    };
                    setSettings(newSettings);
                    if (!isWirdMode && !localIsMemorizationMode) {
                        if (readingMode === 'madinah') {
                            saveMadinahSettings(newSettings, { isLandscape });
                        } else {
                            localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                            const cluster = getClusterForLanguage(language);
                            syncClusterSettings(cluster, newSettings, isLandscape, { readingMode });
                        }
                    } else {
                        localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                        window.dispatchEvent(new Event('settings-change'));
                    }
                    showToast(isEn ? 'Page frame & header design updated' : 'تم تغيير تصميم الإطار ورأس الصفحة');
                }}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
            />
            )}
            {activeModals.includes('notification-settings-modal') && <NotificationSettingsModal onClose={() => closeModal('notification-settings-modal')} showToast={showToast} isLandscape={isLandscape} modeSuffix={themeSuffix} initialTab={modalParams?.tab} isFromQuranReader={true} currentTheme={currentTheme} />}
            {activeModals.includes('font-modal') && <FontSelectModal isOpen={true} onClose={() => closeModal('font-modal')} isLandscape={isLandscape} readingMode={readingMode} currentFontId={settings.fontFamily} onSelect={(id) => {
                const newSettings = { ...settings, fontFamily: id };
                setSettings(newSettings);
                if (!isWirdMode && !localIsMemorizationMode) {
                    if (readingMode === 'madinah') {
                        saveMadinahSettings(newSettings, { isLandscape });
                    } else {
                        localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                        const cluster = getClusterForLanguage(language);
                        syncClusterSettings(cluster, newSettings, isLandscape, { readingMode });
                    }
                } else {
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                }
                showToast(readingMode === 'translation' ? 'Font updated successfully' : 'تم تغيير الخط بنجاح');
                closeModal('font-modal');
            }} />}
            {activeModals.includes('scroll-speed-modal') && <ScrollSpeedModal isOpen={true} onClose={() => closeModal('scroll-speed-modal')} isLandscape={isLandscape} currentTheme={currentTheme} currentMinutes={settings.scrollMinutes} onSelect={(m) => {
                const newSettings = { ...settings, scrollMinutes: m };
                setSettings(newSettings);
                if (!isWirdMode && !localIsMemorizationMode) {
                    if (readingMode === 'madinah') {
                        saveMadinahSettings(newSettings, { isLandscape });
                    } else {
                        localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                        const cluster = getClusterForLanguage(language);
                        syncClusterSettings(cluster, newSettings, isLandscape, { readingMode });
                    }
                } else {
                    localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                    window.dispatchEvent(new Event('settings-change'));
                }
                showToast(isEn ? `Scroll speed: ${m} min` : `سرعة التمرير: ${m} دقيقة`);
                closeModal('scroll-speed-modal');
            }} />}
            {activeModals.includes('reciter-modal') && (
                <ReciterSelectModal 
                    onClose={() => closeModal('reciter-modal')} 
                    currentReader={
                        getValidReaderForMode(
                            localIsMemorizationMode ? 'mushaf' : readingMode,
                            localIsMemorizationMode && memorizationSettingsRef.current ? memorizationSettingsRef.current.reader : settings.reader
                        )
                    } 
                    isLandscape={isLandscape} 
                    readersList={localIsMemorizationMode ? MEMORIZATION_READERS : READERS} 
                    readingMode={localIsMemorizationMode ? 'mushaf' : readingMode}
                    currentTheme={currentTheme}
                    zIndexClass="z-[1250]"
                    onSelect={(id) => {
                        if (localIsMemorizationMode && memorizationSettingsRef.current) {
                            memorizationSettingsRef.current.reader = id;
                        }
                        const curS = currentAyahRef.current?.s || currentAyah?.s || 1;
                        const curA = currentAyahRef.current?.a || currentAyah?.a || 1;
                        const wasPlaying = isPlaying;
                        if (wasPlaying) {
                            stopAudio();
                        }
                        const newSettings = { ...settings, reader: id };
                        setSettings(newSettings);
                        if (!isWirdMode && !localIsMemorizationMode) {
                            const cluster = getClusterForLanguage(language);
                            if (readingMode === 'madinah') {
                                saveMadinahSettings(newSettings, { isLandscape: isLandscapeRef.current });
                            } else {
                                localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                                syncClusterSettings(cluster, newSettings, isLandscapeRef.current, { readingMode });
                            }
                            if (!shouldSkipSavePositionRef.current) {
                                saveClusterPosition(cluster, { s: curS, a: curA, ts: Date.now() }, isLandscapeRef.current);
                            }
                        } else {
                            localStorage.setItem('quran_settings' + themeSuffix, JSON.stringify(newSettings));
                            window.dispatchEvent(new Event('settings-change'));
                        }
                        showToast('تم تغيير القارئ بنجاح');
                        if (wasPlaying) {
                            setTimeout(() => {
                                playAudio(curS, curA);
                            }, 200);
                        }
                    }} 
                />
            )}
            {activeModals.includes('quran-download-modal') && (
                <QuranDownloadModal 
                    onClose={() => closeModal('quran-download-modal')} 
                    quranData={quranData} 
                    showToast={showToast} 
                    isLandscape={isLandscape} 
                    readersList={modalParams?.readersList || (readingMode === 'bilingual' ? [BILINGUAL_READER] : readingMode === 'translation' ? [TRANSLATION_READER] : ARABIC_READERS)}
                    mode={modalParams?.mode}
                    zIndexClass="z-[1250]"
                    isFromQuranReader={true}
                    currentTheme={currentTheme}
                    readingMode={readingMode}
                    readerBgColor={settings.bgColor}
                />
            )}
            {activeModals.includes('tafsir-download-modal') && (
                <TafsirDownloadModal
                    onClose={() => closeModal('tafsir-download-modal')}
                    quranData={quranData}
                    showToast={showToast}
                    isLandscape={isLandscape}
                    zIndexClass="z-[1250]"
                    isFromQuranReader={true}
                    currentTheme={currentTheme}
                    readingMode={readingMode}
                    readerBgColor={settings.bgColor}
                />
            )}
            {tafseerInfo.isOpen && (
            <TafseerModal 
                isOpen={true} 
                isLoading={isTafseerLoading} 
                isLandscape={isLandscape}
                currentTheme={currentTheme}
                surahNumber={tafseerInfo.s}
                ayahNumber={tafseerInfo.a}
                surahName={tafseerInfo.surahName || quranData?.surahs?.[tafseerInfo.s - 1]?.name}
                ayahText={quranData?.surahs?.[tafseerInfo.s - 1]?.ayahs?.[tafseerInfo.a - 1]?.text}
                onPlayAudio={(s, a) => playSingleAyah(s, a)}
                onStopAudio={stopAudio}
                isAudioPlaying={isPlaying && playingAyah?.s === tafseerInfo.s && playingAyah?.a === tafseerInfo.a}
                showToast={showToast}
                categoryTitle={isEn ? 'Ayah Tafseer' : 'تفسير الآية'}
                onOpenCompare={() => {
                    const { s, a, surahName } = tafseerInfo;
                    const surahObj = quranData?.surahs?.[s - 1];
                    const ayahObj = surahObj?.ayahs?.[a - 1];
                    setTafseerInfo((p: any) => ({ ...p, isOpen: false }));
                    setMultiTafseerInfo({
                        isOpen: true,
                        s,
                        a,
                        surahName: surahName || surahObj?.name,
                        ayahText: ayahObj?.text,
                        fromSingleTafseer: true
                    });
                }}
                title={isEn 
                    ? `${tafseerName} - Surah ${SURAH_NAMES_EN[tafseerInfo.s - 1] || tafseerInfo.s} - Ayah ${tafseerInfo.a}` 
                    : `${tafseerName} - ${tafseerInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(tafseerInfo.a)}`} 
                text={tafseerInfo.text} 
                onClose={() => {
                    const fromAyah = tafseerInfo.openedFromAyahMenu;
                    if (tafseerInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setTafseerInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false, openedFromAyahMenu: false }));
                    if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                }} 
            />
            )}
            {multiTafseerInfo.isOpen && (
            <MultiTafseerModal 
                isOpen={true}
                surahNumber={multiTafseerInfo.s}
                ayahNumber={multiTafseerInfo.a}
                surahName={multiTafseerInfo.surahName}
                ayahText={multiTafseerInfo.ayahText}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
                onClose={() => setMultiTafseerInfo((prev: any) => ({ ...prev, isOpen: false }))}
                onBack={() => {
                    setMultiTafseerInfo((prev: any) => ({ ...prev, isOpen: false }));
                    setTafseerInfo((prev: any) => ({ ...prev, isOpen: true }));
                }}
                onPlayAudio={(s, a) => playSingleAyah(s, a)}
                onStopAudio={stopAudio}
                isAudioPlaying={isPlaying && playingAyah?.s === multiTafseerInfo.s && playingAyah?.a === multiTafseerInfo.a}
                showToast={showToast}
            />
            )}
            {quranMeaningsInfo.isOpen && (
            <TafseerModal 
                isOpen={true} 
                isLoading={isQuranMeaningsLoading} 
                isLandscape={isLandscape}
                currentTheme={currentTheme}
                surahNumber={quranMeaningsInfo.s}
                ayahNumber={quranMeaningsInfo.a}
                surahName={quranMeaningsInfo.surahName || quranData?.surahs?.[quranMeaningsInfo.s - 1]?.name}
                ayahText={quranData?.surahs?.[quranMeaningsInfo.s - 1]?.ayahs?.[quranMeaningsInfo.a - 1]?.text}
                onPlayAudio={(s, a) => playSingleAyah(s, a)}
                onStopAudio={stopAudio}
                isAudioPlaying={isPlaying && playingAyah?.s === quranMeaningsInfo.s && playingAyah?.a === quranMeaningsInfo.a}
                showToast={showToast}
                categoryTitle={isEn ? 'Quran Meanings' : 'معاني القرآن'}
                title={isEn 
                    ? `Quran Meanings - Surah ${SURAH_NAMES_EN[quranMeaningsInfo.s - 1] || quranMeaningsInfo.s} - Ayah ${quranMeaningsInfo.a}` 
                    : `معاني القرآن - ${quranMeaningsInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(quranMeaningsInfo.a)}`} 
                text={quranMeaningsInfo.text} 
                onClose={() => {
                    const fromAyah = quranMeaningsInfo.openedFromAyahMenu;
                    if (quranMeaningsInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setQuranMeaningsInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false, openedFromAyahMenu: false }));
                    if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                }} 
            />
            )}
            {quranTranslationInfo.isOpen && (
            <TafseerModal 
                isOpen={true} 
                isLoading={isQuranTranslationLoading} 
                isLandscape={isLandscape}
                currentTheme={currentTheme}
                surahNumber={quranTranslationInfo.s}
                ayahNumber={quranTranslationInfo.a}
                surahName={quranTranslationInfo.surahName || quranData?.surahs?.[quranTranslationInfo.s - 1]?.name}
                ayahText={quranData?.surahs?.[quranTranslationInfo.s - 1]?.ayahs?.[quranTranslationInfo.a - 1]?.text}
                onPlayAudio={(s, a) => playSingleAyah(s, a)}
                onStopAudio={stopAudio}
                isAudioPlaying={isPlaying && playingAyah?.s === quranTranslationInfo.s && playingAyah?.a === quranTranslationInfo.a}
                showToast={showToast}
                categoryTitle={isEn ? 'English Translation' : 'الترجمة الإنجليزية'}
                title={isEn 
                    ? `English Translation - Surah ${SURAH_NAMES_EN[quranTranslationInfo.s - 1] || quranTranslationInfo.s} - Ayah ${quranTranslationInfo.a}` 
                    : `الترجمة الإنجليزية - ${quranTranslationInfo.surahName.replace('سورة','').trim()} - آية ${toArabic(quranTranslationInfo.a)}`} 
                text={quranTranslationInfo.text} 
                onClose={() => {
                    const fromAyah = quranTranslationInfo.openedFromAyahMenu;
                    if (quranTranslationInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setQuranTranslationInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false, openedFromAyahMenu: false }));
                    if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                }} 
            />
            )}
            {(readingMode === 'bilingual' || readingMode === 'translation') && englishTafseerInfo.isOpen && (
                <EnglishTafseerModal 
                    isOpen={true}
                    onClose={() => {
                        const fromAyah = englishTafseerInfo.openedFromAyahMenu;
                        if (englishTafseerInfo.wasAutoscrolling) {
                            autoScrollPausedRef.current = false;
                            setAutoScrollState(p => ({ ...p, isPaused: false }));
                        }
                        setEnglishTafseerInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false, openedFromAyahMenu: false }));
                        if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                    }}
                    surahNumber={englishTafseerInfo.s}
                    ayahNumber={englishTafseerInfo.a}
                    onPlayAudio={(s, a) => playSingleAyah(s, a)}
                    onStopAudio={stopAudio}
                    isAudioPlaying={isPlaying && playingAyah?.s === englishTafseerInfo.s && playingAyah?.a === englishTafseerInfo.a}
                    currentTheme={currentTheme}
                    isLandscape={isLandscape}
                    quranData={quranJsonData}
                    readingMode={readingMode}
                />
            )}
            {ayahActionMenu.isOpen && (
            <AyahActionMenu
                isOpen={true}
                currentTheme={currentTheme}
                isLandscape={isLandscape}
                onClose={() => {
                    if (ayahActionMenu.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }}
                onTafseer={() => {
                    const s = ayahActionMenu.s;
                    const a = ayahActionMenu.a;
                    const surahName = ayahActionMenu.surahName;
                    const wasAutoscrolling = ayahActionMenu.wasAutoscrolling;
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false }));
                    if (readingMode === 'bilingual' || readingMode === 'translation') {
                        setEnglishTafseerInfo({
                            isOpen: true,
                            s,
                            a,
                            wasAutoscrolling,
                            openedFromAyahMenu: true
                        });
                        return;
                    }
                    const currentTafseerId = settings.tafseer || 'ar.jalalayn';
                    const cacheKey = `${s}_${currentTafseerId}`;
                    const cachedList = tafseerCache.current[cacheKey];
                    const embeddedText = currentTafseerId === 'ar.jalalayn' ? getEmbeddedJalalaynSurahSync(s)?.[a] : undefined;
                    const cachedText = cachedList?.[a - 1]?.text ?? embeddedText;
                    setIsTafseerLoading(!cachedText);
                    setTafseerInfo({ isOpen: true, s, a, text: cachedText || '', surahName, wasAutoscrolling, openedFromAyahMenu: true });
                }}
                onTafseerPage={() => {
                    const s = ayahActionMenu.s;
                    const a = ayahActionMenu.a;
                    const surahName = ayahActionMenu.surahName;
                    const wasAutoscrolling = ayahActionMenu.wasAutoscrolling;
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                    if (!s) return;
                    setSurahContentModal({
                        isOpen: true,
                        mode: 'tafseer',
                        s,
                        a: a || 1,
                        surahName,
                        wasAutoscrolling,
                    });
                }}
                onMeanings={() => {
                    const s = ayahActionMenu.s;
                    const a = ayahActionMenu.a;
                    const surahName = ayahActionMenu.surahName;
                    const wasAutoscrolling = ayahActionMenu.wasAutoscrolling;
                    const cachedText = quranMeaningsMapRef.current?.get(`${s}:${a}`) ?? getEmbeddedMeaningsSurahSync(s)?.[a];
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false }));
                    setIsQuranMeaningsLoading(!cachedText);
                    setQuranMeaningsInfo({ isOpen: true, s, a, text: cachedText || '', surahName, wasAutoscrolling, openedFromAyahMenu: true });
                }}
                onMeaningsPage={() => {
                    const s = ayahActionMenu.s;
                    const a = ayahActionMenu.a;
                    const surahName = ayahActionMenu.surahName;
                    const wasAutoscrolling = ayahActionMenu.wasAutoscrolling;
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                    if (!s) return;
                    setSurahContentModal({
                        isOpen: true,
                        mode: 'meanings',
                        s,
                        a: a || 1,
                        surahName,
                        wasAutoscrolling,
                    });
                }}
                onTranslation={() => {
                    const s = ayahActionMenu.s;
                    const a = ayahActionMenu.a;
                    const surahName = ayahActionMenu.surahName;
                    const wasAutoscrolling = ayahActionMenu.wasAutoscrolling;
                    const cachedTrans = quranTranslationCache.current?.[s - 1]?.verses?.[a - 1]?.translation ?? getEmbeddedTranslationSurahSync(s)?.[a];
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false }));
                    setIsQuranTranslationLoading(!cachedTrans);
                    setQuranTranslationInfo({ isOpen: true, s, a, text: cachedTrans || '', surahName, wasAutoscrolling, openedFromAyahMenu: true });
                }}
                onTranslationSurah={() => {
                    const s = ayahActionMenu.s;
                    const a = ayahActionMenu.a;
                    const surahName = ayahActionMenu.surahName;
                    const wasAutoscrolling = ayahActionMenu.wasAutoscrolling;
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                    if (!s) return;
                    setSurahContentModal({
                        isOpen: true,
                        mode: 'translation',
                        s,
                        a: a || 1,
                        surahName,
                        wasAutoscrolling,
                    });
                }}
                onAsbabNuzul={() => {
                    const verseText = quranData?.surahs?.[ayahActionMenu.s - 1]?.ayahs?.[ayahActionMenu.a - 1]?.text || '';
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false }));
                    setAsbabNuzulInfo({ isOpen: true, s: ayahActionMenu.s, a: ayahActionMenu.a, surahName: ayahActionMenu.surahName, verseText, openedFromAyahMenu: true });
                }}
                onIrab={() => {
                    const verseText = quranData?.surahs?.[ayahActionMenu.s - 1]?.ayahs?.[ayahActionMenu.a - 1]?.text || '';
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false }));
                    setIrabInfo({ isOpen: true, s: ayahActionMenu.s, a: ayahActionMenu.a, surahName: ayahActionMenu.surahName, verseText, openedFromAyahMenu: true });
                }}
                onMutashabihat={() => {
                    const verseText = quranData?.surahs?.[ayahActionMenu.s - 1]?.ayahs?.[ayahActionMenu.a - 1]?.text || '';
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false }));
                    setMutashabihatInfo({ isOpen: true, s: ayahActionMenu.s, a: ayahActionMenu.a, surahName: ayahActionMenu.surahName, verseText, openedFromAyahMenu: true });
                }}
                onWaqf={() => {
                    const verseText = quranData?.surahs?.[ayahActionMenu.s - 1]?.ayahs?.[ayahActionMenu.a - 1]?.text || '';
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false }));
                    setWaqfGuideInfo({ isOpen: true, s: ayahActionMenu.s, a: ayahActionMenu.a, surahName: ayahActionMenu.surahName, verseText, openedFromAyahMenu: true });
                }}
                onShareCard={() => {
                    if (ayahActionMenu.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    const targetS = ayahActionMenu.s;
                    const targetA = ayahActionMenu.a;
                    if (!targetS || !targetA) return;
                    setCurrentAyah({ s: targetS, a: targetA });
                    currentAyahRef.current = { s: targetS, a: targetA };
                    setAyahActionMenu((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                    if (readingMode === 'madinah') {
                        openModal('share-ayah');
                        return;
                    }
                    showToast(isEn ? 'Preparing Ayah card...' : 'جاري تجهيز بطاقة الآية للمشاركة...');
                    setInstantShareTarget({ s: targetS, a: targetA, nonce: Date.now() });
                }}
            />
            )}
            {surahContentModal.isOpen && (
                <SurahExplanationModal
                    isOpen={true}
                    mode={surahContentModal.mode}
                    surahNumber={surahContentModal.s}
                    targetAyahNumber={surahContentModal.a}
                    surahName={surahContentModal.surahName || quranData?.surahs?.[surahContentModal.s - 1]?.name}
                    quranData={quranData}
                    settings={settings}
                    currentTheme={currentTheme}
                    isLandscape={isLandscape}
                    tafseerCacheRef={tafseerCache}
                    quranMeaningsCacheRef={quranMeaningsCache}
                    quranMeaningsMapRef={quranMeaningsMapRef}
                    quranTranslationCacheRef={quranTranslationCache}
                    onPlayAudio={(s, a) => playSingleAyah(s, a)}
                    onStopAudio={stopAudio}
                    playingAyah={playingAyah}
                    isAudioPlaying={isPlaying}
                    showToast={showToast}
                    onClose={() => {
                        if (surahContentModal.wasAutoscrolling) {
                            autoScrollPausedRef.current = false;
                            setAutoScrollState(p => ({ ...p, isPaused: false }));
                        }
                        setSurahContentModal((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                    }}
                />
            )}
            {/* 6 New Features Modals */}
            {waqfGuideInfo.isOpen && (
            <WaqfGuideModal 
                isOpen={true}
                onClose={() => {
                    const fromMenu = waqfGuideInfo.openedFromMenu;
                    const fromAyah = waqfGuideInfo.openedFromAyahMenu;
                    setWaqfGuideInfo((p: any) => ({ ...p, isOpen: false }));
                    if (fromMenu) setIsFloatingMenuOpen(true);
                    else if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                }}
                currentTheme={currentTheme}
                currentAyahText={waqfGuideInfo.verseText}
                surahName={waqfGuideInfo.surahName}
                ayahNumber={waqfGuideInfo.a}
                surahNumber={waqfGuideInfo.s}
                onPlayAudio={(s, a) => playSingleAyah(s, a)}
                onStopAudio={stopAudio}
                isAudioPlaying={isPlaying && playingAyah?.s === waqfGuideInfo.s && playingAyah?.a === waqfGuideInfo.a}
                showToast={showToast}
                isLandscape={isLandscape}
            />
            )}
            {mutashabihatInfo.isOpen && (
            <MutashabihatModal
                isOpen={true}
                onClose={() => {
                    const fromMenu = mutashabihatInfo.openedFromMenu;
                    const fromAyah = mutashabihatInfo.openedFromAyahMenu;
                    setMutashabihatInfo((p: any) => ({ ...p, isOpen: false }));
                    if (fromMenu) setIsFloatingMenuOpen(true);
                    else if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                }}
                currentTheme={currentTheme}
                surahNumber={mutashabihatInfo.s}
                ayahNumber={mutashabihatInfo.a}
                surahName={mutashabihatInfo.surahName}
                verseText={mutashabihatInfo.verseText}
                onJumpToAyah={(s, a) => jumpToAyah(s, a)}
                onPlayAudio={(s, a) => playSingleAyah(s, a)}
                onStopAudio={stopAudio}
                isAudioPlaying={isPlaying && playingAyah?.s === mutashabihatInfo.s && playingAyah?.a === mutashabihatInfo.a}
                showToast={showToast}
                isLandscape={isLandscape}
            />
            )}
            {asbabNuzulInfo.isOpen && (
            <AsbabNuzulModal
                isOpen={true}
                onClose={() => {
                    const fromMenu = asbabNuzulInfo.openedFromMenu;
                    const fromAyah = asbabNuzulInfo.openedFromAyahMenu;
                    setAsbabNuzulInfo((p: any) => ({ ...p, isOpen: false }));
                    if (fromMenu) setIsFloatingMenuOpen(true);
                    else if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                }}
                currentTheme={currentTheme}
                surahNumber={asbabNuzulInfo.s}
                ayahNumber={asbabNuzulInfo.a}
                surahName={asbabNuzulInfo.surahName}
                verseText={asbabNuzulInfo.verseText}
                onPlayAudio={(s, a) => playSingleAyah(s, a)}
                onStopAudio={stopAudio}
                isAudioPlaying={isPlaying && playingAyah?.s === asbabNuzulInfo.s && playingAyah?.a === asbabNuzulInfo.a}
                showToast={showToast}
                isLandscape={isLandscape}
            />
            )}
            {irabInfo.isOpen && (
            <IrabModal
                isOpen={true}
                onClose={() => {
                    const fromMenu = irabInfo.openedFromMenu;
                    const fromAyah = irabInfo.openedFromAyahMenu;
                    setIrabInfo((p: any) => ({ ...p, isOpen: false }));
                    if (fromMenu) setIsFloatingMenuOpen(true);
                    else if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                }}
                currentTheme={currentTheme}
                surahNumber={irabInfo.s}
                ayahNumber={irabInfo.a}
                surahName={irabInfo.surahName}
                verseText={irabInfo.verseText}
                onPlayAudio={(s, a) => playSingleAyah(s, a)}
                onStopAudio={stopAudio}
                isAudioPlaying={isPlaying && playingAyah?.s === irabInfo.s && playingAyah?.a === irabInfo.a}
                showToast={showToast}
                isLandscape={isLandscape}
            />
            )}

            {isThematicEncyclopediaOpen && (
            <ThematicEncyclopediaModal
                isOpen={true}
                onClose={() => {
                    const fromMenu = thematicEncyclopediaInfo.openedFromMenu;
                    setThematicEncyclopediaInfo((p: any) => ({ ...p, isOpen: false }));
                    if (fromMenu) setIsFloatingMenuOpen(true);
                }}
                currentTheme={currentTheme}
                onJumpToAyah={(s, a) => jumpToAyah(s, a)}
                showToast={showToast}
                isLandscape={isLandscape}
            />
            )}
            {tafseerSelectionInfo.isOpen && (
            <TafseerSelectionModal 
                isOpen={true} 
                isLandscape={isLandscape}
                currentTheme={currentTheme}
                onClose={() => {
                    if (tafseerSelectionInfo.wasAutoscrolling) {
                        autoScrollPausedRef.current = false;
                        setAutoScrollState(p => ({ ...p, isPaused: false }));
                    }
                    setTafseerSelectionInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                }} 
                onSelect={handleTafseerSelect} 
                currentTafseerId={settings.tafseer} 
            />
            )}
            {sajdahCardInfo.show && (
            <SajdahCardModal info={sajdahCardInfo} onClose={handleCloseSajdahCard} isLandscape={isLandscape} currentTheme={currentTheme} setToastMessage={showToast} />
            )}
            {showResumeModal && savedSession && (
            <ResumeSessionModal 
                isOpen={true} 
                onClose={() => setShowResumeModal(false)} 
                onResume={handleResumeSession} 
                onStartNew={handleStartNewFromResume} 
                currentTheme={currentTheme} 
                savedSession={savedSession} 
                isLandscape={isLandscape}
            />
            )}
            <JuzNotification isVisible={juzNotification.show} text={juzNotification.text} currentTheme={currentTheme} isFlat={true} />
            <Toast message={toast.message} show={toast.show} onClose={handleToastClose} currentTheme={currentTheme} />
            
            {/* Memorization Review Controls */}
            {localIsMemorizationMode && localMemorizationSettings?.isReviewMode && (
                <div className="fixed bottom-[calc(4.75rem+var(--app-safe-bottom,0px))] left-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
                    <div className="flex justify-between items-end w-full pointer-events-auto">
                        <div className="flex flex-col gap-2.5">
                            <button 
                                onClick={() => setIsHideMode(!isHideMode)}
                                className={`unified-3d-fab w-12 h-12 rounded-full border-0 flex items-center justify-center cursor-pointer ${isHideMode ? 'quran-raised-btn-selected bg-emerald-600 text-white' : 'quran-raised-btn bg-white/95 dark:bg-zinc-800/95 text-gray-700 dark:text-zinc-100'}`}
                                title={isHideMode ? "إظهار الآيات" : "إخفاء الآيات"}
                            >
                                {isHideMode ? <BookOpen size={24} className="quran-3d-icon" /> : <Grid size={24} className="quran-3d-icon" />}
                            </button>
                            <button 
                                onClick={() => setShowReviewTest(true)}
                                className="unified-3d-fab quran-raised-btn w-12 h-12 rounded-full border-0 flex items-center justify-center bg-white/95 dark:bg-zinc-800/95 text-gray-700 dark:text-zinc-100 cursor-pointer"
                                title="اختبار الحفظ"
                            >
                                <Trophy size={24} className="text-amber-500 quran-3d-icon" />
                            </button>
                            <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`unified-3d-fab w-12 h-12 rounded-full border-0 flex items-center justify-center cursor-pointer ${isRecording ? 'quran-raised-btn-selected bg-red-600 text-white animate-pulse' : 'quran-raised-btn bg-white/95 dark:bg-zinc-800/95 text-gray-700 dark:text-zinc-100'}`}
                                title={isRecording ? "إيقاف التسجيل" : "بدء التسجيل"}
                            >
                                <Mic size={24} className="quran-3d-icon" />
                            </button>
                            {recordedAudio && !isRecording && (
                                <button 
                                    onClick={playRecordedAudio}
                                    className="unified-3d-fab quran-raised-btn-selected w-12 h-12 rounded-full border-0 flex items-center justify-center bg-blue-600 text-white cursor-pointer"
                                    title="تشغيل التسجيل"
                                >
                                    <Play size={24} className="quran-3d-icon" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showReviewTest && localMemorizationSettings && (
                <ReviewTestModal 
                    isOpen={showReviewTest}
                    onClose={() => setShowReviewTest(false)}
                    quranData={quranJsonData}
                    fromSurah={localMemorizationSettings.fromSurah}
                    fromAyah={localMemorizationSettings.fromAyah}
                    toSurah={localMemorizationSettings.toSurah}
                    toAyah={localMemorizationSettings.toAyah}
                    currentTheme={currentTheme}
                    isLandscape={isLandscape}
                    onComplete={(success) => {
                        setShowReviewTest(false);
                        if (success) {
                            showToast('أحسنت! لقد نجحت في الاختبار وجرى تحديث جدول المراجعة 🎉');
                            if (localMemorizationSettings?.rangeId) {
                                memorizationService.updateReviewStatus(localMemorizationSettings.rangeId);
                            }
                        } else {
                            showToast('تحتاج لمزيد من المراجعة، حاول مرة أخرى');
                        }
                    }}
                />
            )}

            {/* Contextual Guides for Quran Reader & Submenus (Only open in portrait reading mode) */}
            <QuranSpotlightGuide
                guideKey={readingMode === 'madinah' ? 'madinah_reader' : 'main_reader'}
                steps={readingMode === 'madinah' ? MADINAH_PAGE_STEPS : QURAN_PAGE_STEPS}
                isOpen={isMainGuideOpen && !isLandscape}
                onClose={handleCloseMainGuide}
                onStepChange={handleMainGuideStepChange}
                isEn={isEn}
                currentTheme={currentTheme}
                isMadinahMode={readingMode === 'madinah'}
            />

            <QuranSpotlightGuide
                guideKey="surah_juz_modal_v2"
                steps={QURAN_SURAH_JUZ_STEPS}
                isOpen={isSurahJuzGuideOpen && !isLandscape}
                onClose={() => setIsSurahJuzGuideOpen(false)}
                isEn={isEn}
                currentTheme={currentTheme}
                isMadinahMode={readingMode === 'madinah'}
            />

            <QuranMicroHints
                readingMode={readingMode}
                isMadinahVertical={isMadinahVertical}
                isPaused={isLoading || isAnyMenuOpen || isMainGuideOpen || isSurahJuzGuideOpen || isPageInputActive || isBottomPageInputActive || autoScrollState.isActive}
                isEn={isEn}
                currentTheme={currentTheme}
            />
        </>
    );
};

export default QuranReaderModalsLayer;
