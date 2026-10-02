import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Check, Sparkles, ArrowRight, Camera, Trash2, 
  Loader2, KeyRound, Copy, LogIn, Lock, CheckCircle2, Shield
} from 'lucide-react';
import { communityService, CommunityUser } from '../../services/communityService';
import { registerBackInterceptor } from '../../hooks/useBackButton';

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

const UsernameModal: React.FC<UsernameModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaved, 
  onBackToApps 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'restore'>('profile');
  const [currentUser, setCurrentUser] = useState<CommunityUser>(() => communityService.getCurrentUser());
  
  // Profile fields
  const [username, setUsername] = useState(currentUser.username || '');
  const [country, setCountry] = useState(currentUser.country || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || '');
  const [passcode, setPasscode] = useState(currentUser.passcode || '');
  
  // Restore fields
  const [restoreCode, setRestoreCode] = useState('');
  const [restorePasscode, setRestorePasscode] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens
  useEffect(() => {
    const syncUser = () => {
      const u = communityService.getCurrentUser();
      setCurrentUser(u);
      if (u.username) setUsername(u.username);
      if (u.country) setCountry(u.country);
      if (u.bio) setBio(u.bio);
      if (u.avatarUrl) setAvatarUrl(u.avatarUrl);
      if (u.passcode) setPasscode(u.passcode);
    };

    syncUser();
    window.addEventListener('community_user_updated', syncUser);
    return () => window.removeEventListener('community_user_updated', syncUser);
  }, [isOpen]);

  // Handle hardware back button when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const unregister = registerBackInterceptor(() => {
      if (onBackToApps) {
        onBackToApps();
      } else {
        onClose();
      }
      return true;
    });

    return () => {
      unregister();
    };
  }, [isOpen, onBackToApps, onClose]);

  const handleCopyCode = async () => {
    if (!currentUser.accountCode) return;
    try {
      await navigator.clipboard.writeText(currentUser.accountCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      // Fallback
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setError('');
    setSuccessMsg('');
    try {
      await communityService.saveCurrentUser(username, country, bio, avatarUrl, passcode);
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err?.message || 'حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreCode.trim()) {
      setError('يرجى إدخال كود الحساب أو اسم المستخدم');
      return;
    }

    setIsRestoring(true);
    setError('');
    setSuccessMsg('');

    try {
      const restored = await communityService.restoreAccount(restoreCode, restorePasscode);
      setCurrentUser(restored);
      setUsername(restored.username || '');
      setCountry(restored.country || '');
      setBio(restored.bio || '');
      setAvatarUrl(restored.avatarUrl || '');
      setPasscode(restored.passcode || '');
      
      setSuccessMsg(`مرحباً بك مجدداً يا ${restored.username}! تم استعادة حسابك ومحادثاتك بنجاح.`);
      
      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'تعذر استعادة الحساب. تأكد من صحة الكود ورمز المرور.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSwitchAccount = () => {
    communityService.logoutAccount();
    const fresh = communityService.getCurrentUser();
    setCurrentUser(fresh);
    setUsername('');
    setCountry('');
    setBio('');
    setAvatarUrl('');
    setPasscode('');
    setError('');
    setSuccessMsg('تم تسجيل الخروج بنجاح. يمكنك الآن إنشاء حساب جديد أو استعادة حساب آخر.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto"
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
            title="الرجوع"
          >
            <ArrowRight size={15} />
            <span>رجوع</span>
          </button>

          <div className="text-center mb-4 mt-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <span>مجتمع المصحف الشريف</span>
              <Sparkles size={18} className="text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              حسابك ومحادثاتك محفوظة دائماً بدون حاجة لجوجل
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl mb-4 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User size={14} />
              <span>{currentUser.username ? 'تعديل بياناتي' : 'إنشاء حساب جديد'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('restore');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'restore'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn size={14} />
              <span>استعادة حساب سابق</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Profile & Create New */}
          {activeTab === 'profile' && (
            <div>
              {/* Account Code Showcase Card */}
              <div className="mb-4 p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      كود حسابك الدائم (للدخول من أي هاتف آخر):
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">
                        {currentUser.accountCode || 'MQ-XXXXX'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex-shrink-0"
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  احفظ هذا الكود. عند فتح التطبيق من أي جهاز آخر، ادخل الكود لاستعادة اسمك ومحادثاتك فوراً.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center mb-1">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border-2 border-emerald-500/30 overflow-hidden shadow-md">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="صورة الملف" className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 left-0 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
                      title="رفع صورة جديدة"
                    >
                      <Camera size={14} />
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
                      className="mt-1 text-[11px] text-rose-500 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Trash2 size={11} />
                      <span>إزالة الصورة</span>
                    </button>
                  )}

                  {/* Preset Avatars */}
                  <div className="mt-2.5 flex items-center gap-2">
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

                {/* Username */}
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
                    placeholder="مثال: أحمد عبد الله..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الدولة / البلد:
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
                  >
                    <option value="" disabled>-- اختر الدولة / البلد --</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نبذة بسيطة (اختياري):
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="أكتب نبذة بسيطة عنك..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                {/* Optional Passcode / PIN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock size={12} className="text-emerald-500" />
                      <span>رمز مرور سري لحماية الحساب (اختياري):</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">4-6 أرقام</span>
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="ضع رمز مرور لحماية حسابك من الدخول..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>جارٍ الحفظ والمزامنة...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>حفظ البيانات وبدء التراسل</span>
                      </>
                    )}
                  </button>

                  {currentUser.username && (
                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={13} className="text-rose-500" />
                      <span>تسجيل الخروج والبدء بحساب جديد</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Restore Existing Account */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <KeyRound size={15} className="text-emerald-500" />
                  <span>فتح حسابك من أي جهاز أو نسخة أخرى:</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  إذا كنت قد سجلت حساباً في السابق على هاتف آخر، قم بإدخال كود حسابك الفريد (مثل: <span className="font-mono font-bold text-emerald-600">MQ-XXXXX</span>) أو اسم المستخدم، وسيتم فتح حسابك ومحادثاتك ودردشاتك فوراً بدون تكرار!
                </p>
              </div>

              <form onSubmit={handleRestoreAccount} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كود الحساب الفريد أو اسم المستخدم:
                  </label>
                  <input
                    type="text"
                    value={restoreCode}
                    onChange={(e) => {
                      setRestoreCode(e.target.value);
                      setError('');
                    }}
                    placeholder="أدخل كود الحساب (MQ-XXXXX) أو اسم المستخدم..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رمز الحماية (PIN) - إن كنت قد قمت بتعيينه:
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={restorePasscode}
                    onChange={(e) => {
                      setRestorePasscode(e.target.value);
                      setError('');
                    }}
                    placeholder="اتركه فارغاً إذا لم تكن قد عينت رمزاً..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isRestoring}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isRestoring ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>جارٍ البحث واستعادة الحساب...</span>
                      </>
                    ) : (
                      <>
                        <LogIn size={16} />
                        <span>استعادة الحساب والدخول</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UsernameModal;
