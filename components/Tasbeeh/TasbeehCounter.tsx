import React from 'react';
import { toArabicNumerals } from '../../utils/tasbeehUtils';
import { motion, AnimatePresence } from 'motion/react';

interface TasbeehCounterProps {
    isCountingStopped: boolean;
    target: number;
    secondaryTextColor: string;
    primaryTextColor: string;
    counterColor: string;
    count: number;
    handleIncrement: () => void;
    isBlackAndWhite?: boolean;
    skin?: string;
}

const TasbeehCounter: React.FC<TasbeehCounterProps> = ({ isCountingStopped, target, secondaryTextColor, primaryTextColor, counterColor, count, handleIncrement, isBlackAndWhite, skin = 'modern' }) => {
    // Calculate progress percentage
    const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0;
    const strokeDasharray = 283; // 2 * pi * r (approx 45)
    const strokeDashoffset = strokeDasharray - (strokeDasharray * progress) / 100;

    const renderCounter = () => {
        if (skin === 'classic') {
            return (
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleIncrement} 
                    className={`tasbeeh-counter w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none relative z-10 ${isBlackAndWhite ? 'border-2 border-white' : ''}`} 
                    style={{ backgroundColor: counterColor, borderBottom: '6px solid rgba(0,0,0,0.2)' }}
                >
                    <span className="text-6xl font-mono font-black" style={{ fontFamily: 'Amiri', textShadow: '0 2px 4px rgba(0,0,0,0.3)', color: 'white' }}>
                        {toArabicNumerals(count)}
                    </span>
                    <span className="text-sm font-bold mt-2" style={{color: 'white', opacity: 0.9}}>
                        {isCountingStopped ? 'قم بالتصفير' : 'اضغط للعد'}
                    </span>
                </motion.button>
            );
        }

        if (skin === 'beads') {
            return (
                <div className="relative flex flex-col items-center justify-center h-64 w-full" onClick={handleIncrement}>
                    <div className="absolute top-0 bottom-0 w-1 bg-black/10 dark:bg-white/10 left-1/2 -translate-x-1/2 z-0"></div>
                    <motion.div 
                        key={count}
                        initial={{ y: -60, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg relative z-10 cursor-pointer"
                        style={{ 
                            background: `radial-gradient(circle at 30% 30%, ${counterColor}, #000)`,
                            boxShadow: `0 10px 20px -5px rgba(0,0,0,0.3), inset 0 -4px 6px rgba(0,0,0,0.4), inset 0 4px 6px rgba(255,255,255,0.4)`
                        }}
                    >
                        <span className="text-2xl font-mono font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>
                            {toArabicNumerals(count)}
                        </span>
                    </motion.div>
                    <div className="mt-8 text-sm font-bold opacity-70" style={{color: primaryTextColor}}>اسحب أو اضغط للعد</div>
                </div>
            );
        }

        // Default 'modern' skin
        return (
            <div className="relative flex items-center justify-center">
                {/* SVG Progress Ring */}
                {target > 0 && (
                    <svg className="absolute w-[220px] h-[220px] -rotate-90 pointer-events-none drop-shadow-md z-0" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle cx="50" cy="50" r="45" fill="transparent" stroke={counterColor} strokeWidth="3" strokeOpacity="0.2" />
                        {/* Progress indicator */}
                        <motion.circle
                            cx="50" cy="50" r="45" fill="transparent" stroke={counterColor} strokeWidth="8" strokeLinecap="round"
                            initial={{ strokeDashoffset: strokeDasharray }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            style={{ strokeDasharray }}
                        />
                    </svg>
                )}

                {/* Counter Button */}
                <motion.button 
                    whileTap={{ scale: 0.93 }}
                    onClick={handleIncrement} 
                    className={`tasbeeh-counter w-48 h-48 rounded-full flex flex-col items-center justify-center transition-colors duration-200 ease-out cursor-pointer select-none relative z-10 shadow-xl ${isBlackAndWhite ? 'border-2 border-white' : ''}`} 
                    style={{ 
                        backgroundColor: counterColor,
                        boxShadow: `0 15px 35px -10px ${counterColor}80, 0 8px 10px -6px ${counterColor}60`
                    }}
                >
                    <div className="relative overflow-hidden h-28 flex items-center justify-center w-full mt-4">
                        <AnimatePresence mode="popLayout">
                            <motion.span 
                                key={count}
                                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -20, opacity: 0, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="text-7xl md:text-8xl font-mono font-black absolute" 
                                style={{ fontFamily: 'Amiri', textShadow: '0 4px 8px rgba(0,0,0,0.2)', color: 'white' }}
                            >
                                {toArabicNumerals(count)}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                    <span className="text-base font-bold mt-1 mb-4" style={{color: 'white', opacity: 0.9}}>
                        {isCountingStopped ? 'قم بالتصفير للبدء' : 'اضغط للعد'}
                    </span>
                    
                    {/* Ripple/Glow effect on the bottom */}
                    <div className="absolute bottom-4 w-12 h-1 rounded-full bg-white opacity-20"></div>
                </motion.button>
            </div>
        );
    };

    return (
        <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -50) {
                    // Swiped left (next)
                    if ((window as any).handleNextPhrase) (window as any).handleNextPhrase();
                } else if (swipe > 50) {
                    // Swiped right (prev)
                    if ((window as any).handlePrevPhrase) (window as any).handlePrevPhrase();
                }
            }}
            className="flex-grow flex flex-col items-center justify-center w-full max-w-lg space-y-8 py-2 relative z-0"
        >
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center px-6 py-3 rounded-2xl themed-card w-full max-w-xs shadow-sm border border-black/5"
            >
                <span className="block text-sm font-bold mb-1" style={{color: secondaryTextColor}}>{isCountingStopped && target > 0 ? 'تم الوصول للهدف! 🎉' : 'الهدف:'}</span>
                <span className="text-3xl font-extrabold font-amiri" style={{color: primaryTextColor}}>{toArabicNumerals(target > 0 ? target : 'مفتوح')}</span>
            </motion.div>

            {renderCounter()}
        </motion.div>
    );
};

export default TasbeehCounter;
