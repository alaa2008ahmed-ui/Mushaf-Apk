/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  User, 
  Lock, 
  ArrowRight, 
  Globe, 
  Home, 
  ExternalLink, 
  Settings, 
  ChevronDown, 
  Check, 
  BookOpen, 
  Receipt, 
  TrendingUp, 
  Truck, 
  Maximize2, 
  Minimize2,
  X,
  Menu,
  LogOut
} from 'lucide-react';

const DEFAULT_URLS = {
  accounting: "https://alaa-accounting-system.vercel.app",
  dailySales: "https://daily-sales-rose.vercel.app/",
  deliverySales: "https://dilevry-note.vercel.app/",
  quran: "https://mushaf-ahmed-laila.vercel.app/"
};

const t = {
  ar: {
    portalTitle: "مجموعة تطبيقات علاء",
    portalSubtitle: "",
    accounting: "برنامج علاء المحاسبي",
    accountingDesc: "منظومة متكاملة لإدارة الحسابات العامة، القيود المالية، ومراقبة الميزانية بدقة عالية.",
    dailySales: "المبيعات اليومية",
    dailySalesDesc: "تقرير المبيعات اليومي المباشر لمتابعة حركة الفروع والإيرادات لحظة بلحظة.",
    deliverySales: "مبيعات الدليفري",
    deliverySalesDesc: "نظام إدارة مبيعات التوصيل، تتبع الطلبات وحسابات مناديب الدليفري.",
    quran: "مصحف أحمد وليلى",
    quranDesc: "المصحف الشريف الميسر للقراءة والتدبر برسم المصحف وتلاوات متعددة.",
    adminPortal: "بوابة الإدارة",
    adminLogin: "تسجيل دخول المشرف",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    loginError: "اسم المستخدم أو كلمة المرور غير صحيحة",
    loginBtn: "دخول",
    configMode: "تهيئة وإعداد روابط الأنظمة",
    saveBtn: "حفظ وتحديث الروابط",
    backBtn: "رجوع",
    homeBtn: "الرئيسية",
    fullscreenBtn: "ملء الشاشة",
    exitFullscreenBtn: "استعادة الواجهة",
    language: "English",
    loading: "جارٍ تهيئة الأنظمة والروابط...",
    successSave: "تم تحديث روابط الأنظمة وحفظها بنجاح!",
    openNewTab: "فتح في علامة تبويب جديدة",
    switchApp: "الانتقال السريع",
    closeBtn: "إغلاق",
    chooseApp: "اختر النظام المطلوب تشغيله:",
    activeApp: "التطبيق النشط حالياً:",
    exitPortal: "الخروج",
    floatingMenuTitle: "التحكم السريع"
  },
  en: {
    portalTitle: "Alaa Applications Suite",
    portalSubtitle: "",
    accounting: "Alaa Accounting System",
    accountingDesc: "An integrated system to manage general ledger, financial entries, and budget control.",
    dailySales: "Daily Sales",
    dailySalesDesc: "Direct daily sales report to monitor branches' movements and revenues in real-time.",
    deliverySales: "Delivery Note",
    deliverySalesDesc: "System for managing delivery sales, tracking orders, and delivery agents' accounts.",
    quran: "Mushaf Ahmed & Laila",
    quranDesc: "The Holy Quran for reading, listening, and contemplation with multiple recitations.",
    adminPortal: "Admin Portal",
    adminLogin: "Administrator Login",
    username: "Username",
    password: "Password",
    loginError: "Incorrect username or password",
    loginBtn: "Login",
    configMode: "Configure System URLs",
    saveBtn: "Save & Update URLs",
    backBtn: "Back",
    homeBtn: "Home",
    fullscreenBtn: "Fullscreen",
    exitFullscreenBtn: "Exit Fullscreen",
    language: "العربية",
    loading: "Initializing systems and links...",
    successSave: "System links updated and saved successfully!",
    openNewTab: "Open in new tab",
    switchApp: "Quick Switch",
    closeBtn: "Close",
    chooseApp: "Choose system to launch:",
    activeApp: "Currently active app:",
    exitPortal: "Exit",
    floatingMenuTitle: "Quick Control"
  }
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  
  // URLs configuration
  const [urls, setUrls] = useState({
    accounting: DEFAULT_URLS.accounting,
    dailySales: DEFAULT_URLS.dailySales,
    deliverySales: DEFAULT_URLS.deliverySales,
    quran: DEFAULT_URLS.quran,
  });

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Editing state
  const [editUrls, setEditUrls] = useState({ ...urls });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Layout controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [menuAlign, setMenuAlign] = useState<'left' | 'right'>('right');
  const [menuValign, setMenuValign] = useState<'top' | 'bottom'>('bottom');
  const [loadedApps, setLoadedApps] = useState<Record<string, boolean>>({});
  const dragAreaRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedAppId) {
      setLoadedApps(prev => ({ ...prev, [selectedAppId]: true }));
    }
  }, [selectedAppId]);

  useEffect(() => {
    // Load language preference
    const savedLang = localStorage.getItem('swc_portal_lang');
    if (savedLang === 'ar' || savedLang === 'en') {
      setLang(savedLang);
    }

    // Load URLs configuration from localStorage
    const savedAccounting = localStorage.getItem('swc_url_accounting');
    const savedDailySales = localStorage.getItem('swc_url_dailySales');
    const savedDeliverySales = localStorage.getItem('swc_url_deliverySales');
    const savedQuran = localStorage.getItem('swc_url_quran');

    const loadedUrls = {
      accounting: savedAccounting || DEFAULT_URLS.accounting,
      dailySales: savedDailySales || DEFAULT_URLS.dailySales,
      deliverySales: savedDeliverySales || DEFAULT_URLS.deliverySales,
      quran: savedQuran || DEFAULT_URLS.quran,
    };

    setUrls(loadedUrls);
    setEditUrls(loadedUrls);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    localStorage.setItem('swc_portal_lang', nextLang);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'alaa' && password === '0120301012') {
      setIsAdminAuthenticated(true);
      setEditUrls({ ...urls });
      setLoginError('');
    } else {
      setLoginError(t[lang].loginError);
    }
  };

  const handleSaveUrls = () => {
    localStorage.setItem('swc_url_accounting', editUrls.accounting);
    localStorage.setItem('swc_url_dailySales', editUrls.dailySales);
    localStorage.setItem('swc_url_deliverySales', editUrls.deliverySales);
    localStorage.setItem('swc_url_quran', editUrls.quran);
    
    setUrls({ ...editUrls });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsAdminAuthenticated(false);
      setShowAdminLogin(false);
      setUsername('');
      setPassword('');
    }, 1500);
  };

  const closeAdminMenu = () => {
    setShowAdminLogin(false);
    setIsAdminAuthenticated(false);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  const handleSelectApp = (id: string | null) => {
    setSelectedAppId(id);
    setShowQuickSwitcher(false);
    setShowFloatingMenu(false);
  };

  const handleExitPortal = () => {
    // 1. Attempt Cordova/PhoneGap/Capacitor exit
    const nav = window.navigator as any;
    if (nav && nav.app && typeof nav.app.exitApp === 'function') {
      try {
        nav.app.exitApp();
        return;
      } catch (e) {
        console.error("Cordova exitApp failed:", e);
      }
    }

    // 2. Attempt generic Android interface
    const win = window as any;
    if (win.Android) {
      if (typeof win.Android.exitApp === 'function') {
        try {
          win.Android.exitApp();
          return;
        } catch (e) {
          console.error("Android.exitApp failed:", e);
        }
      }
      if (typeof win.Android.close === 'function') {
        try {
          win.Android.close();
          return;
        } catch (e) {
          console.error("Android.close failed:", e);
        }
      }
    }

    // 3. Attempt Capacitor standard JS Bridge if loaded (e.g. window.Capacitor)
    if (win.Capacitor && win.Capacitor.Plugins && win.Capacitor.Plugins.App) {
      try {
        win.Capacitor.Plugins.App.exitApp();
        return;
      } catch (e) {
        console.error("Capacitor App.exitApp failed:", e);
      }
    }

    // 4. Attempt standard window.close
    try {
      win.close();
    } catch (e) {
      console.error("window.close failed:", e);
    }

    // 5. Fallback for browser preview: Go back to portal screen so it acts as an exit inside the web browser
    handleSelectApp(null);
    setShowFloatingMenu(false);
  };

  // Render proper icon based on app identifier
  const renderAppIcon = (id: string, className: string = "w-6 h-6") => {
    switch (id) {
      case 'accounting':
        return <Receipt className={className} />;
      case 'dailySales':
        return <TrendingUp className={className} />;
      case 'deliverySales':
        return <Truck className={className} />;
      case 'quran':
        return <BookOpen className={className} />;
      default:
        return <Zap className={className} />;
    }
  };

  const currentT = t[lang];
  const isRTL = lang === 'ar';

  const appsList = [
    {
      id: 'accounting',
      title: currentT.accounting,
      desc: currentT.accountingDesc,
      url: urls.accounting,
      color: "from-blue-500/10 to-blue-600/5 text-blue-400 border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/5"
    },
    {
      id: 'dailySales',
      title: currentT.dailySales,
      desc: currentT.dailySalesDesc,
      url: urls.dailySales,
      color: "from-emerald-500/10 to-emerald-600/5 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5"
    },
    {
      id: 'deliverySales',
      title: currentT.deliverySales,
      desc: currentT.deliverySalesDesc,
      url: urls.deliverySales,
      color: "from-amber-500/10 to-amber-600/5 text-amber-400 border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-500/5"
    },
    {
      id: 'quran',
      title: currentT.quran,
      desc: currentT.quranDesc,
      url: urls.quran,
      color: "from-purple-500/10 to-purple-600/5 text-purple-400 border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/5"
    }
  ];

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-[#050505] overflow-hidden flex flex-col font-sans select-none text-zinc-300"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
          >
            <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20"
              >
                <Zap className="w-10 h-10 text-white fill-current" />
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white font-semibold text-2xl mb-2 tracking-tight font-sans"
              >
                {currentT.portalTitle}
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-500 text-sm mb-12 leading-relaxed"
              >
                {currentT.loading}
              </motion.p>

              <div className="w-24 h-1 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  className="w-full h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="app-portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col"
          >
            {selectedAppId ? (
              // Active application screen with direct iframe and a draggable circular floating switcher menu
              <div className="w-full h-full flex flex-col relative bg-[#010101]">
                {appsList.map((app) => (
                  loadedApps[app.id] && (
                    <iframe
                      key={app.id}
                      src={urls[app.id as keyof typeof urls]}
                      style={{ display: selectedAppId === app.id ? 'block' : 'none' }}
                      className="w-full h-full flex-1 border-none"
                      title={app.title}
                      referrerPolicy="no-referrer"
                      allow="camera; microphone; geolocation"
                    />
                  )
                ))}

                {/* Draggable Circular Floating Menu Area */}
                <div ref={dragAreaRef} className="fixed inset-0 pointer-events-none z-50">
                  <motion.div
                    drag
                    dragConstraints={dragAreaRef}
                    dragElastic={0.05}
                    dragMomentum={false}
                    onDrag={(event, info) => {
                      const screenWidth = window.innerWidth;
                      const screenHeight = window.innerHeight;
                      if (info.point.x < screenWidth / 2) {
                        setMenuAlign('left');
                      } else {
                        setMenuAlign('right');
                      }
                      if (info.point.y < screenHeight / 2) {
                        setMenuValign('top');
                      } else {
                        setMenuValign('bottom');
                      }
                    }}
                    className="absolute bottom-10 right-10 pointer-events-auto"
                  >
                    <div className="relative">
                      {/* Floating Trigger Button */}
                      <button
                        onClick={() => setShowFloatingMenu(!showFloatingMenu)}
                        className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-400/20 active:scale-95 transition-all select-none cursor-grab active:cursor-grabbing"
                      >
                        <Menu className="w-6 h-6" />
                      </button>

                      {/* Floating Menu Popover */}
                      <AnimatePresence>
                        {showFloatingMenu && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 15 }}
                            className={`absolute ${menuValign === 'top' ? 'top-16' : 'bottom-16'} ${menuAlign === 'left' ? 'left-0' : 'right-0'} w-64 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 rounded-[2rem] p-4 shadow-2xl space-y-4`}
                          >
                            <div className="space-y-1.5">
                              {appsList.map((app) => (
                                <button
                                  key={app.id}
                                  onClick={() => {
                                    handleSelectApp(app.id);
                                    setShowFloatingMenu(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl transition-all ${
                                    selectedAppId === app.id 
                                      ? 'bg-blue-600/15 text-blue-400 font-bold border border-blue-500/20' 
                                      : 'hover:bg-zinc-900/80 text-zinc-400 hover:text-white border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {renderAppIcon(app.id, "w-4 h-4")}
                                    <span>{app.title}</span>
                                  </div>
                                  {selectedAppId === app.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                                </button>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-zinc-900">
                              {/* Exit button */}
                              <button
                                onClick={handleExitPortal}
                                className="w-full flex items-center justify-center gap-2 bg-red-600/15 hover:bg-red-600/25 border border-red-500/20 text-red-400 text-xs font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
                              >
                                <LogOut className="w-4 h-4" />
                                <span>{currentT.exitPortal}</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              // Landing dashboard displaying the 4 applications
              <div className="w-full h-full flex flex-col justify-between overflow-hidden px-4 md:px-6 py-4 md:py-8 relative">
                {/* Background ambient lighting effects */}
                <div className="absolute top-[-10%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

                {/* Dashboard Header */}
                <header className="max-w-4xl w-full mx-auto flex items-center justify-between mb-4 md:mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/10">
                      <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div>
                      <h1 className="text-base md:text-lg font-bold text-white tracking-tight">{currentT.portalTitle}</h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Language Switcher */}
                    <button
                      onClick={toggleLanguage}
                      className="px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-xs text-zinc-300 rounded-xl transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span>{currentT.language}</span>
                    </button>

                    {/* Admin Settings Link */}
                    <button
                      onClick={() => setShowAdminLogin(true)}
                      className="p-2 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all active:scale-95"
                      title={currentT.adminPortal}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </header>

                {/* Welcome Hero Panel - Hidden on mobile to fit screen completely */}
                <div className="hidden md:block max-w-4xl w-full mx-auto text-center my-6">
                  <motion.h2 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3"
                  >
                    {currentT.portalTitle}
                  </motion.h2>
                </div>

                {/* Applications grid - 2x2 layout by default for mobile and desktop */}
                <main className="max-w-4xl w-full mx-auto grid grid-cols-2 gap-3 md:gap-5 my-2 md:my-8 flex-1 items-center content-center">
                  {appsList.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index + 0.2 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => handleSelectApp(app.id)}
                      className={`glass-panel p-4 md:p-8 rounded-2xl md:rounded-[2rem] border bg-zinc-900/20 backdrop-blur-md flex flex-col items-center justify-center text-center gap-2 md:gap-4 cursor-pointer transition-all ${app.color} group relative overflow-hidden h-28 sm:h-32 md:h-[180px]`}
                    >
                      {/* Subtle app card background glow */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      <div className="p-2 md:p-4 bg-zinc-900/80 border border-zinc-800/60 rounded-xl md:rounded-2xl group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-300 shadow-md">
                        {renderAppIcon(app.id, "w-6 h-6 md:w-8 md:h-8")}
                      </div>

                      <h3 className="text-xs md:text-lg font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight line-clamp-2">
                        {app.title}
                      </h3>
                    </motion.div>
                  ))}
                </main>

                {/* Portal Footer - Compacted */}
                <footer className="max-w-4xl w-full mx-auto text-center border-t border-zinc-900 pt-4 mt-4">
                  <p className="text-[10px] text-zinc-600">
                    &copy; 2026 {currentT.portalTitle}. All rights reserved.
                  </p>
                </footer>
              </div>
            )}

            {/* Admin Portal Modal */}
            <AnimatePresence>
              {showAdminLogin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl"
                  >
                    <button 
                      onClick={closeAdminMenu}
                      className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-zinc-500 hover:text-white transition-colors`}
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {!isAdminAuthenticated ? (
                      <form onSubmit={handleAdminLogin} className="space-y-6 pt-4">
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold tracking-wider uppercase mb-3">
                            {currentT.adminPortal}
                          </div>
                          <h2 className="text-xl font-bold text-white">{currentT.adminLogin}</h2>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                              {currentT.username}
                            </label>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl py-3.5 px-4 text-white text-xs focus:outline-none focus:border-blue-500/40 transition-all font-mono"
                              placeholder="alaa"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                              {currentT.password}
                            </label>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl py-3.5 px-4 text-white text-xs focus:outline-none focus:border-blue-500/40 transition-all"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>

                        {loginError && <p className="text-xs text-red-400 text-center font-medium">{loginError}</p>}

                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                          {currentT.loginBtn}
                        </button>
                      </form>
                    ) : (
                      // Admin configuration for all 4 links individually!
                      <div className="space-y-6 pt-4">
                        <div className="text-center mb-4">
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold tracking-wider uppercase mb-3">
                            {currentT.configMode}
                          </div>
                          <h2 className="text-xl font-bold text-white">{currentT.configMode}</h2>
                        </div>

                        {saveSuccess ? (
                          <div className="py-8 flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                              <Check className="w-6 h-6 animate-bounce" />
                            </div>
                            <p className="text-xs font-medium text-emerald-400 text-center">{currentT.successSave}</p>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                              {/* Link 1 */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5">
                                  {renderAppIcon('accounting', 'w-3.5 h-3.5')}
                                  <span>{currentT.accounting}</span>
                                </label>
                                <input
                                  type="text"
                                  value={editUrls.accounting}
                                  onChange={(e) => setEditUrls({ ...editUrls, accounting: e.target.value })}
                                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2.5 px-3 text-white text-[11px] focus:outline-none focus:border-blue-500/40 transition-all font-mono"
                                  placeholder="https://..."
                                />
                              </div>

                              {/* Link 2 */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5">
                                  {renderAppIcon('dailySales', 'w-3.5 h-3.5')}
                                  <span>{currentT.dailySales}</span>
                                </label>
                                <input
                                  type="text"
                                  value={editUrls.dailySales}
                                  onChange={(e) => setEditUrls({ ...editUrls, dailySales: e.target.value })}
                                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2.5 px-3 text-white text-[11px] focus:outline-none focus:border-blue-500/40 transition-all font-mono"
                                  placeholder="https://..."
                                />
                              </div>

                              {/* Link 3 */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5">
                                  {renderAppIcon('deliverySales', 'w-3.5 h-3.5')}
                                  <span>{currentT.deliverySales}</span>
                                </label>
                                <input
                                  type="text"
                                  value={editUrls.deliverySales}
                                  onChange={(e) => setEditUrls({ ...editUrls, deliverySales: e.target.value })}
                                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2.5 px-3 text-white text-[11px] focus:outline-none focus:border-blue-500/40 transition-all font-mono"
                                  placeholder="https://..."
                                />
                              </div>

                              {/* Link 4 */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5">
                                  {renderAppIcon('quran', 'w-3.5 h-3.5')}
                                  <span>{currentT.quran}</span>
                                </label>
                                <input
                                  type="text"
                                  value={editUrls.quran}
                                  onChange={(e) => setEditUrls({ ...editUrls, quran: e.target.value })}
                                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2.5 px-3 text-white text-[11px] focus:outline-none focus:border-blue-500/40 transition-all font-mono"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900">
                              <button
                                onClick={handleSaveUrls}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-3 rounded-2xl transition-all shadow-lg active:scale-95"
                              >
                                {currentT.saveBtn}
                              </button>
                              <button
                                onClick={() => setIsAdminAuthenticated(false)}
                                className="w-full py-2 text-zinc-500 hover:text-zinc-400 text-[10px] uppercase font-bold tracking-wider"
                              >
                                {currentT.backBtn}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
