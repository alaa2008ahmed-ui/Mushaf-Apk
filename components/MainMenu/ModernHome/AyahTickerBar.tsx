import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AyahTickerBarProps {
  text: string;
  ayahNum: number;
  isEn: boolean;
  isNightMode: boolean;
  isBlackTheme: boolean;
  formatNumber: (n: number | string) => string;
  onNavigate?: () => void;
}

export const AyahTickerBar: React.FC<AyahTickerBarProps> = React.memo(({
  text,
  ayahNum,
  isEn,
  isNightMode,
  isBlackTheme,
  formatNumber,
  onNavigate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const singleItemRef = useRef<HTMLSpanElement>(null);
  const [singleWidth, setSingleWidth] = useState(0);

  const ayahLabel = isEn
    ? `(Verse ${ayahNum})`
    : `(آية ${formatNumber(ayahNum)})`;

  const displayText = `${ayahLabel} ${text}`;

  useEffect(() => {
    const measure = () => {
      if (singleItemRef.current) {
        const w = Math.round(singleItemRef.current.getBoundingClientRect().width);
        if (w > 0) {
          setSingleWidth(prev => (Math.abs(prev - w) >= 1 ? w : prev));
        }
      }
    };

    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    const handleResize = () => measure();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [displayText, isEn]);

  const GAP_PX = 28;
  const stepWidth = singleWidth > 0 ? singleWidth + GAP_PX : 400;

  const SPEED_PX_PER_SEC = 28;
  const duration = Math.max(3, stepWidth / SPEED_PX_PER_SEC);

  const xAnimation = !isEn ? [-stepWidth, 0] : [0, -stepWidth];

  return (
    <div
      ref={containerRef}
      onClick={onNavigate}
      className={`w-full overflow-hidden relative py-1.5 px-2.5 rounded-xl mt-2.5 flex items-center select-none ${onNavigate ? 'cursor-pointer group' : ''}`}
      style={{
        minHeight: '34px',
        contain: 'layout paint',
        background: (isNightMode || isBlackTheme)
          ? 'linear-gradient(180deg, #1c1a24 0%, #131218 100%)'
          : 'linear-gradient(180deg, rgba(254, 249, 195, 0.7) 0%, rgba(253, 230, 138, 0.85) 100%)',
        border: (isNightMode || isBlackTheme)
          ? '1px solid rgba(245, 158, 11, 0.35)'
          : '1px solid rgba(217, 119, 6, 0.35)',
        boxShadow: (isNightMode || isBlackTheme)
          ? 'inset 0 1px 2px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.4)'
          : 'inset 0 1px 2px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(180, 115, 20, 0.1)',
      }}
      dir="ltr"
    >
      <motion.div
        key={`ayah-ticker-loop-${displayText}-${isEn}-${stepWidth}`}
        className="flex items-center whitespace-nowrap shrink-0"
        style={{ gap: `${GAP_PX}px`, willChange: 'transform' }}
        animate={{ x: xAnimation }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            ref={idx === 0 ? singleItemRef : undefined}
            className="whitespace-nowrap font-bold text-xs sm:text-sm tracking-wide inline-flex items-center shrink-0"
            style={{
              color: (isNightMode || isBlackTheme) ? '#FBBF24' : '#451A03',
              fontFamily: isEn ? "'Cairo', sans-serif" : "'Amiri', 'Cairo', serif",
              textShadow: (isNightMode || isBlackTheme)
                ? '0 1px 3px rgba(0,0,0,0.9)'
                : '0 1px 1px rgba(255, 255, 255, 0.8)',
            }}
          >
            {displayText}
          </span>
        ))}
      </motion.div>
    </div>
  );
});
