/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, User, Lock, ArrowRight, UserCircle } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedUser, setSavedUser] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [targetUrl, setTargetUrl] = useState("https://daily-sales-swc.netlify.app/");
  const [isSettingUrl, setIsSettingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState("");

  useEffect(() => {
    // Check for saved user on initial load
    const user = localStorage.getItem('daily_sales_user');
    const savedUrl = localStorage.getItem('daily_sales_target_url');
    
    if (savedUrl) {
      setTargetUrl(savedUrl);
    }

    if (user) {
      setSavedUser(user);
      setUsername(user);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError('يرجى إدخال البيانات المطلوبة');
      return;
    }

    // Special case for admin alaa
    if (username === 'alaa' && password === '0120301012') {
      setTempUrl(targetUrl);
      setIsSettingUrl(true);
      localStorage.setItem('daily_sales_user', username);
      return;
    }

    // In a real application, you would verify the credentials here.
    // For this shell app, we'll simulate verification and save the user.
    localStorage.setItem('daily_sales_user', username);
    setIsLoggedIn(true);
  };

  const handleSaveAndOpen = () => {
    if (!tempUrl) return;
    localStorage.setItem('daily_sales_target_url', tempUrl);
    setTargetUrl(tempUrl);
    setIsSettingUrl(false);
    setIsLoggedIn(true);
  };

  const handleSwitchUser = () => {
    localStorage.removeItem('daily_sales_user');
    setSavedUser(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] overflow-hidden flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-zinc-300"
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
                className="text-white font-semibold text-2xl mb-2 tracking-tight"
              >
                Daily Sales
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-500 text-sm mb-12 leading-relaxed"
              >
                جارِ تجهيز نظام المبيعات اليومية...
              </motion.p>

              <div className="w-16 h-1 rounded-full bg-zinc-800 overflow-hidden">
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
        ) : isSettingUrl ? (
          <motion.div
            key="url-config"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-[#050505]"
          >
            <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-[2.5rem] space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium tracking-wider uppercase mb-6">
                  Admin Configuration
                </div>
                <h2 className="text-3xl font-semibold text-white mb-2 tracking-tight">إعداد الرابط</h2>
                <p className="text-zinc-500 text-sm">يمكنك تعديل رابط النظام هنا ليتم حفظه</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1 font-medium">رابط النظام الحالي</label>
                  <div className="relative group">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="text"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all font-light"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveAndOpen}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-amber-900/20 group active:scale-[0.98]"
                  >
                    حفظ وفتح النظام
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsSettingUrl(false);
                      setIsLoggedIn(true);
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition-all active:scale-[0.98]"
                  >
                    تجاوز (فتح الرابط الحالي)
                  </button>
                </div>
              </div>

              <div className="pt-4 text-center border-t border-zinc-900/50">
                <div className="text-[10px] text-zinc-700 uppercase tracking-[0.2em] mb-2">Target Link Persistence</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-[10px] text-amber-500/60 font-medium font-mono uppercase">Changes will apply for all users</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : !isLoggedIn ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-[#050505]"
          >
            <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-[2.5rem] space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium tracking-wider uppercase mb-6">
                  Security Gateway Active
                </div>
                <h2 className="text-3xl font-semibold text-white mb-2 tracking-tight">Daily Sales</h2>
                <p className="text-zinc-500 text-sm">مرحباً بك في نظام إدارة المبيعات</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {savedUser ? (
                  <div className="p-5 bg-zinc-900/50 rounded-3xl border border-zinc-800/50 flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                      <UserCircle className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">تسجيل دخول كـ</p>
                      <p className="text-white font-medium">{savedUser}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleSwitchUser}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium px-3 py-2"
                    >
                      تغيير؟
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1 font-medium">اسم المستخدم</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all font-light"
                        placeholder="أدخل اسم المستخدم"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1 font-medium">الرقم السري</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all font-light"
                      placeholder="••••••••"
                      autoFocus={!!savedUser}
                    />
                  </div>
                </div>

                {loginError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400/80 text-center"
                  >
                    {loginError}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20 group active:scale-[0.98] mt-4"
                >
                  دخول النظام
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="pt-4 text-center border-t border-zinc-900/50">
                <div className="text-[10px] text-zinc-700 uppercase tracking-[0.2em] mb-2">Cloud Connectivity</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-500/60 font-medium">Encrypted & Secure</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {(isLoggedIn) && (
        <iframe
          id="app-frame"
          src={targetUrl}
          className="w-full h-full border-none flex-grow"
          title="Daily Sales"
          allow="camera; microphone; geolocation"
        />
      )}
    </div>
  );
}
