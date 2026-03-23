import React from 'react';
import { motion } from 'framer-motion';
import NavButton from './NavButton';

interface GridSectionProps {
    menuItems: any[];
    setMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
    visibleItems: string[];
    isEditMode: boolean;
    onNavigate: (id: string) => void;
    theme: any;
    themeKey: string;
    DEFAULT_MENU_ITEMS: any[];
}

const GridSection: React.FC<GridSectionProps> = ({
    menuItems,
    setMenuItems,
    visibleItems,
    isEditMode,
    onNavigate,
    theme,
    themeKey,
    DEFAULT_MENU_ITEMS
}) => {

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

    return (
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
                        className={item.id === 'more' ? "w-[calc(50%-6px)] h-full" : "w-full h-full"}
                        color={
                            (item.id === 'quran' && themeKey === 'default') ? '#059669' : 
                            (item.id === 'listen' && themeKey === 'default') ? '#059669' : 
                            (item.id === 'prayer-times' && themeKey === 'default') ? '#059669' : 
                            (item.id === 'tasbeeh' && themeKey === 'default') ? '#8b5cf6' : 
                            (item.id === 'calendar' && themeKey === 'default') ? '#8b5cf6' : 
                            (item.id === 'qibla' && themeKey === 'default') ? '#8b5cf6' : 
                            (item.id === 'calculators' && themeKey === 'default') ? '#8b5cf6' : 
                            (item.id === 'hisn-muslim' && themeKey === 'default') ? '#8b5cf6' : 
                            (item.id === 'salah-adhkar' && themeKey === 'default') ? '#8b5cf6' : 
                            (item.id === 'more' && themeKey === 'default') ? '#8b5cf6' : 
                            (item.customColor || theme.palette[DEFAULT_MENU_ITEMS.find(d => d.id === item.id)?.colorIndex ?? item.colorIndex])
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
    );
};

export default GridSection;
