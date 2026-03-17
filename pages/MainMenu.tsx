
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import WhatsAppButton from '../components/WhatsAppButton';
import InteractiveBackground from '../components/InteractiveBackground';
import { verses } from '../data/mainMenuData';
import MenuCustomizationModal from '../components/MenuCustomizationModal';
import { registerBackInterceptor } from '../hooks/useBackButton';

const DEFAULT_MENU_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'adia', label: "🤲 الأدعية", className: "h-10", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "h-10", colorIndex: 1 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "h-10", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "h-10", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "h-10", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "h-10", colorIndex: 0 },
    { id: 'qibla', label: "🧭 القبلة", className: "h-10", colorIndex: 0 },
    { id: 'calculators', label: "🧮 الحاسبة الشرعية", className: "h-10", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "h-10", colorIndex: 1 },
    { id: 'nawawi', label: "📚 الأربعون النووية", className: "h-10", colorIndex: 1 },
];

interface NavButtonProps {
    label: string;
    onClick: () => void;
    className?: string;
    color?: string;
    border?: string;
    isEditMode?: boolean;
    onResize?: (e: React.MouseEvent) => void;
}

const NavButton: React.FC<NavButtonProps & { isGlass?: boolean, btnText?: string }> = ({ label, onClick, className, color, border, isEditMode, onResize, isGlass, btnText }) => (
    <div className={`h-full ${className} relative group`}>
        <button 
            onClick={onClick} 
            className={`btn-3d-effect w-full rounded-2xl py-3 px-1 font-bold relative text-sm h-full ${isEditMode ? 'cursor-move animate-pulse' : ''}`}
            style={{ 
                background: isGlass ? 'transparent' : color, 
                color: btnText || '#FFFFFF',
                border: border || (isGlass ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'),
                boxShadow: isGlass ? '0 2px 10px rgba(0,0,0,0.1)' : undefined,
                textShadow: isGlass ? '0 2px 4px rgba(0,0,0,0.8)' : undefined
            }}
            disabled={isEditMode}
        >
            {label}
        </button>
        {isEditMode && (
            <button 
                onClick={onResize}
                className="absolute top-1 left-1 bg-white/20 hover:bg-white/40 rounded-full p-1.5 z-20 transition-colors"
                title="تغيير الحجم"
            >
                <i className="fa-solid fa-expand text-white text-xs"></i>
            </button>
        )}
    </div>
);

function MainMenu({ onNavigate, onOpenThemes }) {
  const [currentVerse, setCurrentVerse] = useState(verses[0]);
  const { theme, themeKey } = useTheme();
  const [visibleItems, setVisibleItems] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU_ITEMS);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [verseFontSize, setVerseFontSize] = useState(() => {
      const saved = localStorage.getItem('mainMenuVerseFontSize');
      return saved ? parseFloat(saved) : 1.25;
  });
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const titleLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialDistanceRef = useRef<number | null>(null);
  const initialFontSizeRef = useRef<number>(1.25);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * verses.length);
    setCurrentVerse(verses[randomIndex]);

    // Load saved preferences
    const savedVisible = localStorage.getItem('visibleMenuItems');
    if (savedVisible) {
        setVisibleItems(JSON.parse(savedVisible));
    } else {
        setVisibleItems(DEFAULT_MENU_ITEMS.map(i => i.id));
    }

    const savedLayout = localStorage.getItem('menuLayout');
    if (savedLayout) {
        try {
            const parsed = JSON.parse(savedLayout);
            let changed = false;
            const updated = parsed.map((item: any) => {
                // Remove hardcoded custom colors to allow theme colors to take effect
                if (item.id === 'calculators' || item.id === 'calendar') {
                    const { customColor, ...rest } = item;
                    return rest;
                }
                return item;
            });
            
            const qiblaIndex = updated.findIndex((i: any) => i.id === 'qibla');
            const hisnIndex = updated.findIndex((i: any) => i.id === 'hisn-muslim');
            
            // If hisn-muslim is not right after qibla, force reset to apply new order
            if (hisnIndex > qiblaIndex + 2) {
                localStorage.removeItem('menuLayout');
                setMenuItems(DEFAULT_MENU_ITEMS);
                return;
            }

            if (changed) {
                localStorage.setItem('menuLayout', JSON.stringify(updated));
            }
            setMenuItems(updated);
        } catch (e) {
            setMenuItems(DEFAULT_MENU_ITEMS);
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

  const handleResize = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuItems(prev => prev.map(item => {
          if (item.id === id) {
              const isLarge = item.className.includes('col-span-2');
              const newClass = isLarge 
                  ? item.className.replace('col-span-2', '').trim() 
                  : `${item.className} col-span-2`.trim();
              return { ...item, className: newClass };
          }
          return item;
      }));
  };

  const handleDragStart = () => {
      if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleDragEnd = (event: any, info: any, draggedId: string) => {
      // Find the item currently under the cursor using geometry
      // This is more reliable than elementFromPoint which might hit the dragged element itself
      const point = info.point;
      const items = document.querySelectorAll('[data-item-id]');
      let targetId: string | null = null;

      for (let i = 0; i < items.length; i++) {
          const el = items[i];
          const id = el.getAttribute('data-item-id');
          if (id === draggedId) continue;

          const rect = el.getBoundingClientRect();
          if (
              point.x >= rect.left &&
              point.x <= rect.right &&
              point.y >= rect.top &&
              point.y <= rect.bottom
          ) {
              targetId = id;
              break;
          }
      }

      if (targetId) {
          const fromIndex = menuItems.findIndex(i => i.id === draggedId);
          const toIndex = menuItems.findIndex(i => i.id === targetId);
          
          if (fromIndex !== -1 && toIndex !== -1) {
              const newItems = [...menuItems];
              const [movedItem] = newItems.splice(fromIndex, 1);
              newItems.splice(toIndex, 0, movedItem);
              setMenuItems(newItems);
              if (navigator.vibrate) navigator.vibrate(20);
          }
      }
  };

  // Verse Long Press & Pinch Zoom Logic
  const startPress = (e: React.SyntheticEvent) => {
      isLongPressRef.current = false;
      longPressTimerRef.current = setTimeout(() => {
          isLongPressRef.current = true;
          setIsCustomizationOpen(true);
          if (navigator.vibrate) navigator.vibrate(50);
      }, 600);
  };

  const cancelPress = () => {
      if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
      }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
          cancelPress();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
          initialDistanceRef.current = dist;
          initialFontSizeRef.current = verseFontSize;
      } else if (e.touches.length === 1) {
          startPress(e);
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 2 && initialDistanceRef.current !== null) {
          cancelPress();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
          
          const scale = dist / initialDistanceRef.current;
          let newSize = initialFontSizeRef.current * scale;
          
          newSize = Math.max(0.8, Math.min(newSize, 3.0));
          setVerseFontSize(newSize);
      } else {
          cancelPress();
      }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
          if (initialDistanceRef.current !== null) {
              localStorage.setItem('mainMenuVerseFontSize', verseFontSize.toString());
              initialDistanceRef.current = null;
          }
      }
      cancelPress();
  };

  // Title Long Press Logic (for Edit Mode)
  const startTitlePress = () => {
      titleLongPressTimerRef.current = setTimeout(() => {
          setIsEditMode(true);
          if (navigator.vibrate) navigator.vibrate(100);
      }, 800);
  };

  const cancelTitlePress = () => {
      if (titleLongPressTimerRef.current) {
          clearTimeout(titleLongPressTimerRef.current);
          titleLongPressTimerRef.current = null;
      }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!isLongPressRef.current) {
          setIsCustomizationOpen(true);
      }
  };

  return (
    <>
      <InteractiveBackground />
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden pb-32 fade-in">
          <div className="main-layout px-4 h-full flex flex-col" style={{ fontFamily: theme.font }}>
              
              {/* Verse Section */}
              <div 
                className="text-center pt-12 select-none cursor-pointer active:scale-95 transition-transform touch-manipulation"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onMouseDown={startPress}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onContextMenu={handleContextMenu}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                  <p className="font-bold leading-tight mb-1 pointer-events-none transition-all duration-75" style={{ color: theme.textColor === '#000000' ? theme.palette[0] : theme.textColor, fontSize: `${verseFontSize}rem` }}>
                      {currentVerse.text}
                  </p>
                  <p className="text-[12px] font-bold text-left pl-8 pointer-events-none transition-all duration-75" style={{ color: theme.textColor === '#000000' ? theme.palette[1] : theme.textColor, fontSize: `${Math.max(0.75, verseFontSize * 0.6)}rem` }}>
                      {`(${currentVerse.surah}: ${currentVerse.number})`}
                  </p>
              </div>

              {/* Title Section */}
              <div 
                  className="text-center mt-6 select-none relative"
                  onTouchStart={startTitlePress}
                  onTouchEnd={cancelTitlePress}
                  onMouseDown={startTitlePress}
                  onMouseUp={cancelTitlePress}
                  onMouseLeave={cancelTitlePress}
              >
                  <h1 className={`text-4xl font-black tracking-tight transition-transform ${isEditMode ? 'scale-110 text-yellow-400' : ''}`} style={{ color: isEditMode ? undefined : theme.textColor }}>
                      مُصْحَفُ أَحْمَدَ وَلَيْلَى
                  </h1>
                  <p className="text-[16px] font-black mt-3" style={{ color: themeKey === 'default' ? '#8b5cf6' : theme.textColor }}>
                      {isEditMode ? 'اسحب الأزرار لترتيبها' : 'نرجوا الدعاء لهم بالرحمة والمغفرة'}
                  </p>
                  
                  {isEditMode && (
                      <div className="flex justify-center gap-2 mt-4 mb-2">
                          <button 
                              onClick={handleSaveLayout}
                              className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition-transform"
                          >
                              حفظ
                          </button>
                          <button 
                              onClick={handleResetLayout}
                              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition-transform"
                          >
                              الافتراضي
                          </button>
                          <button 
                              onClick={handleCancelEdit}
                              className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition-transform"
                          >
                              إلغاء
                          </button>
                      </div>
                  )}
              </div>

              {/* Grid Section */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto flex-grow content-center relative mt-6">
                  {menuItems.filter(item => visibleItems.includes(item.id)).map(item => (
                      <motion.div
                          layout
                          key={item.id}
                          data-item-id={item.id}
                          className={`${item.className} relative`}
                          drag={isEditMode}
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          dragElastic={1}
                          whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing', opacity: 0.8 }}
                          onDragStart={handleDragStart}
                          onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
                      >
                          <NavButton 
                            label={item.label} 
                            onClick={() => !isEditMode && onNavigate(item.id)} 
                            className="w-full h-full"
                            color={
                                (item.id === 'tasbeeh' && themeKey === 'default') ? '#10b981' : 
                                (item.id === 'calendar' && themeKey === 'default') ? '#10b981' : 
                                (item.id === 'qibla' && themeKey === 'default') ? '#8b5cf6' : 
                                (item.id === 'calculators' && themeKey === 'default') ? '#8b5cf6' : 
                                (item.id === 'hisn-muslim' && themeKey === 'default') ? '#8b5cf6' : 
                                (item.id === 'salah-adhkar' && themeKey === 'default') ? '#8b5cf6' : 
                                (item.customColor || theme.palette[item.colorIndex])
                            } 
                            border={theme.btnBorder} 
                            isEditMode={isEditMode}
                            onResize={(e) => handleResize(item.id, e)}
                            isGlass={theme.isGlass}
                            btnText={theme.btnText}
                          />
                          {item.id === 'quran' && !isEditMode && (
                              <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      onNavigate('quran-landscape');
                                  }}
                                  className="absolute top-1/2 left-2 -translate-y-1/2 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 transition-colors shadow-lg border border-white/20"
                                  style={{ 
                                      backgroundColor: theme.isGlass ? 'rgba(255, 255, 255, 0.2)' : theme.palette[1],
                                      backdropFilter: theme.isGlass ? 'blur(4px)' : 'none',
                                      WebkitBackdropFilter: theme.isGlass ? 'blur(4px)' : 'none'
                                  }}
                                  title="وضع العرض"
                              >
                                  <i className="fa-solid fa-arrows-rotate text-lg"></i>
                              </button>
                          )}
                      </motion.div>
                  ))}
              </div>

              {/* Footer/Save Button */}
              {!isEditMode && (
                  <div className="themed-card p-2.5 rounded-2xl text-center w-full max-w-sm mx-auto mt-4 mb-4 relative">
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
    </>
  );
}

export default MainMenu;
