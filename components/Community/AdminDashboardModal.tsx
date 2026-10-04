import React, { useState, useEffect } from 'react';
import { X, Trash2, ShieldAlert, Users, Info, ShieldCheck, Mail, Send, Reply, ArrowRight, User, Globe, Calendar, Activity, UserMinus, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { communityService, CommunityUser, ServerContact, ChatMessage, ADMIN_USER_ID } from '../../services/communityService';

interface AdminDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: any;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
    isOpen,
    onClose,
    currentTheme
}) => {
    const [users, setUsers] = useState<CommunityUser[]>([]);
    const [contacts, setContacts] = useState<ServerContact[]>([]);
    const [serverMessages, setServerMessages] = useState<ChatMessage[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'support'>('users');
    
    // Detailed User Inspector State
    const [selectedInspectorUser, setSelectedInspectorUser] = useState<CommunityUser | null>(null);

    // Support tab reply states
    const [selectedUserForSupport, setSelectedUserForSupport] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    // In-app Confirmation Modal State
    const [userToDeleteConfirm, setUserToDeleteConfirm] = useState<CommunityUser | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const showAdminToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const loadData = async () => {
        const uList = await communityService.fetchLatestUsers();
        // Remove official Admin from regular list
        const filteredUsers = uList.filter(u => u.userId !== ADMIN_USER_ID);
        setUsers(filteredUsers);
        setContacts(communityService.getRawContacts());
        
        const msgs = await communityService.fetchAllServerMessages();
        setServerMessages(msgs);
    };

    const promptDeleteUser = (user: CommunityUser) => {
        setUserToDeleteConfirm(user);
    };

    const executeDeleteUser = async () => {
        if (!userToDeleteConfirm) return;
        setIsDeleting(true);
        try {
            const uName = userToDeleteConfirm.username || 'القارئ';
            await communityService.deleteUser(userToDeleteConfirm.userId);
            setUserToDeleteConfirm(null);
            setSelectedInspectorUser(null);
            await loadData();
            showAdminToast(`تم حذف حساب القارئ "${uName}" نهائياً من التطبيق والسيرفر ✅`);
        } catch (e) {
            console.error('Error deleting user:', e);
            showAdminToast('حدث خطأ أثناء محاولة الحذف، يرجى المحاولة ثانية');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleImpersonate = (user: CommunityUser) => {
        communityService.impersonateUser(user);
        onClose();
    };

    const handleSendReply = async () => {
        if (!selectedUserForSupport || !replyText.trim()) return;
        setSendingReply(true);
        try {
            await communityService.sendAdminReply(selectedUserForSupport, replyText);
            setReplyText('');
            loadData();
        } catch (e) {
            console.error(e);
        } finally {
            setSendingReply(false);
        }
    };

    if (!isOpen) return null;

    // Filter messages for support
    const supportMessages = serverMessages.filter(
        m => m.recipientId === ADMIN_USER_ID || m.senderId === ADMIN_USER_ID
    );

    // Group support messages by user
    const supportUserIds = Array.from(new Set(
        supportMessages.map(m => m.senderId === ADMIN_USER_ID ? m.recipientId : m.senderId)
    ));

    return (
        <div className="fixed inset-0 z-[1300] bg-white dark:bg-slate-950 flex flex-col animate-fadeIn overflow-hidden" dir="rtl" style={{ color: currentTheme.text }}>
            
            {/* Admin In-App Toast */}
            {toastMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[1450] bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce border border-white/20">
                    <CheckCircle2 size={18} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* In-App Delete Confirmation Modal (Native UI - No Window.confirm) */}
            {userToDeleteConfirm && (
                <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center animate-scaleUp">
                        <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                            <AlertTriangle size={34} />
                        </div>
                        
                        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                            تأكيد حذف الحساب نهائياً ⚠️
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            هل أنت متأكد من رغبتك في حذف حساب القارئ <strong className="text-rose-600 dark:text-rose-400 underline font-bold">{userToDeleteConfirm.username || 'المستخدم'}</strong> نهائياً من السيرفر والتطبيق؟
                        </p>

                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-[11px] text-rose-700 dark:text-rose-300 text-right leading-relaxed space-y-1">
                            <div>• سيتم مسح ملف الحساب وجميع رسائله وجهات اتصاله فوراً من السيرفر.</div>
                            <div>• سيتم إنهاء جلسته على هاتفه، وسيعامل كزائر جديد تماماً وبحساب جديد.</div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={executeDeleteUser}
                                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>جارٍ الحذف نهائياً من السيرفر...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        <span>نعم، احذف الحساب نهائياً</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setUserToDeleteConfirm(null)}
                                className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs sm:text-sm transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header - Full Screen Style */}
            <div className="p-4 sm:p-5 border-b bg-white dark:bg-slate-900 flex items-center justify-between" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <ShieldAlert size={22} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg sm:text-xl leading-tight">لوحة تحكم الإدارة الشاملة</h2>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white rounded-xl transition-all duration-200">
                    <X size={22} />
                </button>
            </div>

            {/* Sub-tabs - Sleek, Dense & Clean */}
            <div className="flex border-b text-sm font-bold bg-slate-50 dark:bg-slate-900/50" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <button 
                    onClick={() => { setActiveTab('users'); setSelectedInspectorUser(null); setSelectedUserForSupport(null); }}
                    className={`flex-1 py-4 text-center transition-all border-b-2 flex items-center justify-center gap-2 ${
                        activeTab === 'users' 
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' 
                            : 'border-transparent opacity-70 hover:bg-black/5'
                    }`}
                >
                    <Users size={16} />
                    <span>إدارة المستخدمين</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('support'); setSelectedInspectorUser(null); }}
                    className={`flex-1 py-4 text-center transition-all border-b-2 flex items-center justify-center gap-2 ${
                        activeTab === 'support' 
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' 
                            : 'border-transparent opacity-70 hover:bg-black/5'
                    }`}
                >
                    <Mail size={16} />
                    <span>وارد الدعم الفني</span>
                </button>
            </div>

            {/* Main Full-Screen Layout Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-950">
                
                {/* 1. USERS TAB */}
                {activeTab === 'users' && (
                    <div className="flex-1 flex flex-col overflow-hidden h-full">
                        {!selectedInspectorUser ? (
                            /* Users List Pane - Full screen width */
                            <div className="flex-1 flex flex-col overflow-y-auto p-4 w-full animate-fadeIn">
                                <div className="font-bold text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    <span>قائمة القراء والمنضمين للتطبيق ({users.length})</span>
                                </div>

                                {users.length === 0 ? (
                                    <div className="text-center py-24 opacity-50 text-sm">لا يوجد مستخدمون مسجلون حالياً</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                        {users.map((u) => (
                                            <button 
                                                key={u.userId}
                                                onClick={() => setSelectedInspectorUser(u)}
                                                className="p-3.5 rounded-2xl transition-all text-right flex items-center justify-between gap-3 border bg-white dark:bg-slate-900 hover:bg-emerald-500/5 border-slate-200 dark:border-slate-800/60 shadow-xs"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 overflow-hidden border border-emerald-500/15">
                                                        {u.avatarUrl ? (
                                                            <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs">{u.username ? u.username[0] : 'ق'}</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-xs sm:text-sm truncate leading-tight">{u.username || 'قارئ بدون اسم'}</h4>
                                                        <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1.5 flex-wrap font-medium">
                                                            <span>🌍 {u.country || 'غير محدد'}</span>
                                                            <span>•</span>
                                                            <span className="font-mono">{u.accountCode}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <span className={`w-2.5 h-2.5 rounded-full block ${u.isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-700"}`} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* User Profile Inspector Pane - Completely separate full-width view */
                            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto p-5 sm:p-6 w-full animate-slideLeft">
                                
                                {/* Inspector Header */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b dark:border-slate-800">
                                    <button 
                                        onClick={() => setSelectedInspectorUser(null)}
                                        className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all"
                                    >
                                        <ArrowRight size={14} />
                                        <span>رجوع للقائمة</span>
                                    </button>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                                        معاينة وتحكم بالحساب
                                    </span>
                                </div>

                                {/* Simulated User Profile Screen */}
                                <div className="max-w-2xl mx-auto w-full space-y-6">
                                    
                                    {/* Big Avatar Card */}
                                    <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border dark:border-slate-800 relative">
                                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg mb-3">
                                            {selectedInspectorUser.avatarUrl ? (
                                                <img src={selectedInspectorUser.avatarUrl} alt={selectedInspectorUser.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{selectedInspectorUser.username ? selectedInspectorUser.username[0] : 'ق'}</span>
                                            )}
                                        </div>
                                        
                                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span>{selectedInspectorUser.username || 'بدون اسم'}</span>
                                        </h3>
                                        
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm px-4">
                                            {selectedInspectorUser.bio || 'لا يوجد وصف شخصي متوفر لحساب القارئ.'}
                                        </p>

                                        <div className="mt-4 flex items-center gap-2">
                                            <span className="text-[10px] bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full font-mono font-bold">
                                                كود الحساب: {selectedInspectorUser.accountCode}
                                            </span>
                                            <span className="text-[10px] bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full font-mono font-bold">
                                                ID: {selectedInspectorUser.userId}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Simulated Enter / Impersonation Button */}
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => handleImpersonate(selectedInspectorUser)}
                                            className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5"
                                        >
                                            <Eye size={18} />
                                            <span>تصفح ودخول كصاحب الحساب تماماً 🛡️</span>
                                        </button>
                                        <p className="text-[10px] text-slate-400 text-center">
                                            عند النقر على هذا الزر، ستفتح معك واجهة الدردشات والمجتمع بتبويباتها الثلاثة كاملة كأنك هذا المستخدم لتقرأ دردشاته، وتراسل، وتحظر بالكامل! يمكنك الخروج والعودة لحسابك الأصلي في أي وقت من الشريط العلوي.
                                        </p>
                                    </div>

                                    {/* Complete Info Fields Block */}
                                    <div className="space-y-3.5 pt-4 border-t dark:border-slate-800">
                                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">البيانات الشخصية والتقنية</h4>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 flex items-center gap-3">
                                                <Globe className="text-emerald-500" size={18} />
                                                <div>
                                                    <span className="text-[10px] opacity-50 block leading-tight">دولة المستخدم</span>
                                                    <span className="text-xs font-extrabold">{selectedInspectorUser.country || 'غير محدد'}</span>
                                                </div>
                                            </div>

                                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 flex items-center gap-3">
                                                <Calendar className="text-emerald-500" size={18} />
                                                <div>
                                                    <span className="text-[10px] opacity-50 block leading-tight">تاريخ التسجيل بالخدمة</span>
                                                    <span className="text-xs font-extrabold">
                                                        {new Date(selectedInspectorUser.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 flex items-center gap-3">
                                                <Activity className="text-emerald-500" size={18} />
                                                <div>
                                                    <span className="text-[10px] opacity-50 block leading-tight">حالة النشاط الفعلي</span>
                                                    <span className={`text-xs font-extrabold ${selectedInspectorUser.isOnline ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                        {selectedInspectorUser.isOnline ? 'متصل بالخدمة الآن 🟢' : 'غير متصل حالياً'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 flex items-center gap-3">
                                                <ShieldCheck className="text-emerald-500" size={18} />
                                                <div>
                                                    <span className="text-[10px] opacity-50 block leading-tight">طريقة المصادقة</span>
                                                    <span className="text-xs font-extrabold">
                                                        {selectedInspectorUser.isGoogleAuth ? 'جوجل ومزامن 🛡️' : 'حساب ضيف محلي'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Critical Action: Delete Account */}
                                    <div className="pt-6 border-t dark:border-slate-800">
                                        <button 
                                            type="button"
                                            onClick={() => promptDeleteUser(selectedInspectorUser)}
                                            className="w-full p-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <UserMinus size={18} />
                                            <span>حذف حساب القارئ نهائياً وتفريغ بياناته</span>
                                        </button>
                                        <p className="text-[10px] text-slate-400 text-center mt-2">
                                            عند حذف الحساب، سيتم إنهاء جلسته على الفور من جهازه الخاص، وعند محاولته الدخول مرة أخرى سيتم توجيهه لإنشاء مستخدم جديد تماماً كزائر جديد.
                                        </p>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. SUPPORT / ADMIN CHAT TAB */}
                {activeTab === 'support' && (
                    <div className="flex-1 flex flex-col overflow-hidden h-full">
                        {!selectedUserForSupport ? (
                            /* Conversations list with Admin - Full screen width */
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-slate-900/50 w-full animate-fadeIn">
                                <div className="font-bold text-sm text-slate-500 dark:text-slate-400 pb-2 border-b dark:border-slate-850 mb-2">صندوق الوارد (رسائل الشكاوى):</div>
                                {supportUserIds.length === 0 ? (
                                    <div className="text-center py-24 opacity-50 text-sm">لا توجد رسائل دعم فني واردة</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                        {supportUserIds.map((uid) => {
                                            const user = users.find(u => u.userId === uid);
                                            
                                            // Count of unread messages sent by this user to support
                                            const userMsgCount = supportMessages.filter(m => m.senderId === uid && m.recipientId === ADMIN_USER_ID && !m.isRead).length;

                                            return (
                                                <button
                                                    key={uid}
                                                    onClick={() => {
                                                        setSelectedUserForSupport(uid);
                                                        communityService.markAdminMessagesAsRead(uid);
                                                    }}
                                                    className="p-4 rounded-2xl text-right text-xs transition-all flex items-center justify-between gap-3 border bg-white dark:bg-slate-900 hover:bg-emerald-500/5 border-slate-200 dark:border-slate-800/60 shadow-xs"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 border">
                                                            {user?.username ? user.username[0] : 'ق'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-xs sm:text-sm truncate leading-tight">{user?.username || 'قارئ مجهول'}</div>
                                                            <div className="text-[10px] opacity-65 truncate mt-1">انقر لعرض المحادثة والرد عليها</div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Messages count badge (only unread) */}
                                                    {userMsgCount > 0 && (
                                                        <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex-shrink-0 min-w-5 text-center shadow-sm">
                                                            {userMsgCount}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Chat Thread & Reply interface - Completely separate full-width view */
                            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900 p-4 sm:p-5 w-full animate-slideLeft">
                                
                                {/* Support Chat Header */}
                                <div className="flex items-center justify-between mb-4 pb-3 border-b dark:border-slate-800">
                                    <button 
                                        onClick={() => setSelectedUserForSupport(null)}
                                        className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all"
                                    >
                                        <ArrowRight size={14} />
                                        <span>رجوع للوارد</span>
                                    </button>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                                        محادثة مع: {users.find(u => u.userId === selectedUserForSupport)?.username || 'قارئ'}
                                    </span>
                                </div>

                                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                    <div className="flex-1 overflow-y-auto space-y-3 p-3 border rounded-2xl bg-slate-50 dark:bg-slate-950/40 mb-3 max-w-3xl mx-auto w-full">
                                        {supportMessages
                                            .filter(m => m.senderId === selectedUserForSupport || m.recipientId === selectedUserForSupport)
                                            .map((m) => {
                                                const isAdmin = m.senderId === ADMIN_USER_ID;

                                                return (
                                                    <div 
                                                        key={m.messageId}
                                                        className={`flex flex-col max-w-[85%] p-3.5 rounded-2xl text-xs ${
                                                            isAdmin 
                                                                ? 'bg-emerald-600 text-white mr-auto rounded-tl-none' 
                                                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 ml-auto rounded-tr-none border dark:border-slate-800 shadow-xs'
                                                        }`}
                                                    >
                                                        <div className="font-extrabold mb-1">
                                                            {isAdmin ? 'إدارة التطبيق (Admin)' : (users.find(u => u.userId === selectedUserForSupport)?.username || 'المستخدم')}
                                                        </div>
                                                        <p className="break-words font-medium text-sm leading-relaxed">{m.text}</p>
                                                        <span className="text-[8px] opacity-50 block text-left mt-1 font-mono">
                                                            {new Date(m.createdAt).toLocaleTimeString('ar-EG')}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    {/* Reply Box */}
                                    <div className="flex gap-2.5 items-center max-w-3xl mx-auto w-full">
                                        <input 
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(); }}
                                            placeholder="اكتب رد كـ Admin وإدارة التطبيق..."
                                            className="flex-1 px-4 py-3.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white"
                                        />
                                        <button
                                            onClick={handleSendReply}
                                            disabled={sendingReply || !replyText.trim()}
                                            className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 active:scale-95 shadow-sm"
                                        >
                                            <span>رد كـ Admin</span>
                                            <Send size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-100 dark:bg-slate-900 text-center text-xs opacity-50 border-t dark:border-slate-800 flex items-center justify-center gap-1">
                <span>مصحف التجويد الملون والتفسير والتحفيظ © جميع الحقوق محفوظة للإدارة</span>
            </div>
        </div>
    );
};
