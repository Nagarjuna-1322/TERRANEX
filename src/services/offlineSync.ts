import { OfflineSyncItem } from '../types';
import { api } from './api';

export type OfflineQueueItem = OfflineSyncItem;

const STORAGE_KEY = 'terranex_pending_sync_queue';
const OFFLINE_OVERRIDE_KEY = 'terranex_simulated_offline';

export class OfflineSyncService {
  private static listeners: Array<(items: OfflineSyncItem[], isOnline: boolean) => void> = [];

  static getQueue(): OfflineSyncItem[] {
    return this.getPendingQueue();
  }

  static clearQueue(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }

  static async processQueue(): Promise<{ success: boolean; syncedCount: number }> {
    return this.syncPendingItems();
  }

  static isSimulatedOffline(): boolean {
    return localStorage.getItem(OFFLINE_OVERRIDE_KEY) === 'true';
  }

  static toggleSimulatedOffline(): boolean {
    const current = this.isSimulatedOffline();
    localStorage.setItem(OFFLINE_OVERRIDE_KEY, String(!current));
    this.notifyListeners();
    if (current) {
      // Switched back to online! Trigger sync
      this.syncPendingItems();
    }
    return !current;
  }

  static isOnline(): boolean {
    if (this.isSimulatedOffline()) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  static getPendingQueue(): OfflineSyncItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static enqueueItem(type: OfflineSyncItem['type'], payload: any): OfflineSyncItem {
    const queue = this.getPendingQueue();
    const newItem: OfflineSyncItem = {
      id: `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      retryCount: 0
    };

    queue.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    this.notifyListeners();

    // If online, attempt immediate sync
    if (this.isOnline()) {
      this.syncPendingItems();
    }

    return newItem;
  }

  static async syncPendingItems(): Promise<{ success: boolean; syncedCount: number }> {
    const queue = this.getPendingQueue();
    if (queue.length === 0) return { success: true, syncedCount: 0 };

    try {
      const res = await api.syncOfflineQueue(queue);
      if (res.success && Array.isArray(res.syncedIds)) {
        // Remove synced items from queue
        const remaining = queue.filter((item) => !res.syncedIds.includes(item.id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
        this.notifyListeners();
        return { success: true, syncedCount: res.syncedCount || queue.length };
      }
    } catch (err) {
      console.warn('Sync failed, will retry later:', err);
    }

    return { success: false, syncedCount: 0 };
  }

  static subscribe(listener: (items: OfflineSyncItem[], isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    listener(this.getPendingQueue(), this.isOnline());

    const handleNetworkChange = () => {
      this.notifyListeners();
      if (this.isOnline()) {
        this.syncPendingItems();
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }

  private static notifyListeners() {
    const queue = this.getPendingQueue();
    const online = this.isOnline();
    this.listeners.forEach((listener) => listener(queue, online));
  }
}
