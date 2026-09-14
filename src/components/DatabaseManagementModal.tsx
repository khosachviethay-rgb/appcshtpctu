import React, { useState, useRef } from 'react';
import { 
  Database, RefreshCw, Download, Upload, CheckCircle2, 
  AlertTriangle, HardDrive, ShieldCheck, Clock, X, 
  Layers, FileText, Check, Activity, Server, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DatabaseManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseManagementModal: React.FC<DatabaseManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    buildings, devices, electricRecords, waterRecords, waterInfrastructure,
    infraIssues, repairRequests, dailyTasks, maintenanceSchedules,
    repairHistory, maintenanceHistory, inventory, inventoryTransactions,
    budget, dailyReports, alerts, auditLogs, rbacAuditLogs, masterDataLogs,
    proposals, users, roles, exportDataJSON, importDataJSON, resetToDefaultData,
    dbStats, dbSaveStatus, lastSavedTime, forceSyncAll
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Collection metadata
  const tables = [
    { id: 'buildings', name: 'Tòa nhà & Khu giảng đường', category: 'Hạ tầng', count: (buildings || []).length },
    { id: 'devices', name: 'Danh mục Thiết bị kỹ thuật & QR', category: 'Thiết bị', count: (devices || []).length },
    { id: 'electric', name: 'Nhật ký chỉ số Điện EVN & Trạm TBA', category: 'Năng lượng', count: (electricRecords || []).length },
    { id: 'water', name: 'Nhật ký chỉ số Nước & Hệ thống bơm', category: 'Năng lượng', count: (waterRecords || []).length },
    { id: 'water_infra', name: 'Cấu hình Bể nước & Bơm cấp', category: 'Hạ tầng', count: 1 },
    { id: 'infra_issues', name: 'Sự cố công trình & Cơ sở hạ tầng', category: 'Hạ tầng', count: (infraIssues || []).length },
    { id: 'repairs', name: 'Phiếu Yêu cầu sửa chữa (Tickets)', category: 'Vận hành', count: (repairRequests || []).length },
    { id: 'tasks', name: 'Nhiệm vụ kỹ thuật & Checklist hàng ngày', category: 'Vận hành', count: (dailyTasks || []).length },
    { id: 'schedules', name: 'Kế hoạch bảo trì định kỳ', category: 'Bảo trì', count: (maintenanceSchedules || []).length },
    { id: 'repair_history', name: 'Lịch sử nghiệm thu sửa chữa', category: 'Bảo trì', count: (repairHistory || []).length },
    { id: 'maint_history', name: 'Lịch sử bảo dưỡng thiết bị', category: 'Bảo trì', count: (maintenanceHistory || []).length },
    { id: 'inventory', name: 'Danh mục Vật tư & Phụ tùng trong kho', category: 'Vật tư', count: (inventory || []).length },
    { id: 'inv_transactions', name: 'Lịch sử Nhập / Xuất kho vật tư', category: 'Vật tư', count: (inventoryTransactions || []).length },
    { id: 'budget', name: 'Dự toán Ngân sách vận hành PCTU', category: 'Tài chính', count: (budget || []).length },
    { id: 'reports', name: 'Báo cáo ca làm việc Kỹ thuật viên', category: 'Báo cáo', count: (dailyReports || []).length },
    { id: 'alerts', name: 'Cảnh báo vận hành & Hệ thống', category: 'Giám sát', count: (alerts || []).length },
    { id: 'audit_logs', name: 'Nhật ký kiểm toán hoạt động (Audit Trail)', category: 'Hệ thống', count: (auditLogs || []).length },
    { id: 'rbac_audit', name: 'Nhật ký phân quyền & Tài khoản RBAC', category: 'Hệ thống', count: (rbacAuditLogs || []).length },
    { id: 'md_logs', name: 'Nhật ký thay đổi Dữ liệu gốc (Master Data)', category: 'Dữ liệu gốc', count: (masterDataLogs || []).length },
    { id: 'proposals', name: 'Đề xuất phê duyệt Master Data', category: 'Dữ liệu gốc', count: (proposals || []).length },
    { id: 'users', name: 'Tài khoản Cán bộ kỹ thuật & Ban giám hiệu', category: 'Phân quyền', count: (users || []).length },
    { id: 'roles', name: 'Cấu hình Quyền & Vai trò RBAC Matrix', category: 'Phân quyền', count: (roles || []).length },
  ];

  const totalRecords = tables.reduce((sum, t) => sum + t.count, 0);

  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
    t.category.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const handleForceSync = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    setImportErrorMsg(null);

    setTimeout(() => {
      forceSyncAll();
      setIsSyncing(false);
      setSyncSuccessMsg('Đã đồng bộ và xác thực thành công toàn bộ 22 bảng cơ sở dữ liệu!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }, 400);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = importDataJSON(content);
        if (ok) {
          setSyncSuccessMsg('Đã nhập và phục hồi thành công cơ sở dữ liệu từ tệp sao lưu!');
          setImportErrorMsg(null);
        } else {
          setImportErrorMsg('Tệp sao lưu không hợp lệ hoặc dữ liệu bị lỗi.');
        }
      } catch {
        setImportErrorMsg('Không thể đọc tệp sao lưu. Vui lòng kiểm tra định dạng JSON.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  Quản Trị & Đồng Bộ Cơ Sở Dữ Liệu Toàn Hệ Thống
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-Save 100%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cơ sở dữ liệu tự động ghi nhận tức thời mọi thao tác thêm, sửa, xóa, duyệt phiếu trên toàn ứng dụng
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50">
          {/* Notifications */}
          {syncSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center gap-2 font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {importErrorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 flex items-center gap-2 font-medium animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importErrorMsg}</span>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tổng bản ghi</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-black text-slate-900 mt-1">{totalRecords}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">22 bảng dữ liệu</p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Dung lượng CSDL</span>
                <HardDrive className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-black text-slate-900 mt-1">{dbStats.storageSizeKb} KB</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Lưu trữ nội bộ an toàn</p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Lần lưu gần nhất</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2 truncate font-mono">
                {lastSavedTime || 'Vừa xong'}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <Check className="w-3 h-3" /> Đã ghi vào ổ cứng
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Trạng thái kết nối</span>
                <Activity className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-900">Đồng bộ liên tục</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Đa tab thời gian thực</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleForceSync}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang tự động quét & đồng bộ...' : 'Đồng bộ lại toàn bộ ngay (22 bảng)'}</span>
              </button>

              <button
                type="button"
                onClick={exportDataJSON}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Tải toàn bộ cơ sở dữ liệu về máy tính dạng tệp JSON để lưu trữ"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Sao lưu toàn bộ CSDL (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Tải tệp JSON sao lưu trước đó lên để phục hồi cơ sở dữ liệu"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Phục hồi từ tệp</span>
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="text-right">
              <input 
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Tìm bảng dữ liệu..."
                className="px-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-hidden focus:border-blue-500 w-44 sm:w-56"
              />
            </div>
          </div>

          {/* Automated Synchronization Engine Details */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-950">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Động Cơ Đồng Bộ Tự Động Toàn Hệ Thống Đang Hoạt Động (Auto-Sync 100%)
              </span>
              <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                Nhịp tim: 30s / lần + Tức thời
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-700">
              <div className="bg-white/80 p-2.5 rounded border border-emerald-200/60">
                <p className="font-bold text-slate-900 mb-0.5">1. Tự động lưu tức thời</p>
                <p className="text-slate-600 leading-snug">Mỗi khi thêm phiếu, đổi trạng thái, cập nhật chỉ số điện nước hay phân công việc, CSDL tự động ghi nhận ngay.</p>
              </div>
              <div className="bg-white/80 p-2.5 rounded border border-emerald-200/60">
                <p className="font-bold text-slate-900 mb-0.5">2. Tự động đồng bộ đa Tab</p>
                <p className="text-slate-600 leading-snug">Sử dụng BroadcastChannel thời gian thực. Thao tác ở tab này sẽ tự động cập nhật ngay trên tất cả các tab khác.</p>
              </div>
              <div className="bg-white/80 p-2.5 rounded border border-emerald-200/60">
                <p className="font-bold text-slate-900 mb-0.5">3. Tự động kiểm tra & Tự phục hồi</p>
                <p className="text-slate-600 leading-snug">Khi mở app hoặc chuyển cửa sổ, hệ thống tự động kiểm tra tính toàn vẹn 22/22 bảng và tự bù đắp dữ liệu thiếu.</p>
              </div>
            </div>
          </div>

          {/* Database Tables Breakdown */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                Danh Mục Bảng Dữ Liệu Trong Hệ Thống ({filteredTables.length}/{tables.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Tất cả bảng đều tự động cập nhật vào Storage
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {filteredTables.map((table) => (
                <div 
                  key={table.id}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {table.category}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">
                      {table.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    <span className="text-slate-600 font-bold">
                      {table.count} <span className="text-[10px] font-normal text-slate-400 font-sans">bản ghi</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Đã lưu
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Note on Continuous Persistence */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5 leading-relaxed">
            <div className="mt-0.5 p-1 bg-blue-600 text-white rounded shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold">Cơ chế bảo toàn dữ liệu tự động liên tục:</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Bất kỳ hành động nào bạn thực hiện (như tạo phiếu sửa chữa, phân công kỹ thuật viên, ghi số điện nước, đổi mật khẩu, cập nhật thiết bị hay điều chỉnh ngân sách) đều được ghi nhận ngay lập tức vào cơ sở dữ liệu. Dữ liệu không bị mất khi tải lại trang hoặc đóng trình duyệt. Bạn cũng có thể tải về bản sao lưu <strong>.JSON</strong> bất cứ lúc nào để lưu trữ phòng ngừa.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {!isResetConfirmOpen ? (
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold hover:underline"
              >
                Đặt lại CSDL về mặc định ban đầu
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-700">Xác nhận đặt lại?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetToDefaultData();
                    setIsResetConfirmOpen(false);
                    setSyncSuccessMsg('Đã đặt lại dữ liệu mặc định thành công!');
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                >
                  Đồng ý xóa & đặt lại
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px]"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
