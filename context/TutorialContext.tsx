import React, { createContext, useContext, useState, useEffect } from 'react';

interface TutorialContextType {
  shouldShowTutorial: (tutorialId: string) => boolean;
  markTutorialAsSeen: (tutorialId: string) => void;
  resetTutorials: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seenTutorials, setSeenTutorials] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('seen_tutorials');
    if (saved) {
      try {
        setSeenTutorials(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to parse seen tutorials', e);
      }
    }
  }, []);

  const shouldShowTutorial = (tutorialId: string) => {
    return !seenTutorials.has(tutorialId);
  };

  const markTutorialAsSeen = (tutorialId: string) => {
    const newSeen = new Set(seenTutorials);
    newSeen.add(tutorialId);
    setSeenTutorials(newSeen);
    localStorage.setItem('seen_tutorials', JSON.stringify(Array.from(newSeen)));
  };

  const resetTutorials = () => {
    setSeenTutorials(new Set());
    localStorage.removeItem('seen_tutorials');
  };

  return (
    <TutorialContext.Provider value={{ shouldShowTutorial, markTutorialAsSeen, resetTutorials }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
