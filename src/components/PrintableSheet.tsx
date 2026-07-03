import React, { useState, useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function PrintableSheet({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [docHeight, setDocHeight] = useState<number>(800);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 768) {
        setScale(1);
      } else {
        const availableWidth = window.innerWidth - 20;
        const calculatedScale = Math.min(1, Math.max(0.32, availableWidth / 820));
        setScale(calculatedScale);
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

  return (
    <div className="w-full flex-grow flex flex-col items-center overflow-hidden print:overflow-visible print:block my-0 print:my-0 h-full">
      <div 
        ref={containerRef}
        style={{
          transform: scale < 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'top center',
          width: scale < 1 ? '820px' : '100%',
          maxWidth: '100%',
          marginBottom: scale < 1 ? `${-(1 - scale) * docHeight}px` : '0px'
        }}
        className="bg-white p-2 sm:p-4 border-none shadow-none print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none print:transform-none text-black text-sm font-sans mx-auto transition-all duration-150 flex-grow flex flex-col h-full"
        dir="rtl"
      >
        {children}
      </div>
    </div>
  );
}
