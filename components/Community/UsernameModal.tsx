import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Globe, Check, Sparkles, ArrowRight, HeartHandshake, Camera, Upload, Trash2, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { communityService } from '../../services/communityService';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  isInitialPrompt?: boolean;
  onBackToApps?: () => void;
}

const COUNTRIES = [
  'مصر 🇪🇬',
  'السعودية 🇸🇦',
  'المغرب 🇲🇦',
  'الجزائر 🇩🇿',
  'الأردن 🇯🇴',
  'الإمارات 🇦🇪',
  'الكويت 🇰🇼',
  'قطر 🇶🇦',
  'العراق 🇮🇶',
  'تونس 🇹🇳',
  'عُمان 🇴🇲',
  'فلسطين 🇵🇸',
  'لبنان 🇱🇧',
  'ليبيا 🇱🇾',
  'السودان 🇸🇩',
  'اليمن 🇾🇪',
  'دولة أخرى 🌍'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
];

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onClose, onSaved, isInitialPrompt = false, onBackToApps }) => {
  const currentUser = communityService.getCurrentUser();
  const [username, setUsername] = useState(currentUser.username || '');
  const [country, setCountry] = useState(currentUser.country || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showRedirectOption, setShowRedirectOption] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGoogleLogin = async (useRedirect = false) => {
    setIsGoogleLoading(true);
    setError('');
    try {
      if (useRedirect) {
        await communityService.loginWithGoogleRedirect();
        return;
      }
      const user = await communityService.loginWithGoogle(false);
      setUsername(user.username || '');
      setCountry(user.country || '');
      setBio(user.bio || '');
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
      setShowRedirectOption(false);
      if (onSaved) onSaved();
    } catch (err: any) {
      console.warn('Google login attempt result:', err);
      setShowRedirectOption(true);
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
        setError('حجب المتصفح نافذة Google المنبثقة أو تم إغلاقها. اضغط على خيار "الدخول عبر صفحة Google المباشرة" أدناه للمتابعة.');
      } else {
        setError('تعذر إتمام الدخول عبر النافذة المنبثقة. يرجى استخدام زر الدخول المباشر أدناه.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    setIsGoogleLoading(true);
    try {
      await communityService.logoutGoogle();
      const updated = communityService.getCurrentUser();
      setUsername(updated.username || '');
      setCountry(updated.country || '');
      setBio(updated.bio || '');
      setAvatarUrl(updated.avatarUrl || '');
    } catch (e) {
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const curr = communityService.getCurrentUser();
    if (!curr.isGoogleAuth) {
      setError('عفواً، يجب تسجيل الدخول باستخدام Google أولاً لبدء التراسل والتواصل.');
      return;
    }
    if (!username.trim() || username.trim().length < 2) {
      setError('يرجى كتابة اسم المستخدم أو اللقب المبارك (حرفين على الأقل)');
      return;
    }
    if (!country || !country.trim()) {
      setError('يرجى اختيار الدولة / البلد');
      return;
    }
    if (!avatarUrl || !avatarUrl.trim()) {
      setError('يرجى اختيار صورة شخصية أو تحديد أحد الصور الرمزية المتاحة');
      return;
    }

    setIsSaving(true);
    try {
      await communityService.saveCurrentUser(username, country, bio, avatarUrl);
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          {/* Header Glow */}
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          {/* Back Button to Apps list / Previous Page */}
          <button
            type="button"
            onClick={() => {
              if (onBackToApps) {
                onBackToApps();
              } else {
                onClose();
              }
            }}
            className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-all shadow-sm hover:scale-105"
            title="الرجوع إلى صفحة قائمة التطبيقات"
          >
            <ArrowRight size={15} />
            <span>رجوع</span>
          </button>

          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <span>مجتمع المصحف الشريف</span>
              <Sparkles size={18} className="text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              أدخل بياناتك وصورتك الشخصية للتواصل مع القُرّاء
            </p>
          </div>

          {/* Google One-Click Login Box */}
          <div className="mb-5 p-3.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
            {currentUser.isGoogleAuth ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Shield className="text-emerald-500 flex-shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>حسابك موثّق مع Google</span>
                      <CheckCircle2 size={13} />
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email || 'Google Account'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  disabled={isGoogleLoading}
                  className="text-[11px] text-rose-500 hover:bg-rose-500/10 px-2.5 py-1 rounded-xl transition-all font-semibold flex-shrink-0"
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-center gap-1.5">
                  <Shield size={15} className="text-emerald-500" />
                  <span>لحفظ حسابك ومنع تكراره عند تغيير الجهاز:</span>
                </p>
                <button
                  type="button"
                  onClick={() => handleGoogleLogin(false)}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-white rounded-xl font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 text-xs active:scale-98"
                >
                  {isGoogleLoading ? (
                    <Loader2 size={16} className="animate-spin text-emerald-500" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>تسجيل الدخول الرسمي بحساب Google</span>
                </button>

                {/* Direct Redirect fallback if browser blocks popups */}
                {showRedirectOption && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 text-center">
                    <button
                      type="button"
                      onClick={() => handleGoogleLogin(true)}
                      disabled={isGoogleLoading}
                      className="w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Globe size={14} />
                      <span>الدخول عبر صفحة Google المباشرة (بدون نوافذ منبثقة)</span>
                    </button>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      ينتقل بك هذا الخيار إلى صفحة Google الرسمية ثم يعود بك فوراً للتطبيق
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center justify-center mb-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border-2 border-emerald-500/30 overflow-hidden shadow-md">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="صورة الملف الشخصي" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 left-0 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
                  title="رفع صورة جديدة"
                >
                  <Camera size={16} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="mt-2 text-xs text-rose-500 hover:underline flex items-center gap-1 font-medium"
                >
                  <Trash2 size={12} />
                  <span>إزالة الصورة</span>
                </button>
              )}

              {/* Preset avatars selection */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">أو اختر رمزاً:</span>
                <div className="flex items-center gap-1.5">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border transition-all ${
                        avatarUrl === url ? 'ring-2 ring-emerald-500 border-white' : 'border-slate-300 dark:border-slate-700 opacity-80'
                      }`}
                    >
                      <img src={url} alt={`رمز ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم المستخدم / اللقب المبارك:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="أدخل اسم المستخدم أو اللقب المبارك..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الدولة / البلد:
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
              >
                <option value="" disabled>-- اختر الدولة / البلد --</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نبذة بسيطة (اختياري):
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="أكتب نبذة بسيطة عنك..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جاري حفظ البيانات بالسيرفر...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>حفظ وبدء التراسل</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UsernameModal;
