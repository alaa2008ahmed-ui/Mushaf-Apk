import React, { useEffect, useRef, useState, useCallback } from 'react';
import MushafPage from './MushafPage';
import { quranData as quranJsonData } from '../../utils/quranData';

interface HorizontalPagingViewProps {
    currentPage: number;
    onPageChange: (page: number) => void;
    settings: any;
    currentTheme: any;
    highlightedAyahId?: string | null;
    onAyahClick: (s: number, a: number) => void;
    onAyahLongPress?: (s: number, a: number, x: number, y: number) => void;
    onVerseClick?: (s: number, a: number) => void;
    onVerseLongPress?: (s: number, a: number, x: number, y: number) => void;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
    onSurahHeaderLongPress?: () => void;
    hideVerses?: boolean;
    memorizationSettings?: any;
    isPlaying?: boolean;
    isRecording?: boolean;
    revealedAyahs?: string[];
    tempRevealedAyah?: string | null;
}

const HorizontalPagingView: React.FC<HorizontalPagingViewProps> = React.memo(({
    currentPage,
    onPageChange,
    settings,
    currentTheme,
    highlightedAyahId,
    onAyahClick,
    onAyahLongPress,
    onVerseClick,
    onVerseLongPress,
    onInteractionStart,
    onInteractionEnd,
    onSurahHeaderLongPress,
    hideVerses,
    memorizationSettings,
    isPlaying,
    isRecording,
    revealedAyahs,
    tempRevealedAyah
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<number[]>([]);
    
    // Determine how many pages to show side-by-side
    const [isTwoPageView, setIsTwoPageView] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsTwoPageView(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate visible pages window (e.g. current-2 to current+2)
    useEffect(() => {
        let p = currentPage;
        let windowPages = [];
        if (isTwoPageView) {
            // For two pages, make sure we show even/odd pairs correctly
            // Usually right page is odd, left page is even. 
            // e.g., page 2 (left) and 3 (right).
            // Actually standard mushaf: Page 1 is on the right (odd). 
            // Page 2 is on the left (even). Page 3 on right (odd).
            const startOdd = p % 2 === 0 ? p - 1 : p;
            windowPages = [startOdd - 2, startOdd - 1, startOdd, startOdd + 1, startOdd + 2, startOdd + 3];
        } else {
            windowPages = [p - 1, p, p + 1];
        }
        setPages(windowPages.filter(x => x > 0 && x <= 604));
    }, [currentPage, isTwoPageView]);

    // Re-center scroll position when pages array changes
    useEffect(() => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        // Find the group or page element
        const selector = isTwoPageView 
            ? `[data-page-group="${currentPage % 2 === 0 ? currentPage - 1 : currentPage}"]`
            : `[data-page="${currentPage}"]`;
        const currentEl = container.querySelector(selector) as HTMLElement;
        if (currentEl) {
            // Scroll to current element instantly
            currentEl.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
        }
        
        // Reset vertical scroll position of the page containers
        const scrollContainers = container.querySelectorAll('.page-scroll-container');
        scrollContainers.forEach(el => {
            el.scrollTop = 0;
        });
    }, [currentPage, pages, isTwoPageView]);

    const getPageData = useCallback((pageNum: number) => {
        if (pageNum < 1 || pageNum > 604) return [];
        const pageAyahs: any[] = [];
        for (let s = 1; s <= 114; s++) {
            const surah = quranJsonData.surahs[s-1];
            for (let a = 1; a <= surah.ayahs.length; a++) {
                const ayah = surah.ayahs[a-1];
                if (ayah.page === pageNum) {
                    pageAyahs.push({ ...ayah, surah: s, sNum: surah.number, sName: surah.name });
                } else if (ayah.page > pageNum) {
                    break;
                }
            }
        }
        return pageAyahs;
    }, []);

    // Handle scroll snapping detection
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;
        
        const container = scrollContainerRef.current;
        let closestPage = currentPage;
        let minDistance = Infinity;

        Array.from(container.children).forEach((child) => {
            const el = child as HTMLElement;
            // In 2-page view, the element is a spread containing an odd page
            const pageNumAttr = isTwoPageView ? el.getAttribute('data-page-group') : el.getAttribute('data-page');
            const pageNum = parseInt(pageNumAttr || '0', 10);
            if (!pageNum) return;
            
            const rect = el.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const elCenter = rect.left + rect.width / 2;
            const contCenter = containerRect.left + containerRect.width / 2;
            
            const distance = Math.abs(elCenter - contCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPage = pageNum;
            }
        });

        if (closestPage !== currentPage && minDistance < container.offsetWidth / 3) {
            if ((window as any).snapTimeout) clearTimeout((window as any).snapTimeout);
            (window as any).snapTimeout = setTimeout(() => {
                onPageChange(closestPage);
            }, 100);
        }
    }, [currentPage, onPageChange, isTwoPageView]);

    return (
        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex flex-row overflow-x-auto w-full h-full snap-x snap-mandatory hide-scrollbar"
            style={{ 
                scrollBehavior: 'smooth',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }}
        >
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
            
            {!isTwoPageView ? pages.map(pageNum => (
                <div 
                    key={pageNum}
                    data-page={pageNum}
                    className="snap-center flex-shrink-0 flex items-center justify-center h-full w-full"
                >
                    <div className="h-full w-full overflow-y-auto overflow-x-hidden page-scroll-container">
                        <MushafPage 
                            pageNum={pageNum} 
                            pageData={getPageData(pageNum)} 
                            highlightedAyahId={highlightedAyahId} 
                            onAyahClick={onAyahClick} 
                            onVerseClick={onVerseClick} 
                            onVerseLongPress={onVerseLongPress} 
                            onAyahLongPress={onAyahLongPress} 
                            onInteractionStart={onInteractionStart} 
                            onInteractionEnd={onInteractionEnd} 
                            settings={settings} 
                            currentTheme={currentTheme}
                            hideVerses={hideVerses}
                            memorizationSettings={memorizationSettings}
                            isPlaying={isPlaying}
                            isRecording={isRecording}
                            revealedAyahs={revealedAyahs}
                            tempRevealedAyah={tempRevealedAyah}
                            onSurahHeaderLongPress={onSurahHeaderLongPress}
                        />
                    </div>
                </div>
            )) : pages.filter(p => p % 2 !== 0).map(oddPage => (
                <div 
                    key={`spread-${oddPage}`}
                    data-page-group={oddPage}
                    className="snap-center flex-shrink-0 flex items-center justify-center h-full w-full px-2 py-2 gap-2 flex-row"
                >
                    {/* Odd page (Right) */}
                    <div className="h-full w-1/2 shadow-2xl rounded-xl overflow-y-auto overflow-x-hidden border page-scroll-container"
                         style={{ 
                             borderColor: currentTheme?.barBorder,
                             backgroundColor: currentTheme?.bg 
                         }}>
                        <MushafPage 
                            pageNum={oddPage} 
                            pageData={getPageData(oddPage)} 
                            highlightedAyahId={highlightedAyahId} 
                            onAyahClick={onAyahClick} 
                            onVerseClick={onVerseClick} 
                            onVerseLongPress={onVerseLongPress} 
                            onAyahLongPress={onAyahLongPress} 
                            onInteractionStart={onInteractionStart} 
                            onInteractionEnd={onInteractionEnd} 
                            settings={settings} 
                            currentTheme={currentTheme}
                            hideVerses={hideVerses}
                            memorizationSettings={memorizationSettings}
                            isPlaying={isPlaying}
                            isRecording={isRecording}
                            revealedAyahs={revealedAyahs}
                            tempRevealedAyah={tempRevealedAyah}
                            onSurahHeaderLongPress={onSurahHeaderLongPress}
                        />
                    </div>
                    {/* Even page (Left) */}
                    {oddPage + 1 <= 604 && (
                        <div className="h-full w-1/2 shadow-2xl rounded-xl overflow-y-auto overflow-x-hidden border page-scroll-container"
                             style={{ 
                                 borderColor: currentTheme?.barBorder,
                                 backgroundColor: currentTheme?.bg 
                             }}>
                            <MushafPage 
                                pageNum={oddPage + 1} 
                                pageData={getPageData(oddPage + 1)} 
                                highlightedAyahId={highlightedAyahId} 
                                onAyahClick={onAyahClick} 
                                onVerseClick={onVerseClick} 
                                onVerseLongPress={onVerseLongPress} 
                                onAyahLongPress={onAyahLongPress} 
                                onInteractionStart={onInteractionStart} 
                                onInteractionEnd={onInteractionEnd} 
                                settings={settings} 
                                currentTheme={currentTheme}
                                hideVerses={hideVerses}
                                memorizationSettings={memorizationSettings}
                                isPlaying={isPlaying}
                                isRecording={isRecording}
                                revealedAyahs={revealedAyahs}
                                tempRevealedAyah={tempRevealedAyah}
                                onSurahHeaderLongPress={onSurahHeaderLongPress}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
});

export default HorizontalPagingView;
