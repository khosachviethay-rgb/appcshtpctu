import React, { useState } from 'react';
import { 
  Hammer, Search, Plus, AlertTriangle, CheckCircle2, 
  Clock, DollarSign, Image as ImageIcon, X, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InfrastructureIssue, InfraCategory, SeverityLevel } from '../types';
import { formatVND, formatDate } from '../utils/formatters';

export const InfrastructureView: React.FC = () => {
  const { infraIssues, buildings, addInfrastructureIssue, updateInfrastructureIssue, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Issue form state
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const [roomOrArea, setRoomOrArea] = useState('Hành lang Tầng 2');
  const [category, setCategory] = useState<InfraCategory>('Trần thạch cao');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [damageDescription, setDamageDescription] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(850000);

  const filteredIssues = (infraIssues || []).filter(issue => {
    if (!issue) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (issue.category || '').toLowerCase().includes(q) ||
      (issue.damageDescription || '').toLowerCase().includes(q) ||
      (issue.buildingName || '').toLowerCase().includes(q) ||
      (issue.roomOrArea || '').toLowerCase().includes(q);

    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageDescription) return;

    const targetBuilding = buildings.find(b => b.id === buildingId);

    const newIssue: InfrastructureIssue = {
      id: `infra_${Date.now()}`,
      buildingId,
      buildingName: targetBuilding?.name || 'Chưa xác định',
      roomOrArea,
      category,
      severity,
      damageDescription: damageDescription.trim(),
      reportedBy: currentUser.name,
      reportedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      proposedSolution: proposedSolution.trim() || 'Cử KTV kiểm tra và thay thế vật tư phụ tùng',
      estimatedCost: Number(estimatedCost),
      status: 'pending_approval',
    };

    addInfrastructureIssue(newIssue);
    setIsAddModalOpen(false);
    setDamageDescription('');
    setProposedSolution('');
  };

  const handleUpdateStatus = (id: string, status: InfrastructureIssue['status']) => {
    updateInfrastructureIssue(id, {
      status,
      completedDate: status === 'resolved' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-600" />
            Cơ Sở Hạ Tầng Xây Dựng, Cửa, Trần & Khuôn Viên Trường
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi hiện trạng tường ẩm mốc, trần thạch cao, cửa nhôm kính, hệ thống vệ sinh và cây xanh
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận hư hỏng hạ tầng</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tổng số điểm hư hỏng</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{infraIssues.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Xây dựng, cửa, trần, sơn</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Sự cố nghiêm trọng</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {infraIssues.filter(i => i.severity === 'critical').length}
          </div>
          <div className="text-[11px] text-rose-700 mt-0.5">Ảnh hưởng trực tiếp an toàn</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đang xử lý sửa chữa</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {infraIssues.filter(i => i.status === 'in_progress').length}
          </div>
          <div className="text-[11px] text-blue-700 mt-0.5">KTV đang thay thế</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đã giải quyết</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {infraIssues.filter(i => i.status === 'resolved').length}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Nghiệm thu đạt yêu cầu</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo hạng mục (trần thạch cao, cửa, sàn...), vị trí..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-hidden text-slate-800"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
        >
          <option value="all">Tất cả mức độ</option>
          <option value="critical">🔴 Nghiêm trọng</option>
          <option value="medium">🟡 Trung bình</option>
          <option value="low">🟢 Nhẹ</option>
        </select>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIssues.map((issue) => (
          <div 
            key={issue.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  issue.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                  issue.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {issue.severity === 'critical' ? 'Nghiêm trọng' : issue.severity === 'medium' ? 'Trung bình' : 'Nhẹ'}
                </span>
                <span className="text-xs font-bold text-slate-900 ml-2">{issue.category}</span>
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {issue.status === 'resolved' ? 'Đã hoàn thành' :
                 issue.status === 'in_progress' ? 'Đang sửa' : 'Chờ duyệt'}
              </span>
            </div>

            <div>
              <div className="text-xs text-slate-500">Vị trí: <strong className="text-slate-800">{issue.buildingName} - {issue.roomOrArea}</strong></div>
              <p className="text-xs text-slate-700 mt-1 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {issue.damageDescription}
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>Đề xuất: <span className="font-semibold text-slate-800">{issue.proposedSolution}</span></div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Dự kiến: <strong className="text-emerald-700 font-mono">{formatVND(issue.estimatedCost || 0)}</strong></span>
                <span>Người báo: {issue.reportedBy} ({formatDate(issue.reportedDate)})</span>
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Cập nhật tiến độ:</span>
              <div className="flex items-center gap-1">
                {issue.status !== 'in_progress' && issue.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(issue.id, 'in_progress')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Bắt đầu sửa
                  </button>
                )}
                {issue.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(issue.id, 'resolved')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Nghiệm thu
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Báo Hư Hỏng Hạ Tầng */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Ghi Nhận Sự Cố Hạ Tầng Xây Dựng</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Khu nhà *</label>
                  <select
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Vị trí cụ thể *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cửa chính phòng A102, Trần tầng 3..."
                    value={roomOrArea}
                    onChange={(e) => setRoomOrArea(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Hạng mục kết cấu *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InfraCategory)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Tường">Tường & Vữa trát</option>
                    <option value="Trần thạch cao">Trần thạch cao & La phông</option>
                    <option value="Sàn">Sàn gạch / Sàn nhựa</option>
                    <option value="Mái">Mái tôn / Mái bê tông</option>
                    <option value="Cửa & Cửa sổ">Cửa đi & Cửa sổ nhôm kính</option>
                    <option value="Lan can & Cầu thang">Lan can & Cầu thang</option>
                    <option value="Nhà vệ sinh">Nhà vệ sinh & Thoát sàn</option>
                    <option value="Cây xanh & Sân bãi">Sân bãi, Cây xanh & Đường đi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mức độ nghiêm trọng *</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="low">🟢 Nhẹ (Thẩm mỹ)</option>
                    <option value="medium">🟡 Trung bình (Cần sửa trong 3 ngày)</option>
                    <option value="critical">🔴 Nghiêm trọng (Mất an toàn / Dột)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Mô tả hiện tượng hư hỏng *</label>
                <textarea
                  required
                  rows={3}
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  placeholder="Mô tả cụ thể: Vỡ kính, xệ bản lề, thấm nước, nứt tường..."
                  className="w-full p-2 border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Đề xuất phương án xử lý</label>
                  <input
                    type="text"
                    value={proposedSolution}
                    onChange={(e) => setProposedSolution(e.target.value)}
                    placeholder="VD: Thay bản lề sàn Kinlong, bả sơn..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Dự toán kinh phí (VNĐ)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Lưu Sự Cố
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
