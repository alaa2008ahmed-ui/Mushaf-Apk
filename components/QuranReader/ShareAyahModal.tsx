import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Type } from 'lucide-react';
import { safeHtml2Canvas } from '../../utils/share/canvasHelper';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { SURAH_NAMES_AR, toArabic, getAyahCountText } from './constants';
import { useLanguage } from '../../context/LanguageContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import {
    getSelectedShareDesign,
    setSelectedShareDesign,
    renderDesignBackdropToDataUrl,
    renderDesignMotifDataUrl,
    encodeHighResCompactImage,
} from '../../utils/share/shareAsImage';
import { SHARE_DESIGN_CHANGE_EVENT } from '../../utils/share/shareCardDesigns';
import {
    isQuranPageShareDesignId,
    getQuranPageDesignPalette,
    renderQuranSurahBannerBackdropToDataUrl,
} from '../../utils/share/shareCardDesignsQuran';
import {
    prewarmShareDesignThumbs,
    getShareDesignThumbsSnapshot,
    subscribeShareDesignThumbs,
} from '../MainMenu/ShareDesignSelectorSection';
import {
    BACKGROUNDS,
    FRAMES,
    SHARE_DESIGN_BGS,
    SHARE_FONTS,
    ShareAyahModalProps,
    ShareBgOption,
    ShareStudioPrefs,
    TEXT_COLORS,
    buildShareStudioPalette,
    loadShareStudioPrefs,
    saveShareStudioPrefs,
} from './ShareAyah/shareStudioConstants';
import { ShareHiddenCaptureNodes } from './ShareAyah/ShareHiddenCaptureNodes';
import { ShareLiveArtboard, ShareNonImagePreview } from './ShareAyah/ShareLiveArtboard';
import { ShareCustomizationPanel, SharePrimaryCTA } from './ShareAyah/ShareStudioControls';
import { ShareAyahRangeModal } from './ShareAyah/ShareAyahRangeModal';

const ShareAyahModal: React.FC<ShareAyahModalProps> = ({
    isOpen,
    onClose,
    currentAyah,
    quranData,
    currentTheme,
    readingMode = 'mushaf',
    settings: propSettings,
    showToast,
    instantShareMode = false,
    instantShareNonce
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const isFlatMadinah = readingMode === 'madinah';
    const isMushafLikeMode = readingMode === 'mushaf' || readingMode === 'madinah';

    const getDefaultBgForOpen = (prefs?: ShareStudioPrefs): ShareBgOption => {
        const savedPrefs = prefs ?? loadShareStudioPrefs();
        if (savedPrefs.bgId) {
            const matched = SHARE_DESIGN_BGS.find((b) => b.id === savedPrefs.bgId);
            if (matched) return matched;
        }
        const activeDesignId = getSelectedShareDesign();
        return SHARE_DESIGN_BGS.find((b) => b.designId === activeDesignId) || SHARE_DESIGN_BGS[0];
    };

    const getDefaultFrameForOpen = () => {
        return FRAMES[0];
    };

    const getDefaultFontForOpen = (prefs?: ShareStudioPrefs) => {
        const savedPrefs = prefs ?? loadShareStudioPrefs();
        if (savedPrefs.fontId && SHARE_FONTS.some((f) => f.id === savedPrefs.fontId)) {
            return savedPrefs.fontId;
        }
        return SHARE_FONTS[0].id;
    };

    const getDefaultFontSizeForOpen = (prefs?: ShareStudioPrefs) => {
        const savedPrefs = prefs ?? loadShareStudioPrefs();
        if (typeof savedPrefs.fontSize === 'number' && savedPrefs.fontSize >= 12 && savedPrefs.fontSize <= 48) {
            return savedPrefs.fontSize;
        }
        return 20;
    };

    const getDefaultTextColorForOpen = (bg: ShareBgOption, prefs?: ShareStudioPrefs) => {
        const savedPrefs = prefs ?? loadShareStudioPrefs();
        if (typeof savedPrefs.textColor === 'string' && savedPrefs.textColor) {
            return savedPrefs.textColor;
        }
        return bg.defaultTextColor || (bg.isLight ? TEXT_COLORS[1] : TEXT_COLORS[0]);
    };

    const initialPrefsRef = useRef<ShareStudioPrefs | null>(null);
    if (!initialPrefsRef.current) {
        initialPrefsRef.current = loadShareStudioPrefs();
    }
    const initialPrefs = initialPrefsRef.current;
    const initialBgResolved = getDefaultBgForOpen(initialPrefs);

    const [shareType, setShareType] = useState<'text' | 'image' | 'page' | 'audio'>(() =>
        instantShareMode ? 'image' : (initialPrefs.shareType || 'image')
    );
    const [fromAyah, setFromAyah] = useState(currentAyah.a);
    const [toAyah, setToAyah] = useState(currentAyah.a);
    const [selectedAyahs, setSelectedAyahs] = useState<{ s: number; a: number }[]>([currentAyah]);

    const [selectedBg, setSelectedBg] = useState<ShareBgOption>(() => initialBgResolved);
    const [selectedFrame, setSelectedFrame] = useState(() => getDefaultFrameForOpen());
    const [selectedFont, setSelectedFont] = useState(() => getDefaultFontForOpen(initialPrefs));
    const [fontSize, setFontSize] = useState(() => getDefaultFontSizeForOpen(initialPrefs));
    const [textColor, setTextColor] = useState(() => getDefaultTextColorForOpen(initialBgResolved, initialPrefs));
    const [studioGroup, setStudioGroup] = useState<'typography' | null>(null);
    const [hideDesktopCustomization, setHideDesktopCustomization] = useState(false);
    const isPointerDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragStartYRef = useRef(0);
    const draggedFarRef = useRef(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isCopiedFeedback, setIsCopiedFeedback] = useState(false);
    const [, setShareDesignThumbs] = useState<Record<string, string>>(() =>
        getShareDesignThumbsSnapshot(isEn)
    );

    const suppressDesignSyncRef = useRef(false);
    const handleSelectBg = (bg: ShareBgOption) => {
        setSelectedBg(bg);
        if (bg.type === 'share_design' && bg.designId) {
            suppressDesignSyncRef.current = true;
            setSelectedShareDesign(bg.designId);
            setTimeout(() => {
                suppressDesignSyncRef.current = false;
            }, 0);
        }
        if (bg.type === 'share_design' && bg.defaultTextColor) {
            setTextColor(bg.defaultTextColor);
        } else if (bg.id === 'bg_white' || bg.isLight) {
            const isCurrentLightText =
                textColor === '#ffffff' ||
                textColor === '#F8FAFC' ||
                textColor === '#FFFDF7' ||
                textColor === '#FAF5FF' ||
                textColor === '#FFFBEB' ||
                textColor === '#FFFDF9';
            if (isCurrentLightText) setTextColor('#000000');
        } else {
            if (textColor === '#000000' || selectedBg.isLight) setTextColor('#ffffff');
        }
    };
    const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
    const [rangeSelectionMode, setRangeSelectionMode] = useState<'single' | 'range'>('single');
    const [rangeActiveStep, setRangeActiveStep] = useState<'from' | 'to'>('from');
    const [customText, setCustomText] = useState(() =>
        typeof initialPrefs.customText === 'string' ? initialPrefs.customText : ''
    );
    const [showBismillah, setShowBismillah] = useState<boolean>(() =>
        typeof initialPrefs.showBismillah === 'boolean' ? initialPrefs.showBismillah : true
    );
    const [isSharing, setIsSharing] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [explanationData, setExplanationData] = useState<any>(null);
    const [explanationReady, setExplanationReady] = useState(() => isMushafLikeMode);
    const [appSettings, setAppSettings] = useState<any>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const previewStageRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState<{ w: number; h: number }>({ w: 340, h: 480 });
    const hiddenImageCaptureRef = useRef<HTMLDivElement>(null);
    const hiddenCapturePagesRef = useRef<(HTMLDivElement | null)[]>([]);
    const selectedAyahRef = useRef<HTMLButtonElement>(null);
    const rangeListRef = useRef<HTMLDivElement>(null);
    const modalBackdropRef = useRef<HTMLDivElement>(null);
    const studioShellRef = useRef<HTMLDivElement>(null);
    const activeColorBtnRef = useRef<HTMLButtonElement>(null);
    const activeFontBtnRef = useRef<HTMLButtonElement>(null);
    const [currentImagePageIndex, setCurrentImagePageIndex] = useState(0);

    useEffect(() => {
        if (studioGroup !== 'typography') return;
        const t = setTimeout(() => {
            activeColorBtnRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            activeFontBtnRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 70);
        return () => clearTimeout(t);
    }, [studioGroup]);

    useEffect(() => {
        if (instantShareMode) return;
        setShareDesignThumbs(getShareDesignThumbsSnapshot(isEn));
        const unsub = subscribeShareDesignThumbs(() => {
            setShareDesignThumbs(getShareDesignThumbsSnapshot(isEn));
        });
        if (isOpen) {
            prewarmShareDesignThumbs(isEn);
        }
        return unsub;
    }, [isEn, isOpen, instantShareMode]);

    useEffect(() => {
        if (!isOpen || (shareType !== 'image' && shareType !== 'page')) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            const total = SHARE_DESIGN_BGS.length;
            const curIdx = Math.max(0, SHARE_DESIGN_BGS.findIndex((bg) => bg.id === selectedBg.id));
            if (e.key === 'ArrowRight') {
                const prevIdx = (curIdx - 1 + total) % total;
                handleSelectBg(SHARE_DESIGN_BGS[prevIdx]);
            } else if (e.key === 'ArrowLeft') {
                const nextIdx = (curIdx + 1) % total;
                handleSelectBg(SHARE_DESIGN_BGS[nextIdx]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, shareType, selectedBg.id]);

    const shareDesignAssets = useMemo(() => {
        if (selectedBg.type !== 'share_design' || !selectedBg.designId) return null;
        const backdropUrl = renderDesignBackdropToDataUrl(selectedBg.designId, 1920);
        return {
            exportBackdropUrl: backdropUrl,
            previewBackdropUrl: backdropUrl,
            upperMotifUrl: renderDesignMotifDataUrl(selectedBg.designId, 'upper'),
            lowerMotifUrl: renderDesignMotifDataUrl(selectedBg.designId, 'lower'),
        };
    }, [selectedBg]);

    const activeQuranPageDesignId = useMemo(() => {
        if (selectedBg.type !== 'share_design' || !selectedBg.designId) return null;
        return isQuranPageShareDesignId(selectedBg.designId) ? selectedBg.designId : null;
    }, [selectedBg]);

    const quranPagePalette = useMemo(() => {
        return activeQuranPageDesignId ? getQuranPageDesignPalette(activeQuranPageDesignId) : null;
    }, [activeQuranPageDesignId]);

    const quranSurahBannerUrl = useMemo(() => {
        return activeQuranPageDesignId ? renderQuranSurahBannerBackdropToDataUrl(activeQuranPageDesignId) : '';
    }, [activeQuranPageDesignId]);

    useEffect(() => {
        if (!isRangePickerOpen) return;
        const timer = setTimeout(() => {
            const container = rangeListRef.current;
            const item = selectedAyahRef.current;
            if (container && item) {
                const containerRect = container.getBoundingClientRect();
                const itemRect = item.getBoundingClientRect();
                const itemOffsetWithinContainer = itemRect.top - containerRect.top + container.scrollTop;
                const targetScrollTop = itemOffsetWithinContainer - (container.clientHeight - itemRect.height) / 2;
                const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
                container.scrollTop = Math.max(0, Math.min(maxScroll, targetScrollTop));
            }
            if (modalBackdropRef.current) modalBackdropRef.current.scrollTop = 0;
            if (studioShellRef.current) studioShellRef.current.scrollTop = 0;
        }, 60);
        return () => clearTimeout(timer);
    }, [isRangePickerOpen, rangeActiveStep, rangeSelectionMode]);

    useEffect(() => {
        if (!isOpen || instantShareMode) return;
        if (modalBackdropRef.current) modalBackdropRef.current.scrollTop = 0;
        if (studioShellRef.current) studioShellRef.current.scrollTop = 0;
        if (previewStageRef.current) previewStageRef.current.scrollTop = 0;
    }, [isOpen, instantShareMode, isRangePickerOpen, fromAyah, toAyah, shareType]);

    useEffect(() => {
        if (!isOpen || instantShareMode) return;
        const unregister = registerBackInterceptor(() => {
            if (isRangePickerOpen) {
                setIsRangePickerOpen(false);
                return true;
            }
            if (studioGroup !== null) {
                setStudioGroup(null);
                return true;
            }
            onClose();
            return true;
        });
        return unregister;
    }, [isOpen, instantShareMode, isRangePickerOpen, studioGroup, onClose]);

    useEffect(() => {
        if (!isOpen || instantShareMode) return;
        const el = previewStageRef.current;
        if (!el) return;
        const measure = () => {
            const cs = window.getComputedStyle(el);
            const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
            const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
            const innerW = Math.max(0, el.clientWidth - padX);
            const innerH = Math.max(0, el.clientHeight - padY);
            if (innerW > 0 && innerH > 0) {
                setStageSize({ w: innerW, h: innerH });
            }
        };
        measure();
        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => measure());
            ro.observe(el);
        }
        window.addEventListener('resize', measure);
        return () => {
            ro?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [isOpen, instantShareMode, shareType, studioGroup]);

    useEffect(() => {
        if (isOpen && currentAyah?.a) {
            setFromAyah(currentAyah.a);
            setToAyah(currentAyah.a);
            setSelectedAyahs([currentAyah]);
        }
    }, [isOpen, currentAyah?.s, currentAyah?.a]);

    useEffect(() => {
        const saved = localStorage.getItem('quran_settings');
        if (saved) {
            try {
                setAppSettings(JSON.parse(saved));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (isMushafLikeMode) {
            setExplanationReady(true);
            return;
        }
        let active = true;
        setExplanationReady(false);
        const fetchExplanation = async () => {
            try {
                let url = '';
                const activeMode = readingMode;

                if (activeMode === 'tafseer') url = '/assets/data/ar.jalalayn.json';
                else if (activeMode === 'meanings') url = '/tafseer.json';
                else if (activeMode === 'translation' || activeMode === 'bilingual') url = '/en.json';

                if (url) {
                    const res = await fetch(url);
                    const data = await res.json();
                    if (active) setExplanationData(data);
                }
            } catch (e) {
                console.error('Error fetching explanation for share:', e);
            } finally {
                if (active) setExplanationReady(true);
            }
        };
        fetchExplanation();
        return () => {
            active = false;
        };
    }, [readingMode, propSettings?.tafseer]);

    useEffect(() => {
        const handleExternalDesignChange = (e: Event) => {
            if (suppressDesignSyncRef.current) return;
            const detail = (e as CustomEvent)?.detail;
            const designId = detail?.designId;
            if (!designId) return;
            const matched = BACKGROUNDS.find((b) => b.designId === designId);
            if (matched) {
                setSelectedBg(matched);
                const nextColor = matched.defaultTextColor || (matched.isLight ? TEXT_COLORS[1] : TEXT_COLORS[0]);
                setTextColor(nextColor);
                const prev = loadShareStudioPrefs();
                saveShareStudioPrefs({ ...prev, bgId: matched.id, textColor: nextColor });
            }
        };
        window.addEventListener(SHARE_DESIGN_CHANGE_EVENT, handleExternalDesignChange);
        return () => window.removeEventListener(SHARE_DESIGN_CHANGE_EVENT, handleExternalDesignChange);
    }, []);

    useEffect(() => {
        if (isOpen) {
            const savedPrefs = loadShareStudioPrefs();
            const restoredBg = getDefaultBgForOpen(savedPrefs);
            const restoredFrame = getDefaultFrameForOpen();
            const restoredFont = getDefaultFontForOpen(savedPrefs);
            const restoredFontSize = getDefaultFontSizeForOpen(savedPrefs);
            const restoredTextColor = getDefaultTextColorForOpen(restoredBg, savedPrefs);
            const restoredCustomText = typeof savedPrefs.customText === 'string' ? savedPrefs.customText : '';
            const restoredShowBismillah = typeof savedPrefs.showBismillah === 'boolean' ? savedPrefs.showBismillah : true;

            setFromAyah(currentAyah.a);
            setToAyah(currentAyah.a);
            setSelectedAyahs([currentAyah]);
            setSelectedBg(restoredBg);
            setSelectedFrame(restoredFrame);
            setFontSize(restoredFontSize);
            setTextColor(restoredTextColor);
            setSelectedFont(restoredFont);
            setCustomText(restoredCustomText);
            setShowBismillah(restoredShowBismillah);
            setShareType(instantShareMode ? 'image' : (savedPrefs.shareType || 'image'));
            setStudioGroup(null);
            setHideDesktopCustomization(false);
            setIsRangePickerOpen(false);
            setRangeSelectionMode('single');
            setRangeActiveStep('from');
            setCurrentImagePageIndex(0);
        }
    }, [isOpen, currentAyah.s, currentAyah.a, instantShareMode]);

    // Persist studio customizations automatically whenever changed inside Share Page
    useEffect(() => {
        if (!isOpen || instantShareMode) return;
        saveShareStudioPrefs({
            bgId: selectedBg.id,
            frameId: selectedFrame.id,
            fontId: selectedFont,
            fontSize,
            textColor,
            customText,
            showBismillah,
            shareType,
        });
    }, [isOpen, instantShareMode, selectedBg, selectedFrame, selectedFont, fontSize, textColor, customText, showBismillah, shareType]);

    useEffect(() => {
        const start = Math.min(fromAyah, toAyah);
        const end = Math.max(fromAyah, toAyah);
        const newSelected = [];
        for (let a = start; a <= end; a++) {
            newSelected.push({ s: currentAyah.s, a });
        }
        setSelectedAyahs(newSelected);
        setCurrentImagePageIndex(0);
    }, [fromAyah, toAyah, currentAyah.s, shareType]);

    const handleShareRef = useRef<(shareMode?: 'all' | 'current') => Promise<void>>(async () => {});
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const instantShareTriggeredNonceRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isOpen || !instantShareMode || !quranData) return;
        const nonce = instantShareNonce ?? 1;
        if (instantShareTriggeredNonceRef.current === nonce) return;
        if (!explanationReady) return;
        if (fromAyah !== currentAyah.a || toAyah !== currentAyah.a) return;
        if (!hiddenImageCaptureRef.current) return;

        instantShareTriggeredNonceRef.current = nonce;
        (async () => {
            try {
                await handleShareRef.current('current');
            } finally {
                onCloseRef.current();
            }
        })();
    }, [isOpen, instantShareMode, instantShareNonce, quranData, explanationReady, fromAyah, toAyah, currentAyah.s, currentAyah.a]);

    if (!isOpen || !quranData) return null;

    const stripTajweedTags = (text: string) => {
        return text;
    };

    const fixQuranText = (text: string) => {
        if (!text) return "";
        return text.replace(/۞/g, '');
    };

    const getAyahText = (s: number, a: number, strip: boolean = true) => {
        const surah = quranData.surahs[s - 1];
        if (!surah) return '';
        const ayah = surah.ayahs.find((ay: any) => ay.numberInSurah === a);
        if (!ayah) return '';
        let text = strip ? stripTajweedTags(ayah.text) : ayah.text;
        text = fixQuranText(text);
        if (s !== 1 && s !== 9 && a === 1) {
            text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
        }
        return text;
    };

    const getSurahName = (s: number) => {
        return SURAH_NAMES_AR[s - 1] || '';
    };

    const getExplanationText = (s: number, a: number) => {
        if (!explanationData) return '';
        if (isMushafLikeMode) return '';

        const activeMode: any = readingMode;

        if (activeMode === 'tafseer' || activeMode === 'ar.jalalayn') {
            return explanationData.data?.surahs?.[s - 1]?.ayahs?.[a - 1]?.text || explanationData[s - 1]?.ayahs?.[a - 1]?.text || '';
        }
        if (activeMode === 'meanings' || activeMode === 'tafseer.json') {
            return explanationData.find((m: any) => m.number === String(s) && m.aya === String(a))?.text || '';
        }
        if (activeMode === 'translation' || activeMode === 'bilingual' || activeMode === 'en.json') {
            return explanationData[s - 1]?.verses?.[a - 1]?.translation || '';
        }
        return '';
    };

    const combinedText = selectedAyahs.map(ay => getAyahText(ay.s, ay.a) + ` ﴿${toArabic(ay.a)}﴾`).join(' ');
    const combinedExplanation = selectedAyahs.map(ay => getExplanationText(ay.s, ay.a)).filter(t => t).join('\n');
    const firstAyah = selectedAyahs[0];
    const lastAyah = selectedAyahs[selectedAyahs.length - 1];
    const getSurahMetadata = (s: number) => {
        const surah = quranData.surahs[s - 1];
        if (!surah) return '';
        const revelationType = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
        return `${getAyahCountText(surah.ayahs.length)} | ${revelationType}`;
    };

    const surahInfo = firstAyah.s === lastAyah.s
        ? (firstAyah.a === lastAyah.a
            ? `سورة ${getSurahName(firstAyah.s)} - آية ${toArabic(firstAyah.a)} (${getSurahMetadata(firstAyah.s)})`
            : `سورة ${getSurahName(firstAyah.s)} - آية ${toArabic(firstAyah.a)} إلى آية ${toArabic(lastAyah.a)} (${getSurahMetadata(firstAyah.s)})`)
        : `سورة ${getSurahName(firstAyah.s)} آية ${toArabic(firstAyah.a)} - سورة ${getSurahName(lastAyah.s)} آية ${toArabic(lastAyah.a)}`;

    const getAyahLength = (ay: { s: number; a: number }) => {
        const text = getAyahText(ay.s, ay.a, false) || '';
        const exp = getExplanationText(ay.s, ay.a) || '';
        return text.length + 8 + (exp ? exp.length * 0.8 : 0);
    };

    const pageNum = useMemo(() => {
        return quranData?.surahs?.[currentAyah.s - 1]?.ayahs?.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
    }, [quranData, currentAyah.s, currentAyah.a]);

    const pageAyahs = useMemo(() => {
        const items: any[] = [];
        if (!quranData?.surahs) return items;
        quranData.surahs.forEach((surah: any, sIdx: number) => {
            surah.ayahs.forEach((ayah: any) => {
                if (ayah.page === pageNum) {
                    items.push({
                        ...ayah,
                        sNum: sIdx + 1,
                        numberInSurah: ayah.numberInSurah,
                        sName: surah.name,
                        juz: ayah.juz,
                        hizbQuarter: ayah.hizbQuarter,
                    });
                }
            });
        });
        return items;
    }, [quranData, pageNum]);

    const activeSourceAyahs = useMemo(() => {
        if (shareType === 'page' && pageAyahs.length > 0) {
            return pageAyahs.map((ay) => ({ s: ay.sNum, a: ay.numberInSurah }));
        }
        return selectedAyahs;
    }, [shareType, pageAyahs, selectedAyahs]);

    // Calculate page chunks for image & page sharing
    const pageChunks = useMemo(() => {
        if (!activeSourceAyahs || activeSourceAyahs.length === 0 || !quranData) return [];

        const SINGLE_PAGE_MAX_CHARS = 1320;
        const TARGET_CHUNK_CHARS = 1150;

        const touchedPages = new Set<number>();
        const ayahItems = activeSourceAyahs.map((ay) => {
            const ayahObj = quranData?.surahs?.[ay.s - 1]?.ayahs?.find((x: any) => x.numberInSurah === ay.a);
            const page = ayahObj?.page || 1;
            touchedPages.add(page);
            const weightedLen = getAyahLength(ay);
            const rawTextLen = (getAyahText(ay.s, ay.a, false) || '').length + 8;
            return { ay, page, weightedLen, rawTextLen };
        });

        const fullMushafPageChars = new Map<number, number>();
        if (quranData?.surahs) {
            for (const surah of quranData.surahs) {
                for (const ayah of surah.ayahs || []) {
                    if (touchedPages.has(ayah.page)) {
                        const prev = fullMushafPageChars.get(ayah.page) || 0;
                        fullMushafPageChars.set(ayah.page, prev + ((ayah.text || '').length + 8));
                    }
                }
            }
        }

        const totalWeightedChars = ayahItems.reduce((sum, item) => sum + item.weightedLen, 0);
        const totalMushafPageCoverage = ayahItems.reduce((sum, item) => {
            const effectivePageCap = Math.max(1150, fullMushafPageChars.get(item.page) || 1150);
            return sum + item.rawTextLen / effectivePageCap;
        }, 0);

        const allSameMushafPage = touchedPages.size === 1;
        const fitsInSinglePage =
            ayahItems.length <= 1 ||
            (allSameMushafPage && isMushafLikeMode) ||
            (totalMushafPageCoverage <= 1.05 && totalWeightedChars <= SINGLE_PAGE_MAX_CHARS);

        const rawGroups: { ayahs: { s: number; a: number }[]; startPage: number; endPage: number }[] = [];

        if (fitsInSinglePage) {
            rawGroups.push({
                ayahs: ayahItems.map((i) => i.ay),
                startPage: ayahItems[0].page,
                endPage: ayahItems[ayahItems.length - 1].page,
            });
        } else {
            const estimatedChunks = Math.max(
                2,
                Math.ceil(Math.max(totalMushafPageCoverage, totalWeightedChars / TARGET_CHUNK_CHARS))
            );
            let chunksLeft = estimatedChunks;
            let remainingChars = totalWeightedChars;
            let currentItems: typeof ayahItems = [];
            let currentLen = 0;

            for (const item of ayahItems) {
                if (currentItems.length === 0) {
                    currentItems.push(item);
                    currentLen = item.weightedLen;
                    remainingChars -= item.weightedLen;
                    continue;
                }

                const wouldExceedMax = currentLen + item.weightedLen > SINGLE_PAGE_MAX_CHARS;
                let shouldSplitForBalance = false;

                if (!wouldExceedMax && chunksLeft > 1) {
                    const idealTarget = (currentLen + remainingChars) / chunksLeft;
                    const closerWithoutItem =
                        currentLen >= idealTarget ||
                        Math.abs(currentLen - idealTarget) <= Math.abs(currentLen + item.weightedLen - idealTarget);
                    const restCanFit = remainingChars <= (chunksLeft - 1) * SINGLE_PAGE_MAX_CHARS;
                    if (closerWithoutItem && restCanFit) {
                        shouldSplitForBalance = true;
                    }
                }

                if (wouldExceedMax || shouldSplitForBalance) {
                    rawGroups.push({
                        ayahs: currentItems.map((i) => i.ay),
                        startPage: currentItems[0].page,
                        endPage: currentItems[currentItems.length - 1].page,
                    });
                    chunksLeft = Math.max(1, chunksLeft - 1);
                    currentItems = [item];
                    currentLen = item.weightedLen;
                    remainingChars -= item.weightedLen;
                } else {
                    currentItems.push(item);
                    currentLen += item.weightedLen;
                    remainingChars -= item.weightedLen;
                }
            }

            if (currentItems.length > 0) {
                rawGroups.push({
                    ayahs: currentItems.map((i) => i.ay),
                    startPage: currentItems[0].page,
                    endPage: currentItems[currentItems.length - 1].page,
                });
            }
        }

        const totalPages = rawGroups.length;

        return rawGroups.map((grp, idx) => {
            const first = grp.ayahs[0];
            const last = grp.ayahs[grp.ayahs.length - 1];
            const chunkPageNum = idx + 1;
            const extraSurahHeaderCount = grp.ayahs.reduce(
                (cnt, ay, i) => cnt + (i > 0 && ay.a === 1 ? 1 : 0),
                0
            );
            const totalChars =
                grp.ayahs.reduce((sum, ay) => sum + getAyahLength(ay), 0) +
                extraSurahHeaderCount * 110;

            const surahName = getSurahName(first.s);
            let surahInfoText = '';
            if (first.s === last.s) {
                if (first.a === last.a) {
                    surahInfoText = `سورة ${surahName} - آية ${toArabic(first.a)}`;
                } else {
                    surahInfoText = `سورة ${surahName} - الآيات ${toArabic(first.a)} إلى ${toArabic(last.a)}`;
                }
            } else {
                surahInfoText = `سورة ${surahName} آية ${toArabic(first.a)} - سورة ${getSurahName(last.s)} آية ${toArabic(last.a)}`;
            }

            if (totalPages > 1) {
                surahInfoText += ` (صورة ${toArabic(chunkPageNum)} من ${toArabic(totalPages)})`;
            }

            return {
                pageNumber: chunkPageNum,
                totalPages,
                mushafPage: grp.startPage,
                endMushafPage: grp.endPage,
                ayahs: grp.ayahs,
                fromAyah: first.a,
                toAyah: last.a,
                totalChars,
                surahInfoText
            };
        });
    }, [activeSourceAyahs, quranData, explanationData, readingMode]);

    const safePageIndex = Math.min(currentImagePageIndex, Math.max(0, (pageChunks.length || 1) - 1));
    const currentPageChunk = pageChunks[safePageIndex] || pageChunks[0];
    const userRatio = (fontSize || 20) / 20;

    const handleShare = async (shareMode: 'all' | 'current' = 'all') => {
        if (isSharing) return;
        setIsSharing(true);

        let shareText = `${surahInfo}\nآيات من القرآن الكريم . بواسطة : مصحف أحمد و ليلى`;

        if (shareType === 'page') {
            let pageSurahInfo = surahInfo;
            if (pageAyahs.length > 0) {
                const firstPageAyah = pageAyahs[0];
                const lastPageAyah = pageAyahs[pageAyahs.length - 1];
                pageSurahInfo = firstPageAyah.sNum === lastPageAyah.sNum
                    ? `سورة ${getSurahName(firstPageAyah.sNum)} - آية ${toArabic(firstPageAyah.numberInSurah)} إلى آية ${toArabic(lastPageAyah.numberInSurah)}`
                    : `سورة ${getSurahName(firstPageAyah.sNum)} آية ${toArabic(firstPageAyah.numberInSurah)} - سورة ${getSurahName(lastPageAyah.sNum)} آية ${toArabic(lastPageAyah.numberInSurah)}`;
            }

            shareText = `صفحة ${toArabic(pageNum)} - ${pageSurahInfo}\nآيات من القرآن الكريم . بواسطة : مصحف أحمد و ليلى`;
        }

        const fullText = `${combinedText}\n\n${combinedExplanation ? combinedExplanation + '\n\n' : ''}${shareText}`;

        const blobToBase64 = (blob: Blob): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };

        try {
            if (shareType === 'text') {
                if (Capacitor.isNativePlatform()) {
                    await Share.share({
                        title: 'مشاركة آية',
                        text: fullText,
                        dialogTitle: 'مشاركة عبر'
                    });
                } else if (navigator.share) {
                    await navigator.share({
                        title: 'مشاركة آية',
                        text: fullText,
                    }).catch(e => {
                        if (e.name !== 'AbortError') throw e;
                    });
                } else {
                    showToast?.("المشاركة غير مدعومة في هذا المتصفح");
                }
            } else if (shareType === 'image' || shareType === 'page') {
                const isPageShare = shareType === 'page';
                try {
                    setIsSharing(true);
                    const isSinglePage = pageChunks.length <= 1 || shareMode === 'current';
                    const targetChunks = isSinglePage ? [currentPageChunk] : pageChunks;
                    const targetIndices = isSinglePage ? [safePageIndex] : pageChunks.map((_, i) => i);

                    const capturedImages: { dataUrl: string; chunk: typeof currentPageChunk }[] = [];

                    for (let i = 0; i < targetIndices.length; i++) {
                        const chunkIdx = targetIndices[i];
                        const captureElement = hiddenCapturePagesRef.current[chunkIdx] || hiddenImageCaptureRef.current;
                        if (!captureElement) continue;

                        const originalStyle = captureElement.style.cssText;

                        captureElement.style.position = 'absolute';
                        captureElement.style.left = '-9999px';
                        captureElement.style.top = '-9999px';
                        captureElement.style.visibility = 'visible';
                        captureElement.style.display = 'flex';
                        captureElement.style.zIndex = '-1000';

                        await document.fonts.ready;
                        const captureImgs = Array.from(captureElement.querySelectorAll('img'));
                        await Promise.all(
                            captureImgs.map((img) =>
                                typeof img.decode === 'function' ? img.decode().catch(() => {}) : Promise.resolve()
                            )
                        );
                        if (!instantShareMode) {
                            await new Promise(r => setTimeout(r, 40));
                        }

                        const targetW = 1890;
                        const targetH = 3360;
                        const canvas = await safeHtml2Canvas(captureElement, {
                            scale: 1.75,
                            backgroundColor: null,
                            useCORS: true,
                            logging: false,
                            imageTimeout: 15000,
                            removeContainer: true
                        });

                        let finalCanvas = canvas;
                        if (canvas.width !== targetW || canvas.height !== targetH) {
                            const resized = document.createElement('canvas');
                            resized.width = targetW;
                            resized.height = targetH;
                            const rCtx = resized.getContext('2d')!;
                            rCtx.imageSmoothingEnabled = true;
                            rCtx.imageSmoothingQuality = 'high';
                            rCtx.drawImage(canvas, 0, 0, targetW, targetH);
                            finalCanvas = resized;
                        }

                        const dataUrl = encodeHighResCompactImage(finalCanvas, 420 * 1024, 0.88, 0.68);
                        captureElement.style.cssText = originalStyle;

                        if (dataUrl && dataUrl !== 'data:,') {
                            capturedImages.push({ dataUrl, chunk: targetChunks[i] });
                        }
                    }

                    if (capturedImages.length === 0) {
                        throw new Error('Failed to generate image data');
                    }

                    const dataUrlToBlob = (url: string): Blob => {
                        const parts = url.split(',');
                        const mimeMatch = parts[0].match(/:(.*?);/);
                        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
                        const binary = atob(parts[1] || '');
                        const bytes = new Uint8Array(binary.length);
                        for (let idx = 0; idx < binary.length; idx++) {
                            bytes[idx] = binary.charCodeAt(idx);
                        }
                        return new Blob([bytes], { type: mime });
                    };

                    const downloadCapturedImages = async () => {
                        for (let i = 0; i < capturedImages.length; i++) {
                            const link = document.createElement('a');
                            link.download = `quran_page_${capturedImages[i].chunk.mushafPage}_part_${i + 1}_${Date.now()}.jpg`;
                            link.href = capturedImages[i].dataUrl;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            if (capturedImages.length > 1) {
                                await new Promise(r => setTimeout(r, 150));
                            }
                        }
                        showToast?.(
                            capturedImages.length > 1
                                ? `تم حفظ ${toArabic(capturedImages.length)} صور بنجاح`
                                : isPageShare
                                ? (isEn ? 'Page card saved successfully' : 'تم حفظ بطاقة الصفحة للمشاركة')
                                : (isEn ? 'Ayah card saved successfully' : 'تم حفظ بطاقة الآية للمشاركة')
                        );
                    };

                    if (Capacitor.isNativePlatform()) {
                        const fileUris: string[] = [];
                        for (let i = 0; i < capturedImages.length; i++) {
                            const fileName = `quran_page_${capturedImages[i].chunk.mushafPage}_part${i + 1}_${Date.now()}.jpg`;
                            const base64Data = capturedImages[i].dataUrl.split(',')[1];
                            const savedFile = await Filesystem.writeFile({
                                path: fileName,
                                data: base64Data,
                                directory: Directory.Cache,
                            });
                            fileUris.push(savedFile.uri);
                        }

                        if (fileUris.length > 1) {
                            await Share.share({
                                title: isPageShare ? 'مشاركة صفحة' : 'مشاركة آيات قرآنية',
                                text: shareText,
                                files: fileUris,
                                dialogTitle: 'مشاركة الصور عبر'
                            });
                        } else {
                            await Share.share({
                                title: isPageShare ? 'مشاركة صفحة' : 'مشاركة آية',
                                text: shareText,
                                url: fileUris[0],
                                dialogTitle: 'مشاركة عبر'
                            });
                        }
                    } else if (navigator.share) {
                        try {
                            const files: File[] = capturedImages.map((item, i) => {
                                const blob = dataUrlToBlob(item.dataUrl);
                                return new File([blob], `quran_page_${item.chunk.mushafPage}_part_${i + 1}.jpg`, { type: 'image/jpeg' });
                            });

                            if (navigator.canShare && navigator.canShare({ files })) {
                                await navigator.share({
                                    title: isPageShare ? 'مشاركة صفحة' : 'مشاركة آيات قرآنية',
                                    text: shareText,
                                    files: files,
                                });
                            } else {
                                await downloadCapturedImages();
                            }
                        } catch (e: any) {
                            const errorMsg = e?.message || String(e);
                            if (e?.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                                console.log('Image share interaction finished');
                            } else {
                                console.warn('Browser share unavailable or blocked, falling back to image download:', e);
                                await downloadCapturedImages();
                            }
                        }
                    } else {
                        await downloadCapturedImages();
                    }
                } catch (e: any) {
                    const errorMsg = e?.message || String(e);
                    if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                        console.log('Image share interaction cancelled or failed');
                    } else {
                        console.error('Error sharing image:', e);
                        showToast?.("حدث خطأ أثناء إنشاء الصورة. حاول مرة أخرى");
                    }
                }
            } else if (shareType === 'audio') {
                const reader = propSettings?.reader || appSettings?.reader || 'Alafasy_128kbps';
                const readerMap: Record<string, string> = {
                    'ar.alafasy': 'Alafasy_128kbps',
                    'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
                    'ar.abdulbasitmujawwad': 'Abdul_Basit_Mujawwad_128kbps',
                    'ar.abdullahbasfar': 'Abdullah_Basfar_192kbps',
                    'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
                    'ar.hudhaify': 'Hudhaify_128kbps',
                    'ar.minshawi': 'Minshawy_Murattal_128kbps',
                    'ar.minshawimujawwad': 'Minshawy_Mujawwad_64kbps',
                    'ar.husary': 'Husary_128kbps',
                    'ar.mahermuaiqly': 'MaherAlMuaiqly128kbps',
                    'https://server11.mp3quran.net/shatri': 'Abu_Bakr_Ash-Shaatree_128kbps',
                    'https://server10.mp3quran.net/ajm': 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
                    'https://server6.mp3quran.net/akdr': 'Ibrahim_Akhdar_32kbps',
                    'https://server6.mp3quran.net/kurdi': 'Raad_Al_Kurdi_128kbps',
                    'https://server7.mp3quran.net/s_gmd': 'Ghamadi_40kbps',
                    'https://server7.mp3quran.net/shur': 'Saood_ash-Shuraym_128kbps',
                    'https://server6.mp3quran.net/shl': 'Sahl_Yassin_128kbps',
                    'https://server8.mp3quran.net/bu_khtr': 'Salaah_AbdulRahman_Bukhatir_128kbps',
                    'https://server8.mp3quran.net/basit': 'Abdul_Basit_Murattal_192kbps',
                    'https://server11.mp3quran.net/sds': 'Abdurrahmaan_As-Sudais_192kbps',
                    'https://server12.mp3quran.net/kyat': 'Abdullah_Khayat_128kbps',
                    'https://server8.mp3quran.net/mtrod': 'Abdullah_Matroud_128kbps',
                    'https://server9.mp3quran.net/hthfi': 'Hudhaify_128kbps',
                    'https://server8.mp3quran.net/frs_a': 'Fares_Abbad_64kbps',
                    'https://server12.mp3quran.net/maher': 'MaherAlMuaiqly128kbps',
                    'https://server10.mp3quran.net/minsh': 'Minshawy_Murattal_128kbps',
                    'https://server12.mp3quran.net/tblawi': 'Mohammad_al_Tablaway_128kbps',
                    'https://server13.mp3quran.net/husr': 'Husary_128kbps',
                    'https://server8.mp3quran.net/bna': 'Mahmoud_Ali_Al_Banna_32kbps',
                    'https://server8.mp3quran.net/afs': 'Alafasy_128kbps',
                    'https://server8.mp3quran.net/mustafa': 'Mustafa_Ismail_48kbps',
                    'https://server6.mp3quran.net/qtm': 'Nasser_Alqatami_128kbps',
                    'https://server11.mp3quran.net/yasser': 'Yasser_Ad-Dussary_128kbps'
                };
                const audioReader = readerMap[reader] || reader;

                const start = Math.min(fromAyah, toAyah);
                const end = Math.max(fromAyah, toAyah);
                const ayahsToShare = [];
                for (let a = start; a <= end; a++) {
                    ayahsToShare.push({ s: currentAyah.s, a });
                }

                const surahName = getSurahName(currentAyah.s);
                const fromStr = String(start).padStart(2, '0');
                const toStr = String(end).padStart(2, '0');
                const fileName = start === end
                    ? `سورة ${surahName} الايه${fromStr}.mp3`
                    : `سورة ${surahName} الايه من ${fromStr} الى ${toStr}.mp3`;

                try {
                    const cleanAudioBuffer = (buffer: ArrayBuffer) => {
                        const uint8 = new Uint8Array(buffer);
                        let startOffset = 0;
                        let endOffset = uint8.length;

                        if (uint8.length > 10 && uint8[0] === 0x49 && uint8[1] === 0x44 && uint8[2] === 0x33) {
                            const size = (uint8[6] << 21) | (uint8[7] << 14) | (uint8[8] << 7) | uint8[9];
                            startOffset = size + 10;
                        }

                        if (uint8.length > 128) {
                            const tagOffset = uint8.length - 128;
                            if (uint8[tagOffset] === 0x54 && uint8[tagOffset + 1] === 0x41 && uint8[tagOffset + 2] === 0x47) {
                                endOffset = tagOffset;
                            }
                        }

                        if (startOffset > 0 || endOffset < uint8.length) {
                            if (startOffset >= endOffset) return buffer;
                            return buffer.slice(startOffset, endOffset);
                        }
                        return buffer;
                    };

                    const buffers: ArrayBuffer[] = [];

                    if (Capacitor.isNativePlatform()) {
                        let isFirst = true;
                        for (const ay of ayahsToShare) {
                            const sStr = String(ay.s).padStart(3, '0');
                            const aStr = String(ay.a).padStart(3, '0');
                            let audioUrl = `https://everyayah.com/data/${audioReader}/${sStr}${aStr}.mp3`;
                            if (/^[a-z]{2,3}\./.test(audioReader)) {
                                const globalAyahNum = quranData?.surahs[ay.s - 1]?.ayahs[ay.a - 1]?.number;
                                if (globalAyahNum) {
                                    audioUrl = `https://cdn.islamic.network/quran/audio/128/${audioReader}/${globalAyahNum}.mp3`;
                                }
                            }

                            const res = await fetch(audioUrl);
                            if (!res.ok) throw new Error(`Failed to fetch audio for ayah ${ay.a}`);
                            const buffer = await res.arrayBuffer();
                            const cleanedBuffer = cleanAudioBuffer(buffer);

                            const base64Data = await blobToBase64(new Blob([cleanedBuffer]));
                            const dataToWrite = base64Data.split(',')[1];

                            if (isFirst) {
                                await Filesystem.writeFile({
                                    path: fileName,
                                    data: dataToWrite,
                                    directory: Directory.Cache,
                                });
                                isFirst = false;
                            } else {
                                await Filesystem.appendFile({
                                    path: fileName,
                                    data: dataToWrite,
                                    directory: Directory.Cache,
                                });
                            }
                        }

                        const savedFile = await Filesystem.getUri({
                            path: fileName,
                            directory: Directory.Cache,
                        });

                        await Share.share({
                            title: 'مشاركة تلاوة',
                            text: shareText,
                            url: savedFile.uri,
                            dialogTitle: 'مشاركة عبر'
                        });
                    } else {
                        for (const ay of ayahsToShare) {
                            const sStr = String(ay.s).padStart(3, '0');
                            const aStr = String(ay.a).padStart(3, '0');
                            let audioUrl = `https://everyayah.com/data/${audioReader}/${sStr}${aStr}.mp3`;
                            if (/^[a-z]{2,3}\./.test(audioReader)) {
                                const globalAyahNum = quranData?.surahs[ay.s - 1]?.ayahs[ay.a - 1]?.number;
                                if (globalAyahNum) {
                                    audioUrl = `https://cdn.islamic.network/quran/audio/128/${audioReader}/${globalAyahNum}.mp3`;
                                }
                            }

                            const res = await fetch(audioUrl);
                            if (!res.ok) throw new Error(`Failed to fetch audio for ayah ${ay.a}`);
                            const buffer = await res.arrayBuffer();
                            buffers.push(cleanAudioBuffer(buffer));
                        }

                        const combinedBlob = new Blob(buffers, { type: 'audio/mpeg' });
                        const file = new File([combinedBlob], fileName, { type: 'audio/mpeg' });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: 'مشاركة تلاوة',
                                text: shareText,
                                files: [file],
                            });
                        } else {
                            const link = document.createElement('a');
                            link.download = fileName;
                            link.href = URL.createObjectURL(combinedBlob);
                            link.click();
                        }
                    }
                } catch (e: any) {
                    const errorMsg = e?.message || String(e);
                    if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                        console.log('Share canceled by user');
                    } else {
                        console.error('Error sharing audio file:', e);
                        showToast?.("حدث خطأ أثناء تحميل الملفات الصوتية");
                    }
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };
    handleShareRef.current = handleShare;

    const handleCopy = async () => {
        if (isCopying) return;
        setIsCopying(true);
        const shareText = `${surahInfo}\nآيات من القرآن الكريم . بواسطة : مصحف أحمد و ليلى`;
        const fullText = `${combinedText}\n\n${combinedExplanation ? combinedExplanation + '\n\n' : ''}${shareText}`;

        try {
            await navigator.clipboard.writeText(fullText);
            setIsCopiedFeedback(true);
            setTimeout(() => setIsCopiedFeedback(false), 1600);
            showToast?.("تم نسخ نص الآيات بنجاح إلى الحافظة");
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showToast?.("فشل نسخ النص");
        } finally {
            setIsCopying(false);
        }
    };

    const hiddenCaptureNodes = (
        <ShareHiddenCaptureNodes
            pageChunks={pageChunks}
            userRatio={userRatio}
            selectedBg={selectedBg}
            selectedFrame={selectedFrame}
            selectedFont={selectedFont}
            textColor={textColor}
            customText={customText}
            showBismillah={showBismillah}
            isMushafLikeMode={isMushafLikeMode}
            shareType={shareType}
            isEn={isEn}
            quranPagePalette={quranPagePalette}
            quranSurahBannerUrl={quranSurahBannerUrl}
            shareDesignAssets={shareDesignAssets}
            hiddenImageCaptureRef={hiddenImageCaptureRef}
            hiddenCapturePagesRef={hiddenCapturePagesRef}
            getAyahText={getAyahText}
            getSurahName={getSurahName}
            getExplanationText={getExplanationText}
        />
    );

    if (instantShareMode) {
        return hiddenCaptureNodes;
    }

    const palette = buildShareStudioPalette(currentTheme, isFlatMadinah);
    const {
        accentBg,
        accentText,
        studioBg,
        surfaceBg,
        trackBg,
        dividerColor,
        textPrimary,
        textMuted,
        flatNeutralBorder,
        flatActiveBorder,
        tactileNeutralShadow,
        tactileActiveShadow,
        tactileInsetShadow,
    } = palette;

    const totalDesigns = SHARE_DESIGN_BGS.length;
    const currentDesignIndex = Math.max(0, SHARE_DESIGN_BGS.findIndex((bg) => bg.id === selectedBg.id));
    const leftDesignIndex = (currentDesignIndex - 1 + totalDesigns) % totalDesigns;
    const rightDesignIndex = (currentDesignIndex + 1) % totalDesigns;
    const leftBg = SHARE_DESIGN_BGS[leftDesignIndex];
    const rightBg = SHARE_DESIGN_BGS[rightDesignIndex];

    const hasMultiImagePager = (shareType === 'image' || shareType === 'page') && pageChunks.length > 1;
    const pagerHeight = hasMultiImagePager ? 44 : 0;

    const stageW = Math.max(260, stageSize.w);
    const stageH = Math.max(180, stageSize.h);

    const isWideStage = stageW >= 560;
    const showSideTypographyRails =
        studioGroup === 'typography' && (shareType === 'image' || shareType === 'page');
    const railW = showSideTypographyRails
        ? Math.max(50, Math.min(62, Math.floor(stageW * 0.165)))
        : 0;

    const horizontalSideSpace = showSideTypographyRails
        ? (railW * 2) + (isWideStage ? 28 : 16)
        : (isWideStage ? 24 : 16);
    const maxCenterW = Math.max(140, stageW - horizontalSideSpace);
    const maxCenterH = Math.max(120, stageH - pagerHeight - 4);
    const sideColumnH = maxCenterH;

    const artboardW = 360;
    const artboardH = 640;
    const fitScale = Math.min(maxCenterW / artboardW, maxCenterH / artboardH, 1.05);
    const scaledW = Math.round(artboardW * fitScale);
    const scaledH = Math.round(artboardH * fitScale);

    const rangeSummaryLabel = shareType === 'page'
        ? `${getSurahName(currentAyah.s)} · ${isEn ? `Page ${pageNum}` : `صفحة ${toArabic(pageNum)}`}`
        : `${getSurahName(currentAyah.s)} · ${fromAyah === toAyah
            ? (isEn ? `Ayah ${fromAyah}` : `آية ${toArabic(fromAyah)}`)
            : (isEn ? `Ayah ${fromAyah}-${toAyah}` : `آيات ${toArabic(fromAyah)} – ${toArabic(toAyah)}`)}`;

    const shareModeOptions: { id: 'image' | 'text' | 'page' | 'audio'; label: string }[] = [
        { id: 'image', label: isEn ? 'Image' : 'صورة' },
        { id: 'text', label: isEn ? 'Text' : 'نص' },
        { id: 'page', label: isEn ? 'Page' : 'صفحة' },
        { id: 'audio', label: isEn ? 'Audio' : 'صوت' },
    ];

    const primaryShareLabel =
        shareType === 'image' ? (isEn ? 'Share Image' : 'مشاركة الصورة') :
        shareType === 'text' ? (isEn ? 'Share Text' : 'مشاركة النص') :
        shareType === 'page' ? (isEn ? 'Share Page' : 'مشاركة الصفحة') :
        (isEn ? 'Share Audio' : 'مشاركة التلاوة');

    return (
        <>
            {hiddenCaptureNodes}
            <div
                ref={modalBackdropRef}
                className="quran-fullscreen-modal-backdrop fixed inset-0 z-[1200] bg-black/55 flex items-center justify-center overflow-clip"
                dir="rtl"
                onClick={onClose}
            >
                <div
                    ref={studioShellRef}
                    className={`quran-fullscreen-modal-panel ${isFlatMadinah ? 'madinah-share-studio-flat' : 'quran-share-studio-flat'} w-full h-full flex flex-col overflow-clip`}
                    style={{ backgroundColor: studioBg, color: textPrimary }}
                    dir={isEn ? 'ltr' : 'rtl'}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 1. Compact Studio Top Bar */}
                    <header
                        className="share-studio-header px-3.5 pb-2.5 flex items-center justify-center gap-2.5 shrink-0 border-b z-20"
                        style={{
                            backgroundColor: surfaceBg,
                            borderColor: dividerColor,
                            paddingTop: 'calc(0.6rem + var(--app-safe-top, 0px))',
                            boxShadow: 'none',
                        }}
                    >
                        {(shareType === 'image' || shareType === 'page') && (
                            <button
                                type="button"
                                onClick={() => setStudioGroup((prev) => (prev === 'typography' ? null : 'typography'))}
                                className="lg:hidden px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border-0 cursor-pointer transition-transform active:translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0"
                                style={{
                                    backgroundColor: studioGroup === 'typography' ? accentBg : surfaceBg,
                                    color: studioGroup === 'typography' ? accentText : textPrimary,
                                    border: studioGroup === 'typography' ? flatActiveBorder : flatNeutralBorder,
                                    boxShadow: studioGroup === 'typography' ? tactileActiveShadow : tactileNeutralShadow,
                                }}
                            >
                                <Type size={13} className="shrink-0" />
                                <span>{isEn ? 'Font' : 'الخط والنص'}</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                if (shareType === 'page') return;
                                setRangeSelectionMode(fromAyah === toAyah ? 'single' : 'range');
                                setRangeActiveStep('from');
                                setIsRangePickerOpen(true);
                            }}
                            disabled={shareType === 'page'}
                            className={`min-w-0 max-w-full px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-extrabold border-0 transition-transform ${
                                shareType === 'page' ? 'opacity-70 cursor-default' : 'cursor-pointer active:translate-y-0.5 active:scale-95'
                            }`}
                            style={{
                                backgroundColor: surfaceBg,
                                color: textPrimary,
                                border: flatNeutralBorder,
                                boxShadow: tactileNeutralShadow,
                            }}
                        >
                            <span className="truncate">{rangeSummaryLabel}</span>
                            {shareType !== 'page' && <ChevronDown size={13} className="shrink-0 opacity-70" />}
                        </button>
                    </header>

                    {/* Main Studio Body */}
                    <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-clip">
                        <div
                            className="lg:hidden px-3.5 pt-2.5 pb-1 shrink-0"
                            style={{ backgroundColor: studioBg }}
                        >
                            <div
                                className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl"
                                style={{ backgroundColor: trackBg, border: flatNeutralBorder, boxShadow: tactileInsetShadow }}
                            >
                                {shareModeOptions.map((opt) => {
                                    const isActive = shareType === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setShareType(opt.id)}
                                            className="py-1.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 border-0 cursor-pointer whitespace-nowrap"
                                            style={{
                                                backgroundColor: isActive ? accentBg : surfaceBg,
                                                color: isActive ? accentText : textPrimary,
                                                border: isActive ? flatActiveBorder : flatNeutralBorder,
                                                boxShadow: isActive ? tactileActiveShadow : tactileNeutralShadow,
                                            }}
                                        >
                                            <span>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div
                            ref={previewStageRef}
                            className="flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center p-2.5 sm:p-4 overflow-clip relative"
                            style={{ background: studioBg }}
                        >
                            {(shareType === 'image' || shareType === 'page') ? (
                                <ShareLiveArtboard
                                    currentPageChunk={currentPageChunk}
                                    pageChunksLength={pageChunks.length}
                                    safePageIndex={safePageIndex}
                                    setCurrentImagePageIndex={setCurrentImagePageIndex}
                                    userRatio={userRatio}
                                    selectedBg={selectedBg}
                                    leftBg={leftBg}
                                    rightBg={rightBg}
                                    handleSelectBg={handleSelectBg}
                                    selectedFrame={selectedFrame}
                                    selectedFont={selectedFont}
                                    setSelectedFont={setSelectedFont}
                                    fontSize={fontSize}
                                    setFontSize={setFontSize}
                                    textColor={textColor}
                                    setTextColor={setTextColor}
                                    customText={customText}
                                    showBismillah={showBismillah}
                                    isMushafLikeMode={isMushafLikeMode}
                                    shareType={shareType}
                                    isEn={isEn}
                                    quranPagePalette={quranPagePalette}
                                    quranSurahBannerUrl={quranSurahBannerUrl}
                                    shareDesignAssets={shareDesignAssets}
                                    studioGroup={studioGroup}
                                    setStudioGroup={setStudioGroup}
                                    setHideDesktopCustomization={setHideDesktopCustomization}
                                    showSideTypographyRails={showSideTypographyRails}
                                    railW={railW}
                                    sideColumnH={sideColumnH}
                                    artboardW={artboardW}
                                    artboardH={artboardH}
                                    scaledW={scaledW}
                                    scaledH={scaledH}
                                    fitScale={fitScale}
                                    hasMultiImagePager={hasMultiImagePager}
                                    palette={palette}
                                    previewRef={previewRef}
                                    activeFontBtnRef={activeFontBtnRef}
                                    activeColorBtnRef={activeColorBtnRef}
                                    isPointerDraggingRef={isPointerDraggingRef}
                                    dragStartXRef={dragStartXRef}
                                    dragStartYRef={dragStartYRef}
                                    draggedFarRef={draggedFarRef}
                                    dragOffset={dragOffset}
                                    setDragOffset={setDragOffset}
                                    getAyahText={getAyahText}
                                    getSurahName={getSurahName}
                                    getExplanationText={getExplanationText}
                                />
                            ) : (
                                <ShareNonImagePreview
                                    shareType={shareType}
                                    surahInfo={surahInfo}
                                    combinedText={combinedText}
                                    combinedExplanation={combinedExplanation}
                                    handleCopy={handleCopy}
                                    isCopying={isCopying}
                                    isCopiedFeedback={isCopiedFeedback}
                                    fromAyah={fromAyah}
                                    toAyah={toAyah}
                                    surahNumber={currentAyah.s}
                                    getSurahName={getSurahName}
                                    isEn={isEn}
                                    palette={palette}
                                />
                            )}
                        </div>

                        <aside
                            className="hidden lg:flex lg:w-[400px] xl:w-[430px] shrink-0 flex-col border-s overflow-hidden"
                            style={{
                                backgroundColor: surfaceBg,
                                borderColor: dividerColor,
                                boxShadow: 'none',
                            }}
                        >
                            <div className="p-4 border-b shrink-0" style={{ borderColor: dividerColor }}>
                                <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl" style={{ backgroundColor: trackBg, border: flatNeutralBorder, boxShadow: tactileInsetShadow }}>
                                    {shareModeOptions.map((opt) => {
                                        const isActive = shareType === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setShareType(opt.id)}
                                                className="py-1.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:translate-y-0.5 border-0 cursor-pointer whitespace-nowrap"
                                                style={{
                                                    backgroundColor: isActive ? accentBg : surfaceBg,
                                                    color: isActive ? accentText : textPrimary,
                                                    border: isActive ? flatActiveBorder : flatNeutralBorder,
                                                    boxShadow: isActive ? tactileActiveShadow : tactileNeutralShadow,
                                                }}
                                            >
                                                <span>{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                                {(shareType === 'image' || shareType === 'page') ? (
                                    !hideDesktopCustomization ? (
                                        <div className="space-y-3 animate-fadeIn">
                                            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: dividerColor }}>
                                                <Type size={14} style={{ color: accentBg }} />
                                                <span className="text-xs font-black" style={{ color: textPrimary }}>
                                                    {isEn ? 'Font & Caption' : 'الخط والنص'}
                                                </span>
                                            </div>
                                            <ShareCustomizationPanel
                                                selectedFont={selectedFont}
                                                setSelectedFont={setSelectedFont}
                                                fontSize={fontSize}
                                                setFontSize={setFontSize}
                                                textColor={textColor}
                                                setTextColor={setTextColor}
                                                customText={customText}
                                                setCustomText={setCustomText}
                                                showBismillah={showBismillah}
                                                setShowBismillah={setShowBismillah}
                                                isEn={isEn}
                                                palette={palette}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setHideDesktopCustomization(false)}
                                            className="w-full rounded-2xl p-4 text-center border-0 cursor-pointer transition-all active:translate-y-0.5 animate-fadeIn"
                                            style={{ backgroundColor: surfaceBg, border: flatNeutralBorder, boxShadow: tactileNeutralShadow }}
                                        >
                                            <p className="text-xs font-bold" style={{ color: textPrimary }}>
                                                {isEn ? 'Click the design to show colors, fonts & caption' : 'اضغط على التصميم لإظهار الألوان والخطوط والنص الإضافي'}
                                            </p>
                                        </button>
                                    )
                                ) : (
                                    <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: trackBg, border: flatNeutralBorder, boxShadow: tactileInsetShadow }}>
                                        <p className="text-xs font-extrabold" style={{ color: textPrimary }}>
                                            {shareType === 'text'
                                                ? (isEn ? 'Text Share Ready' : 'جاهز للمشاركة النصية')
                                                : (isEn ? 'Audio Recitation MP3' : 'مشاركة التلاوة الصوتية')}
                                        </p>
                                        <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
                                            {surahInfo}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t shrink-0" style={{ borderColor: dividerColor }}>
                                <SharePrimaryCTA
                                    shareType={shareType}
                                    pageChunksLength={pageChunks.length}
                                    safePageIndex={safePageIndex}
                                    isSharing={isSharing}
                                    primaryShareLabel={primaryShareLabel}
                                    handleShare={handleShare}
                                    onClose={onClose}
                                    isEn={isEn}
                                    palette={palette}
                                />
                            </div>
                        </aside>
                    </div>

                    {/* Mobile Bottom Dock */}
                    <div
                        data-toast-bottom-bar="true"
                        className="lg:hidden shrink-0 border-t z-20"
                        style={{
                            backgroundColor: surfaceBg,
                            borderColor: dividerColor,
                            boxShadow: 'none',
                        }}
                    >
                        {(shareType === 'image' || shareType === 'page') && studioGroup !== null && (
                            <div
                                className="px-3.5 py-2 border-b animate-fadeIn flex items-center gap-2"
                                style={{ borderColor: dividerColor, backgroundColor: surfaceBg }}
                            >
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder={isEn ? 'Optional note / caption...' : 'نص إضافي يظهر أسفل البطاقة (اختياري)...'}
                                    className="flex-1 min-w-0 px-3 py-2 text-xs font-semibold rounded-xl outline-none transition-all border-0"
                                    style={{
                                        backgroundColor: trackBg,
                                        color: textPrimary,
                                        border: flatNeutralBorder,
                                        boxShadow: tactileInsetShadow,
                                    }}
                                    maxLength={50}
                                    dir={isEn ? 'ltr' : 'rtl'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowBismillah((prev) => !prev)}
                                    className="px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 border-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                                    style={{
                                        backgroundColor: showBismillah ? accentBg : surfaceBg,
                                        color: showBismillah ? accentText : textMuted,
                                        border: showBismillah ? flatActiveBorder : flatNeutralBorder,
                                        boxShadow: showBismillah ? tactileActiveShadow : tactileNeutralShadow,
                                    }}
                                    title={isEn ? (showBismillah ? 'Hide Bismillah' : 'Show Bismillah') : (showBismillah ? 'إخفاء البسملة من التصميم' : 'إظهار البسملة في التصميم')}
                                    aria-pressed={showBismillah}
                                >
                                    {isEn ? 'Bismillah' : 'البسملة'}
                                </button>
                            </div>
                        )}

                        <div className="px-3.5 pt-2.5 modal-sheet-safe-bottom">
                            <SharePrimaryCTA
                                shareType={shareType}
                                pageChunksLength={pageChunks.length}
                                safePageIndex={safePageIndex}
                                isSharing={isSharing}
                                primaryShareLabel={primaryShareLabel}
                                handleShare={handleShare}
                                onClose={onClose}
                                isEn={isEn}
                                palette={palette}
                            />
                        </div>
                    </div>
                </div>

                <ShareAyahRangeModal
                    isOpen={isRangePickerOpen}
                    onClose={() => setIsRangePickerOpen(false)}
                    surahNumber={currentAyah.s}
                    ayahs={quranData.surahs[currentAyah.s - 1]?.ayahs || []}
                    fromAyah={fromAyah}
                    setFromAyah={setFromAyah}
                    toAyah={toAyah}
                    setToAyah={setToAyah}
                    rangeSelectionMode={rangeSelectionMode}
                    setRangeSelectionMode={setRangeSelectionMode}
                    rangeActiveStep={rangeActiveStep}
                    setRangeActiveStep={setRangeActiveStep}
                    rangeListRef={rangeListRef}
                    selectedAyahRef={selectedAyahRef}
                    getSurahName={getSurahName}
                    getAyahText={getAyahText}
                    isEn={isEn}
                    palette={palette}
                />
            </div>
        </>
    );
};

export default ShareAyahModal;
