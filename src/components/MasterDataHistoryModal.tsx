import React from 'react';
import { History, X, Shield, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MasterDataHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId?: string;
  targetType?: 'building' | 'room' | 'device';
  title?: string;
}

export const MasterDataHistoryModal: React.FC<MasterDataHistoryModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  title = 'Lịch sử thay đổi Dữ liệu gốc'
}) => {
  const { masterDataLogs } = useApp();

  if (!isOpen) return null;

  const logsList = masterDataLogs || [];
  const filteredLogs = targetId
    ? logsList.filter((l) => l && l.targetId === targetId)
    : targetType
    ? logsList.filter((l) => l && l.targetType === targetType)
    : logsList;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden text-xs max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <span className="font-bold uppercase tracking-wider text-xs">
              {title} ({filteredLogs.length} bản ghi)
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Chưa có bản ghi chỉnh sửa dữ liệu gốc nào cho đối tượng này.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, idx) => (
                <div 
                  key={`${log.id || 'md_log'}-${idx}`} 
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-colors space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.targetName}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {log.targetCode}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold text-[10px]">
                        {log.fieldLabel}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{log.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-slate-500 text-[11px]">Giá trị:</span>
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 line-through">
                      {log.beforeValue}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      {log.afterValue}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-1 text-[11px]">
                    <p className="text-slate-700 italic">
                      <span className="font-semibold not-italic text-slate-900">Lý do:</span> {log.reason}
                    </p>
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-slate-900 block">{log.actorName}</span>
                      <span className="text-[10px] text-blue-600 font-medium">{log.actorRole}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Hệ thống Audit Trail bất biến • ĐH Phan Châu Trinh
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
