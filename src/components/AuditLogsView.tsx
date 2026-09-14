import React, { useState } from 'react';
import { 
  ShieldCheck, Search, Filter, Calendar, User, 
  Clock, Database, ArrowRight, Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/formatters';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = (auditLogs || []).filter(log => {
    if (!log) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (log.userName || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      (log.entityIdentifier && (log.entityIdentifier || '').toLowerCase().includes(q));

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const handleExportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Mã Log,Thời gian,Người thực hiện,Vai trò,Hành động,Đối tượng,Chi tiết thay đổi\n"
      + filteredLogs.map(l => 
          `"${l.id}","${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.entityType} - ${l.entityIdentifier || ''}","${l.details.replace(/"/g, '""')}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nhat_Ky_He_Thong_PCTU_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Nhật Ký Hoạt Động & Kiểm Toán Hệ Thống (Audit Trail)
          </h2>
          <p className="text-xs text-slate-500">
            Ghi vết bất biến 100% mọi thao tác thêm, sửa, đổi trạng thái, tạo phiếu của cán bộ kỹ thuật
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Xuất File Kiểm Toán (CSV)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo người thực hiện, mã thiết bị, phiếu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-hidden text-slate-800"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
        >
          <option value="all">Tất cả hành động</option>
          <option value="CREATE">Tạo mới</option>
          <option value="UPDATE">Cập nhật</option>
          <option value="DELETE">Xóa</option>
          <option value="STATUS_CHANGE">Đổi trạng thái</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Thời gian</th>
                <th className="p-3">Người thực hiện</th>
                <th className="p-3">Hành động</th>
                <th className="p-3">Phân hệ / Đối tượng</th>
                <th className="p-3">Chi tiết nội dung thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log, idx) => (
                <tr key={`${log.id || 'log'}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'STATUS_CHANGE' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-800">
                    <span className="capitalize">{log.entityType}</span>
                    {log.entityIdentifier && (
                      <span className="font-mono text-blue-700 ml-1">({log.entityIdentifier})</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
