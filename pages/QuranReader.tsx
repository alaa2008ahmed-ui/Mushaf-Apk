import React, { FC } from 'react';
import './QuranReader.css'; 
import { useQuranReaderLogic } from '../hooks/useQuranReaderLogic';
import QuranHeader from '../components/QuranReader/QuranHeader';
import QuranFooter from '../components/QuranReader/QuranFooter';
import FloatingMenu from '../components/QuranReader/FloatingMenu';
import MushafPage from '../components/QuranReader/MushafPage';
import Toast from '../components/QuranReader/Toast';
import ReadingTimer from '../components/QuranReader/ReadingTimer';
import MarkerNotification from '../components/QuranReader/MarkerNotification';
import { QuranReaderModals } from '../components/QuranReader/QuranReaderModals';
import { toArabic } from '../components/QuranReader/constants';

const QuranReader: FC<{ onBack: () => void, onNavigate: (pageId: string) => void, initialLandscape?: boolean }> = ({ onBack, onNavigate, initialLandscape = false }) => {
    const logic = useQuranReaderLogic(onBack, onNavigate, initialLandscape);

    const {
        isLandscape,
        currentTheme,
        settings,
        quranData,
        visiblePages,
        currentAyah,
        highlightedAyahId,
        isTransparentMode,
        isHideToolbarsEnabled,
        lastInteractionType,
        activeModals,
        isFloatingMenuOpen,
        setIsFloatingMenuOpen,
        isLandscapeUIHidden,
        autoScrollState,
        isPlaying,
        isAudioLoading,
        playingAyah,
        isPageInputActive,
        pageInput,
        mushafContentRef,
        floatingMenuRef,
        menuButtonRef,
        pageInputRef,
        toast,
        markerNotification,
        sajdahCardInfo,
        isAutoScrollSettingsOpen,
        setIsAutoScrollSettingsOpen,
        tafseerInfo,
        tafseerSelectionInfo,
        toolbarColors,
        showToast,
        handleToastClose,
        stopAudio,
        playAudio,
        closeModal,
        openModal,
        jumpToAyah,
        jumpToPage,
        toggleAutoScroll,
        startAutoScroll,
        stopAutoScroll,
        saveBookmark,
        deleteBookmark,
        handleVoiceCommand,
        setIsPageInputActive,
        setPageInput,
        setAyahContextMenu,
        setAyahContextColorField,
        setToolbarColors,
        setCurrentTheme,
        setIsTransparentMode,
        setIsHideToolbarsEnabled,
        setUseTajweed,
        setShowSajdahCard,
        setTafseerInfo,
        setTafseerSelectionInfo,
        handleCloseSajdahCard,
        handleMushafTypeSelect,
        handleTafseerSelect,
        playSurah,
        updateSetting,
        handleAyahClick,
        handleAyahTextClick,
        handleSajdahVisible,
        handlePageVisible,
        handleScroll,
        handleFloatingMenuToggle,
        handlePageInputChange,
        handlePageInputSubmit,
        handlePageInputBlur,
        handlePageInputKeyDown,
        handleContextMenu,
        handleContextColorSelect,
        handleContextColorFieldSelect,
        handleContextReset,
        handleContextSave,
        handleContextCancel,
        handleToolbarColorChange,
        handleToolbarColorReset,
        handleToolbarColorResetAll,
        handleToolbarColorSave,
        handleToolbarColorCancel,
        handleToolbarColorFieldSelect,
        handleToolbarColorSelect
    } = logic;

    const showToolbars = !isHideToolbarsEnabled || !autoScrollState.isActive || autoScrollState.isPaused;

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
                    currentAyah={currentAyah}
                    quranData={quranData}
                    toolbarColors={toolbarColors}
                    onBack={onBack}
                    onOpenModal={openModal}
                    isPageInputActive={isPageInputActive}
                    pageInput={pageInput}
                    onPageInputChange={setPageInput}
                    onPageInputSubmit={handlePageInputSubmit}
                    onPageInputBlur={handlePageInputBlur}
                    onPageInputKeyDown={handlePageInputKeyDown}
                    setIsPageInputActive={setIsPageInputActive}
                    pageInputRef={pageInputRef}
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
                        quranData={quranData}
                        settings={settings}
                        highlightedAyahId={highlightedAyahId}
                        onAyahClick={handleAyahClick}
                        onAyahTextClick={handleAyahTextClick}
                        onAyahContextMenu={handleContextMenu}
                        onSajdahVisible={handleSajdahVisible}
                        onPageVisible={handlePageVisible}
                    />
                ))}
            </div>

            {showToolbars && !isLandscapeUIHidden && (
                <QuranFooter 
                    currentAyah={currentAyah}
                    isPlaying={isPlaying}
                    isAudioLoading={isAudioLoading}
                    autoScrollState={autoScrollState}
                    toolbarColors={toolbarColors}
                    onToggleAudio={() => isPlaying ? stopAudio() : playAudio(currentAyah.s, currentAyah.a)}
                    onToggleAutoScroll={toggleAutoScroll}
                    onOpenAutoScrollSettings={() => setIsAutoScrollSettingsOpen(true)}
                    onOpenModal={openModal}
                />
            )}

            <FloatingMenu 
                isOpen={isFloatingMenuOpen}
                onToggle={handleFloatingMenuToggle}
                onOpenModal={openModal}
                toolbarColors={toolbarColors}
                menuRef={floatingMenuRef}
                buttonRef={menuButtonRef}
            />

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
                setSettings={logic.setSettings}
                updateSetting={updateSetting}
                toolbarColors={toolbarColors}
                setToolbarColors={setToolbarColors}
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                isTransparentMode={isTransparentMode}
                setIsTransparentMode={setIsTransparentMode}
                isHideToolbarsEnabled={isHideToolbarsEnabled}
                setIsHideToolbarsEnabled={setIsHideToolbarsEnabled}
                useTajweed={logic.useTajweed}
                handleMushafTypeSelect={handleMushafTypeSelect}
                showSajdahCard={logic.showSajdahCard}
                setShowSajdahCard={setShowSajdahCard}
                modeSuffix={logic.modeSuffix}
                isLandscapeRef={{ current: isLandscape }}
                bookmarks={logic.bookmarks}
                deleteBookmark={deleteBookmark}
                jumpToAyah={jumpToAyah}
                tafseerInfo={tafseerInfo}
                setTafseerInfo={setTafseerInfo}
                isTafseerLoading={logic.isTafseerLoading}
                tafseerSelectionInfo={tafseerSelectionInfo}
                setTafseerSelectionInfo={setTafseerSelectionInfo}
                handleTafseerSelect={handleTafseerSelect}
                ayahContextMenu={logic.ayahContextMenu}
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
