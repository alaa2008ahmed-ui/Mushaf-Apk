import React from 'react';
import { Play, BookOpen, Bookmark, Palette, Share2, Copy } from 'lucide-react';

interface AyahOptionsMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onPlay: () => void;
    onTafseer: () => void;
    onBookmark: () => void;
    onCustomize: () => void;
    onShare?: () => void;
    onCopy?: () => void;
    currentTheme: any;
}

const AyahOptionsMenu: React.FC<AyahOptionsMenuProps> = ({
    x, y, onClose, onPlay, onTafseer, onBookmark, onCustomize, onShare, onCopy, currentTheme
}) => {
    const iconColor = currentTheme.accent || '#000000';

    return (
        <div className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
            <div 
                className="w-max min-w-[220px] max-w-[85vw] bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden animate-modal-enter" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    <MenuItem icon={<Play size={18} />} label="استماع" onClick={onPlay} iconColor={iconColor} />
                    <MenuItem icon={<BookOpen size={18} />} label="تفسير" onClick={onTafseer} iconColor={iconColor} />
                    <MenuItem icon={<Bookmark size={18} />} label="حفظ كعلامة" onClick={onBookmark} iconColor={iconColor} />
                    {onShare && <MenuItem icon={<Share2 size={18} />} label="مشاركة" onClick={onShare} iconColor={iconColor} />}
                    {onCopy && <MenuItem icon={<Copy size={18} />} label="نسخ" onClick={onCopy} iconColor={iconColor} />}
                    <MenuItem icon={<Palette size={18} />} label="تخصيص الآية" onClick={onCustomize} iconColor={iconColor} />
                </div>
            </div>
        </div>
    );
};

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, iconColor: string }> = ({ icon, label, onClick, iconColor }) => (
    <button onClick={onClick} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-right w-full">
        <div style={{ color: iconColor }}>{icon}</div>
        <span className="text-sm font-bold flex-1" style={{ color: iconColor }}>{label}</span>
    </button>
);

export default AyahOptionsMenu;
