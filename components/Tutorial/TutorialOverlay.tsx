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

  useEffect(() => {
    if (shouldShowTutorial(tutorialId)) {
      setIsVisible(true);
    }
  }, [tutorialId, shouldShowTutorial]);

  if (!isVisible) return null;

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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/70 flex flex-col items-center justify-center p-6 text-white text-center select-none"
          onClick={handleClose}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="absolute flex flex-col items-center gap-4 pointer-events-auto cursor-pointer"
              style={{
                top: step.position.top,
                bottom: step.position.bottom,
                left: step.position.left,
                right: step.position.right,
              }}
              onClick={handleNext}
            >
              {step.icon && (
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm shadow-xl border border-white/30">
                  {step.icon}
                </div>
              )}
              
              <div className="max-w-[280px] bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
                <h3 className="text-xl font-bold mb-3 leading-relaxed">
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

              {step.arrow === 'up' && (
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-12"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                </motion.div>
              )}
              {step.arrow === 'down' && (
                <motion.div 
                  animate={{ y: [0, 10, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -bottom-12"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
