/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, User, Lock, ArrowRight, UserCircle } from 'lucide-react';

export default function App() {
  const [targetUrl, setTargetUrl] = useState("https://daily-sales-swc.netlify.app/");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [showFab, setShowFab] = useState(true);

  useEffect(() => {
    // Load saved URL from localStorage
    const savedUrl = localStorage.getItem('daily_sales_target_url');
    if (savedUrl) {
      setTargetUrl(savedUrl);
    }

    const timer = setTimeout(() => {
      setShowFab(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'alaa' && password === '0120301012') {
      setIsAdminAuthenticated(true);
      setNewUrl(targetUrl);
      setLoginError('');
    } else {
      setLoginError('بيانات الدخول غير صحيحة');
    }
  };

  const handleSaveUrl = () => {
    if (!newUrl) return;
    localStorage.setItem('daily_sales_target_url', newUrl);
    setTargetUrl(newUrl);
    setIsAdminAuthenticated(false);
    setShowAdminLogin(false);
    setUsername('');
    setPassword('');
  };

  const closeAdminMenu = () => {
    setShowAdminLogin(false);
    setIsAdminAuthenticated(false);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] overflow-hidden flex flex-col font-sans">
      <div className="relative w-full h-full flex flex-col">
        <iframe
          src={targetUrl}
          className="w-full h-full border-none shadow-2xl"
          title="Daily Sales System"
          referrerPolicy="no-referrer"
          allow="camera; microphone; geolocation"
        />
      </div>

      {/* Floating Admin Button - Only visible for the first 5 seconds */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowAdminLogin(true)}
            className="fixed bottom-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)] group z-[60] active:scale-95"
          >
            <Zap className="w-5 h-5 fill-current text-white group-hover:text-amber-500 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Admin Portal Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md glass-panel p-8 rounded-[2.5rem] relative overflow-hidden"
            >
              <button 
                onClick={closeAdminMenu}
                className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>

              {!isAdminAuthenticated ? (
                <form onSubmit={handleAdminLogin} className="space-y-6 pt-4">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-medium tracking-wider uppercase mb-4">
                      Admin Portal
                    </div>
                    <h2 className="text-2xl font-semibold text-white">تسجيل دخول الإدارة</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium ml-1">اسم المستخدم</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 px-4 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                        placeholder="alaa"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium ml-1">الرقم السري</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 px-4 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {loginError && <p className="text-xs text-red-400 text-center">{loginError}</p>}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-3xl transition-all shadow-lg active:scale-95"
                  >
                    دخول
                  </button>
                </form>
              ) : (
                <div className="space-y-6 pt-4">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-medium tracking-wider uppercase mb-4">
                      Configuration Mode
                    </div>
                    <h2 className="text-2xl font-semibold text-white">تغيير رابط النظام</h2>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-amber-500/80 uppercase tracking-widest font-medium ml-1">رابط الوجهة الجديد</label>
                    <input
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/20 rounded-2xl py-4 px-4 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-all font-mono"
                      placeholder="https://..."
                    />
                    <p className="text-[9px] text-zinc-600 mt-2">سيتم حفظ هذا الرابط لجميع مستخدمي التطبيق.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSaveUrl}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-4 rounded-3xl transition-all shadow-lg active:scale-95"
                    >
                      حفظ وتحديث النظام
                    </button>
                    <button
                      onClick={() => setIsAdminAuthenticated(false)}
                      className="w-full py-3 text-zinc-500 hover:text-zinc-400 text-[10px] uppercase tracking-widest font-medium"
                    >
                      رجوع
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
