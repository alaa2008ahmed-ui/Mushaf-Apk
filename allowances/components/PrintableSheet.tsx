import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function PrintableSheet({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [baseScale, setBaseScale] = useState<number>(1);
  const [zoomFactor, setZoomFactor] = useState<number>(1);
  const [docHeight, setDocHeight] = useState<number>(800);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const mobile = window.innerWidth < 840;
      setIsMobile(mobile);
      if (window.innerWidth >= 840) {
        setBaseScale(1);
      } else {
        const availableWidth = window.innerWidth - 24; // 12px padding on each side
        const calculatedScale = Math.min(1, Math.max(0.3, availableWidth / 820));
        setBaseScale(calculatedScale);
      }
      if (containerRef.current) {
        setDocHeight(containerRef.current.scrollHeight || 800);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        setDocHeight(containerRef.current.scrollHeight || 800);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  const handleZoomIn = () => {
    setZoomFactor(prev => Math.min(2.5, prev + 0.15));
  };

  const handleZoomOut = () => {
    setZoomFactor(prev => Math.max(0.6, prev - 0.15));
  };

  const handleReset = () => {
    setZoomFactor(1);
  };

  const finalScale = isMobile ? (baseScale * zoomFactor) : 1;

  return (
    <div className="w-full flex-grow flex flex-col items-center my-0 print:my-0 h-full">
      {/* أدوات التحكم في التكبير والتصغير - مخفية عند الطباعة وتظهر فقط على الهواتف */}
      {isMobile && (
        <div className="no-print w-full max-w-md mx-auto mb-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-3 flex items-center justify-between gap-4 sticky top-2 z-30 animate-in fade-in duration-200">
          <div className="text-slate-700 font-medium text-xs sm:text-sm select-none pr-1">
            حجم العرض: <span className="font-bold text-violet-600 font-mono">{Math.round(zoomFactor * 100)}%</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* تصغير */}
            <button
              onClick={handleZoomOut}
              disabled={zoomFactor <= 0.6}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 active:scale-95"
              title="تصغير حجم العرض"
            >
              <ZoomOut size={16} />
              <span className="text-xs font-bold select-none hidden sm:inline">تصغير</span>
            </button>

            {/* إعادة تعيين */}
            <button
              onClick={handleReset}
              disabled={zoomFactor === 1}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 active:scale-95"
              title="الحجم الافتراضي"
            >
              <RefreshCcw size={14} />
              <span className="text-xs font-bold select-none hidden sm:inline">تلقائي</span>
            </button>

            {/* تكبير */}
            <button
              onClick={handleZoomIn}
              disabled={zoomFactor >= 2.5}
              className="p-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 transition-colors border border-violet-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 active:scale-95 font-semibold"
              title="تكبير حجم العرض"
            >
              <ZoomIn size={16} />
              <span className="text-xs font-bold select-none hidden sm:inline font-semibold">تكبير</span>
            </button>
          </div>
        </div>
      )}

      {/* حاوية الجدول المدعمة بالتمرير الأفقي عند الحاجة */}
      <div className="w-full overflow-x-auto overflow-y-visible print:overflow-visible print:block flex-grow flex flex-col items-center pb-8 scrollbar-thin select-none sm:select-text">
        <div 
          ref={containerRef}
          style={{
            transform: isMobile ? `scale(${finalScale})` : 'none',
            transformOrigin: 'top center',
            width: '820px',
            maxWidth: 'none',
            marginRight: 'auto',
            marginLeft: 'auto',
            marginBottom: isMobile ? `${-(1 - finalScale) * docHeight}px` : '0px'
          }}
          className="bg-white p-2 sm:p-4 border-none shadow-none print:!shadow-none print:!border-none print:!p-0 print:!w-full print:!max-w-full print:!min-w-0 print:!transform-none text-black text-sm font-sans transition-all duration-150 flex-grow flex flex-col h-full"
          dir="rtl"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
