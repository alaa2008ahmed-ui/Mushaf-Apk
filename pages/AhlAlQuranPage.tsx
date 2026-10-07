import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, BookOpen, Crown, Medal, User, Calendar, 
  Eye, EyeOff, Shield, RefreshCw, ChevronDown, CheckCircle2,
  Sparkles, Info, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { 
  ahlAlQuranService, 
  CalendarType, 
  PrivacyMode 
} from '../services/ahlAlQuranService';
import { communityService } from '../services/communityService';
import UsernameModal from '../components/Community/UsernameModal';

interface AhlAlQuranPageProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
}

const AhlAlQuranPage: React.FC<AhlAlQuranPageProps> = ({ onBack, onNavigate }) => {
  const { theme } = useTheme();

  // Navigation & Calendar States
  const [calendarType, setCalendarType] = useState<CalendarType>('hijri');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');
  const [isArchiveDropdownOpen, setIsArchiveDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'my_stats' | 'privacy'>('leaderboard');
  
  // Real-time Data
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => communityService.getCurrentUser());
  const [isProfileComplete, setIsProfileComplete] = useState(() => communityService.isProfileComplete());
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [userPrivacy, setUserPrivacy] = useState<PrivacyMode>(() => ahlAlQuranService.getCurrentUserPrivacy());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available Month Options (Current + Archived)
  const monthOptions = useMemo(() => {
    return ahlAlQuranService.getAvailableMonths(calendarType);
  }, [calendarType]);

  // Set default month to current month when calendarType changes
  useEffect(() => {
    if (monthOptions.length > 0) {
      setSelectedMonthKey(monthOptions[0].key);
    }
  }, [monthOptions]);

  // Subscribe to real-time Ahl Al-Quran updates
  useEffect(() => {
    const unsub = ahlAlQuranService.subscribe(() => {
      setRefreshTrigger(prev => prev + 1);
    });
    const handleEventUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('ahl_al_quran_updated', handleEventUpdate);
    window.addEventListener('ahl_al_quran_page_recorded', handleEventUpdate);
    return () => {
      unsub();
      window.removeEventListener('ahl_al_quran_updated', handleEventUpdate);
      window.removeEventListener('ahl_al_quran_page_recorded', handleEventUpdate);
    };
  }, []);

  // Update current user & profile state
  useEffect(() => {
    const cur = communityService.getCurrentUser();
    setCurrentUser(cur);
    setIsProfileComplete(communityService.isProfileComplete());
    setUserPrivacy(ahlAlQuranService.getCurrentUserPrivacy());
  }, [refreshTrigger, showUsernameModal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute Leaderboard for Selected Month
  const leaderboard = useMemo(() => {
    return ahlAlQuranService.getLeaderboard(selectedMonthKey, currentUser?.userId);
  }, [selectedMonthKey, currentUser?.userId, refreshTrigger]);

  // Current user's specific performance in this selected month
  const currentUserEntry = useMemo(() => {
    return leaderboard.find(item => item.isCurrentUser);
  }, [leaderboard]);

  const handlePrivacyChange = async (mode: PrivacyMode) => {
    await ahlAlQuranService.setPrivacyMode(mode);
    setUserPrivacy(mode);
    showToast(
      mode === 'public' 
        ? 'تم تفعيل الظهور باسمك وصورتك في لائحة الشرف'
        : mode === 'anonymous'
        ? 'تم تفعيل الظهور كفاعل خير (مجهول) للحفاظ على أجر السر'
        : 'تم حجب اسمك من القائمة العامة مع استمرار حفظ إحصائياتك الشخصية'
    );
  };

  const handleRecordManualKhatma = async () => {
    if (!isProfileComplete) {
      setShowUsernameModal(true);
      return;
    }
    await ahlAlQuranService.recordKhatmaCompleted();
    showToast('مبارك! تم تسجيل ختمة جديدة لك بنجاح، جعلها الله في ميزان حسناتك 🤲');
  };

  const selectedMonthName = useMemo(() => {
    if (selectedMonthKey === 'lifetime') return 'جميع الأوقات (التراكمي)';
    const found = monthOptions.find(m => m.key === selectedMonthKey);
    return found ? found.name : 'الشهر الحالي';
  }, [selectedMonthKey, monthOptions]);

  const isCurrentMonthSelected = useMemo(() => {
    return monthOptions.length > 0 && monthOptions[0].key === selectedMonthKey;
  }, [selectedMonthKey, monthOptions]);

  return (
    <div 
      className="h-screen max-h-screen h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col overflow-y-auto overscroll-contain"
      dir="rtl"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3.75rem + 1cm)'
      }}
    >
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-4">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Right: Quran Shortcut */}
          <button
            type="button"
            onClick={() => onNavigate('quran')}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer flex-shrink-0"
            title="الذهاب للمصحف الشريف"
          >
            <BookOpen size={20} />
          </button>

          {/* Center Title */}
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-0.5">
              <Trophy size={14} className="text-amber-500" />
              <span>لائحة الشرف والتنافس المحمود</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              أهل القرآن الكريم
            </h1>
          </div>

          {/* Left placeholder to balance the Quran shortcut button on the right */}
          <div className="w-10 flex-shrink-0" aria-hidden="true" />
        </div>

        {/* Unregistered User Warning / Invitation Banner */}
        {!isProfileComplete && (
          <div className="mb-4 p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 text-right">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Info size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm">لم تقم بالتسجيل في مجتمع المصحف بعد</h4>
                <p className="text-xs opacity-85 mt-0.5">
                  سجل اسمك وصورتك في مجتمع المصحف ليتم تتبع قراءتك وظهورك في لوحة أهل القرآن!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUsernameModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              تسجيل حسابي الآن
            </button>
          </div>
        )}

        {/* Main Tab Switcher: Leaderboard, My Stats, Privacy */}
        <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-300/50 dark:border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy size={16} />
            <span>لوحة المتصدرين</span>
          </button>

          <button
            onClick={() => setActiveTab('my_stats')}
            className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'my_stats'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award size={16} />
            <span>إحصائياتي</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield size={16} />
            <span>الخصوصية والظهور</span>
          </button>
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div>
            {/* Filter Bar: Calendar Switch & Archive Dropdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-4 mb-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Hijri vs Gregorian Switch */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border dark:border-slate-800">
                  <button
                    onClick={() => setCalendarType('hijri')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      calendarType === 'hijri'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    📅 الشهور الهجرية
                  </button>
                  <button
                    onClick={() => setCalendarType('gregorian')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      calendarType === 'gregorian'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    🗓️ الشهور الميلادية
                  </button>
                </div>

                {/* Selected Month & Archive Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsArchiveDropdownOpen(prev => !prev)}
                    className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={15} />
                      <span>{selectedMonthName}</span>
                      {isCurrentMonthSelected && (
                        <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-semibold">
                          الحالي
                        </span>
                      )}
                    </div>
                    <ChevronDown size={14} className={`transition-transform ${isArchiveDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu for Archive */}
                  <AnimatePresence>
                    {isArchiveDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute left-0 right-0 sm:right-auto sm:left-0 mt-1.5 sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto p-1.5"
                      >
                        <div className="text-[11px] font-bold text-slate-400 px-2.5 py-1.5 border-b dark:border-slate-800">
                          اختر الشهر أو الأرشيف السابق:
                        </div>
                        {monthOptions.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              setSelectedMonthKey(opt.key);
                              setIsArchiveDropdownOpen(false);
                            }}
                            className={`w-full text-right px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                              selectedMonthKey === opt.key
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{opt.name}</span>
                            {opt.isCurrent ? (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                                الحالي
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">أرشيف</span>
                            )}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setSelectedMonthKey('lifetime');
                            setIsArchiveDropdownOpen(false);
                          }}
                          className={`w-full text-right px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border-t dark:border-slate-800 mt-1 ${
                            selectedMonthKey === 'lifetime'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>👑 الإجمالي التراكمي (كل الأوقات)</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Status Note */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  {isCurrentMonthSelected 
                    ? '⚡ يتم التحديث لحظياً وتلقائياً عند قراءة أي صفحة في المصحف'
                    : '📜 أنت تشاهد الأرشيف المحفوظ لهذا الشهر السابق'}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {leaderboard.length} قارئ مسجل
                </span>
              </div>
            </div>


            {/* Current User Floating Progress Bar if participating */}
            {currentUserEntry && (
              <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                    #{currentUserEntry.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        ترتيبك في {selectedMonthName}:
                      </span>
                      <span className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                        المركز {currentUserEntry.rank}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {currentUserEntry.formattedProgress.summaryText}
                    </div>
                  </div>
                </div>
                {currentUserEntry.khatmas > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl">
                    <Crown size={14} />
                    <span>{currentUserEntry.khatmas} ختمة</span>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard Cards List */}
            {leaderboard.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <Trophy size={48} className="mx-auto text-slate-400 mb-3 opacity-60" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  لا توجد قراءات مسجلة في هذا الشهر حتى الآن
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  ابدأ بقراءة القرآن من صفحة المصحف وسيتم تسجيل تقدمك وأجزائك هنا في الحال!
                </p>
                <button
                  onClick={() => onNavigate('quran')}
                  className="mt-4 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <BookOpen size={16} />
                  <span>فتح المصحف والقراءة الآن</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {leaderboard.map((item) => {
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;

                  return (
                    <motion.div
                      key={item.record.userId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative rounded-3xl border p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all ${
                        item.isCurrentUser
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30'
                          : isTop1
                          ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/40 shadow-xs'
                          : isTop2
                          ? 'bg-gradient-to-r from-slate-400/10 via-slate-400/5 to-transparent border-slate-300 dark:border-slate-700 shadow-xs'
                          : isTop3
                          ? 'bg-gradient-to-r from-amber-700/10 via-amber-700/5 to-transparent border-amber-700/30 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 shadow-xs'
                      }`}
                    >
                      {/* Left Side: Rank Badge + User Profile */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Rank Badge */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          {isTop1 ? (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-amber-500/30">
                              🥇
                            </div>
                          ) : isTop2 ? (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-400 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-slate-400/30">
                              🥈
                            </div>
                          ) : isTop3 ? (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-amber-700/30">
                              🥉
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-xs flex items-center justify-center">
                              {item.rank}
                            </div>
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 overflow-hidden flex items-center justify-center shrink-0">
                          {item.isAnonymous ? (
                            <Shield size={20} className="text-emerald-600 dark:text-emerald-400" />
                          ) : item.displayAvatar ? (
                            <img src={item.displayAvatar} alt={item.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>

                        {/* Name & Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {item.displayName}
                            </h4>
                            {item.isCurrentUser && (
                              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                                أنت
                              </span>
                            )}
                            {item.isAnonymous && (
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded-full font-bold">
                                مجهول
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {!item.isAnonymous && item.record.country && (
                              <span>{item.record.country}</span>
                            )}
                            <span>•</span>
                            <span className="font-mono">{item.pages} صفحة مسجلة</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Formatted Progress (Ajza & Remaining Pages) */}
                      <div className="text-left shrink-0">
                        <div className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {item.formattedProgress.summaryText}
                        </div>
                        {item.khatmas > 0 && (
                          <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg mt-0.5">
                            <Crown size={12} />
                            <span>{item.khatmas} ختمة</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY STATS & RECORD MANUAL KHATMA */}
        {activeTab === 'my_stats' && (
          <div className="space-y-4">
            {/* Quick Profile Overview Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 mx-auto mb-3 overflow-hidden flex items-center justify-center">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={30} className="text-emerald-600" />
                )}
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {currentUser?.username || 'قارئ المصحف'}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                كود الحساب: {currentUser?.accountCode || 'غير مسجل'}
              </p>

              {/* Progress Counters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-medium">صفحات هذا الشهر</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {currentUserEntry?.pages || 0}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {currentUserEntry?.formattedProgress.summaryText || '0 صفحة'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-medium">ختمات هذا الشهر</div>
                  <div className="text-lg font-black text-amber-500 mt-1">
                    {currentUserEntry?.khatmas || 0}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">ختمة كاملة</div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border dark:border-slate-800 text-center">
                  <div className="text-xs text-slate-400 font-medium">الترتيب الحالي</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {currentUserEntry ? `#${currentUserEntry.rank}` : '-'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">في {selectedMonthName}</div>
                </div>
              </div>

              {/* Button to Record Completed Khatma */}
              <div className="mt-5 pt-4 border-t dark:border-slate-800">
                <button
                  onClick={handleRecordManualKhatma}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Crown size={18} />
                  <span>أتممتُ ختمة جديدة للقرآن الكريم (تسجيل ختمة)</span>
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  يتم أيضاً احتساب الختمة تلقائياً بمجرد إكمال قراءة صفحات المصحف الشريف كاملاً (604 صفحات).
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('quran')}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs flex items-center gap-3 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs sm:text-sm">فتح المصحف</div>
                  <div className="text-[10px] text-slate-400">متابعة القراءة والورد</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('community')}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs flex items-center gap-3 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs sm:text-sm">مجتمع المصحف</div>
                  <div className="text-[10px] text-slate-400">ملفي الشخصي والرسائل</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PRIVACY & VISIBILITY CONTROLS */}
        {activeTab === 'privacy' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={20} className="text-emerald-600" />
                <span>إعدادات خصوصية الظهور في قائمة أهل القرآن</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                لك مطلق الحرية في اختيار كيفية ظهور إنجازك القرآني، سواءً رغبت في التنافس المحمود وتشجيع إخوانك، أو رغبت في إخفاء اسمك ابتغاء الأجر وسر العبادة.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option 1: Public with Name & Avatar */}
              <div
                onClick={() => handlePrivacyChange('public')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  userPrivacy === 'public'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      الظهور بالاسم والصورة الرسمية (علني)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      يظهر اسمك وصورتك في لائحة الشرف لتشجيع القراء والتنافس في الخيرات.
                    </p>
                  </div>
                </div>
                {userPrivacy === 'public' && (
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-1" />
                )}
              </div>

              {/* Option 2: Anonymous (فاعل خير) */}
              <div
                onClick={() => handlePrivacyChange('anonymous')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  userPrivacy === 'anonymous'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      الظهور كـ "فاعل خير" (مجهول)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تظهر صفحاتك وأجزاؤك في الترتيب ولكن يُحجب اسمك وصورتك ويظهر بدلاً منها "فاعل خير".
                    </p>
                  </div>
                </div>
                {userPrivacy === 'anonymous' && (
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-1" />
                )}
              </div>

              {/* Option 3: Completely Hidden */}
              <div
                onClick={() => handlePrivacyChange('hidden')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  userPrivacy === 'hidden'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <EyeOff size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      عدم الظهور نهائياً في القائمة (خاص)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      لا تظهر إطلاقاً في لوحة المتصدرين العامة، مع استمرار تتبع وحفظ قراءتك لنفسك في تبويب إحصائياتي.
                    </p>
                  </div>
                </div>
                {userPrivacy === 'hidden' && (
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-1" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-slate-900 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-2xl shadow-xl z-50 text-center border border-slate-700"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Modal if user clicks register */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSaved={() => {
          setShowUsernameModal(false);
          setIsProfileComplete(communityService.isProfileComplete());
          setCurrentUser(communityService.getCurrentUser());
          showToast('مرحباً بك! تم تسجيل حسابك بنجاح وأصبحت الآن ضمن أهل القرآن 🌸');
        }}
      />

      {/* Standard BottomBar across the app */}
      <BottomBar 
        onHomeClick={() => onNavigate('home')}
        onThemesClick={() => {}}
        showThemes={false}
      />
    </div>
  );
};

export default AhlAlQuranPage;
