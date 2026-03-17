import React from 'react';
import MainMenu from '../pages/MainMenu';
import AthkarAlSalah from '../pages/AthkarAlSalah';
import HijriCalendar from '../pages/HijriCalendar';
import ListenQuran from '../pages/ListenQuran';
import Tasbeeh from '../pages/Tasbeeh';
import HajjUmrah from '../pages/HajjUmrah';
import HisnAlmuslim from '../pages/HisnAlmuslim';
import PrayerTimes from '../pages/PrayerTimes';
import Qibla from '../pages/Qibla';
import AdkarSabahMasaa from '../pages/AdkarSabahMasaa';
import Adia from '../pages/Adia';
import Nawawi from '../pages/Nawawi';
import QuranReader from '../pages/QuranReader';
import Calculators from '../pages/Calculators';

interface AppRouterProps {
    page: string;
    onBack: () => void;
    onNavigate: (pageId: string) => void;
    onOpenThemes: () => void;
}

const AppRouter: React.FC<AppRouterProps> = ({ page, onBack, onNavigate, onOpenThemes }) => {
    switch(page) {
      case 'quran':
        return <QuranReader onBack={onBack} initialLandscape={false} />;
      case 'quran-landscape':
        return <QuranReader onBack={onBack} initialLandscape={true} />;
      case 'salah-adhkar':
        return <AthkarAlSalah onBack={onBack} />;
      case 'calendar':
        return <HijriCalendar onBack={onBack} />;
      case 'listen':
        return <ListenQuran onBack={onBack} onOpenThemes={onOpenThemes} />;
      case 'tasbeeh':
        return <Tasbeeh onBack={onBack} />;
      case 'hajj-umrah':
        return <HajjUmrah onBack={onBack} />;
      case 'hisn-muslim':
        return <HisnAlmuslim onBack={onBack} />;
      case 'prayer-times':
        return <PrayerTimes onBack={onBack} />;
      case 'qibla':
        return <Qibla onBack={onBack} />;
      case 'sabah-masaa':
        return <AdkarSabahMasaa onBack={onBack} />;
      case 'adia':
        return <Adia onBack={onBack} />;
      case 'nawawi':
        return <Nawawi onBack={onBack} />;
      case 'calculators':
        return <Calculators onBack={onBack} />;
      case 'home':
      default:
        return <MainMenu onNavigate={onNavigate} onOpenThemes={onOpenThemes} />;
    }
};

export default AppRouter;
