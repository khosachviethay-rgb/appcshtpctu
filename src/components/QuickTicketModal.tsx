import React, { useState } from 'react';
import { X, Send, AlertTriangle, Building, MapPin, Phone, User, Tag, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RepairRequest, TicketPriority, DeviceCategory } from '../types';

interface QuickTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickTicketModal: React.FC<QuickTicketModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, buildings, addRepairRequest, setActiveTab } = useApp();

  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const [floorNumber, setFloorNumber] = useState(1);
  const [roomCode, setRoomCode] = useState('A102');
  const [category, setCategory] = useState<DeviceCategory | 'infrastructure'>('electric');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [requesterName, setRequesterName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone);

  if (!isOpen) return null;

  const selectedBuilding = buildings.find(b => b.id === buildingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    const ticketNumber = Math.floor(100 + Math.random() * 900);
    const newTicket: RepairRequest = {
      id: `req_${Date.now()}`,
      ticketCode: `SC-2026-${ticketNumber}`,
      requesterName,
      department,
      phoneNumber,
      buildingId,
      buildingName: selectedBuilding?.name || 'Chưa xác định',
      floorNumber: Number(floorNumber),
      roomCode: roomCode || 'Toàn khu vực',
      category,
      issueDescription: issueDescription.trim(),
      priority,
      requestedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'new',
    };

    addRepairRequest(newTicket);
    onClose();
    setActiveTab('repair');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Gửi Yêu Cầu Sửa Chữa / Báo Hỏng Cơ Sở Vật Chất</h2>
              <p className="text-xs text-slate-300">Tổ Cơ sở Hạ tầng & Kỹ thuật sẽ tiếp nhận và xử lý ngay</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Sender details */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Người yêu cầu</label>
              <input
                type="text"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Đơn vị / Phòng ban</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Số điện thoại liên hệ</label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Khu nhà *</label>
              <select
                value={buildingId}
                onChange={(e) => {
                  setBuildingId(e.target.value);
                  const b = buildings.find(item => item.id === e.target.value);
                  if (b && b.floors[0]?.rooms[0]) {
                    setFloorNumber(1);
                    setRoomCode(b.floors[0].rooms[0].code);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tầng *</label>
              <select
                value={floorNumber}
                onChange={(e) => setFloorNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                {selectedBuilding?.floors.map((fl) => (
                  <option key={fl.floorNumber} value={fl.floorNumber}>
                    Tầng {fl.floorNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng / Vị trí cụ thể *</label>
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Ví dụ: A102, C301, Hành lang Tầng 2..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hạng mục sự cố *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="electric">⚡ Điện & Chiếu sáng (đèn, ổ cắm, CB, quạt)</option>
                <option value="water">💧 Nước & Vệ sinh (vòi nước, lavabo, bồn cầu, van)</option>
                <option value="hvac">❄️ Điều hòa không khí (không lạnh, chảy nước, ồn)</option>
                <option value="pccc">🔥 PCCC & An toàn (bình cứu hỏa, chuông, đèn exit)</option>
                <option value="infrastructure">🏗️ Xây dựng & Cơ sở hạ tầng (cửa, trần, tường, sàn)</option>
                <option value="other">🔧 Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mức độ ưu tiên *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
              >
                <option value="low">Thấp (Xử lý trong vòng 3-5 ngày)</option>
                <option value="medium">Trung bình (Xử lý trong 24-48 giờ)</option>
                <option value="high">Cao (Cần xử lý trong ngày)</option>
                <option value="urgent">🔴 Khẩn cấp (Ảnh hưởng giảng dạy, mất an toàn)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết sự cố / Hiện tượng hư hỏng *
            </label>
            <textarea
              required
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Vui lòng mô tả hiện tượng: Thiết bị nào bị hỏng, phát ra tiếng ồn hay có mùi lạ, đã xảy ra từ khi nào..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Gửi Phiếu Yêu Cầu Sửa Chữa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
