const DB_NAME = 'AutoBackupFolderDB';
const STORE_NAME = 'handles';
const KEY = 'backup_folder_handle';

export async function saveFolderHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const putRequest = store.put(handle, KEY);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function getFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getRequest = store.get(KEY);
            getRequest.onsuccess = () => resolve(getRequest.result || null);
            getRequest.onerror = () => reject(getRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function deleteFolderHandle(): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const deleteRequest = store.delete(KEY);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function verifyPermission(handle: FileSystemDirectoryHandle, readWrite: boolean): Promise<boolean> {
    const options: any = {};
    if (readWrite) {
        options.mode = 'readwrite';
    }
    try {
        if ((await (handle as any).queryPermission(options)) === 'granted') {
            return true;
        }
        if ((await (handle as any).requestPermission(options)) === 'granted') {
            return true;
        }
    } catch (e) {
        console.error("Error verifying permission for directory handle:", e);
    }
    return false;
}
