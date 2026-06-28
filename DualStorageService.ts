
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs,
  writeBatch,
  DocumentData
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';

const COLLECTIONS = {
  CUSTOMERS: 'customers',
  SALES_INVOICES: 'salesInvoices',
  DELIVERY_NOTES: 'deliveryNotes',
  BOTTLE_TRANSACTIONS: 'bottleTransactions',
  RECORDS: 'records',
  PO_CUSTOMERS: 'poCustomers'
};

class DualStorageService {
  private listeners: (() => void)[] = [];
  private onDataUpdateCallback?: (collectionName: string, data: any[]) => void;
  private onErrorCallback?: (message: string, type: 'error' | 'warning') => void;
  private isInitializing = false;

  private convertTimestamps(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    // If it's a Firestore Timestamp object
    if (typeof obj.toDate === 'function') return obj.toDate();
    
    // If it's a plain object with timestamp-like structure (e.g. from local storage JSON)
    if (obj.seconds !== undefined && (obj.nanoseconds !== undefined || obj.nanos !== undefined)) {
      return new Date(obj.seconds * 1000 + (obj.nanoseconds || obj.nanos || 0) / 1000000);
    }
    
    // If it's a string that looks like an ISO date, we leave it as string 
    // because the app components usually do new Date(date) on them.
    // However, for consistency we could convert to Date objects here.
    
    if (Array.isArray(obj)) return obj.map(item => this.convertTimestamps(item));
    
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = this.convertTimestamps(obj[key]);
    }
    return newObj;
  }

  /**
   * Prepares data for Firestore by converting JS Dates to ISO strings.
   * This ensures backward compatibility with older app versions that expect 
   * date fields to be strings in the database.
   */
  private prepareForFirestore(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(item => this.prepareForFirestore(item));
    
    const newObj: any = {};
    for (const key in obj) {
      const val = obj[key];
      if (val instanceof Date) {
        newObj[key] = val.toISOString();
      } else if (typeof val === 'object' && val !== null) {
        newObj[key] = this.prepareForFirestore(val);
      } else {
        newObj[key] = val;
      }
    }
    return newObj;
  }

  /**
   * Initialize real-time listeners for all collections.
   * Updates LocalStorage whenever Firestore changes.
   */
  async initialize(onDataUpdate: (collectionName: string, data: any[]) => void, onError?: (message: string, type: 'error' | 'warning') => void) {
    if (this.isInitializing) return;
    this.isInitializing = true;

    this.onDataUpdateCallback = onDataUpdate;
    this.onErrorCallback = onError;
    // Clear existing listeners
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];

    // Prioritize instant loading: Emit existing cached local data immediately so UI renders in <15ms!
    Object.values(COLLECTIONS).forEach(collectionName => {
      const localData = this.getLocalData(collectionName);
      if (localData && localData.length > 0) {
        if (collectionName === COLLECTIONS.SALES_INVOICES) {
          // 1. STAGED LOCAL LOAD: Push last 3 days first to instantly render Dashboard
          const d3 = new Date();
          d3.setDate(d3.getDate() - 2);
          d3.setHours(0,0,0,0);
          const threeDaysAgoStr = d3.toISOString();
          
          const recentLocalData = localData.filter((item: any) => item.date >= threeDaysAgoStr);
          onDataUpdate(collectionName, recentLocalData);
          
          // 2. Then push the rest of the local cache after a tiny delay
          setTimeout(() => {
             // In DualStorageService we always pass the full array to onDataUpdate
             onDataUpdate(collectionName, localData);
          }, 200);
        } else {
          onDataUpdate(collectionName, localData);
        }
      }
    });

    try {
      const delayedCollections = [COLLECTIONS.RECORDS, COLLECTIONS.PO_CUSTOMERS];

      Object.values(COLLECTIONS).forEach(collectionName => {
        if (navigator.onLine) {
          if (delayedCollections.includes(collectionName)) {
             // Will be loaded after salesInvoices stage 2
             return;
          }
          // For salesInvoices, enable background cleanup (so it runs once to verify deletions)
          // For other collections, we just run staged fetch.
          const isMainCollection = collectionName === COLLECTIONS.SALES_INVOICES;
          this.runStagedFetchForCollection(collectionName, isMainCollection);
        } else {
          // If offline, still notify about existing local data
          this.onDataUpdateCallback?.(collectionName, this.getLocalData(collectionName));
        }
      });
    } finally {
      this.isInitializing = false;
    }

    // Listen for online status to sync pending changes
    window.addEventListener('online', () => this.syncPendingChanges());

    // Sync any pending changes if already online on startup
    if (navigator.onLine) {
        // Run asynchronously so it doesn't block init
        setTimeout(() => this.syncPendingChanges(), 1000);
    }

    // NEW: Periodic sync retry every 30 seconds to catch transient failures 
    // where the 'online' event might not have fired correctly.
    setInterval(() => {
        if (navigator.onLine) {
            this.syncPendingChanges();
        }
    }, 30000);
  }

  /**
   * Processes cloud data updates, merging with local-only changes.
   * @param collectionName The collection being updated
   * @param cloudData The authoritative data from the cloud
   * @param isPartial If true, the cloudData is a subset (e.g. staged load) and shouldn't delete missing items.
   */
  private processDataUpdate(collectionName: string, cloudData: any[], isPartial: boolean = false) {
    const cloudIds = new Set(cloudData.map(d => d.id));
    const localData = this.getLocalData(collectionName);
    const queue = this.getPendingQueue();
    const mergedMap = new Map();
    
    if (isPartial) {
      // In partial mode (Phase 1 & 2), we preserve existing local data and update/add from cloud
      localData.forEach(item => mergedMap.set(item.id, item));
      cloudData.forEach(item => mergedMap.set(item.id, item));
    } else {
      // In full mode (onSnapshot), the cloudData is the complete truth
      cloudData.forEach(item => mergedMap.set(item.id, item));
    }
    
    // Always apply pending local changes regardless of mode
    // 2. Remove items that are pending local deletion
    queue.forEach(qItem => {
      if (qItem.collectionName === collectionName && qItem.action === 'delete') {
        mergedMap.delete(qItem.id);
      }
    });
    
    // 3. Apply local items from mirror if they are pending sync
    // This ensures local optimistic updates win over potentially stale cloud data in the mirror
    localData.forEach(item => {
      const isPendingSave = queue.some(q => q.collectionName === collectionName && q.id === item.id && q.action === 'save');
      if (isPendingSave) {
        mergedMap.set(item.id, item);
      }
    });
    
    const finalData = Array.from(mergedMap.values());
    localStorage.setItem(`fs_${collectionName}`, JSON.stringify(finalData));
    
    if (this.onDataUpdateCallback) {
      this.onDataUpdateCallback(collectionName, finalData);
    }
  }

  /**
   * Extremely efficient incremental fetching and synchronization for ANY collection:
   * 1. Establishes a lightweight realtime listener for any changes happening *during* this session.
   * 2. Queries Firestore only for items updated/modified since the last sync timestamp (with buffer).
   * 3. Merges new/modified items into the localStorage cache and updates UI.
   */
  private getActivePeriodStartDate(): string {
    const d = new Date();
    if (d.getDate() > 3) {
        // After 3rd day, active period starts from current month 1st
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
    } else {
        // Before/On 3rd day, active period starts from previous month 1st
        d.setMonth(d.getMonth() - 1);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
    }
    return d.toISOString();
  }

  private async runStagedFetchForCollection(collectionName: string, enableBackgroundCleanup: boolean = false) {
    try {
      if (collectionName === "salesInvoices") {
          // 1. FAST BOOT: First fetch only the last 3 days for immediate UI load
          const d3 = new Date();
          d3.setDate(d3.getDate() - 2); // Today and 2 previous days
          d3.setHours(0,0,0,0);
          const threeDaysAgoStr = d3.toISOString();
          
          // // console.log(`DualStorage [${collectionName}]: Fast boot... fetching last 3 days >= ${threeDaysAgoStr}`);

          const qFast = query(
            collection(db, collectionName), 
            where('date', '>=', threeDaysAgoStr)
          );

          // We use getDocs for the fast boot so it resolves immediately
          getDocs(qFast).then(snapshot => {
            const fastData = snapshot.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
            // console.log(`DualStorage [${collectionName}]: Fast boot loaded ${fastData.length} invoices.`);
            this.processDataUpdate(collectionName, fastData, true); // Use partial=true to preserve existing cache during boot
            
            // 2. ACTIVE PERIOD: After fast boot, fetch the full active month
            const activeStartDateStr = this.getActivePeriodStartDate();
            // console.log(`DualStorage [${collectionName}]: Starting active period query >= ${activeStartDateStr}`);

            const qRecent = query(
              collection(db, collectionName), 
              where('date', '>=', activeStartDateStr)
            );

            getDocs(qRecent).then(snapshotRecent => {
              const recentData = snapshotRecent.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
              // console.log(`DualStorage [${collectionName}]: Fetched ${recentData.length} active month invoices.`);
              
              // partial=true so we merge without deleting anything.
              this.processDataUpdate(collectionName, recentData, true); 

              // Trigger Stage 3: Time Sheet and PO Pages
              setTimeout(() => {
                  this.runStagedFetchForCollection(COLLECTIONS.RECORDS);
                  this.runStagedFetchForCollection(COLLECTIONS.PO_CUSTOMERS);
              }, 100);

              // 3. PREVIOUS MONTH: Fetch the preceding month for comparison stats in Dashboard/Ticker
              const prevMonthStart = new Date(activeStartDateStr);
              prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
              const prevMonthStartStr = prevMonthStart.toISOString();
              
              // console.log(`DualStorage [${collectionName}]: Fetching previous month comparison data [${prevMonthStartStr} to ${activeStartDateStr}]`);
              
              const qPrev = query(
                collection(db, collectionName),
                where('date', '>=', prevMonthStartStr),
                where('date', '<', activeStartDateStr)
              );

              getDocs(qPrev).then(snapshotPrev => {
                const prevData = snapshotPrev.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
                // console.log(`DualStorage [${collectionName}]: Fetched ${prevData.length} previous month invoices.`);
                this.processDataUpdate(collectionName, prevData, true);
              }).catch(err => console.error(`DualStorage [${collectionName}]: Previous month fetch error:`, err));

              // 4. LIVE UPDATES: Hook up a live listener for any changes happening CONCURRENTLY during session
              const sessionStartTime = new Date().toISOString();
              const qLive = query(
                collection(db, collectionName), 
                where('updatedAt', '>=', sessionStartTime)
              );
              const unsubscribeLive = onSnapshot(qLive, (snapshotLive) => {
                const liveUpdates = snapshotLive.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
                if (liveUpdates.length > 0) {
                  this.processDataUpdate(collectionName, liveUpdates, true); 
                }
              }, (error) => {
                handleFirestoreError(error, OperationType.LIST, collectionName);
              });
              this.listeners.push(unsubscribeLive);

            }).catch(err => {
              console.error(`DualStorage [${collectionName}]: Active fetch error:`, err);
              this.runStagedFetchForCollection(COLLECTIONS.RECORDS);
              this.runStagedFetchForCollection(COLLECTIONS.PO_CUSTOMERS);
            });
          }).catch(err => {
            console.error(`DualStorage [${collectionName}]: Fast fetch error:`, err);
            this.runStagedFetchForCollection(COLLECTIONS.RECORDS);
            this.runStagedFetchForCollection(COLLECTIONS.PO_CUSTOMERS);
          });
          
          return;
      }

      // Default staged loading for other collections:
      const cachedItems = this.getLocalData(collectionName);
      const sessionStartTime = new Date().toISOString();

      // Hook up a live lightweight realtime listener for any changes happening CONCURRENTLY during session
      // console.log(`DualStorage [${collectionName}]: Starting lightweight live listener for session updates >= ${sessionStartTime}`);
      const qLive = query(
        collection(db, collectionName), 
        where('updatedAt', '>=', sessionStartTime)
      );

      const unsubscribeLive = onSnapshot(qLive, (snapshot) => {
        // We received updates during the session. Process and merge them right away.
        const liveUpdates = snapshot.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
        if (liveUpdates.length > 0) {
          // console.log(`DualStorage [${collectionName}]: [Live Snapshot] Received ${liveUpdates.length} real-time session update(s).`);
          this.processDataUpdate(collectionName, liveUpdates, true); // Partial=true so it merges nicely
        }
      }, (error) => {
        console.error(`DualStorage [${collectionName}]: Live session listener error:`, error);
        handleFirestoreError(error, OperationType.LIST, collectionName);
      });

      this.listeners.push(unsubscribeLive);

      // Step 1: Find the threshold timestamp (highest updatedAt in cache)
      let lastUpdatedStr = '';
      if (cachedItems && cachedItems.length > 0) {
        let maxTime = 0;
        cachedItems.forEach(item => {
          if (item.updatedAt) {
            const t = new Date(item.updatedAt).getTime();
            if (t > maxTime) maxTime = t;
          }
        });
        if (maxTime > 0) {
          // Subtract a 2-hour buffer for clock safety/drift
          lastUpdatedStr = new Date(maxTime - 2 * 60 * 60 * 1000).toISOString();
        }
      }

      // console.log(`DualStorage [${collectionName}]: Incremental fetch started. Highest local updatedAt threshold: ${lastUpdatedStr || 'None (Full Sync)'}`);

      // Step 2: Fetch only items updated since our local threshold
      let fetchedItems: any[] = [];
      if (lastUpdatedStr) {
        try {
          const qIncremental = query(
            collection(db, collectionName), 
            where('updatedAt', '>=', lastUpdatedStr)
          );
          const snap = await getDocs(qIncremental);
          fetchedItems = snap.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
          // console.log(`DualStorage [${collectionName}]: Incremental fetch found ${fetchedItems.length} items updated/created since ${lastUpdatedStr}.`);
        } catch (err) {
          console.error(`DualStorage [${collectionName}]: Incremental query failed, falling back to full query`, err);
          const qFallback = query(collection(db, collectionName));
          const snap = await getDocs(qFallback);
          fetchedItems = snap.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
        }
      } else {
        // No cached records found, fetch all
        const qFull = query(collection(db, collectionName));
        const snap = await getDocs(qFull);
        fetchedItems = snap.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
      }

      // Step 3: Merge fetched data with cached list and instantly update UI!
      if (fetchedItems.length > 0) {
         this.processDataUpdate(collectionName, fetchedItems, true);
      }
      
      // Optional Step 4: Run a background cleanup (Removed fullSyncFromCloud to avoid performance hits)
      if (enableBackgroundCleanup) {
        // console.log(`DualStorage [${collectionName}]: Background cleanup flag checked, skipping full sync for performance.`);
      }

    } catch (error) {
      console.error(`DualStorage [${collectionName}]: Error during staged loading:`, error);
      // Fallback
      const qFull = query(collection(db, collectionName));
      const unsubscribeDefault = onSnapshot(qFull, (snap) => {
        const data = snap.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
        this.processDataUpdate(collectionName, data);
      });
      this.listeners.push(unsubscribeDefault);
    }
  }

  /**
   * Returns the count of pending changes in the queue, optionally filtered by branch.
   */
  getPendingCount(branchId?: string): number {
    const queue = this.getPendingQueue();
    if (!branchId) return queue.length;
    
    return queue.filter(item => {
        if (!item.data) return false;
        return item.data.branchId === branchId;
    }).length;
  }

  /**
   * Save data to Firestore and LocalStorage.
   * If offline, queue for later sync.
   */
  async save(collectionName: string, id: string, data: any) {
    const docRef = doc(db, collectionName, id);
    // Convert Dates to ISO strings before saving to Firestore for backward compatibility
    const firestoreData = this.prepareForFirestore({ ...data, updatedAt: new Date() });
    delete firestoreData.id;

    // Use original data for local storage (with actual Date objects)
    const timestampedData = { ...data, id, updatedAt: new Date().toISOString() };
    const originalLocalData = this.getLocalData(collectionName);
    const originalItem = originalLocalData.find((item: any) => item.id === id);

    // 1. ADD TO PENDING QUEUE IMMEDIATELY (Before optimistic update)
    // This ensures that even if the process dies, the intent is captured.
    this.addToPendingQueue(collectionName, id, firestoreData, 'save');

    // 2. Optimistically update local UI immediately
    const updatedLocalData = this.updateLocalMirror(collectionName, id, timestampedData);
    if (this.onDataUpdateCallback) {
        this.onDataUpdateCallback(collectionName, updatedLocalData);
    }

    if (navigator.onLine) {
      try {
        await setDoc(docRef, firestoreData);
        
        // UPDATE STATISTICS DOCUMENT FOR SALES_INVOICES IF IT'S A NEW OR MODIFIED INVOICE
        if (collectionName === "salesInvoices") {
           const statsRef = doc(db, 'settings', 'global_stats');
           const incrementValue = originalItem ? (data.total || 0) - (originalItem.total || 0) : (data.total || 0);
           const countIncrement = originalItem ? 0 : 1;
           const quantityIncrement = originalItem ? (data.quantity || 0) - (originalItem.quantity || 0) : (data.quantity || 0);
           const updatePayload: any = { updatedAt: new Date() };
           
           if (data.branchId) {
             const { increment } = await import('firebase/firestore');
             updatePayload[`lifetimeTotal_${data.branchId}`] = increment(incrementValue);
             updatePayload[`lifetimeCount_${data.branchId}`] = increment(countIncrement);
             updatePayload[`lifetimeQuantity_${data.branchId}`] = increment(quantityIncrement);
             
             // Update global un-branched totals too
             updatePayload['global_lifetimeTotal'] = increment(incrementValue);
             updatePayload['global_lifetimeCount'] = increment(countIncrement);
             
             try {
               await setDoc(statsRef, updatePayload, { merge: true });
             } catch (e) {
               console.warn("Could not update global stats", e);
             }
           }
        }

        // 3. REMOVE FROM PENDING QUEUE ONLY AFTER SUCCESS
        this.removeFromPendingQueue(collectionName, id, 'save');
      } catch (error: any) {
        handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
        if (error?.code === 'permission-denied' || (error?.message && error.message.toLowerCase().includes('permission'))) {
            // Log warning but keep optimistic update in local storage (graceful offline fallback)
            console.warn(`Firestore permission denied for save on ${collectionName}/${id}. Saved in local storage only (fallback mode).`);
            this.removeFromPendingQueue(collectionName, id, 'save');
            // Do not revert or throw, so the user's data is safely preserved in browser local storage
            return;
        }
        // Keep in queue for other errors (network etc)
      }
    }
    // If offline, it stays in the queue (already added at step 1)
  }

  async delete(collectionName: string, id: string) {
    // console.log(`DualStorage: Deleting from ${collectionName}, ID: ${id}`);
    const docRef = doc(db, collectionName, id);

    const originalLocalData = this.getLocalData(collectionName);
    const originalItem = originalLocalData.find((item: any) => item.id === id);

    // 1. ADD TO PENDING QUEUE IMMEDIATELY
    this.addToPendingQueue(collectionName, id, null, 'delete');

    // 2. Optimistically update local UI immediately
    const updatedLocalData = this.removeFromLocalMirror(collectionName, id);
    if (this.onDataUpdateCallback) {
        this.onDataUpdateCallback(collectionName, updatedLocalData);
    }

    if (navigator.onLine) {
      try {
        await deleteDoc(docRef);
        
        // UPDATE STATISTICS DOCUMENT FOR SALES_INVOICES UPON DELETING AN INVOICE
        if (collectionName === "salesInvoices" && originalItem) {
           const statsRef = doc(db, 'settings', 'global_stats');
           const updatePayload: any = { updatedAt: new Date() };
           
           if (originalItem.branchId) {
             const { increment } = await import('firebase/firestore');
             updatePayload[`lifetimeTotal_${originalItem.branchId}`] = increment(-(originalItem.total || 0));
             updatePayload[`lifetimeCount_${originalItem.branchId}`] = increment(-1);
             updatePayload[`lifetimeQuantity_${originalItem.branchId}`] = increment(-(originalItem.quantity || 0));
             
             // Update global un-branched totals too
             updatePayload['global_lifetimeTotal'] = increment(-(originalItem.total || 0));
             updatePayload['global_lifetimeCount'] = increment(-1);
             
             try {
               await setDoc(statsRef, updatePayload, { merge: true });
             } catch (e) {
               console.warn("Could not decrement global stats", e);
             }
           }
        }

        // 3. REMOVE FROM PENDING QUEUE ONLY AFTER SUCCESS
        this.removeFromPendingQueue(collectionName, id, 'delete');
      } catch (error: any) {
        handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
        if (error?.code === 'permission-denied' || (error?.message && error.message.toLowerCase().includes('permission'))) {
            // Log warning but keep optimistic deletion in local storage (graceful offline fallback)
            console.warn(`Firestore permission denied for delete on ${collectionName}/${id}. Deleted in local storage only (fallback mode).`);
            this.removeFromPendingQueue(collectionName, id, 'delete');
            // Do not revert or throw, so the deletion remains applied in local storage
            return;
        }
        // Keep in queue for other errors
      }
    }
  }

  private updateLocalMirror(collectionName: string, id: string, data: any): any[] {
    const localData = this.getLocalData(collectionName);
    const index = localData.findIndex((item: any) => item.id === id);
    if (index > -1) {
      localData[index] = { ...data, id };
    } else {
      localData.push({ ...data, id });
    }
    localStorage.setItem(`fs_${collectionName}`, JSON.stringify(localData));
    return localData;
  }

  private removeFromLocalMirror(collectionName: string, id: string): any[] {
    const localData = this.getLocalData(collectionName);
    const filtered = localData.filter((item: any) => item.id !== id);
    localStorage.setItem(`fs_${collectionName}`, JSON.stringify(filtered));
    return filtered;
  }

  getLocalData(collectionName: string): any[] {
    const saved = localStorage.getItem(`fs_${collectionName}`);
    return saved ? JSON.parse(saved) : [];
  }

  private addToPendingQueue(collectionName: string, id: string, data: any, action: 'save' | 'delete') {
    const queue = this.getPendingQueue();
    // Use upsert logic to avoid multiple entries for same document
    const existingIndex = queue.findIndex(item => item.collectionName === collectionName && item.id === id);
    const newItem = { collectionName, id, data, action, timestamp: Date.now() };
    
    if (existingIndex > -1) {
        queue[existingIndex] = newItem;
    } else {
        queue.push(newItem);
    }
    localStorage.setItem('fs_pending_queue', JSON.stringify(queue));
  }

  private removeFromPendingQueue(collectionName: string, id: string, action: 'save' | 'delete') {
    const queue = this.getPendingQueue();
    const filtered = queue.filter(item => 
        !(item.collectionName === collectionName && item.id === id && item.action === action)
    );
    localStorage.setItem('fs_pending_queue', JSON.stringify(filtered));
  }

  private getPendingQueue(): any[] {
    const saved = localStorage.getItem('fs_pending_queue');
    return saved ? JSON.parse(saved) : [];
  }

  private async syncPendingChanges() {
    const queue = this.getPendingQueue();
    if (queue.length === 0) return;

    // console.log(`DualStorage: Syncing ${queue.length} pending changes to Firestore...`);
    
    const processedIds: string[] = [];

    // Process queue in order
    for (const item of queue) {
      try {
        const docRef = doc(db, item.collectionName, item.id);
        if (item.action === 'save') {
          await setDoc(docRef, item.data);
        } else if (item.action === 'delete') {
          await deleteDoc(docRef);
        }
        processedIds.push(`${item.collectionName}-${item.id}-${item.action}`);
      } catch (error: any) {
        console.error('DualStorage: Failed to sync pending change:', error);
        // Only remove if it's a permanent error like permission-denied
        if (error?.code === 'permission-denied' || (error?.message && error.message.toLowerCase().includes('permission'))) {
           processedIds.push(`${item.collectionName}-${item.id}-${item.action}`);
        }
        // Network/transient errors stay in queue
      }
    }

    // Remove processed items from queue
    const remainingQueue = this.getPendingQueue().filter(item => 
        !processedIds.includes(`${item.collectionName}-${item.id}-${item.action}`)
    );
    
    if (remainingQueue.length === 0) {
        localStorage.removeItem('fs_pending_queue');
    } else {
        localStorage.setItem('fs_pending_queue', JSON.stringify(remainingQueue));
    }
  }

  /**
   * Clear documents in a collection, optionally filtered by a field and value.
   */
  async clearCollection(collectionName: string, field?: string, value?: any) {
    if (navigator.onLine) {
      try {
        let q = query(collection(db, collectionName));
        if (field && value !== undefined) {
          q = query(collection(db, collectionName), where(field, '==', value));
        }
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, collectionName);
      }
    }

    // Always clear local mirror immediately for responsiveness
    const localData = this.getLocalData(collectionName);
    let filtered = [];
    if (field && value !== undefined) {
      filtered = localData.filter((item: any) => item[field] !== value);
    } 
    localStorage.setItem(`fs_${collectionName}`, JSON.stringify(filtered));
    if (this.onDataUpdateCallback) {
      this.onDataUpdateCallback(collectionName, filtered);
    }
  }

  /**
   * Returns the timestamp of the last successful full sync.
   */
  getLastSyncTime(): number {
    const lastSync = localStorage.getItem('fs_last_sync_time');
    return lastSync ? parseInt(lastSync) : 0;
  }

  /**
   * One-way sync from Cloud to Local, with recovery for local-only items.
   * This is called on app start to ensure local mirror is fresh.
   */
  async fullSyncFromCloud() {
    if (!navigator.onLine) {
        // console.log('DualStorage: Offline, skipping cloud sync.');
        return;
    }

    // console.log('DualStorage: Starting parallel cloud sync with recovery...');
    const syncPromises = Object.values(COLLECTIONS).map(async (collectionName) => {
      try {
        let q = query(collection(db, collectionName));
        const snapshot = await getDocs(q);
        const cloudData = snapshot.docs.map(doc => ({ ...this.convertTimestamps(doc.data()), id: doc.id }));
        const cloudIds = new Set(cloudData.map(d => d.id));
        
        const localData = this.getLocalData(collectionName);
        
        // CLEANUP: If items in pending queue are already in cloud, remove them
        const queue = this.getPendingQueue();
        const updatedQueue = queue.filter(qItem => 
          !(qItem.collectionName === collectionName && cloudIds.has(qItem.id))
        );
        if (updatedQueue.length !== queue.length) {
            localStorage.setItem('fs_pending_queue', JSON.stringify(updatedQueue));
            // console.log(`DualStorage: Cleaned up ${queue.length - updatedQueue.length} items from queue that are already in cloud.`);
        }

        // RECOVERY: Find items in local storage that ARE NOT in cloud
        // These are ONLY recovered if they are in the pending queue as 'save' actions.
        // If they aren't in the cloud and aren't in the pending save queue, they are likely 
        // deleted items from another device and should be removed from local.
        const localOnlyItems = localData.filter(item => {
            if (cloudIds.has(item.id)) return false;
            return queue.some(qItem => qItem.collectionName === collectionName && qItem.id === item.id && qItem.action === 'save');
        });
        
        if (localOnlyItems.length > 0) {
            // console.log(`DualStorage: Recovering ${localOnlyItems.length} local-only items for ${collectionName}`);
            
            // Use batch for efficient recovery of multiple items
            const batchSize = 20;
            for (let i = 0; i < localOnlyItems.length; i += batchSize) {
                const chunk = localOnlyItems.slice(i, i + batchSize);
                const batch = writeBatch(db);
                chunk.forEach(item => {
                    const docRef = doc(db, collectionName, item.id);
                    const firestoreData = this.prepareForFirestore({ ...item, updatedAt: new Date() });
                    delete firestoreData.id;
                    batch.set(docRef, firestoreData);
                });
                try {
                    await batch.commit();
                    // console.log(`DualStorage: Successfully recovered batch of ${chunk.length} items for ${collectionName}`);
                } catch (e) {
                    console.error(`DualStorage: Failed to recover batch`, e);
                    // On failure, ensure they are in pending queue
                    chunk.forEach(item => {
                        const firestoreData = this.prepareForFirestore({ ...item, updatedAt: new Date() });
                        delete firestoreData.id;
                        this.addToPendingQueue(collectionName, item.id, firestoreData, 'save');
                    });
                }
            }
        }

        // Standard merge Cloud -> Local
        if (localData.length === 0 && cloudData.length > 0) {
            localStorage.setItem(`fs_${collectionName}`, JSON.stringify(cloudData));
            if (this.onDataUpdateCallback) {
                this.onDataUpdateCallback(collectionName, cloudData);
            }
        } else {
            const mergedMap = new Map();
            // Start with cloud data
            cloudData.forEach(cloudItem => mergedMap.set(cloudItem.id, cloudItem));
            
            // Apply pending local items (unsynced)
            // This ensures local optimistic updates win over stale cloud data
            localData.forEach(item => {
                const isPendingSave = queue.some(q => q.collectionName === collectionName && q.id === item.id && q.action === 'save');
                if (isPendingSave) {
                    mergedMap.set(item.id, item);
                }
            });

            // Respect pending deletions (even if in cloud snapshot)
            queue.forEach(qItem => {
                if (qItem.collectionName === collectionName && qItem.action === 'delete') {
                    mergedMap.delete(qItem.id);
                }
            });

            const mergedData = Array.from(mergedMap.values());
            localStorage.setItem(`fs_${collectionName}`, JSON.stringify(mergedData));
            
            if (this.onDataUpdateCallback) {
                this.onDataUpdateCallback(collectionName, mergedData);
            }
        }
      } catch (error: any) {
        console.error(`DualStorage: Failed to sync ${collectionName}`, error);
        handleFirestoreError(error, OperationType.LIST, collectionName);
      }
    });

    await Promise.all(syncPromises);
    localStorage.setItem('fs_last_sync_time', Date.now().toString());
    // console.log('DualStorage: Parallel sync and recovery complete.');
  }

  /**
   * Forces a push of all local data for a specific branch to the cloud.
   * This is the "Force Upload" requested by the user.
   */
  async forcePushBranchData(branchId: string) {
    if (!navigator.onLine) {
        throw new Error('Cannot force push while offline');
    }

    // console.log(`DualStorage: Force pushing data for branch ${branchId}...`);
    
    // 1. First, try to sync the general pending queue to clear any easy stuff
    await this.syncPendingChanges();

    // 2. Now, specifically look for data belonging to this branch in local storage 
    // that might not have made it to the cloud (recovery scan).
    const syncPromises = Object.values(COLLECTIONS).map(async (collectionName) => {
        const localData = this.getLocalData(collectionName);
        // Filter by branch
        const branchLocalData = localData.filter(item => item.branchId === branchId);
        
        if (branchLocalData.length === 0) return;

        try {
            // Fetch current cloud state for this branch to see what's missing
            const q = query(collection(db, collectionName), where('branchId', '==', branchId));
            const snapshot = await getDocs(q);
            const cloudIds = new Set(snapshot.docs.map(doc => doc.id));
            const queue = this.getPendingQueue();
            
            // Only push items that are in the pending queue with action 'save'
            // or if we're doing a total recovery (but safely)
            const missingItems = branchLocalData.filter(item => {
                if (cloudIds.has(item.id)) return false;
                // If it's not in the cloud AND it's in the pending queue, it's definitely new.
                const inQueue = queue.some(q => q.collectionName === collectionName && q.id === item.id && q.action === 'save');
                if (inQueue) return true;
                
                // If it's been created VERY recently (last 10 mins) we might treat it as "not yet queued" 
                // but this is risky. Let's stick to the queue.
                return false;
            });
            
            if (missingItems.length > 0) {
                // console.log(`DualStorage: Found ${missingItems.length} missing items for branch ${branchId} in ${collectionName}. Pushing now...`);
                
                const batchSize = 50;
                for (let i = 0; i < missingItems.length; i += batchSize) {
                    const chunk = missingItems.slice(i, i + batchSize);
                    const batch = writeBatch(db);
                    chunk.forEach(item => {
                        const docRef = doc(db, collectionName, item.id);
                        const firestoreData = this.prepareForFirestore({ ...item, updatedAt: new Date() });
                        delete firestoreData.id;
                        batch.set(docRef, firestoreData);
                    });
                    await batch.commit();
                }
            }
        } catch (error) {
            console.error(`DualStorage: Error during force push for ${collectionName}:`, error);
        }
    });

    await Promise.all(syncPromises);
    localStorage.setItem('fs_last_sync_time', Date.now().toString());
    // console.log(`DualStorage: Force push for branch ${branchId} complete.`);
  }

  /**
   * Export all collections data for backup.
   */
  exportAllData() {
    const backup: Record<string, any[]> = {};
    Object.values(COLLECTIONS).forEach(collectionName => {
      backup[collectionName] = this.getLocalData(collectionName);
    });
    return backup;
  }

  /**
   * Import data into all collections.
   * WARNING: This replaces local data and attempts to sync to Firestore.
   */
  async importAllData(backup: Record<string, any[]>) {
    // console.log("DualStorage: Importing full backup...");
    for (const [collectionName, data] of Object.entries(backup)) {
      if (!Object.values(COLLECTIONS).includes(collectionName)) continue;
      
      // Update local first
      localStorage.setItem(`fs_${collectionName}`, JSON.stringify(data));
      if (this.onDataUpdateCallback) {
        this.onDataUpdateCallback(collectionName, data);
      }

      // Sync to Firestore if online
      if (navigator.onLine) {
        try {
          const batch = writeBatch(db);
          // 1. Clear existing in Firestore for this collection (Note: simple implemention, real app might prefer full clean)
          const q = query(collection(db, collectionName));
          const snapshot = await getDocs(q);
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          
          // 2. Add new data
          data.forEach(item => {
            const docRef = doc(db, collectionName, item.id);
            batch.set(docRef, item);
          });
          
          await batch.commit();
          // console.log(`DualStorage: Successfully synced ${collectionName} import to cloud.`);
        } catch (error) {
          console.error(`DualStorage: Failed to sync import for ${collectionName}`, error);
        }
      }
    }
  }
}

export const dualStorage = new DualStorageService();
export { COLLECTIONS };
