import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTutorial } from '../../context/TutorialContext';
import { MousePointer2, Move, ZoomIn, ChevronRight, ChevronLeft } from 'lucide-react';

export interface TutorialStep {
  id: string;
  text: string;
  icon?: React.ReactNode;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  arrow?: 'up' | 'down' | 'left' | 'right';
  selector?: string;
}

interface TutorialOverlayProps {
  tutorialId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ tutorialId, steps, onComplete }) => {
  const { shouldShowTutorial, markTutorialAsSeen } = useTutorial();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (shouldShowTutorial(tutorialId)) {
      setIsVisible(true);
    }
  }, [tutorialId, shouldShowTutorial]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    markTutorialAsSeen(tutorialId);
    if (onComplete) onComplete();
  };

  const step = steps[currentStep];

  useEffect(() => {
    if (isVisible && step?.selector) {
      const el = document.querySelector(step.selector!);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const update = () => {
          setTargetRect(el.getBoundingClientRect());
        };

        // Update immediately and after a short delay for scroll
        update();
        const timer = setTimeout(update, 500);
        const longTimer = setTimeout(update, 1000); // Second check for slow scrolls

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(el);
        resizeObserver.observe(document.body);

        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);

        return () => {
          clearTimeout(timer);
          clearTimeout(longTimer);
          resizeObserver.disconnect();
          window.removeEventListener('scroll', update, true);
          window.removeEventListener('resize', update);
        };
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isVisible, step?.selector]);

  if (!isVisible) return null;

  const getTooltipStyle = () => {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(320px, 90vw)',
    };
  };

  const tooltipStyle = getTooltipStyle();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] select-none overflow-hidden"
          onClick={handleClose}
        >
          {/* Background Overlay - Only when no specific target is highlighted */}
          {!targetRect && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/85" 
            />
          )}

          {/* Highlight Target */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                boxShadow: [
                  '0 0 0 9999px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.4)',
                  '0 0 0 9999px rgba(0,0,0,0.85), 0 0 0 4px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.6)',
                  '0 0 0 9999px rgba(0,0,0,0.85), 0 0 0 2px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.4)'
                ]
              }}
              transition={{
                boxShadow: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }
              }}
              className="fixed border-4 border-white rounded-2xl pointer-events-none z-[10000]"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            />
          )}

          {/* Centered Tooltip Container */}
          <div className="fixed inset-0 flex items-center justify-center p-6 pointer-events-none z-[10001]">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4 pointer-events-auto cursor-pointer w-full max-w-[320px] text-center"
              onClick={handleNext}
            >
              {step.icon && (
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-md shadow-2xl border border-white/30">
                  {step.icon}
                </div>
              )}
              
              <div className="w-full bg-black/80 p-6 rounded-[2rem] backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <h3 className="text-xl font-bold mb-6 leading-relaxed text-white">
                  {step.text}
                </h3>
                
                <div className="flex items-center justify-center gap-2">
                  <button 
                    className="px-8 py-3 bg-white text-black rounded-full text-base font-bold flex items-center gap-2 active:scale-95 transition-transform shadow-lg"
                    onClick={handleNext}
                  >
                    {currentStep === steps.length - 1 ? 'إنهاء' : 'التالي'}
                    {currentStep < steps.length - 1 && <ChevronLeft className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Indicators & Instructions */}
          <div className="fixed bottom-10 left-0 right-0 flex flex-col items-center gap-6 pointer-events-none z-[10002]">
            {/* Step Indicator */}
            <div className="flex gap-2.5">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>

            {/* Global Instruction */}
            <div className="text-white/60 text-sm font-medium animate-pulse tracking-wide">
              اضغط في أي مكان فارغ للخروج
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialOverlay;
