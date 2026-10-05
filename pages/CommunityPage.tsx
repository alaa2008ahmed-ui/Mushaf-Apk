import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Search, MessageSquare, Users, Ban, User, Edit3, 
  Sparkles, Globe, Shield, CheckCircle2, UserX, RefreshCw, Trash2, KeyRound, Copy
} from 'lucide-react';
import { communityService, CommunityUser, ChatConversation, ADMIN_USER_ID } from '../services/communityService';
import { SUPPORT_AVATAR_BASE64 } from '../src/supportAvatarBase64';
import UsernameModal from '../components/Community/UsernameModal';
import { AdminDashboardModal } from '../components/Community/AdminDashboardModal';
import BottomBar from '../components/BottomBar';

interface CommunityPageProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
  initialTab?: 'users' | 'chats' | 'blocked';
}

const CommunityPage: React.FC<CommunityPageProps> = ({ onBack, onNavigate, initialTab }) => {
  const [activeTab, setActiveTabState] = useState<'users' | 'chats' | 'blocked'>(() => {
    if (initialTab && ['users', 'chats', 'blocked'].includes(initialTab)) {
      return initialTab;
    }
    return 'users';
  });

  const setActiveTab = (tab: 'users' | 'chats' | 'blocked') => {
    setActiveTabState(tab);
    communityService.setActiveTab(tab);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(() => !communityService.isProfileComplete());

  const [currentUser, setCurrentUser] = useState<CommunityUser>(() => communityService.getCurrentUser());

  const [userToBlock, setUserToBlock] = useState<CommunityUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = () => {
    const cur = communityService.getCurrentUser();
    setCurrentUser(cur);
    const visibleUsers = communityService.getVisibleUsers(searchQuery, false);
    setUsers(visibleUsers);

    const activeChats = communityService.getActiveConversations();
    setChats(activeChats);

    const count = communityService.getTotalRegisteredCount();
    setTotalUsersCount(count);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await communityService.fetchLatestUsers();
    loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    if (!communityService.isProfileComplete()) {
      setShowProfileModal(true);
    }

    // Active fetch on load
    communityService.fetchLatestUsers().then(() => {
      loadData();
    });

    loadData();

    const handleUpdate = () => {
      loadData();
    };

    const presenceInterval = setInterval(() => {
      loadData();
    }, 3500);

    window.addEventListener('community_user_updated', handleUpdate);
    window.addEventListener('community_messages_updated', handleUpdate);
    window.addEventListener('community_block_updated', handleUpdate);

    return () => {
      clearInterval(presenceInterval);
      window.removeEventListener('community_user_updated', handleUpdate);
      window.removeEventListener('community_messages_updated', handleUpdate);
      window.removeEventListener('community_block_updated', handleUpdate);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.trim().toLowerCase() === '/alaa.ahmed') {
      setShowAdminModal(true);
      setSearchQuery('');
    }
  }, [searchQuery]);

  const handleStartChat = (partnerUserId: string) => {
    if (!communityService.isProfileComplete()) {
      setShowProfileModal(true);
      return;
    }
    communityService.setActiveTab(activeTab);
    onNavigate('direct-chat', { partnerUserId, returnTab: activeTab });
  };

  const confirmBlockUser = async () => {
    if (!userToBlock) return;
    const targetName = userToBlock.username;
    await communityService.blockUser(userToBlock.userId);
    setUserToBlock(null);
    loadData();
    showToast(`تم حظر (${targetName}) بنجاح`);
  };

  const handleUnblockUser = async (userId: string, username?: string) => {
    await communityService.unblockUser(userId);
    loadData();
    showToast(`تم إلغاء حظر ${username ? `(${username})` : 'المستخدم'} بنجاح`);
  };

  const blockedUsers = communityService.getMyBlockedUsers();

  const activeUserChatsCount = useMemo(() => {
    return chats.filter(c => c.partner.userId !== ADMIN_USER_ID).length;
  }, [chats]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase().trim();
    return chats.filter((chat) => {
      const partnerName = (chat.partner.username || '').toLowerCase();
      const partnerCountry = (chat.partner.country || '').toLowerCase();
      const partnerCode = (chat.partner.accountCode || '').toLowerCase();
      const lastMsg = (typeof chat.lastMessage === 'string' ? chat.lastMessage : (chat.lastMessage as any)?.text || '').toLowerCase();
      return partnerName.includes(q) || partnerCountry.includes(q) || partnerCode.includes(q) || lastMsg.includes(q);
    });
  }, [chats, searchQuery]);

  const newMatchingFriends = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const existingPartnerIds = new Set(chats.map(c => c.partner.userId));
    return users.filter(u => !existingPartnerIds.has(u.userId) && u.userId !== currentUser.userId);
  }, [users, chats, searchQuery, currentUser.userId]);

  if (showProfileModal) {
    return (
      <UsernameModal
        isOpen={true}
        onClose={() => {
          if (!communityService.isProfileComplete()) {
            onBack();
          } else {
            setShowProfileModal(false);
          }
        }}
        onBackToApps={onBack}
        onSaved={() => {
          setShowProfileModal(false);
          const u = communityService.getCurrentUser();
          setCurrentUser(u);
          loadData();
          if (u.username) {
            showToast(`أهلاً بك يا ${u.username}! يمكنك الآن التواصل والتراسل`);
          }
        }}
      />
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32" 
      dir="rtl"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Compact Navigation Bar: Return + Profile Edit */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={() => {
              if (communityService.isImpersonating()) {
                communityService.exitImpersonate();
                loadData();
                showToast('تمت العودة لحسابك الأصلي بنجاح');
              } else {
                onBack();
              }
            }}
            className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center flex-shrink-0 shadow-sm"
            title="الرجوع"
          >
            <ArrowRight size={20} />
          </button>

          {/* Current User Profile Pill (Click to edit) */}
          {currentUser.username && (
            <div 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm overflow-hidden"
              title="تعديل الملف الشخصي"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={13} />
                )}
              </div>
              <span className="truncate max-w-[140px]">{currentUser.username}</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
                {currentUser.country || '🌍'}
              </span>
              <Edit3 size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mr-1" />
            </div>
          )}
        </div>

        {/* Navigation Tabs (Equally divided 3 tabs: Members, Chats, Blocked) */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-300/50 dark:border-slate-800 mb-3">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-center py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all truncate ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>الأعضاء ({totalUsersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`w-full flex items-center justify-center py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative truncate ${
              activeTab === 'chats'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>المحادثة ({activeUserChatsCount})</span>
            {chats.some(c => c.unreadCount > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 left-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`w-full flex items-center justify-center py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all truncate ${
              activeTab === 'blocked'
                ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>الحظر</span>
          </button>
        </div>

        {/* Inline Block Confirmation Banner (No popups / No modals) */}
        <AnimatePresence>
          {userToBlock && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Ban size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-rose-700 dark:text-rose-300">
                    تأكيد حظر ({userToBlock.username}) {userToBlock.country ? `• ${userToBlock.country}` : ''}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    عند الحظر، لن يظهر اسم هذا المستخدم لك في القوائم ولن تتمكن من مراسلته ولن يتمكن من مراسلتك.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={confirmBlockUser}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      <Ban size={14} />
                      <span>نعم، تأكيد الحظر</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserToBlock(null)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                    >
                      تراجع
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Input & Refresh Button (Always available for both chats and users tabs to search for friends) */}
        {(activeTab === 'chats' || activeTab === 'users') && (
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أصدقاء وقُرّاء بالاسم أو الدولة أو كود الحساب..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  مسح
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all flex-shrink-0 active:scale-95"
              title="تحديث القائمة الآن من الخادم"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        )}

        {/* Tab 1: Global Users Directory (Excluding current user) */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {users.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <Globe size={40} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {searchQuery 
                    ? 'لا يوجد مستخدمون مطابقون للبحث' 
                    : 'لا يوجد مستخدمون آخرون مسجلون حالياً'
                  }
                </p>
              </div>
            ) : (
              users.map((u) => {
                const isOnline = communityService.isUserOnline(u);
                const statusText = communityService.getUserStatusText(u);

                return (
                  <motion.div
                    key={u.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleStartChat(u.userId)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl py-3 px-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer active:scale-[0.99] group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full font-bold flex items-center justify-center overflow-hidden bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            <User size={22} />
                          )}
                        </div>
                        {isOnline ? (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="متصل الآن" />
                        ) : (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900 opacity-60" title="غير متصل" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {u.username}
                        </h3>
                        <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{u.country || 'دولة أخرى 🌍'}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className={isOnline ? "text-emerald-500 font-medium text-[11px]" : "text-slate-400 text-[11px]"}>
                            {statusText}
                          </span>
                        </div>
                        {u.bio && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Active Chats & Friends Search */}
        {activeTab === 'chats' && (
          <div className="space-y-2.5">
            {filteredChats.length === 0 && newMatchingFriends.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <MessageSquare size={40} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {searchQuery ? 'لا توجد محادثات أو أصدقاء مطابقون للبحث' : 'لا توجد محادثات نشطة حالياً'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery ? 'جرب البحث باسم أو كود حساب آخر' : 'اختر قارئاً من تبويب (المستخدمون) أو استخدم شريط البحث أعلاه لبدء محادثة'}
                </p>
              </div>
            ) : (
              <>
                {filteredChats.map((chat) => {
                  const isPartnerOnline = communityService.isUserOnline(chat.partner);
                  return (
                    <div
                      key={chat.chatId}
                      onClick={() => handleStartChat(chat.partner.userId)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                            {(chat.partner.userId === ADMIN_USER_ID ? SUPPORT_AVATAR_BASE64 : chat.partner.avatarUrl) ? (
                              <img 
                                src={chat.partner.userId === ADMIN_USER_ID ? SUPPORT_AVATAR_BASE64 : chat.partner.avatarUrl} 
                                alt={chat.partner.username} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  if (chat.partner.userId === ADMIN_USER_ID) {
                                    e.currentTarget.src = SUPPORT_AVATAR_BASE64;
                                  }
                                }}
                              />
                            ) : (
                              <User size={24} />
                            )}
                          </div>
                          {isPartnerOnline ? (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="متصل الآن" />
                          ) : (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900 opacity-60" title="غير متصل" />
                          )}
                          {chat.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                              {chat.unreadCount}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{chat.partner.username}</span>
                            <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">({chat.partner.country})</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium">
                            {chat.lastMessage || 'بدء المحادثة'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  );
                })}

                {/* Additional Friends Found Matching Search Query */}
                {newMatchingFriends.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 px-1">
                      <Users size={14} className="text-emerald-500" />
                      <span>أصدقاء وقُرّاء متاحون لبدء المحادثة ({newMatchingFriends.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {newMatchingFriends.map(friend => (
                        <div
                          key={friend.userId}
                          onClick={() => handleStartChat(friend.userId)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                              {friend.avatarUrl ? (
                                <img src={friend.avatarUrl} alt={friend.username} className="w-full h-full object-cover" />
                              ) : (
                                <User size={20} />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{friend.username}</span>
                                <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">({friend.country || 'دولة أخرى'})</span>
                              </div>
                              {friend.bio && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{friend.bio}</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartChat(friend.userId);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95"
                          >
                            <MessageSquare size={13} />
                            <span>محادثة</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 3: Blocked Users */}
        {activeTab === 'blocked' && (
          <div className="space-y-2.5">
            {blockedUsers.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <Shield size={40} className="mx-auto text-emerald-500 mb-2 opacity-60" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا يوجد مستخدمون محظورون</p>
                <p className="text-xs text-slate-500 mt-1">المستخدمون المحظورون فلن تظهر أسماؤهم لك ولن يتمكنوا من التراسل معك</p>
              </div>
            ) : (
              blockedUsers.map((b) => {
                const displayName = b.user?.username || 'مستخدم محظور';
                const displayCountry = b.user?.country;
                return (
                  <div
                    key={b.blockedId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold overflow-hidden border border-rose-500/20">
                        {b.user?.avatarUrl ? (
                          <img src={b.user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <UserX size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{displayName}</span>
                          {displayCountry && (
                            <span className="text-xs font-normal text-slate-400">({displayCountry})</span>
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-400">تاريخ الحظر: {new Date(b.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnblockUser(b.blockedId, b.user?.username)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-emerald-500/30 active:scale-95"
                    >
                      إلغاء الحظر
                    </button>
                  </div>
                );
              })
            )}
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-5 py-3 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none"
          >
            <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        currentTheme={{ bg: '', text: '' }}
      />

      {/* Standard App Bottom Bar */}
      <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
    </div>
  );
};

export default CommunityPage;
