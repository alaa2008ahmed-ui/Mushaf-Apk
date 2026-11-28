import { useEffect, useRef, Dispatch, SetStateAction, MutableRefObject, RefObject } from 'react';
import { registerBackInterceptor } from './useBackButton';
import { restoreHomeThemeDOMInstantly } from '../context/ThemeContext';
import { ReadingMode } from '../components/QuranReader/constants';

interface UseQuranBackInterceptorParams {
    activeModals: string[];
    waqfGuideInfo: any;
    setWaqfGuideInfo: Dispatch<SetStateAction<any>>;
    mutashabihatInfo: any;
    setMutashabihatInfo: Dispatch<SetStateAction<any>>;
    asbabNuzulInfo: any;
    setAsbabNuzulInfo: Dispatch<SetStateAction<any>>;
    irabInfo: any;
    setIrabInfo: Dispatch<SetStateAction<any>>;
    thematicEncyclopediaInfo: any;
    setThematicEncyclopediaInfo: Dispatch<SetStateAction<any>>;
    isThematicEncyclopediaOpen: boolean;
    ayahContextMenu: any;
    setAyahContextMenu: Dispatch<SetStateAction<any>>;
    ayahActionMenu: any;
    setAyahActionMenu: Dispatch<SetStateAction<any>>;
    tafseerInfo: any;
    setTafseerInfo: Dispatch<SetStateAction<any>>;
    multiTafseerInfo: any;
    setMultiTafseerInfo: Dispatch<SetStateAction<any>>;
    tafseerSelectionInfo: any;
    setTafseerSelectionInfo: Dispatch<SetStateAction<any>>;
    quranMeaningsInfo: any;
    setQuranMeaningsInfo: Dispatch<SetStateAction<any>>;
    quranTranslationInfo: any;
    setQuranTranslationInfo: Dispatch<SetStateAction<any>>;
    surahContentModal: any;
    setSurahContentModal: Dispatch<SetStateAction<any>>;
    englishTafseerInfo: any;
    setEnglishTafseerInfo: Dispatch<SetStateAction<any>>;
    isAutoScrollSettingsOpen: boolean;
    setIsAutoScrollSettingsOpen: Dispatch<SetStateAction<boolean>>;
    isSurahDesignPickerOpen: boolean;
    setIsSurahDesignPickerOpen: Dispatch<SetStateAction<boolean>>;
    showWirdCompleteModal: boolean;
    setShowWirdCompleteModal: Dispatch<SetStateAction<boolean>>;
    showResumeModal: boolean;
    setShowResumeModal: Dispatch<SetStateAction<boolean>>;
    showReviewTest: boolean;
    setShowReviewTest: Dispatch<SetStateAction<boolean>>;
    isMainGuideOpen: boolean;
    setIsMainGuideOpen: Dispatch<SetStateAction<boolean>>;
    isSurahJuzGuideOpen: boolean;
    setIsSurahJuzGuideOpen: Dispatch<SetStateAction<boolean>>;
    closeModal: (modalName: string) => void;
    handleCloseSajdahCard: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    setIsFloatingMenuOpen: Dispatch<SetStateAction<boolean>>;
    isFloatingMenuOpenRef: MutableRefObject<boolean>;
    isPageInputActiveRef: MutableRefObject<boolean>;
    pageInputRef: RefObject<HTMLInputElement | null>;
    setIsPageInputActive: Dispatch<SetStateAction<boolean>>;
    setPageInput: Dispatch<SetStateAction<string>>;
    isBottomPageInputActiveRef: MutableRefObject<boolean>;
    bottomPageInputRef: RefObject<HTMLInputElement | null>;
    setIsBottomPageInputActive: Dispatch<SetStateAction<boolean>>;
    setBottomPageInput: Dispatch<SetStateAction<string>>;
    autoScrollPausedRef: MutableRefObject<boolean>;
    setAutoScrollState: Dispatch<SetStateAction<any>>;
    sajdahCardInfoRef: MutableRefObject<any>;
    readingModeRef: MutableRefObject<ReadingMode>;
    saveFinalLastReadRef: MutableRefObject<() => void>;
}

export const useQuranBackInterceptor = ({
    activeModals,
    waqfGuideInfo,
    setWaqfGuideInfo,
    mutashabihatInfo,
    setMutashabihatInfo,
    asbabNuzulInfo,
    setAsbabNuzulInfo,
    irabInfo,
    setIrabInfo,
    thematicEncyclopediaInfo,
    setThematicEncyclopediaInfo,
    isThematicEncyclopediaOpen,
    ayahContextMenu,
    setAyahContextMenu,
    ayahActionMenu,
    setAyahActionMenu,
    tafseerInfo,
    setTafseerInfo,
    multiTafseerInfo,
    setMultiTafseerInfo,
    tafseerSelectionInfo,
    setTafseerSelectionInfo,
    quranMeaningsInfo,
    setQuranMeaningsInfo,
    quranTranslationInfo,
    setQuranTranslationInfo,
    surahContentModal,
    setSurahContentModal,
    englishTafseerInfo,
    setEnglishTafseerInfo,
    isAutoScrollSettingsOpen,
    setIsAutoScrollSettingsOpen,
    isSurahDesignPickerOpen,
    setIsSurahDesignPickerOpen,
    showWirdCompleteModal,
    setShowWirdCompleteModal,
    showResumeModal,
    setShowResumeModal,
    showReviewTest,
    setShowReviewTest,
    isMainGuideOpen,
    setIsMainGuideOpen,
    isSurahJuzGuideOpen,
    setIsSurahJuzGuideOpen,
    closeModal,
    handleCloseSajdahCard,
    onNavigate,
    setIsFloatingMenuOpen,
    isFloatingMenuOpenRef,
    isPageInputActiveRef,
    pageInputRef,
    setIsPageInputActive,
    setPageInput,
    isBottomPageInputActiveRef,
    bottomPageInputRef,
    setIsBottomPageInputActive,
    setBottomPageInput,
    autoScrollPausedRef,
    setAutoScrollState,
    sajdahCardInfoRef,
    readingModeRef,
    saveFinalLastReadRef,
}: UseQuranBackInterceptorParams) => {
    // Refs for hardware/gesture back button interceptor
    const activeModalsRef = useRef(activeModals);
    useEffect(() => { activeModalsRef.current = activeModals; }, [activeModals]);

    const waqfGuideInfoRef = useRef(waqfGuideInfo);
    useEffect(() => { waqfGuideInfoRef.current = waqfGuideInfo; }, [waqfGuideInfo]);

    const mutashabihatInfoRef = useRef(mutashabihatInfo);
    useEffect(() => { mutashabihatInfoRef.current = mutashabihatInfo; }, [mutashabihatInfo]);

    const asbabNuzulInfoRef = useRef(asbabNuzulInfo);
    useEffect(() => { asbabNuzulInfoRef.current = asbabNuzulInfo; }, [asbabNuzulInfo]);

    const irabInfoRef = useRef(irabInfo);
    useEffect(() => { irabInfoRef.current = irabInfo; }, [irabInfo]);

    const thematicEncyclopediaInfoRef = useRef(thematicEncyclopediaInfo);
    useEffect(() => { thematicEncyclopediaInfoRef.current = thematicEncyclopediaInfo; }, [thematicEncyclopediaInfo]);

    const isThematicEncyclopediaOpenRef = useRef(isThematicEncyclopediaOpen);
    useEffect(() => { isThematicEncyclopediaOpenRef.current = isThematicEncyclopediaOpen; }, [isThematicEncyclopediaOpen]);

    const ayahContextMenuRef = useRef(ayahContextMenu);
    useEffect(() => { ayahContextMenuRef.current = ayahContextMenu; }, [ayahContextMenu]);

    const ayahActionMenuRef = useRef(ayahActionMenu);
    useEffect(() => { ayahActionMenuRef.current = ayahActionMenu; }, [ayahActionMenu]);

    const tafseerInfoRef = useRef(tafseerInfo);
    useEffect(() => { tafseerInfoRef.current = tafseerInfo; }, [tafseerInfo]);

    const multiTafseerInfoRef = useRef(multiTafseerInfo);
    useEffect(() => { multiTafseerInfoRef.current = multiTafseerInfo; }, [multiTafseerInfo]);

    const tafseerSelectionInfoRef = useRef(tafseerSelectionInfo);
    useEffect(() => { tafseerSelectionInfoRef.current = tafseerSelectionInfo; }, [tafseerSelectionInfo]);

    const quranMeaningsInfoRef = useRef(quranMeaningsInfo);
    useEffect(() => { quranMeaningsInfoRef.current = quranMeaningsInfo; }, [quranMeaningsInfo]);

    const quranTranslationInfoRef = useRef(quranTranslationInfo);
    useEffect(() => { quranTranslationInfoRef.current = quranTranslationInfo; }, [quranTranslationInfo]);

    const surahContentModalRef = useRef(surahContentModal);
    useEffect(() => { surahContentModalRef.current = surahContentModal; }, [surahContentModal]);

    const englishTafseerInfoRef = useRef(englishTafseerInfo);
    useEffect(() => { englishTafseerInfoRef.current = englishTafseerInfo; }, [englishTafseerInfo]);

    const isAutoScrollSettingsOpenRef = useRef(isAutoScrollSettingsOpen);
    useEffect(() => { isAutoScrollSettingsOpenRef.current = isAutoScrollSettingsOpen; }, [isAutoScrollSettingsOpen]);

    const isSurahDesignPickerOpenRef = useRef(isSurahDesignPickerOpen);
    useEffect(() => { isSurahDesignPickerOpenRef.current = isSurahDesignPickerOpen; }, [isSurahDesignPickerOpen]);

    const showWirdCompleteModalRef = useRef(showWirdCompleteModal);
    useEffect(() => { showWirdCompleteModalRef.current = showWirdCompleteModal; }, [showWirdCompleteModal]);

    const showResumeModalRef = useRef(showResumeModal);
    useEffect(() => { showResumeModalRef.current = showResumeModal; }, [showResumeModal]);

    const showReviewTestRef = useRef(showReviewTest);
    useEffect(() => { showReviewTestRef.current = showReviewTest; }, [showReviewTest]);

    const isMainGuideOpenRef = useRef(isMainGuideOpen);
    useEffect(() => { isMainGuideOpenRef.current = isMainGuideOpen; }, [isMainGuideOpen]);

    const isSurahJuzGuideOpenRef = useRef(isSurahJuzGuideOpen);
    useEffect(() => { isSurahJuzGuideOpenRef.current = isSurahJuzGuideOpen; }, [isSurahJuzGuideOpen]);

    const closeModalRef = useRef(closeModal);
    closeModalRef.current = closeModal;

    const handleCloseSajdahCardRef = useRef(handleCloseSajdahCard);
    handleCloseSajdahCardRef.current = handleCloseSajdahCard;

    const onNavigateRef = useRef(onNavigate);
    onNavigateRef.current = onNavigate;

    useEffect(() => {
        const unregister = registerBackInterceptor(() => {
            // 1. Guides
            if (isSurahJuzGuideOpenRef.current) {
                setIsSurahJuzGuideOpen(false);
                return true;
            }
            if (isMainGuideOpenRef.current) {
                setIsMainGuideOpen(false);
                return true;
            }

            // 2. Specialized modals / inputs
            if (waqfGuideInfoRef.current?.isOpen) {
                const fromMenu = waqfGuideInfoRef.current.openedFromMenu;
                const fromAyah = waqfGuideInfoRef.current.openedFromAyahMenu;
                setWaqfGuideInfo((p: any) => ({ ...p, isOpen: false }));
                if (fromMenu) setIsFloatingMenuOpen(true);
                else if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                return true;
            }
            if (mutashabihatInfoRef.current?.isOpen) {
                const fromMenu = mutashabihatInfoRef.current.openedFromMenu;
                const fromAyah = mutashabihatInfoRef.current.openedFromAyahMenu;
                setMutashabihatInfo((p: any) => ({ ...p, isOpen: false }));
                if (fromMenu) setIsFloatingMenuOpen(true);
                else if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                return true;
            }
            if (asbabNuzulInfoRef.current?.isOpen) {
                const fromMenu = asbabNuzulInfoRef.current.openedFromMenu;
                const fromAyah = asbabNuzulInfoRef.current.openedFromAyahMenu;
                setAsbabNuzulInfo((p: any) => ({ ...p, isOpen: false }));
                if (fromMenu) setIsFloatingMenuOpen(true);
                else if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                return true;
            }
            if (irabInfoRef.current?.isOpen) {
                const fromMenu = irabInfoRef.current.openedFromMenu;
                const fromAyah = irabInfoRef.current.openedFromAyahMenu;
                setIrabInfo((p: any) => ({ ...p, isOpen: false }));
                if (fromMenu) setIsFloatingMenuOpen(true);
                else if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                return true;
            }
            if (thematicEncyclopediaInfoRef.current?.isOpen) {
                const fromMenu = thematicEncyclopediaInfoRef.current.openedFromMenu;
                setThematicEncyclopediaInfo((p: any) => ({ ...p, isOpen: false }));
                if (fromMenu) setIsFloatingMenuOpen(true);
                return true;
            }
            if (showReviewTestRef.current) {
                setShowReviewTest(false);
                return true;
            }
            if (showWirdCompleteModalRef.current) {
                setShowWirdCompleteModal(false);
                return true;
            }
            if (showResumeModalRef.current) {
                setShowResumeModal(false);
                return true;
            }
            if (isSurahDesignPickerOpenRef.current) {
                setIsSurahDesignPickerOpen(false);
                closeModalRef.current('surah-design-picker');
                return true;
            }
            if (isPageInputActiveRef.current) {
                pageInputRef.current?.blur();
                setIsPageInputActive(false);
                setPageInput('');
                return true;
            }
            if (isBottomPageInputActiveRef.current) {
                bottomPageInputRef.current?.blur();
                setIsBottomPageInputActive(false);
                setBottomPageInput('');
                return true;
            }

            // 3. Ayah context menus & popups
            if (ayahContextMenuRef.current?.isOpen) {
                setAyahContextMenu((p: any) => ({ ...p, isOpen: false }));
                return true;
            }
            if (ayahActionMenuRef.current?.isOpen) {
                if (ayahActionMenuRef.current.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                }
                setAyahActionMenu((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (multiTafseerInfoRef.current?.isOpen) {
                setMultiTafseerInfo((p: any) => ({ ...p, isOpen: false }));
                if (multiTafseerInfoRef.current?.fromSingleTafseer) {
                    setTafseerInfo((p: any) => ({ ...p, isOpen: true }));
                }
                return true;
            }
            if (tafseerInfoRef.current?.isOpen) {
                const fromAyah = tafseerInfoRef.current.openedFromAyahMenu;
                if (tafseerInfoRef.current.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                }
                setTafseerInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false, openedFromAyahMenu: false }));
                if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                return true;
            }
            if (quranMeaningsInfoRef.current?.isOpen) {
                const fromAyah = quranMeaningsInfoRef.current.openedFromAyahMenu;
                if (quranMeaningsInfoRef.current.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                }
                setQuranMeaningsInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false, openedFromAyahMenu: false }));
                if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                return true;
            }
            if (surahContentModalRef.current?.isOpen) {
                if (surahContentModalRef.current.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                }
                setSurahContentModal((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (quranTranslationInfoRef.current?.isOpen) {
                const fromAyah = quranTranslationInfoRef.current.openedFromAyahMenu;
                if (quranTranslationInfoRef.current.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                }
                setQuranTranslationInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false, openedFromAyahMenu: false }));
                if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                return true;
            }
            if (englishTafseerInfoRef.current?.isOpen) {
                const fromAyah = englishTafseerInfoRef.current.openedFromAyahMenu;
                if (englishTafseerInfoRef.current.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                }
                setEnglishTafseerInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false, openedFromAyahMenu: false }));
                if (fromAyah) setAyahActionMenu((p: any) => ({ ...p, isOpen: true }));
                return true;
            }
            if (tafseerSelectionInfoRef.current?.isOpen) {
                if (tafseerSelectionInfoRef.current.wasAutoscrolling) {
                    autoScrollPausedRef.current = false;
                    setAutoScrollState((p: any) => ({ ...p, isPaused: false }));
                }
                setTafseerSelectionInfo((p: any) => ({ ...p, isOpen: false, wasAutoscrolling: false }));
                return true;
            }
            if (sajdahCardInfoRef.current?.show) {
                handleCloseSajdahCardRef.current();
                return true;
            }
            if (isAutoScrollSettingsOpenRef.current) {
                setIsAutoScrollSettingsOpen(false);
                return true;
            }

            // 4. Modals array (ScrollSpeedModal, SettingsModal, BookmarksModal, SearchModal, ReciterSelectModal, SurahJuzModal, FontSelectModal, etc.)
            if (activeModalsRef.current && activeModalsRef.current.length > 0) {
                const topModal = activeModalsRef.current[activeModalsRef.current.length - 1];
                closeModalRef.current(topModal);
                return true;
            }

            // 5. Floating / Sidebar menu
            if (isFloatingMenuOpenRef.current) {
                setIsFloatingMenuOpen(false);
                return true;
            }

            // 6. Madinah Mushaf mode has no footer Home button: hardware/system back button returns directly to app home page
            if (readingModeRef.current === 'madinah') {
                try {
                    saveFinalLastReadRef.current?.();
                } catch (e) {}
                restoreHomeThemeDOMInstantly();
                onNavigateRef.current('home');
                return true;
            }

            return false;
        });

        return () => {
            unregister();
        };
    }, []);
};
