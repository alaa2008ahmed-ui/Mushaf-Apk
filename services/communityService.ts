import { db } from '../lib/firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, onSnapshot, 
  updateDoc, deleteDoc 
} from 'firebase/firestore';
import { SUPPORT_AVATAR_BASE64 } from '../src/supportAvatarBase64';
import { checkContentModeration } from '../utils/contentModerator';

export interface QuranVerseAttachment {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  fromAyah?: number;
  toAyah?: number;
  text: string;
  audioUrl?: string;
  shareType?: 'text' | 'image' | 'page' | 'audio';
  pageNumber?: number;
  fullPageText?: string;
  reciterName?: string;
  bgValue?: string;
  bgType?: string;
  bgText?: string;
  border?: string;
  accent?: string;
  frameType?: string;
  frameColor?: string;
  textColor?: string;
  fontSize?: number;
  fontClass?: string;
  fontFamily?: string;
  customNote?: string;
}

export interface CommunityUser {
  userId: string;
  accountCode?: string;
  passcode?: string;
  username: string;
  avatarUrl?: string;
  country: string;
  bio?: string;
  email?: string;
  isGoogleAuth?: boolean;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  typingToUserId?: string;
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  targetRecipientId?: string;
  text: string;
  verseData?: QuranVerseAttachment;
  audioUrl?: string;
  isRead: boolean;
  isViolationReport?: boolean;
  isBroadcast?: boolean;
  broadcastBatchId?: string;
  createdAt: string;
}

export interface ChatConversation {
  chatId: string;
  partner: CommunityUser;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface BlockRecord {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export const ADMIN_USER_ID = 'usr_admin_official';
export const ADMIN_USER: CommunityUser = {
  userId: ADMIN_USER_ID,
  username: 'الدعم الفني',
  accountCode: 'ADMIN-OFFICIAL',
  country: 'الإدارة 🛡️',
  bio: 'أهلاً بك! تواصل معنا هنا في حال مواجهة أي مشكلة بالتطبيق.',
  avatarUrl: SUPPORT_AVATAR_BASE64,
  isOnline: true,
  createdAt: new Date('2026-01-01').toISOString()
};

export interface ServerContact {
  userId: string;
  partnerId: string;
  createdAt: string;
}

const STORAGE_KEY_USER = 'mushaf_community_current_user_v9';
const STORAGE_KEY_USERS_ALL = 'mushaf_community_global_users_v9';
const STORAGE_KEY_MESSAGES = 'mushaf_community_messages_v9';
const STORAGE_KEY_BLOCKS = 'mushaf_community_blocks_v9';
const STORAGE_KEY_CONTACTS = 'mushaf_community_contacts_v9';

class CommunityService {
  private currentUser: CommunityUser | null = null;
  private usersMap: Map<string, CommunityUser> = new Map();
  private messagesList: ChatMessage[] = [];
  private blocksList: BlockRecord[] = [];
  private serverContactsList: ServerContact[] = [];
  private pollInterval: any = null;
  private heartbeatInterval: any = null;

  constructor() {
    this.initCurrentUser();
    this.loadFromLocalStorage();
    this.purgeLegacyGoogleData();
    this.setupFirestoreListeners();
    this.setupPresenceLifecycle();
    this.fetchLatestUsers();
    this.startPolling();
  }

  public isLegacyGoogleUser(u?: any): boolean {
    if (!u) return false;
    // Never filter out real users or valid registered accounts
    return false;
  }

  public async purgeLegacyGoogleData() {
    try {
      // 1. Remove legacy localStorage keys from prior versions
      if (typeof localStorage !== 'undefined') {
        const legacyKeys = [
          'mushaf_community_global_users_v8',
          'mushaf_community_current_user_v8',
          'mushaf_community_global_users_v7',
          'mushaf_community_current_user_v7',
          'mushaf_community_global_users',
          'mushaf_community_current_user',
          'mushaf_community_user',
          'quran_community_user',
          'google_user_token'
        ];
        legacyKeys.forEach(k => {
          try { localStorage.removeItem(k); } catch (e) {}
        });
      }

      // 2. Remove legacy users from in-memory map & delete from Firestore
      for (const [uid, user] of Array.from(this.usersMap.entries())) {
        if (this.isLegacyGoogleUser(user)) {
          this.usersMap.delete(uid);
          try {
            deleteDoc(doc(db, 'users', uid)).catch(() => {});
          } catch (e) {}
        }
      }

      // 3. Reset current user if legacy Google user
      if (this.currentUser && this.isLegacyGoogleUser(this.currentUser)) {
        localStorage.removeItem(STORAGE_KEY_USER);
        this.currentUser = null;
        this.initCurrentUser();
      }

      this.saveToLocalStorage();
    } catch (e) {
      console.warn('Purge legacy google data error:', e);
    }
  }

  private cleanPayload(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (val !== undefined) {
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          cleaned[key] = this.cleanPayload(val);
        } else {
          cleaned[key] = val;
        }
      }
    });
    return cleaned;
  }

  private notifyIncomingMessage(msg: ChatMessage, sender: CommunityUser) {
    // 1. Dispatch in-app visual notification event (strictly inside the app only)
    try {
      window.dispatchEvent(
        new CustomEvent('community_inapp_notification', {
          detail: { message: msg, sender }
        })
      );
    } catch (e) {}

    // 2. In-App Audio alert (while app is open)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  public generateAccountCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MQ-${code}`;
  }

  public initCurrentUser(): CommunityUser {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.userId) {
          if (!u.accountCode) {
            u.accountCode = this.generateAccountCode();
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
          }
          this.currentUser = u;
          this.usersMap.set(u.userId, u);
          return this.currentUser!;
        }
      }
    } catch (e) {}

    const randomId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    this.currentUser = {
      userId: randomId,
      accountCode: this.generateAccountCode(),
      username: '',
      country: '',
      bio: '',
      avatarUrl: '',
      isOnline: true,
      createdAt: new Date().toISOString()
    };
    return this.currentUser;
  }

  public getCurrentUser(): CommunityUser {
    if (!this.currentUser) {
      return this.initCurrentUser();
    }
    return this.currentUser;
  }

  public normalizeDigits(str?: string): string {
    if (!str) return '';
    return str
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .trim();
  }

  public normalizeArabicText(str?: string): string {
    if (!str) return '';
    return str
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىي]/g, 'ي')
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  public async restoreAccount(codeOrUsername: string, inputPasscode?: string): Promise<CommunityUser> {
    const rawInput = (codeOrUsername || '').trim();
    if (!rawInput) {
      throw new Error('يرجى إدخال كود الحساب (مثل MQ-XXXXX) أو اسم المستخدم');
    }

    const normQuery = this.normalizeArabicText(rawInput);
    const cleanCode = this.normalizeDigits(rawInput).toUpperCase().replace(/\s+/g, '');
    const cleanCodeNoMQ = cleanCode.replace(/^MQ-?/i, '');
    const cleanInputPasscode = this.normalizeDigits(inputPasscode);

    let foundUser: CommunityUser | null = null;

    const matchUser = (u: CommunityUser, docId?: string): boolean => {
      if (!u) return false;
      const uCode = (u.accountCode || '').toUpperCase().replace(/\s+/g, '');
      const uCodeNoMQ = uCode.replace(/^MQ-?/i, '');
      const uNameNorm = this.normalizeArabicText(u.username);
      const uIdNorm = this.normalizeArabicText(u.userId || docId || '');

      return Boolean(
        (uCode && (uCode === cleanCode || uCodeNoMQ === cleanCodeNoMQ)) ||
        (uCodeNoMQ && cleanCode && (uCodeNoMQ === cleanCode || cleanCode.includes(uCodeNoMQ))) ||
        (uNameNorm && (uNameNorm === normQuery || uNameNorm.includes(normQuery) || normQuery.includes(uNameNorm))) ||
        (uIdNorm && uIdNorm === normQuery)
      );
    };

    // 1. Check in local memory map first
    for (const u of this.usersMap.values()) {
      if (matchUser(u)) {
        foundUser = u;
        break;
      }
    }

    // 2. Fetch fresh snapshot from Firestore to find the user or sync latest data
    try {
      const snap = await getDocs(collection(db, 'users'));
      for (const docSnap of snap.docs) {
        const u = docSnap.data() as CommunityUser;
        const uid = u.userId || docSnap.id;
        const fullUser = { ...u, userId: uid };
        this.usersMap.set(uid, fullUser);
        if (!foundUser && matchUser(fullUser, docSnap.id)) {
          foundUser = fullUser;
        }
      }
    } catch (e: any) {
      console.warn('Firestore fetch during restore:', e);
      if (!foundUser) {
        throw new Error('تعذر الاتصال بقاعدة البيانات. يرجى التأكد من اتصال الإنترنت.');
      }
    }

    if (!foundUser) {
      throw new Error('لم يتم العثور على أي حساب بهذا الكود أو الاسم. تأكد من صحة كود الحساب أو قم بإنشاء حساب جديد.');
    }

    // Verify PIN passcode if one was set for this account
    const storedPasscode = this.normalizeDigits(foundUser.passcode);
    if (storedPasscode) {
      if (!cleanInputPasscode) {
        throw new Error('هذا الحساب محمي برمز مرور (PIN). يرجى إدخال رمز المرور للمتابعة.');
      }
      if (cleanInputPasscode !== storedPasscode) {
        throw new Error('رمز الحماية (PIN) غير صحيح لهذا الحساب.');
      }
    }

    // Activate restored user session
    const nowIso = new Date().toISOString();
    foundUser.isOnline = true;
    foundUser.lastSeen = nowIso;
    if (!foundUser.country || !foundUser.country.trim()) {
      foundUser.country = 'دولة أخرى 🌍';
    }
    if (!foundUser.avatarUrl || !foundUser.avatarUrl.trim()) {
      foundUser.avatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    }
    if (!foundUser.accountCode) {
      foundUser.accountCode = this.generateAccountCode();
    }

    this.currentUser = foundUser;
    this.usersMap.set(foundUser.userId, foundUser);

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(foundUser));
    this.saveToLocalStorage();

    // Mark online in Firestore
    try {
      await updateDoc(doc(db, 'users', foundUser.userId), {
        isOnline: true,
        lastSeen: nowIso
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'users', foundUser.userId), this.cleanPayload(foundUser), { merge: true });
      } catch (err) {}
    }

    // Fetch messages for restored user
    this.fetchLatestMessages().catch(() => {});

    window.dispatchEvent(new CustomEvent('community_user_updated', { detail: foundUser }));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
    this.sendHeartbeat();

    return foundUser;
  }

  public logoutAccount() {
    const userToSignOut = this.currentUser;
    if (userToSignOut && userToSignOut.userId) {
      updateDoc(doc(db, 'users', userToSignOut.userId), {
        isOnline: false,
        lastSeen: new Date().toISOString()
      }).catch(() => {});
    }

    localStorage.removeItem(STORAGE_KEY_USER);
    this.currentUser = null;
    const freshUser = this.initCurrentUser();
    window.dispatchEvent(new CustomEvent('community_user_updated', { detail: freshUser }));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  private setupPresenceLifecycle() {
    if (typeof window === 'undefined') return;

    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    // Send heartbeat every 15 seconds while app is open
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 15000);

    // Initial heartbeat on boot
    this.sendHeartbeat();

    // 1. Web visibilitychange - offline when minimized or hidden, online when visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.sendHeartbeat();
      } else {
        this.setOfflineStatusSync();
      }
    });

    // 2. Window focus & blur
    window.addEventListener('focus', () => {
      this.sendHeartbeat();
    });

    window.addEventListener('blur', () => {
      // Don't mark offline on simple blur, let visibilitychange handle it
    });

    // 3. Unload & pagehide
    window.addEventListener('beforeunload', () => {
      this.setOfflineStatusSync();
    });

    window.addEventListener('pagehide', () => {
      this.setOfflineStatusSync();
    });

    // 4. Native Capacitor Android app state listener
    try {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('appStateChange', (state) => {
          if (state.isActive) {
            this.sendHeartbeat();
          } else {
            this.setOfflineStatusSync();
          }
        }).catch(() => {});
      }).catch(() => {});
    } catch (e) {}
  }

  public getUserById(userId: string): CommunityUser | undefined {
    if (userId === ADMIN_USER_ID) return ADMIN_USER;
    return this.usersMap.get(userId);
  }

  public async sendHeartbeat() {
    const user = this.currentUser;
    if (!user || !user.userId || !this.isProfileComplete()) return;
    const nowIso = new Date().toISOString();
    user.isOnline = true;
    user.lastSeen = nowIso;
    this.usersMap.set(user.userId, user);

    try {
      await updateDoc(doc(db, 'users', user.userId), {
        isOnline: true,
        lastSeen: nowIso
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'users', user.userId), {
          isOnline: true,
          lastSeen: nowIso
        }, { merge: true });
      } catch (err) {}
    }
  }

  public async setOfflineStatusSync() {
    const user = this.currentUser;
    if (!user || !user.userId || !this.isProfileComplete()) return;
    const nowIso = new Date().toISOString();
    user.isOnline = false;
    user.lastSeen = nowIso;
    this.usersMap.set(user.userId, user);

    try {
      await updateDoc(doc(db, 'users', user.userId), {
        isOnline: false,
        lastSeen: nowIso
      });
    } catch (e) {
      try {
        await setDoc(doc(db, 'users', user.userId), {
          isOnline: false,
          lastSeen: nowIso
        }, { merge: true });
      } catch (err) {}
    }
  }

  public async updateLastSeen() {
    const user = this.currentUser;
    if (!user || !user.userId || !this.isProfileComplete()) return;
    const nowIso = new Date().toISOString();
    user.lastSeen = nowIso;
    try {
      await updateDoc(doc(db, 'users', user.userId), {
        lastSeen: nowIso
      });
    } catch (e) {}
  }

  public isUserOnline(user?: CommunityUser | null): boolean {
    if (!user) return false;
    // Current user viewing the app is online
    if (this.currentUser && user.userId === this.currentUser.userId) return true;

    // If explicitly marked as not online, they are offline immediately
    if (user.isOnline !== true) return false;
    if (!user.lastSeen) return false;

    const lastSeenTime = new Date(user.lastSeen).getTime();
    if (isNaN(lastSeenTime)) return false;

    // Heartbeat is sent every 15s. A user is online if heartbeat was within last 70 seconds
    const diffSeconds = (Date.now() - lastSeenTime) / 1000;
    return diffSeconds >= -70 && diffSeconds <= 70;
  }

  public getUserStatusText(user?: CommunityUser | null): string {
    if (!user) return 'غير متصل';
    if (this.isUserOnline(user)) return 'متصل الآن';

    if (!user.lastSeen) return 'غير متصل';
    const lastSeenTime = new Date(user.lastSeen).getTime();
    if (isNaN(lastSeenTime)) return 'غير متصل';

    const diffSeconds = Math.max(0, Math.floor((Date.now() - lastSeenTime) / 1000));
    if (diffSeconds < 60) return 'متوقف منذ لحظات';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `متوقف منذ ${diffMinutes} د`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `متوقف منذ ${diffHours} س`;
    const diffDays = Math.floor(diffHours / 24);
    return `متوقف منذ ${diffDays} يوم`;
  }

  public isProfileComplete(): boolean {
    const user = this.getCurrentUser();
    return Boolean(
      user &&
      user.username && user.username.trim().length >= 2
    );
  }

  public isProfileSetup(): boolean {
    return this.isProfileComplete();
  }

  public async saveCurrentUser(
    username: string, 
    country: string = 'دولة أخرى 🌍', 
    bio?: string, 
    avatarUrl?: string,
    passcode?: string
  ): Promise<CommunityUser> {
    const user = this.getCurrentUser();
    user.username = username.trim();
    user.country = country && country.trim() ? country.trim() : 'دولة أخرى 🌍';
    if (bio !== undefined) user.bio = bio;
    
    // Fallback safe avatar if empty or oversized
    let safeAvatar = avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    if (safeAvatar.length > 250000) {
      // If unexpectedly huge data URI, replace with clean preset
      safeAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    }
    user.avatarUrl = safeAvatar;

    if (passcode !== undefined) {
      user.passcode = this.normalizeDigits(passcode);
    }
    if (!user.accountCode) {
      user.accountCode = this.generateAccountCode();
    }
    user.isOnline = true;
    user.lastSeen = new Date().toISOString();

    this.currentUser = user;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      this.usersMap.set(user.userId, user);
      
      const payload = this.cleanPayload(user);
      await setDoc(doc(db, 'users', user.userId), payload, { merge: true });

      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_user_updated', { detail: user }));
    } catch (e: any) {
      console.error('Error saving user to Firestore:', e);
      throw new Error(e?.message || 'تعذر حفظ البيانات على الخادم، يرجى التأكد من اتصال الإنترنت.');
    }

    return user;
  }

  public async createNewAccount(
    username: string, 
    country: string = 'دولة أخرى 🌍', 
    bio?: string, 
    avatarUrl?: string,
    passcode?: string
  ): Promise<CommunityUser> {
    const randomId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    const newCode = this.generateAccountCode();

    let safeAvatar = avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    if (safeAvatar.length > 250000) {
      safeAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    }

    const newUser: CommunityUser = {
      userId: randomId,
      accountCode: newCode,
      username: username.trim(),
      country: country && country.trim() ? country.trim() : 'دولة أخرى 🌍',
      bio: bio || '',
      avatarUrl: safeAvatar,
      passcode: this.normalizeDigits(passcode),
      isOnline: true,
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.currentUser = newUser;
    this.usersMap.set(newUser.userId, newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));

    try {
      const payload = this.cleanPayload(newUser);
      await setDoc(doc(db, 'users', newUser.userId), payload, { merge: true });

      this.saveToLocalStorage();
      this.sendHeartbeat();
      window.dispatchEvent(new CustomEvent('community_user_updated', { detail: newUser }));
    } catch (e: any) {
      console.error('Error creating new account in Firestore:', e);
      throw new Error(e?.message || 'تعذر إنشاء الحساب على الخادم، يرجى التأكد من اتصال الإنترنت.');
    }

    return newUser;
  }

  private loadFromLocalStorage() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS_ALL);
      if (storedUsers) {
        const arr: CommunityUser[] = JSON.parse(storedUsers);
        arr.forEach(u => {
          if (u && u.userId && !this.isLegacyGoogleUser(u) && u.userId !== ADMIN_USER_ID) {
            this.usersMap.set(u.userId, u);
          }
        });
      }
      this.usersMap.set(ADMIN_USER_ID, ADMIN_USER);

      const storedMsgs = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (storedMsgs) {
        const parsed: ChatMessage[] = JSON.parse(storedMsgs);
        this.messagesList = parsed.filter(m => !this.isViolationReportMessage(m));
      }

      const storedBlocks = localStorage.getItem(STORAGE_KEY_BLOCKS);
      if (storedBlocks) {
        this.blocksList = JSON.parse(storedBlocks);
      }

      const storedContacts = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (storedContacts) {
        this.serverContactsList = JSON.parse(storedContacts);
      }
    } catch (e) {}
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_ALL, JSON.stringify(Array.from(this.usersMap.values())));
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(this.messagesList));
      localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(this.blocksList));
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(this.serverContactsList));
    } catch (e) {}
  }

  private activeTab: 'users' | 'chats' | 'blocked' = 'users';

  public hasUserAnyConversations(): boolean {
    const current = this.getCurrentUser();
    if (!current || !current.userId) return false;

    return this.messagesList.some(m => 
      (m.senderId === current.userId || m.recipientId === current.userId) &&
      !this.isViolationReportMessage(m)
    );
  }

  public getDefaultTab(): 'users' | 'chats' {
    return this.hasUserAnyConversations() ? 'chats' : 'users';
  }

  public getActiveTab(): 'users' | 'chats' | 'blocked' {
    try {
      const saved = sessionStorage.getItem('community_active_tab') as any;
      if (saved && ['users', 'chats', 'blocked'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return this.getDefaultTab();
  }

  public setActiveTab(tab: 'users' | 'chats' | 'blocked') {
    this.activeTab = tab;
    try {
      sessionStorage.setItem('community_active_tab', tab);
    } catch (e) {}
  }

  public async clearAllServerData() {
    try {
      // 1. Delete all users from Firestore
      const usersSnap = await getDocs(collection(db, 'users'));
      const userDeletes = usersSnap.docs.map((d) => deleteDoc(doc(db, 'users', d.id)));
      await Promise.all(userDeletes);

      // 2. Delete all messages from Firestore
      const msgsSnap = await getDocs(collection(db, 'messages'));
      const msgDeletes = msgsSnap.docs.map((d) => deleteDoc(doc(db, 'messages', d.id)));
      await Promise.all(msgDeletes);

      // 3. Delete all blocks from Firestore
      const blocksSnap = await getDocs(collection(db, 'blocks'));
      const blockDeletes = blocksSnap.docs.map((d) => deleteDoc(doc(db, 'blocks', d.id)));
      await Promise.all(blockDeletes);

      // Delete all contacts from Firestore
      try {
        const contactsSnap = await getDocs(collection(db, 'contacts'));
        const contactDeletes = contactsSnap.docs.map((d) => deleteDoc(doc(db, 'contacts', d.id)));
        await Promise.all(contactDeletes);
      } catch (e) {}

      // 4. Clear local memory and storage completely
      this.usersMap.clear();
      this.messagesList = [];
      this.blocksList = [];
      this.serverContactsList = [];

      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_USERS_ALL);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_BLOCKS);
      localStorage.removeItem(STORAGE_KEY_CONTACTS);

      // Reset current user object
      this.currentUser = {
        userId: 'usr_' + Math.random().toString(36).substr(2, 9),
        accountCode: this.generateAccountCode(),
        username: '',
        country: '',
        bio: '',
        avatarUrl: '',
        isOnline: true,
        createdAt: new Date().toISOString()
      };

      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_user_updated'));
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
      window.dispatchEvent(new CustomEvent('community_block_updated'));
    } catch (e) {
      console.error('Error clearing all server data:', e);
    }
  }

  public async purgeExpiredServerMessages() {
    try {
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago for regular peer messages only
      const snapshot = await getDocs(collection(db, 'messages'));
      snapshot.forEach((docSnap) => {
        const msg = docSnap.data() as ChatMessage;
        if (msg && msg.createdAt) {
          // ALWAYS preserve support messages, violation reports, and broadcast announcements permanently on server!
          const isPermanentServerMessage = (
            msg.senderId === ADMIN_USER_ID ||
            msg.recipientId === ADMIN_USER_ID ||
            msg.isViolationReport ||
            msg.isBroadcast ||
            msg.messageId?.startsWith('msg_report_') ||
            msg.text?.includes('[بلاغ آلي - محتوى محظور]')
          );
          if (isPermanentServerMessage) {
            return; // Never auto-delete from server
          }

          const msgTime = new Date(msg.createdAt).getTime();
          if (!isNaN(msgTime) && msgTime < cutoffTime) {
            deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {});
          }
        }
      });
    } catch (e) {
      console.warn('Error purging expired messages:', e);
    }
  }

  private startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.purgeExpiredServerMessages();
    this.fetchLatestContacts();
    this.pollInterval = setInterval(() => {
      this.fetchLatestUsers();
      this.fetchLatestMessages();
      this.fetchLatestContacts();
      this.purgeExpiredServerMessages();
    }, 3000);
  }

  public async fetchLatestUsers(): Promise<CommunityUser[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const activeIds = new Set<string>();

      // Inject official Admin user
      activeIds.add(ADMIN_USER_ID);
      this.usersMap.set(ADMIN_USER_ID, ADMIN_USER);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CommunityUser;
        const uid = data?.userId || docSnap.id;
        if (data && uid && data.username && data.username.trim() && uid !== ADMIN_USER_ID) {
          activeIds.add(uid);
          this.usersMap.set(uid, {
            ...data,
            userId: uid
          });
        }
      });

      // Check if current user was deleted from Firestore (and is not Admin or empty profile)
      const currentUid = this.currentUser?.userId;
      if (currentUid && currentUid !== ADMIN_USER_ID && this.isProfileSetup()) {
        const currentUserExistsOnServer = activeIds.has(currentUid);
        if (!currentUserExistsOnServer && snapshot.size > 0) {
          console.warn('Current user was deleted from Firestore. Force resetting account...');
          this.logoutAccount();
          return Array.from(this.usersMap.values());
        }
      }

      // Remove stale users that are no longer in Firestore (except admin)
      for (const id of Array.from(this.usersMap.keys())) {
        if (!activeIds.has(id) && id !== ADMIN_USER_ID) {
          if (id === currentUid) {
            this.logoutAccount();
          }
          this.usersMap.delete(id);
        }
      }

      // Ensure current user is in usersMap only if they still exist in activeIds or if activeIds is empty (offline)
      if (this.currentUser && this.currentUser.userId && this.currentUser.username && this.currentUser.username.trim()) {
        if (activeIds.has(this.currentUser.userId) || snapshot.empty) {
          this.usersMap.set(this.currentUser.userId, this.currentUser);
        }
      }

      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_user_updated'));
    } catch (e) {
      console.warn('Firestore fetch users:', e);
    }
    return Array.from(this.usersMap.values());
  }

  public async fetchLatestMessages(): Promise<ChatMessage[]> {
    try {
      const myId = this.getCurrentUser().userId;
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
      const snapshot = await getDocs(collection(db, 'messages'));
      snapshot.forEach((docSnap) => {
        const msg = docSnap.data() as ChatMessage;
        if (msg && msg.messageId) {
          const msgTime = new Date(msg.createdAt).getTime();
          if (!isNaN(msgTime) && msgTime < cutoffTime) {
            deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {});
            return;
          }

          if (msg.recipientId === myId || msg.senderId === myId) {
            // Never pull automated violation reports into regular user accounts
            if (this.isViolationReportMessage(msg) && myId !== ADMIN_USER_ID) {
              return;
            }

            const exists = this.messagesList.some(m => m.messageId === msg.messageId);
            if (!exists) {
              this.messagesList.push(msg);
            } else {
              const idx = this.messagesList.findIndex(m => m.messageId === msg.messageId);
              if (idx >= 0) this.messagesList[idx] = msg;
            }

            // Save chatted user contact on server to keep history of who spoke with whom
            this.saveChattedUser(msg.senderId, msg.recipientId);
            this.saveChattedUser(msg.recipientId, msg.senderId);
          }
        }
      });
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
    } catch (e) {
      console.warn('Firestore fetch messages:', e);
    }
    return this.messagesList;
  }

  public async saveChattedUser(userId: string, partnerId: string) {
    if (!userId || !partnerId || userId === partnerId) return;
    try {
      const contactId = `${userId}_${partnerId}`;
      await setDoc(doc(db, 'contacts', contactId), {
        userId,
        partnerId,
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Error saving contact to firestore:', e);
    }
  }

  public async fetchLatestContacts() {
    try {
      const current = this.getCurrentUser();
      if (!current || !current.userId) return;
      const snapshot = await getDocs(collection(db, 'contacts'));
      const list: ServerContact[] = [];
      snapshot.forEach((docSnap) => {
        const c = docSnap.data() as ServerContact;
        if (c && c.userId && c.partnerId) {
          list.push(c);
        }
      });
      this.serverContactsList = list;
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
    } catch (e) {
      console.warn('Error fetching server contacts:', e);
    }
  }

  private setupFirestoreListeners() {
    try {
      onSnapshot(collection(db, 'users'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            this.usersMap.delete(change.doc.id);
          }
        });

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CommunityUser;
          const uid = data?.userId || docSnap.id;
          if (data && uid && data.username && data.username.trim()) {
            this.usersMap.set(uid, {
              ...data,
              userId: uid
            });
          }
        });
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_user_updated'));
      }, (err) => console.warn('Firestore Users Listener:', err));
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'messages'), (snapshot) => {
        const myId = this.getCurrentUser().userId;
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
        snapshot.docChanges().forEach((change) => {
          const msg = change.doc.data() as ChatMessage;
          if (msg && msg.messageId) {
            const msgTime = new Date(msg.createdAt).getTime();
            if (!isNaN(msgTime) && msgTime < cutoffTime) {
              deleteDoc(doc(db, 'messages', change.doc.id)).catch(() => {});
              return;
            }

            if (change.type === 'added') {
              if (msg.recipientId === myId || msg.senderId === myId) {
                const exists = this.messagesList.some(m => m.messageId === msg.messageId);
                if (!exists) {
                  this.messagesList.push(msg);
                  if (msg.recipientId === myId && !msg.isRead) {
                    const sender = this.usersMap.get(msg.senderId) || {
                      userId: msg.senderId,
                      username: 'مستخدم المصحف',
                      country: 'غير محدد',
                      isOnline: true,
                      createdAt: new Date().toISOString()
                    };
                    this.notifyIncomingMessage(msg, sender);
                  }
                }

                // Save chatted user contact on server to keep history of who spoke with whom
                this.saveChattedUser(msg.senderId, msg.recipientId);
                this.saveChattedUser(msg.recipientId, msg.senderId);
              }
            } else if (change.type === 'modified') {
              const idx = this.messagesList.findIndex(m => m.messageId === msg.messageId);
              if (idx >= 0) this.messagesList[idx] = msg;
            }
          }
        });
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_messages_updated'));
      }, (err) => console.warn('Firestore Messages Listener:', err));
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'blocks'), (snapshot) => {
        const newBlocks: BlockRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as BlockRecord;
          if (data && data.blockerId) newBlocks.push(data);
        });
        this.blocksList = newBlocks;
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_block_updated'));
      }, (err) => console.warn('Firestore Blocks Listener:', err));
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'contacts'), (snapshot) => {
        const list: ServerContact[] = [];
        snapshot.forEach((docSnap) => {
          const c = docSnap.data() as ServerContact;
          if (c && c.userId && c.partnerId) {
            list.push(c);
          }
        });
        this.serverContactsList = list;
        this.saveToLocalStorage();
        window.dispatchEvent(new CustomEvent('community_messages_updated'));
      }, (err) => console.warn('Firestore Contacts Listener:', err));
    } catch (e) {}
  }

  public async setTypingStatus(partnerUserId: string, isTyping: boolean) {
    const user = this.getCurrentUser();
    user.typingToUserId = isTyping ? partnerUserId : undefined;
    this.usersMap.set(user.userId, user);

    try {
      await updateDoc(doc(db, 'users', user.userId), {
        typingToUserId: isTyping ? partnerUserId : null
      });
    } catch (e) {}
  }

  public getBlocks(): BlockRecord[] {
    return this.blocksList;
  }

  public isBlockedMutually(otherUserId: string): boolean {
    const current = this.getCurrentUser();
    return this.blocksList.some(
      b => (b.blockerId === current.userId && b.blockedId === otherUserId) ||
           (b.blockerId === otherUserId && b.blockedId === current.userId)
    );
  }

  public isSelf(user?: CommunityUser | null): boolean {
    if (!user) return false;
    const current = this.getCurrentUser();
    return Boolean(
      (user.userId && current.userId && user.userId === current.userId) ||
      (current.accountCode && user.accountCode && user.accountCode.toUpperCase() === current.accountCode.toUpperCase())
    );
  }

  public getOtherUsersCount(): number {
    const current = this.getCurrentUser();
    return Array.from(this.usersMap.values()).filter(u => 
      !this.isLegacyGoogleUser(u) && 
      u.username && 
      u.username.trim().length > 0 && 
      u.userId !== ADMIN_USER_ID &&
      (!current || u.userId !== current.userId)
    ).length;
  }

  public getTotalRegisteredCount(): number {
    return this.getOtherUsersCount();
  }

  public getVisibleUsers(searchQuery: string = '', includeSelf: boolean = false): CommunityUser[] {
    const current = this.getCurrentUser();
    const queryLower = searchQuery.trim().toLowerCase();

    // Ensure current user is in usersMap if they have a valid username
    if (current && current.userId && current.username && current.username.trim()) {
      this.usersMap.set(current.userId, current);
    }

    const allUsersArray = Array.from(this.usersMap.values());

    return allUsersArray.filter(u => {
      // 1. Completely exclude legacy Google auth accounts / Alaa Ahmed
      if (this.isLegacyGoogleUser(u)) return false;

      // 2. Technical Support only appears in chats tab, not in members directory
      if (u.userId === ADMIN_USER_ID) return false;

      // 3. Filter out self (current user) unless explicitly requested
      const isCurrentSelf = this.isSelf(u);
      if (!includeSelf && isCurrentSelf) return false;
      
      // 4. Must have valid username
      if (!u.username || !u.username.trim()) return false;

      // 5. Exclude blocked users (unless self)
      if (!isCurrentSelf && this.isBlockedMutually(u.userId)) return false;

      // 6. Search query matching
      if (queryLower) {
        const matchesName = u.username.toLowerCase().includes(queryLower);
        const matchesCountry = u.country?.toLowerCase().includes(queryLower);
        const matchesBio = u.bio?.toLowerCase().includes(queryLower);
        const matchesCode = u.accountCode?.toLowerCase().includes(queryLower);
        return Boolean(matchesName || matchesCountry || matchesBio || matchesCode);
      }

      return true;
    }).sort((a, b) => {
      // 1. Current user always pinned at top if included
      const aSelf = this.isSelf(a);
      const bSelf = this.isSelf(b);
      if (aSelf && !bSelf) return -1;
      if (!aSelf && bSelf) return 1;

      // 2. Online users strictly first at the top
      const aOnline = this.isUserOnline(a);
      const bOnline = this.isUserOnline(b);
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;

      // 3. Most recently active / joined
      const bTime = new Date(b.lastSeen || b.createdAt || 0).getTime();
      const aTime = new Date(a.lastSeen || a.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }

  public getMyBlockedUsers(): { blockedId: string; user?: CommunityUser; createdAt: string }[] {
    const current = this.getCurrentUser();
    return this.blocksList
      .filter(b => b.blockerId === current.userId)
      .map(b => ({
        blockedId: b.blockedId,
        user: this.usersMap.get(b.blockedId),
        createdAt: b.createdAt
      }));
  }

  public async blockUser(targetUserId: string) {
    const current = this.getCurrentUser();
    if (!current || !current.userId || !targetUserId) return;

    const blockId = `${current.userId}_${targetUserId}`;
    const newBlock: BlockRecord = {
      blockerId: current.userId,
      blockedId: targetUserId,
      createdAt: new Date().toISOString()
    };

    // Filter out previous entry if any to avoid duplicates
    this.blocksList = this.blocksList.filter(
      b => !(b.blockerId === current.userId && b.blockedId === targetUserId)
    );
    this.blocksList.push(newBlock);
    this.saveToLocalStorage();

    try {
      const payload = this.cleanPayload(newBlock);
      await setDoc(doc(db, 'blocks', blockId), payload);
    } catch (e) {
      console.warn('Error saving block to firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_block_updated'));
    window.dispatchEvent(new CustomEvent('community_user_updated'));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public async unblockUser(targetUserId: string) {
    const current = this.getCurrentUser();
    if (!current || !current.userId || !targetUserId) return;

    const blockId = `${current.userId}_${targetUserId}`;
    this.blocksList = this.blocksList.filter(b => !(b.blockerId === current.userId && b.blockedId === targetUserId));
    this.saveToLocalStorage();

    try {
      await deleteDoc(doc(db, 'blocks', blockId));
    } catch (e) {
      console.warn('Error deleting block from firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_block_updated'));
    window.dispatchEvent(new CustomEvent('community_user_updated'));
    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  private getChatId(userA: string, userB: string): string {
    return [userA, userB].sort().join('_chat_');
  }

  public isViolationReportMessage(msg: ChatMessage | null | undefined): boolean {
    if (!msg) return false;
    return Boolean(
      msg.isViolationReport ||
      msg.messageId?.startsWith('msg_report_') ||
      msg.text?.includes('[بلاغ آلي - محتوى محظور]')
    );
  }

  public getMessagesForChat(partnerUserId: string): ChatMessage[] {
    const current = this.getCurrentUser();
    const chatId = this.getChatId(current.userId, partnerUserId);

    return this.messagesList
      .filter(m => m.chatId === chatId && !this.isViolationReportMessage(m))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async sendMessage(
    recipientId: string, 
    text: string, 
    verseData?: QuranVerseAttachment, 
    audioUrl?: string
  ): Promise<ChatMessage> {
    const current = this.getCurrentUser();
    if (!this.isProfileComplete()) {
      throw new Error('عفواً، يرجى حفظ اسمك وبياناتك وصورتك الشخصية أولاً لبدء إرسال الرسائل.');
    }

    // --- Automated Content Moderation Check (Option 1: Block message + Send report to Admin /alaa.ahmed) ---
    const checkText = (text || '') + (verseData?.customNote ? ' ' + verseData.customNote : '');
    const modResult = checkContentModeration(checkText);

    if (modResult.isViolating) {
      // 1. Send automated report to Technical Support (/alaa.ahmed - ADMIN_USER_ID) using the offending user's account
      const supportChatId = this.getChatId(current.userId, ADMIN_USER_ID);
      const reportMsgId = 'msg_report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const categoryLabel = modResult.category === 'political' ? 'سياسية/تحريضية' : 'مسيئة وخادشة للحياء';
      
      const targetUser = this.getUserById(recipientId);
      const targetDisplayName = targetUser?.username || 'قارئ';
      const targetCode = targetUser?.accountCode || recipientId;

      const reportText = `⚠️ [بلاغ آلي - محتوى محظور]
تم حجب محاولة إرسال رسالة تحتوي على كلمات ${categoryLabel}.

• المستخدم المخالف: ${current.username} (كود الحساب: ${current.accountCode || 'غير محدد'})
• المرسل إليه: ${targetDisplayName} (كود الحساب: ${targetCode})
• معرّف الحساب (UID): ${current.userId}
• الدولة: ${current.country || 'غير محددة'}
• الكلمات المكتشفة: ${modResult.detectedWords.join(' ، ')}
• نص الرسالة المحجوبة:
"${text.trim()}"
• الوقت: ${new Date().toLocaleString('ar-EG')}`;

      const reportMsg: ChatMessage = {
        messageId: reportMsgId,
        chatId: supportChatId,
        senderId: current.userId,
        recipientId: ADMIN_USER_ID,
        targetRecipientId: recipientId,
        text: reportText,
        isViolationReport: true,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      // Send report to Firestore exclusively for the admin dashboard (/alaa.ahmed)
      // It must NEVER appear in the offending user's own technical support messages
      try {
        const payload = this.cleanPayload(reportMsg);
        await setDoc(doc(db, 'messages', reportMsgId), payload);
      } catch (e) {
        console.error('Error sending moderation report to Firestore:', e);
      }

      this.saveChattedUser(ADMIN_USER_ID, current.userId);

      window.dispatchEvent(new CustomEvent('community_messages_updated'));

      // 2. Throw error to block the message from being sent to the recipient in normal chat
      throw new Error('عفواً، تحتوي الرسالة على كلمات غير لائقة مخالفة لشروط الاستخدام.');
    }

    const chatId = this.getChatId(current.userId, recipientId);
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newMsg: ChatMessage = {
      messageId: msgId,
      chatId,
      senderId: current.userId,
      recipientId,
      text: text.trim(),
      verseData,
      audioUrl,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.messagesList.push(newMsg);
    this.saveToLocalStorage();

    this.setTypingStatus(recipientId, false);

    // Save chatted user contact on server to keep history of who spoke with whom
    this.saveChattedUser(current.userId, recipientId);
    this.saveChattedUser(recipientId, current.userId);

    try {
      const payload = this.cleanPayload(newMsg);
      await setDoc(doc(db, 'messages', msgId), payload);
    } catch (e) {
      console.error('Error sending message to Firestore:', e);
    }

    return newMsg;
  }

  public async markMessagesAsRead(partnerUserId: string) {
    const current = this.getCurrentUser();
    const chatId = this.getChatId(current.userId, partnerUserId);

    let updatedAny = false;
    this.messagesList.forEach(m => {
      if (m.chatId === chatId && m.recipientId === current.userId && !m.isRead) {
        m.isRead = true;
        updatedAny = true;
        try {
          updateDoc(doc(db, 'messages', m.messageId), { isRead: true });
        } catch (e) {}
      }
    });

    if (updatedAny) {
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
    }
  }

  public async deleteSingleMessage(messageId: string) {
    this.messagesList = this.messagesList.filter(m => m.messageId !== messageId);
    this.saveToLocalStorage();

    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public async deleteReadMessages(partnerUserId: string) {
    const current = this.getCurrentUser();
    const chatId = this.getChatId(current.userId, partnerUserId);

    const toDelete = this.messagesList.filter(m => m.chatId === chatId && m.isRead);
    this.messagesList = this.messagesList.filter(m => !(m.chatId === chatId && m.isRead));
    this.saveToLocalStorage();

    toDelete.forEach(async (m) => {
      try {
        await deleteDoc(doc(db, 'messages', m.messageId));
      } catch (e) {}
    });

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public async clearConversation(partnerUserId: string) {
    const current = this.getCurrentUser();
    const chatId = this.getChatId(current.userId, partnerUserId);
    const adminChatId = this.getChatId(ADMIN_USER_ID, partnerUserId);

    const toDeleteMsgIds = new Set<string>();
    this.messagesList.forEach(m => {
      if (
        m.chatId === chatId ||
        m.chatId === adminChatId ||
        (m.senderId === current.userId && m.recipientId === partnerUserId) ||
        (m.senderId === partnerUserId && m.recipientId === current.userId) ||
        (m.senderId === ADMIN_USER_ID && m.recipientId === partnerUserId) ||
        (m.senderId === partnerUserId && m.recipientId === ADMIN_USER_ID)
      ) {
        toDeleteMsgIds.add(m.messageId);
      }
    });

    this.messagesList = this.messagesList.filter(m => !toDeleteMsgIds.has(m.messageId));
    this.saveToLocalStorage();

    try {
      const snap = await getDocs(collection(db, 'messages'));
      const deletePromises: Promise<any>[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data() as ChatMessage;
        if (
          data && (
            toDeleteMsgIds.has(docSnap.id) ||
            data.chatId === chatId ||
            data.chatId === adminChatId ||
            (data.senderId === current.userId && data.recipientId === partnerUserId) ||
            (data.senderId === partnerUserId && data.recipientId === current.userId) ||
            (data.senderId === ADMIN_USER_ID && data.recipientId === partnerUserId) ||
            (data.senderId === partnerUserId && data.recipientId === ADMIN_USER_ID)
          )
        ) {
          deletePromises.push(deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {}));
        }
      });
      await Promise.allSettled(deletePromises);
    } catch (e) {
      console.warn('Error clearing conversation from Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public async clearSupportConversation(partnerUserId: string) {
    const adminChatId = this.getChatId(ADMIN_USER_ID, partnerUserId);
    const current = this.getCurrentUser();
    const currentChatId = this.getChatId(current.userId, partnerUserId);

    const toDeleteMsgIds = new Set<string>();
    this.messagesList.forEach(m => {
      if (
        m.chatId === adminChatId ||
        m.chatId === currentChatId ||
        (m.senderId === ADMIN_USER_ID && m.recipientId === partnerUserId) ||
        (m.senderId === partnerUserId && m.recipientId === ADMIN_USER_ID)
      ) {
        toDeleteMsgIds.add(m.messageId);
      }
    });

    this.messagesList = this.messagesList.filter(m => !toDeleteMsgIds.has(m.messageId));
    this.saveToLocalStorage();

    try {
      const snap = await getDocs(collection(db, 'messages'));
      const deletePromises: Promise<any>[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data() as ChatMessage;
        if (
          data && (
            toDeleteMsgIds.has(docSnap.id) ||
            data.chatId === adminChatId ||
            data.chatId === currentChatId ||
            (data.senderId === ADMIN_USER_ID && data.recipientId === partnerUserId) ||
            (data.senderId === partnerUserId && data.recipientId === ADMIN_USER_ID)
          )
        ) {
          deletePromises.push(deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {}));
        }
      });
      await Promise.allSettled(deletePromises);
    } catch (e) {
      console.warn('Error clearing support conversation from Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public getActiveConversations(): ChatConversation[] {
    const current = this.getCurrentUser();
    const partnersMap = new Map<string, { lastMsg: ChatMessage | null; unread: number; time: string }>();

    // 1. Ensure Technical Support always appears at the top of the chats tab for users
    if (current.userId !== ADMIN_USER_ID) {
      partnersMap.set(ADMIN_USER_ID, {
        lastMsg: null,
        unread: 0,
        time: new Date('2099-12-31').toISOString()
      });
    }

    this.messagesList.forEach(m => {
      // Never show automated violation reports in user's chat preview, unread counts, or technical support preview
      if (this.isViolationReportMessage(m)) {
        return;
      }

      let partnerId = '';
      if (m.senderId === current.userId) partnerId = m.recipientId;
      else if (m.recipientId === current.userId) partnerId = m.senderId;

      if (!partnerId) return;

      if (this.isBlockedMutually(partnerId)) return;

      const existing = partnersMap.get(partnerId);
      const isUnread = m.recipientId === current.userId && !m.isRead;
      const isPinnedAdmin = partnerId === ADMIN_USER_ID;
      const msgTime = m.createdAt;

      if (!existing || isPinnedAdmin || new Date(m.createdAt).getTime() > new Date(existing.time).getTime()) {
        partnersMap.set(partnerId, {
          lastMsg: m,
          unread: (existing?.unread || 0) + (isUnread ? 1 : 0),
          time: isPinnedAdmin ? new Date('2099-12-31').toISOString() : msgTime
        });
      } else if (isUnread) {
        existing.unread += 1;
      }
    });

    // Populate from server contacts list (if contact was initiated)
    this.serverContactsList.forEach(c => {
      if (c.userId === current.userId) {
        const partnerId = c.partnerId;
        if (this.isBlockedMutually(partnerId)) return;

        if (!partnersMap.has(partnerId)) {
          partnersMap.set(partnerId, {
            lastMsg: null,
            unread: 0,
            time: partnerId === ADMIN_USER_ID ? new Date('2099-12-31').toISOString() : (c.createdAt || new Date(0).toISOString())
          });
        }
      }
    });

    const conversations: ChatConversation[] = [];
    partnersMap.forEach((val, partnerId) => {
      const partnerUser = partnerId === ADMIN_USER_ID ? ADMIN_USER : (this.usersMap.get(partnerId) || {
        userId: partnerId,
        username: 'مستخدم المصحف',
        country: 'غير محدد',
        isOnline: false,
        createdAt: new Date().toISOString()
      });

      conversations.push({
        chatId: this.getChatId(current.userId, partnerId),
        partner: partnerUser,
        lastMessage: val.lastMsg 
          ? (val.lastMsg.text || (val.lastMsg.verseData ? `آية من سورة ${val.lastMsg.verseData.surahName}` : 'مقطع صوتي 🎙️'))
          : (partnerId === ADMIN_USER_ID ? 'تواصل مع إدارة التطبيق للدعم الفني والشكاوى ✉️' : 'لا توجد رسائل (تم حذفها من السيرفر)'),
        lastMessageTime: val.time,
        unreadCount: val.unread
      });
    });

    return conversations.sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());
  }

  public getRawContacts(): ServerContact[] {
    return this.serverContactsList;
  }

  public async deleteUser(userId: string) {
    try {
      // 1. Delete from users collection (direct doc ID)
      await deleteDoc(doc(db, 'users', userId)).catch(() => {});
      
      // Sweep any other user docs matching this userId
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const deletePromises: Promise<void>[] = [];
        usersSnap.forEach((d) => {
          const dData = d.data();
          if (d.id === userId || dData?.userId === userId) {
            deletePromises.push(deleteDoc(doc(db, 'users', d.id)).catch(() => {}));
          }
        });
        await Promise.allSettled(deletePromises);
      } catch (err) {}

      // 2. Delete all their messages from Firestore
      try {
        const msgSnapshot = await getDocs(collection(db, 'messages'));
        const deleteMsgPromises: Promise<void>[] = [];
        msgSnapshot.forEach((docSnap) => {
          const data = docSnap.data() as ChatMessage;
          if (data && (data.senderId === userId || data.recipientId === userId)) {
            deleteMsgPromises.push(deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {}));
          }
        });
        await Promise.allSettled(deleteMsgPromises);
      } catch (err) {}

      // 3. Delete all contacts of theirs from Firestore
      try {
        const contactsSnapshot = await getDocs(collection(db, 'contacts'));
        const deleteContactPromises: Promise<void>[] = [];
        contactsSnapshot.forEach((docSnap) => {
          const data = docSnap.data() as ServerContact;
          if (data && (data.userId === userId || data.partnerId === userId)) {
            deleteContactPromises.push(deleteDoc(doc(db, 'contacts', docSnap.id)).catch(() => {}));
          }
        });
        await Promise.allSettled(deleteContactPromises);
      } catch (err) {}

      // 4. Delete all blocks of theirs from Firestore
      try {
        const blocksSnapshot = await getDocs(collection(db, 'blocks'));
        const deleteBlockPromises: Promise<void>[] = [];
        blocksSnapshot.forEach((docSnap) => {
          const data = docSnap.data() as BlockRecord;
          if (data && (data.blockerId === userId || data.blockedId === userId)) {
            deleteBlockPromises.push(deleteDoc(doc(db, 'blocks', docSnap.id)).catch(() => {}));
          }
        });
        await Promise.allSettled(deleteBlockPromises);
      } catch (err) {}

      // 5. Clean local state
      this.usersMap.delete(userId);
      this.messagesList = this.messagesList.filter(m => m.senderId !== userId && m.recipientId !== userId);
      this.blocksList = this.blocksList.filter(b => b.blockerId !== userId && b.blockedId !== userId);
      this.serverContactsList = this.serverContactsList.filter(c => c.userId !== userId && c.partnerId !== userId);
      
      // If deleted user was active current user, clear profile
      if (this.currentUser && this.currentUser.userId === userId) {
        this.logoutAccount();
      }

      // If impersonating this user, exit impersonation
      if (this.isImpersonating()) {
        const stored = localStorage.getItem('mushaf_community_original_owner');
        if (stored) {
          try {
            const original = JSON.parse(stored);
            if (original.userId === userId) {
              localStorage.removeItem('mushaf_community_original_owner');
            }
          } catch (e) {}
        }
      }

      this.saveToLocalStorage();
      
      // 6. Trigger events
      window.dispatchEvent(new CustomEvent('community_user_updated'));
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
      window.dispatchEvent(new CustomEvent('community_block_updated'));
    } catch (e) {
      console.error('Error deleting user from Firestore:', e);
    }
  }

  public async fetchAllServerMessages(): Promise<ChatMessage[]> {
    try {
      const snapshot = await getDocs(collection(db, 'messages'));
      const list: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const msg = docSnap.data() as ChatMessage;
        if (msg && msg.messageId) {
          list.push(msg);
        }
      });
      return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (e) {
      console.warn('Error fetching all server messages:', e);
      return [];
    }
  }

  public async deleteServerMessage(messageId: string) {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (e) {
      console.warn('Error deleting server message:', e);
    }
  }

  public async sendAdminReply(recipientId: string, text: string): Promise<ChatMessage> {
    const chatId = this.getChatId(ADMIN_USER_ID, recipientId);
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newMsg: ChatMessage = {
      messageId: msgId,
      chatId,
      senderId: ADMIN_USER_ID,
      recipientId,
      text: text.trim(),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.messagesList.push(newMsg);
    this.saveToLocalStorage();
    this.saveChattedUser(ADMIN_USER_ID, recipientId);
    this.saveChattedUser(recipientId, ADMIN_USER_ID);

    try {
      const payload = this.cleanPayload(newMsg);
      await setDoc(doc(db, 'messages', msgId), payload);
    } catch (e) {
      console.error('Error sending admin reply to Firestore:', e);
    }

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
    return newMsg;
  }

  public async sendBroadcastAdminMessage(text: string): Promise<number> {
    const cleanText = text.trim();
    if (!cleanText) return 0;

    // 1. Fetch latest users list
    const allUsers = await this.fetchLatestUsers();
    // Exclude official admin user
    const targetUsers = allUsers.filter(u => u.userId !== ADMIN_USER_ID);

    if (targetUsers.length === 0) return 0;

    const nowIso = new Date().toISOString();
    const batchId = 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    let sentCount = 0;

    // Send message to every user's support chat
    for (const targetUser of targetUsers) {
      const chatId = this.getChatId(ADMIN_USER_ID, targetUser.userId);
      const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_' + sentCount;

      const newMsg: ChatMessage = {
        messageId: msgId,
        chatId,
        senderId: ADMIN_USER_ID,
        recipientId: targetUser.userId,
        text: cleanText,
        isBroadcast: true,
        broadcastBatchId: batchId,
        isRead: false,
        createdAt: nowIso
      };

      this.messagesList.push(newMsg);

      // Save contact mapping so Technical Support chat appears in their conversation list
      this.saveChattedUser(ADMIN_USER_ID, targetUser.userId);
      this.saveChattedUser(targetUser.userId, ADMIN_USER_ID);

      try {
        const payload = this.cleanPayload(newMsg);
        await setDoc(doc(db, 'messages', msgId), payload);
      } catch (e) {
        console.error('Error sending broadcast message to user:', targetUser.userId, e);
      }

      sentCount++;
    }

    this.saveToLocalStorage();
    window.dispatchEvent(new CustomEvent('community_messages_updated'));

    return sentCount;
  }

  public async deleteBroadcastBatch(batchIdOrText: string) {
    const toDelete = this.messagesList.filter(m => 
      (m.isBroadcast && m.broadcastBatchId === batchIdOrText) || 
      (m.senderId === ADMIN_USER_ID && m.text === batchIdOrText)
    );
    this.messagesList = this.messagesList.filter(m => 
      !((m.isBroadcast && m.broadcastBatchId === batchIdOrText) || 
        (m.senderId === ADMIN_USER_ID && m.text === batchIdOrText))
    );
    this.saveToLocalStorage();

    toDelete.forEach(async (m) => {
      try {
        await deleteDoc(doc(db, 'messages', m.messageId));
      } catch (e) {}
    });

    window.dispatchEvent(new CustomEvent('community_messages_updated'));
  }

  public impersonateUser(user: CommunityUser) {
    if (typeof localStorage === 'undefined') return;
    try {
      // Store current user as original owner if not already impersonating
      if (!this.isImpersonating()) {
        const original = this.getCurrentUser();
        localStorage.setItem('mushaf_community_original_owner', JSON.stringify(original));
      }
      this.currentUser = user;
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      this.usersMap.set(user.userId, user);
      
      // Trigger update events
      window.dispatchEvent(new CustomEvent('community_user_updated', { detail: user }));
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
    } catch (e) {
      console.warn('Error impersonating user:', e);
    }
  }

  public exitImpersonate() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem('mushaf_community_original_owner');
      if (stored) {
        const original = JSON.parse(stored);
        this.currentUser = original;
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(original));
        localStorage.removeItem('mushaf_community_original_owner');
        this.usersMap.set(original.userId, original);
        
        // Trigger update events
        window.dispatchEvent(new CustomEvent('community_user_updated', { detail: original }));
        window.dispatchEvent(new CustomEvent('community_messages_updated'));
      }
    } catch (e) {
      console.warn('Error exiting impersonation:', e);
    }
  }

  public isImpersonating(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return !!localStorage.getItem('mushaf_community_original_owner');
  }

  public getOriginalOwnerName(): string {
    if (typeof localStorage === 'undefined') return 'الإدارة';
    try {
      const stored = localStorage.getItem('mushaf_community_original_owner');
      if (stored) {
        const original = JSON.parse(stored);
        return original.username || 'الإدارة';
      }
    } catch (e) {}
    return 'الإدارة';
  }

  public async markAdminMessagesAsRead(userId: string) {
    try {
      const snapshot = await getDocs(collection(db, 'messages'));
      snapshot.forEach(async (docSnap) => {
        const msg = docSnap.data() as ChatMessage;
        if (msg && msg.senderId === userId && msg.recipientId === ADMIN_USER_ID && !msg.isRead) {
          await updateDoc(doc(db, 'messages', docSnap.id), { isRead: true }).catch(() => {});
        }
      });
      // Also mark locally inside messagesList
      this.messagesList.forEach(m => {
        if (m.senderId === userId && m.recipientId === ADMIN_USER_ID) {
          m.isRead = true;
        }
      });
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('community_messages_updated'));
    } catch (e) {
      console.warn('Error marking admin messages as read:', e);
    }
  }
}

export const communityService = new CommunityService();
