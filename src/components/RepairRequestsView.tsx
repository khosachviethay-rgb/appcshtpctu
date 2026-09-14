import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Plus, Filter, CheckCircle2, Clock, 
  AlertTriangle, User, Calendar, DollarSign, ArrowRight,
  Shield, Check, Star, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RepairRequest, TicketStatus, TicketPriority } from '../types';
import { formatVND, formatDate, getStatusBadgeClass, getStatusLabel } from '../utils/formatters';

interface RepairRequestsViewProps {
  onOpenNewTicketModal: () => void;
}

export const RepairRequestsView: React.FC<RepairRequestsViewProps> = ({ onOpenNewTicketModal }) => {
  const { 
    repairRequests, updateRepairRequest, currentUser, 
    inventory, addInventoryTransaction, selectedTicketId, setSelectedTicketId 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeTicket, setActiveTicket] = useState<RepairRequest | null>(null);

  useEffect(() => {
    if (selectedTicketId && repairRequests.length > 0) {
      const match = repairRequests.find(
        r => r.id === selectedTicketId || 
             (r.ticketCode && r.ticketCode.toLowerCase() === selectedTicketId.toLowerCase())
      );
      if (match) {
        setActiveTicket(match);
      } else {
        setSearchQuery(selectedTicketId);
      }
    }
  }, [selectedTicketId, repairRequests]);

  // Resolution modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [repairNotes, setRepairNotes] = useState('');
  const [actualCost, setActualCost] = useState(150000);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>(inventory[0]?.id || '');
  const [usedPartQty, setUsedPartQty] = useState(1);

  const filteredRequests = (repairRequests || []).filter(req => {
    if (!req) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (req.ticketCode || '').toLowerCase().includes(q) ||
      (req.issueDescription || '').toLowerCase().includes(q) ||
      (req.requesterName || '').toLowerCase().includes(q) ||
      (req.department || '').toLowerCase().includes(q) ||
      (req.buildingName || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAssignToHuy = (ticket: RepairRequest) => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (ticket.priority === 'urgent' ? 1 : 2));

    updateRepairRequest(ticket.id, {
      status: 'in_progress',
      assignedToId: 'user_huy',
      assignedToName: 'Thầy Nguyễn Đình Huy',
      expectedDeadline: deadline.toISOString().replace('T', ' ').substring(0, 16),
    });

    if (activeTicket?.id === ticket.id) {
      setActiveTicket(prev => prev ? {
        ...prev,
        status: 'in_progress',
        assignedToName: 'Thầy Nguyễn Đình Huy',
      } : null);
    }
  };

  const handleOpenResolve = (ticket: RepairRequest) => {
    setActiveTicket(ticket);
    setRepairNotes('Đã kiểm tra, thay thế linh kiện và đo kiểm an toàn điện nước hoạt động bình thường.');
    setActualCost(150000);
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;

    // Deduct parts from inventory if selected
    const part = inventory.find(p => p.id === selectedInventoryId);
    let partsList: string[] = [];
    if (part && usedPartQty > 0) {
      partsList = [`${part.name} (SL: ${usedPartQty} ${part.unit})`];
      addInventoryTransaction({
        id: `txn_${Date.now()}`,
        itemId: part.id,
        itemName: part.name,
        type: 'export',
        quantity: usedPartQty,
        unitPrice: part.unitPrice,
        totalAmount: part.unitPrice * usedPartQty,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        performerName: currentUser.name,
        reasonOrTaskId: `Sửa chữa theo phiếu ${activeTicket.ticketCode}`,
      });
    }

    updateRepairRequest(activeTicket.id, {
      status: 'completed',
      completedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      repairNotes,
      actualCost: Number(actualCost),
      partsUsed: partsList,
    });

    setIsResolveModalOpen(false);
    setActiveTicket(null);
  };

  const handleUserAcceptTicket = (ticket: RepairRequest, rating: number) => {
    updateRepairRequest(ticket.id, {
      status: 'accepted',
      rating,
      feedback: 'Đã nghiệm thu đạt chuẩn, phòng ban rất hài lòng với chất lượng phục vụ.',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Quy Trình Quản Lý Phiếu Yêu Cầu Sửa Chữa (7 Bước)
          </h2>
          <p className="text-xs text-slate-500">
            Tiếp nhận → Phân loại → Giao việc KTV → Thực hiện & xuất kho → Báo hoàn thành → Nghiệm thu → Đóng phiếu
          </p>
        </div>

        <button
          onClick={onOpenNewTicketModal}
          className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo phiếu sửa chữa mới</span>
        </button>
      </div>

      {/* 7-Step Workflow Visual Legend */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px]">1</span>
            <span className="font-semibold text-slate-700">Mới gửi</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[11px]">2</span>
            <span className="font-semibold text-slate-700">Tiếp nhận</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px]">3</span>
            <span className="font-semibold text-slate-700">Đang xử lý</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[11px]">4</span>
            <span className="font-semibold text-slate-700">Chờ vật tư</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px]">5</span>
            <span className="font-semibold text-slate-700">Hoàn thành</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">6</span>
            <span className="font-semibold text-slate-700">Nghiệm thu</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-[11px]">7</span>
            <span className="font-semibold text-slate-700">Đóng phiếu</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu (SC-2026-001...), người gửi, phòng ban..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-hidden text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="new">Mới gửi</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="accepted">Đã nghiệm thu</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">Tất cả ưu tiên</option>
            <option value="urgent">🔴 Khẩn cấp</option>
            <option value="high">Ưu tiên cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mã phiếu</th>
                <th className="p-3">Hạng mục & Mô tả sự cố</th>
                <th className="p-3">Vị trí hư hỏng</th>
                <th className="p-3">Người yêu cầu & Khoa phòng</th>
                <th className="p-3">KTV Phụ trách</th>
                <th className="p-3 text-center">Ưu tiên</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Hành động quy trình</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-700">{req.ticketCode}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{req.issueDescription}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Phân loại: {req.category === 'electric' ? 'Điện' : req.category === 'water' ? 'Nước' : req.category === 'hvac' ? 'Điều hòa' : req.category === 'pccc' ? 'PCCC' : 'Xây dựng'}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    {req.buildingName} • Phòng {req.roomCode}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-800">{req.requesterName}</div>
                    <div className="text-[11px] text-slate-500">{req.department} • {req.phoneNumber}</div>
                  </td>
                  <td className="p-3">
                    {req.assignedToName ? (
                      <span className="font-semibold text-slate-900">{req.assignedToName}</span>
                    ) : (
                      <span className="text-slate-400 italic">Chưa phân công</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      req.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                      req.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {req.priority === 'urgent' ? 'Khẩn cấp' : req.priority === 'high' ? 'Cao' : 'Thường'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${getStatusBadgeClass(req.status)}`}>
                      {getStatusLabel(req.status)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {req.status === 'new' && (
                        <button
                          onClick={() => handleAssignToHuy(req)}
                          className="px-2 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          Tiếp nhận & Giao việc
                        </button>
                      )}

                      {req.status === 'in_progress' && (
                        <button
                          onClick={() => handleOpenResolve(req)}
                          className="px-2 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Báo xong
                        </button>
                      )}

                      {req.status === 'completed' && (
                        <button
                          onClick={() => handleUserAcceptTicket(req, 5)}
                          className="px-2 py-1 text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> Nghiệm thu
                        </button>
                      )}

                      {req.status === 'accepted' && (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal KTV Báo Cáo Hoàn Thành Sửa Chữa & Xuất Vật Tư */}
      {isResolveModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Báo Cáo Hoàn Thành Sửa Chữa - {activeTicket.ticketCode}
              </h3>
              <button onClick={() => setIsResolveModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-5 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{activeTicket.issueDescription}</div>
                <div className="text-slate-500 text-[11px]">
                  Vị trí: {activeTicket.buildingName} - Phòng {activeTicket.roomCode}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nội dung kỹ thuật đã xử lý *</label>
                <textarea
                  required
                  rows={3}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Vật tư xuất kho sử dụng (nếu có)</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={selectedInventoryId}
                    onChange={(e) => setSelectedInventoryId(e.target.value)}
                    className="col-span-2 p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} (còn {item.currentStock} {item.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={usedPartQty}
                    onChange={(e) => setUsedPartQty(Number(e.target.value))}
                    placeholder="SL"
                    className="p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Chi phí sửa chữa thực tế (VNĐ)</label>
                <input
                  type="number"
                  value={actualCost}
                  onChange={(e) => setActualCost(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Xác Nhận Hoàn Thành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
