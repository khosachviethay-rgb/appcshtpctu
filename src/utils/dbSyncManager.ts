/**
 * Quản lý Đồng bộ Cơ sở Dữ liệu Toàn Hệ thống PCTU
 * Đảm bảo mọi thay đổi dữ liệu trong quá trình sử dụng luôn được lưu trữ,
 * đồng bộ thời gian thực giữa các tab/cửa sổ và có thể sao lưu/phục hồi an toàn.
 */

export interface DatabaseTableInfo {
  key: string;
  name: string;
  category: string;
  count: number;
  lastUpdated: string;
  status: 'synced' | 'saving' | 'error';
}

export interface DatabaseStats {
  totalRecords: number;
  storageSizeKb: number;
  tablesCount: number;
  lastSavedTime: string;
  isAutoSyncEnabled: boolean;
}

export const DB_CHANNEL_NAME = 'pctu_database_sync_channel';

// Safe localStorage saver with quota check & error handling
export const safeStorageSet = (key: string, value: any): boolean => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Lỗi khi lưu dữ liệu vào khóa [${key}]:`, error);
    return false;
  }
};

// Calculate total byte size of PCTU facility database in localStorage
export const calculatePctuStorageSize = (prefix: string): { bytes: number; kb: number } => {
  try {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalBytes += (key.length + item.length) * 2; // UTF-16 characters = 2 bytes
        }
      }
    }
    return {
      bytes: totalBytes,
      kb: Math.round((totalBytes / 1024) * 10) / 10,
    };
  } catch {
    return { bytes: 0, kb: 0 };
  }
};

// Broadcast database update event across browser tabs
export const broadcastDbUpdate = (tableName: string, count: number) => {
  try {
    if (typeof window !== 'undefined') {
      // 1. BroadcastChannel for modern browsers
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(DB_CHANNEL_NAME);
        channel.postMessage({
          type: 'DB_UPDATED',
          tableName,
          count,
          timestamp: new Date().toISOString(),
        });
        channel.close();
      }

      // 2. Custom DOM event within current window
      window.dispatchEvent(
        new CustomEvent('pctu_local_db_updated', {
          detail: { tableName, count, timestamp: new Date().toISOString() },
        })
      );
    }
  } catch (err) {
    console.warn('Không thể phát tín hiệu đồng bộ CSDL qua channel:', err);
  }
};
