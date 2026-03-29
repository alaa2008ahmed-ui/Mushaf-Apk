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
    if (!targetRect) {
      return {
        top: step.position.top || '50%',
        left: step.position.left || '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 15;
    const tooltipWidth = Math.min(280, screenWidth * 0.9);
    const tooltipHeight = 180; // Estimated max height

    let top: number | string = 'auto';
    let left: number | string = 'auto';
    let bottom: number | string = 'auto';
    let right: number | string = 'auto';
    let transform = 'none';

    // Helper to keep left/right within bounds
    const getSafeLeft = (preferredLeft: number) => {
      return Math.max(10, Math.min(screenWidth - tooltipWidth - 10, preferredLeft));
    };

    if (step.arrow === 'up') {
      // Tooltip is BELOW the target, arrow points UP
      top = targetRect.bottom + padding;
      // If it goes off screen bottom, flip it or cap it
      if (typeof top === 'number' && top + tooltipHeight > screenHeight - 20) {
        top = 'auto';
        bottom = (screenHeight - targetRect.top) + padding;
      }
      left = getSafeLeft(targetRect.left + targetRect.width / 2 - tooltipWidth / 2);
    } else if (step.arrow === 'down') {
      // Tooltip is ABOVE the target, arrow points DOWN
      bottom = (screenHeight - targetRect.top) + padding;
      // If it goes off screen top, flip it or cap it
      if (typeof bottom === 'number' && screenHeight - bottom < 20) {
         bottom = 'auto';
         top = targetRect.bottom + padding;
      }
      left = getSafeLeft(targetRect.left + targetRect.width / 2 - tooltipWidth / 2);
    } else if (step.arrow === 'left') {
      // Tooltip is to the RIGHT of the target, arrow points LEFT
      left = targetRect.right + padding;
      if (typeof left === 'number' && left + tooltipWidth > screenWidth - 10) {
        left = 'auto';
        right = (screenWidth - targetRect.left) + padding;
      }
      top = Math.max(10, Math.min(screenHeight - tooltipHeight - 10, targetRect.top + targetRect.height / 2 - 50));
    } else if (step.arrow === 'right') {
      // Tooltip is to the LEFT of the target, arrow points RIGHT
      right = (screenWidth - targetRect.left) + padding;
      if (typeof right === 'number' && right + tooltipWidth > screenWidth - 10) {
        right = 'auto';
        left = targetRect.right + padding;
      }
      top = Math.max(10, Math.min(screenHeight - tooltipHeight - 10, targetRect.top + targetRect.height / 2 - 50));
    } else {
      return {
        top: step.position.top || '50%',
        left: step.position.left || '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    return { top, left, bottom, right, transform };
  };

  const tooltipStyle = getTooltipStyle();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 text-white text-center select-none"
          onClick={handleClose}
        >
          {/* Background Overlay when no target */}
          {!targetRect && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80" 
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

          <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="absolute flex flex-col items-center gap-4 pointer-events-auto cursor-pointer z-[10001]"
              style={tooltipStyle}
              onClick={handleNext}
            >
              {step.arrow === 'up' && (
                <motion.div 
                  animate={{ y: [0, -5, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-10"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                </motion.div>
              )}
              
              {step.icon && (
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm shadow-xl border border-white/30">
                  {step.icon}
                </div>
              )}
              
              <div className="w-[280px] bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
                <h3 className="text-lg font-bold mb-3 leading-relaxed">
                  {step.text}
                </h3>
                
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button 
                    className="px-4 py-1.5 bg-white text-black rounded-full text-sm font-bold flex items-center gap-1 active:scale-95 transition-transform"
                    onClick={handleNext}
                  >
                    {currentStep === steps.length - 1 ? 'إنهاء' : 'التالي'}
                    {currentStep < steps.length - 1 && <ChevronLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {step.arrow === 'down' && (
                <motion.div 
                  animate={{ y: [0, 5, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -bottom-10"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                </motion.div>
              )}
            </motion.div>

            {/* Global Instruction */}
            <div className="absolute bottom-10 left-0 right-0 text-center opacity-70 text-sm animate-pulse">
              اضغط في أي مكان فارغ للخروج
            </div>

            {/* Step Indicator */}
            <div className="absolute bottom-20 flex gap-2">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-white' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialOverlay;
