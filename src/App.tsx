/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  X, 
  Check, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Link as LinkIcon 
} from 'lucide-react';

const DEFAULT_URL = "https://daily-sales-rose.vercel.app/";
const SECRET_PASSCODE = "0120301012";
const STORAGE_KEY = "daily_sales_custom_url";

export default function App() {
  const [url, setUrl] = useState<string>(DEFAULT_URL);
  const [editUrl, setEditUrl] = useState<string>(DEFAULT_URL);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // 3-second icon visibility state
  const [showConfigIcon, setShowConfigIcon] = useState<boolean>(true);

  // Settings Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPasscodeAuthenticated, setIsPasscodeAuthenticated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Load saved URL on mount and start 2-second timer for icon
  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('swc_url_dailySales');
    if (savedUrl && savedUrl.trim()) {
      setUrl(savedUrl);
      setEditUrl(savedUrl);
    } else {
      setUrl(DEFAULT_URL);
      setEditUrl(DEFAULT_URL);
    }

    // Show icon for exactly 3 seconds then disappear
    timerRef.current = setTimeout(() => {
      setShowConfigIcon(false);
    }, 3000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Handle clicking the 2-second icon
  const handleIconClick = () => {
    // Clear timeout so it doesn't close abruptly
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowConfigIcon(false);
    setIsModalOpen(true);
    setEditUrl(url);
    setPasscode('');
    setErrorMessage('');
    setIsPasscodeAuthenticated(false);
  };

  // Handle Passcode verification
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === SECRET_PASSCODE) {
      setIsPasscodeAuthenticated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('الرقم السري غير صحيح، يرجى المحاولة مرة أخرى');
    }
  };

  // Handle saving the new URL
  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = editUrl.trim();
    if (!cleanUrl) {
      setErrorMessage('يرجى إدخال رابط صالح');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // Persist in localStorage so it automatically loads on all future starts
    localStorage.setItem(STORAGE_KEY, cleanUrl);
    localStorage.setItem('swc_url_dailySales', cleanUrl);

    setUrl(cleanUrl);
    setEditUrl(cleanUrl);
    setSaveSuccess(true);
    setIsIframeLoading(true);
    setIframeKey(prev => prev + 1);

    setTimeout(() => {
      setSaveSuccess(false);
      setIsModalOpen(false);
      setIsPasscodeAuthenticated(false);
      setPasscode('');
      setErrorMessage('');
    }, 1200);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsPasscodeAuthenticated(false);
    setPasscode('');
    setErrorMessage('');
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-white overflow-hidden flex flex-col font-sans select-none"
      dir="rtl"
    >
      {/* 3-Second Temporary Settings Icon (Bottom Right) */}
      <AnimatePresence>
        {showConfigIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 15 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
          >
            <button
              onClick={handleIconClick}
              className="relative group flex items-center justify-center p-2.5 rounded-2xl bg-slate-900/95 hover:bg-slate-900 text-blue-400 hover:text-blue-300 border border-blue-500/50 shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
              title="إعدادات الرابط"
            >
              {/* 3-second animated circular countdown */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5">
                <circle
                  cx="50%"
                  cy="50%"
                  r="16"
                  className="stroke-blue-500/20"
                  strokeWidth="2.5"
                  fill="none"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="16"
                  className="stroke-blue-500"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 100 }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </svg>
              <Settings className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Fullscreen Application Iframe */}
      <div className="relative w-full h-full flex-1 bg-white">
        <iframe
          ref={iframeRef}
          key={iframeKey}
          src={url}
          className="w-full h-full border-none block bg-white"
          title="Daily Sales System"
          referrerPolicy="no-referrer"
          allow="camera; microphone; geolocation; clipboard-read; clipboard-write; fullscreen"
        />
      </div>

      {/* Secret Passcode & URL Configuration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-slate-950 border border-slate-800 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl text-right"
            >
              {/* Close Button */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-5 left-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step 1: Request Secret Passcode (0120301012) */}
              {!isPasscodeAuthenticated ? (
                <form onSubmit={handleVerifyPasscode} className="space-y-5 pt-1">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wider mb-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>حماية الإعدادات</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">أدخل الرقم السري</h2>
                    <p className="text-xs text-slate-400 mt-1">أدخل الرقم السري لتعديل رابط تشغيل التطبيق</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-medium block">
                      الرقم السري
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passcode}
                        onChange={(e) => {
                          setPasscode(e.target.value);
                          setErrorMessage('');
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-10 text-white text-sm focus:outline-none focus:border-blue-500/60 transition-all font-mono tracking-widest text-center"
                        placeholder="••••••••••"
                        autoFocus
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-200 absolute left-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    تأكيد الرقم السري
                  </button>
                </form>
              ) : (
                /* Step 2: Passcode verified -> Show & Edit Application URL */
                <form onSubmit={handleSaveUrl} className="space-y-5 pt-1">
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>تعديل رابط التطبيق</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">رابط النظام التلقائي</h2>
                    <p className="text-xs text-slate-400 mt-1">سيتم فتح هذا الرابط مباشرة وتلقائياً عند تشغيل التطبيق</p>
                  </div>

                  {saveSuccess ? (
                    <div className="py-6 flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Check className="w-6 h-6 animate-bounce" />
                      </div>
                      <p className="text-xs font-medium text-blue-400 text-center">تم حفظ الرابط وسيتم فتح التطبيق عليه دائماً!</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                          <span>رابط الموقع / النظام</span>
                        </label>
                        <input
                          type="text"
                          value={editUrl}
                          onChange={(e) => {
                            setEditUrl(e.target.value);
                            setErrorMessage('');
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-3 text-white text-xs focus:outline-none focus:border-blue-500/60 transition-all font-mono"
                          placeholder="https://daily-sales-rose.vercel.app/"
                          dir="ltr"
                          autoFocus
                        />
                      </div>

                      {errorMessage && (
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center font-medium">
                          {errorMessage}
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                          حفظ وتطبيق الرابط الجديد
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
