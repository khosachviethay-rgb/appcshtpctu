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
  autoSyncIntervalSec: number;
  lastSyncResult?: string;
}

export const DB_CHANNEL_NAME = 'pctu_database_sync_channel';

export const ALL_DB_TABLES = [
  { keySuffix: '_buildings', name: 'Tòa nhà & Khu giảng đường', category: 'Hạ tầng' },
  { keySuffix: '_devices', name: 'Thiết bị kỹ thuật & Mã QR', category: 'Thiết bị' },
  { keySuffix: '_electric', name: 'Chỉ số Điện & Trạm biến áp', category: 'Năng lượng' },
  { keySuffix: '_water', name: 'Chỉ số Nước & Hệ thống bơm', category: 'Năng lượng' },
  { keySuffix: '_water_infra', name: 'Cấu hình Bể nước & Bơm cấp', category: 'Hạ tầng' },
  { keySuffix: '_infra_issues', name: 'Sự cố hạ tầng & Công trình', category: 'Hạ tầng' },
  { keySuffix: '_repair_requests', name: 'Phiếu Yêu cầu sửa chữa', category: 'Vận hành' },
  { keySuffix: '_daily_tasks', name: 'Nhiệm vụ & Checklist kỹ thuật', category: 'Vận hành' },
  { keySuffix: '_maint_schedules', name: 'Kế hoạch bảo trì định kỳ', category: 'Bảo trì' },
  { keySuffix: '_repair_history', name: 'Lịch sử nghiệm thu sửa chữa', category: 'Bảo trì' },
  { keySuffix: '_maint_history', name: 'Lịch sử bảo dưỡng thiết bị', category: 'Bảo trì' },
  { keySuffix: '_inventory', name: 'Danh mục Vật tư trong kho', category: 'Vật tư' },
  { keySuffix: '_inv_transactions', name: 'Nhật ký Nhập/Xuất kho vật tư', category: 'Vật tư' },
  { keySuffix: '_budget', name: 'Dự toán Ngân sách vận hành', category: 'Tài chính' },
  { keySuffix: '_daily_reports', name: 'Báo cáo ca kỹ thuật viên', category: 'Báo cáo' },
  { keySuffix: '_alerts', name: 'Cảnh báo hệ thống & Sự cố', category: 'Giám sát' },
  { keySuffix: '_audit_logs', name: 'Nhật ký kiểm toán hoạt động', category: 'Hệ thống' },
  { keySuffix: '_rbac_audit_logs', name: 'Nhật ký phân quyền & Tài khoản', category: 'Hệ thống' },
  { keySuffix: '_md_logs', name: 'Nhật ký thay đổi Master Data', category: 'Dữ liệu gốc' },
  { keySuffix: '_proposals', name: 'Đề xuất phê duyệt Master Data', category: 'Dữ liệu gốc' },
  { keySuffix: '_users', name: 'Tài khoản người dùng & CBKT', category: 'Phân quyền' },
  { keySuffix: '_roles', name: 'Cấu hình Quyền hạn RBAC Matrix', category: 'Phân quyền' },
];

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

// Safe localStorage loader with fallback
export const safeStorageGet = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== undefined && parsed !== null ? parsed : fallback;
  } catch (err) {
    console.warn(`Lỗi khi đọc dữ liệu từ [${key}], trả về giá trị mặc định:`, err);
    return fallback;
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
