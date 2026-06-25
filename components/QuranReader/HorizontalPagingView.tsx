import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
    
    // Determine how many pages to show side-by-side
    const [isTwoPageView, setIsTwoPageView] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsTwoPageView(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const pages = useMemo(() => {
        const arr = [];
        if (isTwoPageView) {
            for (let i = 1; i <= 604; i += 2) arr.push(i);
        } else {
            for (let i = 1; i <= 604; i++) arr.push(i);
        }
        return arr;
    }, [isTwoPageView]);

    // Effect for "fit to screen" mode
    useEffect(() => {
        if (!settings?.fitToScreen || !scrollContainerRef.current) {
            // Reset transforms if disabled
            if (scrollContainerRef.current) {
                const pages = scrollContainerRef.current.querySelectorAll('.mushaf-page');
                pages.forEach(p => {
                    (p as HTMLElement).style.fontSize = '';
                });
                const containers = scrollContainerRef.current.querySelectorAll('.page-scroll-container');
                containers.forEach(c => {
                    (c as HTMLElement).style.overflowY = 'auto';
                    (c as HTMLElement).style.display = 'block';
                    (c as HTMLElement).style.alignItems = '';
                });
            }
            return;
        }

        const applyScaling = () => {
            if (!scrollContainerRef.current) return;
            const containers = scrollContainerRef.current.querySelectorAll('.page-scroll-container');
            containers.forEach(container => {
                const page = container.querySelector('.mushaf-page') as HTMLElement;
                if (!page) return;

                // Make container hidden overflow
                (container as HTMLElement).style.overflowY = 'hidden';
                (container as HTMLElement).style.display = 'flex';
                (container as HTMLElement).style.flexDirection = 'column';
                (container as HTMLElement).style.alignItems = 'center';
                (container as HTMLElement).style.justifyContent = 'center';

                // Get base font size from settings or computed
                const baseFontSize = settings?.fontSize ? (settings.fontSize * 16) : 27; // 1rem = 16px usually
                
                const containerHeight = container.clientHeight;
                const containerWidth = container.clientWidth;
                
                // Set initial size
                page.style.fontSize = `${baseFontSize}px`;
                let pageHeight = page.scrollHeight;
                
                // If it overflows, reduce font size iteratively until it fits
                if (pageHeight > containerHeight && containerHeight > 0) {
                    let low = 10;
                    let high = baseFontSize;
                    let best = baseFontSize;
                    
                    while (low <= high) {
                        const mid = Math.floor((low + high) / 2);
                        page.style.fontSize = `${mid}px`;
                        if (page.scrollHeight <= containerHeight) {
                            best = mid;
                            low = mid + 1; // Try bigger
                        } else {
                            high = mid - 1; // Try smaller
                        }
                    }
                    // Apply best size with a tiny margin of safety
                    page.style.fontSize = `${Math.max(10, best - 1)}px`;
                }
            });
        };

        // Apply scaling
        applyScaling();
        
        // Setup observer to watch for container size changes
        const resizeObserver = new ResizeObserver(() => {
            applyScaling();
        });
        
        if (scrollContainerRef.current) {
            resizeObserver.observe(scrollContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [settings?.fitToScreen, settings?.fontSize, currentPage, pages]);

    const lastBroadcastedPage = useRef(-1);

    // Track scroll programmatically to avoid jumpiness
    const isProgrammaticScroll = useRef(false);

    // Re-center scroll position when current page changes programmatically (e.g. from nav menu)
    useEffect(() => {
        if (lastBroadcastedPage.current === currentPage) {
            return;
        }
        lastBroadcastedPage.current = currentPage;

        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        // Find the group or page element
        const selector = isTwoPageView 
            ? `[data-page-group="${currentPage % 2 === 0 ? currentPage - 1 : currentPage}"]`
            : `[data-page="${currentPage}"]`;
        const currentEl = container.querySelector(selector) as HTMLElement;
        if (currentEl) {
            const rect = currentEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const elCenter = rect.left + rect.width / 2;
            const contCenter = containerRect.left + containerRect.width / 2;
            
            if (Math.abs(elCenter - contCenter) > 10) {
                isProgrammaticScroll.current = true;
                // Scroll to current element instantly
                currentEl.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
                setTimeout(() => { isProgrammaticScroll.current = false; }, 100);
            }
        }
        
        // Reset vertical scroll position of the page containers
        const scrollContainers = container.querySelectorAll('.page-scroll-container');
        scrollContainers.forEach(el => {
            el.scrollTop = 0;
        });
    }, [currentPage, isTwoPageView]);

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
                lastBroadcastedPage.current = closestPage;
                onPageChange(closestPage);
            }, 50);
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
            
            {!isTwoPageView ? pages.map(pageNum => {
                const isVisible = Math.abs(pageNum - currentPage) <= 15;
                return (
                <div 
                    key={pageNum}
                    data-page={pageNum}
                    className="snap-center snap-always flex-shrink-0 flex items-center justify-center h-full w-full"
                >
                    <div className="h-full w-full overflow-y-auto overflow-x-hidden page-scroll-container">
                        {isVisible && (
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
                        )}
                    </div>
                </div>
            )}) : pages.filter(p => p % 2 !== 0).map(oddPage => {
                const isVisible = Math.abs(oddPage - currentPage) <= 16 || Math.abs((oddPage + 1) - currentPage) <= 16;
                return (
                <div 
                    key={`spread-${oddPage}`}
                    data-page-group={oddPage}
                    className="snap-center snap-always flex-shrink-0 flex items-center justify-center h-full w-full px-2 py-2 gap-2 flex-row"
                >
                    {/* Odd page (Right) */}
                    <div className="h-full w-1/2 shadow-2xl rounded-xl overflow-y-auto overflow-x-hidden border page-scroll-container"
                         style={{ 
                             borderColor: currentTheme?.barBorder,
                             backgroundColor: currentTheme?.bg 
                         }}>
                        {isVisible && (
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
                        )}
                    </div>
                    {/* Even page (Left) */}
                    {oddPage + 1 <= 604 && (
                        <div className="h-full w-1/2 shadow-2xl rounded-xl overflow-y-auto overflow-x-hidden border page-scroll-container"
                             style={{ 
                                 borderColor: currentTheme?.barBorder,
                                 backgroundColor: currentTheme?.bg 
                             }}>
                            {isVisible && (
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
                            )}
                        </div>
                    )}
                </div>
            )})}
        </div>
    );
});

export default HorizontalPagingView;
