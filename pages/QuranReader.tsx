import React, { FC } from 'react';
import { Play, Pause } from 'lucide-react';
import './QuranReader.css'; 
import { useQuranReaderLogic } from '../hooks/useQuranReaderLogic';
import QuranHeader from '../components/QuranReader/QuranHeader';
import QuranFooter from '../components/QuranReader/QuranFooter';
import MushafPage from '../components/QuranReader/MushafPage';
import Toast from '../components/QuranReader/Toast';
import ReadingTimer from '../components/QuranReader/ReadingTimer';
import MarkerNotification from '../components/QuranReader/MarkerNotification';
import { QuranReaderModals } from '../components/QuranReader/QuranReaderModals';

const QuranReader: FC<{ onBack: () => void, onNavigate: (pageId: string) => void, initialLandscape?: boolean }> = ({ onBack, onNavigate, initialLandscape = false }) => {
    const logic = useQuranReaderLogic(onBack, onNavigate, initialLandscape);

    const {
        isLandscape, isLandscapeRef, modeSuffix, useTajweed, setUseTajweed, quranData, pagesData,
        surahName, page, juz, onNavigate: logicOnNavigate,
        isLoading, setIsLoading, loadingStatus, setLoadingStatus, loadingProgress, setLoadingProgress,
        visiblePages, setVisiblePages, currentAyah, setCurrentAyah, highlightedAyahId, setHighlightedAyahId,
        isTransparentMode, setIsTransparentMode, isHideToolbarsEnabled, setIsHideToolbarsEnabled,
        lastInteractionType, setLastInteractionType,
        activeModals, setActiveModals, isFloatingMenuOpen, setIsFloatingMenuOpen,
        ayahContextMenu, setAyahContextMenu, ayahContextColorField, setAyahContextColorField,
        isLandscapeUIHidden, setIsLandscapeUIHidden, settings, setSettings,
        currentTheme, setCurrentTheme, bookmarks, setBookmarks,
        autoScrollState, setAutoScrollState,
        isPlaying, setIsPlaying, isAudioLoading, setIsAudioLoading, playingAyah, setPlayingAyah,
        isTafseerLoading, setIsTafseerLoading, isPageInputActive, setIsPageInputActive,
        pageInput, setPageInput, mushafContentRef,
        floatingMenuRef, menuButtonRef, pageInputRef,
        toast, reciterToast, markerNotification, sajdahCardInfo,
        isAutoScrollSettingsOpen, setIsAutoScrollSettingsOpen,
        tafseerInfo, setTafseerInfo, tafseerSelectionInfo, setTafseerSelectionInfo,
        toolbarColors, setToolbarColors, showToast, handleToastClose,
        stopAudio, playAudio, closeModal, openModal,
        jumpToAyah, jumpToPage,
        toggleAutoScroll, startAutoScroll,
        stopAutoScroll, saveBookmark, deleteBookmark,
        handleVoiceCommand, PREDEFINED_COLORS, renderCheckerboard,
        handleMushafTypeSelect, handleTafseerSelect,
        handleVerseClick, handleVerseLongPress, handleAyahLongPress,
        playSurah, updateSetting, handleAyahClick, handleAyahTextClick,
        handleSajdahVisible, handlePageVisible, handleScroll, handleFloatingMenuToggle,
        handlePageInputChange, handlePageInputSubmit, handlePageInputBlur,
        handlePageInputKeyDown, handleContextMenu, handleContextColorSelect,
        handleContextColorFieldSelect, handleContextReset, handleContextSave,
        handleContextCancel, handleToolbarColorChange, handleToolbarColorReset,
        handleToolbarColorResetAll, handleToolbarColorSave, handleToolbarColorCancel,
        handleToolbarColorFieldSelect, handleToolbarColorSelect,
        getToolbarStyle,
        showSajdahCard, setShowSajdahCard, handleCloseSajdahCard
    } = logic;

    const showToolbars = !isHideToolbarsEnabled || !autoScrollState.isActive || autoScrollState.isPaused;

    const renderPlayButtonIcon = () => {
        if (isAudioLoading) return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;
        return isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />;
    };

    const handlePlayButtonPointerDown = (e: React.PointerEvent) => {
        // Implementation for play button pointer down
    };

    const handlePlayButtonPointerUp = (e: React.PointerEvent) => {
        if (isPlaying || isAudioLoading) stopAudio();
        else playAudio(currentAyah.s, currentAyah.a);
    };

    const handlePlayButtonPointerLeave = () => {
        // Implementation for play button pointer leave
    };

    const handlePageButtonClick = () => {
        setIsPageInputActive(true);
    };

    const handleBookmarkButtonPointerDown = (e: any) => {};
    const handleBookmarkButtonPointerUp = (e: any) => saveBookmark();
    const handleBookmarkButtonPointerLeave = () => {};

    const handleAutoScrollButtonPointerDown = (e: any) => {};
    const handleAutoScrollButtonPointerUp = (e: any) => toggleAutoScroll(setIsFloatingMenuOpen, showToast);
    const handleAutoScrollButtonPointerLeave = () => {};

    if (!quranData) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="text-purple-800 font-bold">جاري تحميل المصحف...</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`quran-reader-container ${isLandscape ? 'landscape-mode' : 'portrait-mode'} ${currentTheme.id}`}
            style={{ 
                backgroundColor: settings.bgColor,
                color: settings.textColor,
                fontFamily: settings.fontFamily,
                '--quran-text-color': settings.textColor,
                '--quran-bg-color': settings.bgColor,
                '--quran-highlight-color': settings.highlightTextColor,
                '--quran-font-family': settings.fontFamily,
                '--quran-font-size': `${settings.fontSize}rem`
            } as React.CSSProperties}
        >
            {showToolbars && !isLandscapeUIHidden && (
                <QuranHeader 
                    isPageInputActive={isPageInputActive}
                    pageInputRef={pageInputRef}
                    pageInput={pageInput}
                    handlePageInputChange={handlePageInputChange}
                    handlePageInputBlur={handlePageInputBlur}
                    handlePageInputKeyDown={handlePageInputKeyDown}
                    handlePageButtonClick={handlePageButtonClick}
                    page={page}
                    surahName={surahName}
                    currentAyah={currentAyah}
                    juz={juz}
                    openModal={openModal}
                    currentTheme={currentTheme}
                    getToolbarStyle={getToolbarStyle}
                    handlePlayButtonPointerDown={handlePlayButtonPointerDown}
                    handlePlayButtonPointerUp={handlePlayButtonPointerUp}
                    handlePlayButtonPointerLeave={handlePlayButtonPointerLeave}
                    renderPlayButtonIcon={renderPlayButtonIcon}
                    reciterToast={reciterToast}
                />
            )}

            <div 
                ref={mushafContentRef}
                className={`mushaf-content ${isTransparentMode ? 'transparent-mode' : ''} ${isLandscapeUIHidden ? 'ui-hidden' : ''}`}
                onScroll={handleScroll}
                onClick={() => {
                    if (isFloatingMenuOpen) setIsFloatingMenuOpen(false);
                    if (isAutoScrollSettingsOpen) setIsAutoScrollSettingsOpen(false);
                }}
            >
                {visiblePages.map(pageNum => (
                    <MushafPage 
                        key={pageNum}
                        pageNum={pageNum}
                        pageData={pagesData[pageNum] || []}
                        settings={settings}
                        highlightedAyahId={highlightedAyahId}
                        onAyahClick={handleAyahClick}
                        onVerseClick={handleVerseClick}
                        onAyahLongPress={handleContextMenu}
                    />
                ))}
            </div>

            {showToolbars && !isLandscapeUIHidden && (
                <QuranFooter 
                    currentTheme={currentTheme}
                    getToolbarStyle={getToolbarStyle}
                    setIsFloatingMenuOpen={setIsFloatingMenuOpen}
                    isFloatingMenuOpen={isFloatingMenuOpen}
                    floatingMenuRef={floatingMenuRef}
                    openModal={openModal}
                    menuButtonRef={menuButtonRef}
                    handleBookmarkButtonPointerDown={handleBookmarkButtonPointerDown}
                    handleBookmarkButtonPointerUp={handleBookmarkButtonPointerUp}
                    handleBookmarkButtonPointerLeave={handleBookmarkButtonPointerLeave}
                    handleAutoScrollButtonPointerDown={handleAutoScrollButtonPointerDown}
                    handleAutoScrollButtonPointerUp={handleAutoScrollButtonPointerUp}
                    handleAutoScrollButtonPointerLeave={handleAutoScrollButtonPointerLeave}
                    autoScrollState={autoScrollState}
                    onBack={onBack}
                    initialLandscape={isLandscape}
                    onNavigate={onNavigate}
                />
            )}

            <ReadingTimer isActive={autoScrollState.isActive && !autoScrollState.isPaused} />
            
            <MarkerNotification 
                show={markerNotification.show}
                type={markerNotification.type}
                text={markerNotification.text}
            />

            <Toast 
                show={toast.show}
                message={toast.message}
                onClose={handleToastClose}
            />

            <QuranReaderModals 
                activeModals={activeModals}
                closeModal={closeModal}
                openModal={openModal}
                settings={settings}
                setSettings={setSettings}
                updateSetting={updateSetting}
                toolbarColors={toolbarColors}
                setToolbarColors={setToolbarColors}
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                isTransparentMode={isTransparentMode}
                setIsTransparentMode={setIsTransparentMode}
                isHideToolbarsEnabled={isHideToolbarsEnabled}
                setIsHideToolbarsEnabled={setIsHideToolbarsEnabled}
                useTajweed={useTajweed}
                handleMushafTypeSelect={handleMushafTypeSelect}
                showSajdahCard={showSajdahCard}
                setShowSajdahCard={setShowSajdahCard}
                modeSuffix={modeSuffix}
                isLandscapeRef={isLandscapeRef}
                bookmarks={bookmarks}
                deleteBookmark={deleteBookmark}
                jumpToAyah={jumpToAyah}
                tafseerInfo={tafseerInfo}
                setTafseerInfo={setTafseerInfo}
                isTafseerLoading={isTafseerLoading}
                tafseerSelectionInfo={tafseerSelectionInfo}
                setTafseerSelectionInfo={setTafseerSelectionInfo}
                handleTafseerSelect={handleTafseerSelect}
                ayahContextMenu={ayahContextMenu}
                setAyahContextMenu={setAyahContextMenu}
                playAudio={playAudio}
                saveBookmark={saveBookmark}
                handleCloseSajdahCard={handleCloseSajdahCard}
                sajdahCardInfo={sajdahCardInfo}
                showToast={showToast}
                quranData={quranData}
                playSurah={playSurah}
            />
        </div>
    );
};

export default QuranReader;
