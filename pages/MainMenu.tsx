
import React, { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import WhatsAppButton from '../components/WhatsAppButton';
import InteractiveBackground from '../components/InteractiveBackground';
import { verses } from '../data/mainMenuData';
import MenuCustomizationModal from '../components/MenuCustomizationModal';
import { registerBackInterceptor } from '../hooks/useBackButton';
import VerseSection from '../components/MainMenu/VerseSection';
import TitleSection from '../components/MainMenu/TitleSection';
import GridSection from '../components/MainMenu/GridSection';
import FloatingNeonTicker from '../components/FloatingNeonTicker';

const DEFAULT_MENU_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'adia', label: "🤲 الأدعية", className: "h-10", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "h-10", colorIndex: 1 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "h-10", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "h-10", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "h-10", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "h-10", colorIndex: 1 },
    { id: 'qibla', label: "🧭 القبلة", className: "h-10", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "h-10", colorIndex: 1 },
    { id: 'more', label: "✨ المزيد", className: "col-span-2 h-10 flex justify-center", colorIndex: 0 },
];

function MainMenu({ onNavigate, onOpenThemes }) {
  const [currentVerse] = useState(() => {
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
  });
  const { theme, themeKey } = useTheme();
  const [visibleItems, setVisibleItems] = useState<string[]>(() => {
    const savedVisible = localStorage.getItem('visibleMenuItems');
    return savedVisible ? JSON.parse(savedVisible) : DEFAULT_MENU_ITEMS.map(i => i.id);
  });
  const [menuItems, setMenuItems] = useState(() => {
    const savedLayout = localStorage.getItem('menuLayout');
    if (savedLayout) {
        try {
            const parsed = JSON.parse(savedLayout);
            const updated = parsed.map((item: any) => {
                if (item.id === 'calculators' || item.id === 'calendar') {
                    const { customColor, ...rest } = item;
                    return rest;
                }
                if (item.id === 'more' && !item.className.includes('flex justify-center')) {
                    return { ...item, className: "col-span-2 h-10 flex justify-center" };
                }
                return item;
            });
            
            const qiblaIndex = updated.findIndex((i: any) => i.id === 'qibla');
            const hisnIndex = updated.findIndex((i: any) => i.id === 'hisn-muslim');
            
            if (hisnIndex > qiblaIndex + 2) {
                return DEFAULT_MENU_ITEMS;
            }
            return updated;
        } catch (e) {
            return DEFAULT_MENU_ITEMS;
        }
    }
    return DEFAULT_MENU_ITEMS;
  });
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [verseFontSize, setVerseFontSize] = useState(() => {
      const saved = localStorage.getItem('mainMenuVerseFontSize');
      return saved ? parseFloat(saved) : 1.25;
  });

  useEffect(() => {
    // Check if we need to update layout in storage (migration/fix)
    const savedLayout = localStorage.getItem('menuLayout');
    if (savedLayout) {
        try {
            const parsed = JSON.parse(savedLayout);
            let changed = false;
            const updated = parsed.map((item: any) => {
                if (item.id === 'calculators' || item.id === 'calendar') {
                    if (item.customColor) {
                        const { customColor, ...rest } = item;
                        changed = true;
                        return rest;
                    }
                }
                if (item.id === 'more' && !item.className.includes('flex justify-center')) {
                    changed = true;
                    return { ...item, className: "col-span-2 h-10 flex justify-center" };
                }
                return item;
            });
            
            if (changed) {
                localStorage.setItem('menuLayout', JSON.stringify(updated));
                setMenuItems(updated);
            }
        } catch (e) {
            // Error handled in initializer
        }
    }
  }, []);

  const handleCancelEdit = () => {
      const savedLayout = localStorage.getItem('menuLayout');
      if (savedLayout) {
          setMenuItems(JSON.parse(savedLayout));
      } else {
          setMenuItems(DEFAULT_MENU_ITEMS);
      }
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  useEffect(() => {
      const interceptor = () => {
          if (isCustomizationOpen) {
              setIsCustomizationOpen(false);
              return true;
          }
          if (isEditMode) {
              handleCancelEdit();
              return true;
          }
          return false;
      };
      const unregister = registerBackInterceptor(interceptor);
      return unregister;
  }, [isCustomizationOpen, isEditMode]);

  const handleSaveCustomization = (selectedIds: string[]) => {
      setVisibleItems(selectedIds);
      localStorage.setItem('visibleMenuItems', JSON.stringify(selectedIds));
  };

  const handleSaveLayout = () => {
      localStorage.setItem('menuLayout', JSON.stringify(menuItems));
      setIsEditMode(false);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleResetLayout = () => {
      setMenuItems(DEFAULT_MENU_ITEMS);
      localStorage.removeItem('menuLayout');
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div className="fade-in">
      <InteractiveBackground />
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden pb-32">
          <div className="main-layout px-4 h-full flex flex-col" style={{ fontFamily: theme.font }}>
              
              <VerseSection 
                  currentVerse={currentVerse}
                  verseFontSize={verseFontSize}
                  setVerseFontSize={setVerseFontSize}
                  setIsCustomizationOpen={setIsCustomizationOpen}
                  theme={theme}
                  themeKey={themeKey}
              />

              <TitleSection 
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                  handleSaveLayout={handleSaveLayout}
                  handleResetLayout={handleResetLayout}
                  handleCancelEdit={handleCancelEdit}
                  theme={theme}
                  themeKey={themeKey}
              />

              <GridSection 
                  menuItems={menuItems}
                  setMenuItems={setMenuItems}
                  visibleItems={visibleItems}
                  isEditMode={isEditMode}
                  onNavigate={(id) => {
                      if (id === 'more') onNavigate('more-menu');
                      else onNavigate(id);
                  }}
                  theme={theme}
                  themeKey={themeKey}
                  DEFAULT_MENU_ITEMS={DEFAULT_MENU_ITEMS}
              />

              {/* Footer/Save Button */}
              {!isEditMode && (
                  <div className="themed-card p-2.5 rounded-2xl text-center w-full max-w-sm mx-auto mt-4 mb-4 relative">
                      <FloatingNeonTicker />
                      <p className="text-[14px] font-bold" style={{ color: themeKey === 'default' ? '#10b981' : theme.textColor }}>
                          اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة
                      </p>
                  </div>
              )}
          </div>
        </div>
      </div>

      <BottomBar onHomeClick={() => {}} onThemesClick={onOpenThemes} showHome={false} showThemes={true} />
      <WhatsAppButton />
      
      <MenuCustomizationModal 
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        allItems={DEFAULT_MENU_ITEMS}
        visibleIds={visibleItems}
        onSave={handleSaveCustomization}
      />
    </div>
  );
}

export default MainMenu;
