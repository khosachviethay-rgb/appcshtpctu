import React, { useState, useEffect } from 'react';
import { 
  Wrench, Search, Plus, QrCode, Filter, ExternalLink,
  Calendar, DollarSign, Shield, ArrowUpRight, History, X,
  Tag, Info, FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Device, DeviceCategory, DeviceStatus } from '../types';
import { formatVND, formatDate, getStatusBadgeClass, getStatusLabel } from '../utils/formatters';
import { canEditMasterData, canSubmitProposal } from '../utils/authSecurity';
import { MasterDataEditModal } from './MasterDataEditModal';
import { ProposalModal } from './ProposalModal';
import { MasterDataHistoryModal } from './MasterDataHistoryModal';

interface DevicesViewProps {
  onOpenQrModal: (device: Device) => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({ onOpenQrModal }) => {
  const { 
    currentUser, devices, buildings, addDevice, updateDevice, 
    repairHistory, maintenanceHistory, selectedDeviceId, setSelectedDeviceId 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<Device | null>(
    selectedDeviceId ? devices.find(d => d.id === selectedDeviceId) || null : null
  );

  useEffect(() => {
    if (selectedDeviceId) {
      const match = devices.find(d => d.id === selectedDeviceId || d.deviceCode.toLowerCase() === selectedDeviceId.toLowerCase());
      if (match) {
        setViewingDevice(match);
      }
    }
  }, [selectedDeviceId, devices]);

  // Master Data & Proposal Modal states
  const [isEditDeviceModalOpen, setIsEditDeviceModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalConfig, setProposalConfig] = useState<{
    targetId: string;
    targetCode: string;
    targetName: string;
    availableFields?: any[];
  } | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<{ id?: string; title: string }>({
    title: 'Lịch sử thay đổi Dữ liệu gốc Thiết bị'
  });

  const isSuperAdmin = canEditMasterData(currentUser?.role);
  const isProposer = canSubmitProposal(currentUser?.role);

  // New device form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DeviceCategory>('electric');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const [roomCode, setRoomCode] = useState('A102');
  const [vendor, setVendor] = useState('');
  const [warrantyUntil, setWarrantyUntil] = useState('2027-12-31');

  const filteredDevices = (devices || []).filter(d => {
    if (!d) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (d.code || '').toLowerCase().includes(q) ||
      (d.name || '').toLowerCase().includes(q) ||
      (d.brand || '').toLowerCase().includes(q) ||
      (d.model || '').toLowerCase().includes(q) ||
      (d.roomCode && (d.roomCode || '').toLowerCase().includes(q));

    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    const matchesBuilding = buildingFilter === 'all' || d.buildingId === buildingFilter;
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

    return matchesSearch && matchesCategory && matchesBuilding && matchesStatus;
  });

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    const targetBuilding = buildings.find(b => b.id === buildingId);

    const nextMaint = new Date();
    nextMaint.setMonth(nextMaint.getMonth() + 3);

    const newDev: Device = {
      id: `dev_${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      buildingId,
      buildingName: targetBuilding?.name || 'Chưa xác định',
      floorNumber: 1,
      roomCode: roomCode.trim().toUpperCase(),
      brand,
      model,
      serialNumber,
      capacity,
      vendor,
      warrantyUntil,
      installDate: new Date().toISOString().split('T')[0],
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate: nextMaint.toISOString().split('T')[0],
      maintenanceCycleDays: 90,
      status: 'operating',
      totalRepairCostAccumulated: 0,
      qrCodeUrl: `https://pctu.edu.vn/asset/${code.trim().toUpperCase()}`,
    };

    addDevice(newDev);
    setIsAddModalOpen(false);
    setCode('');
    setName('');
  };

  // History records for viewingDevice
  const deviceRepairs = viewingDevice 
    ? repairHistory.filter(h => h.deviceId === viewingDevice.id || h.deviceCode === viewingDevice.code)
    : [];

  const deviceMaints = viewingDevice 
    ? maintenanceHistory.filter(m => m.deviceId === viewingDevice.id || m.deviceCode === viewingDevice.code)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Hồ Sơ Danh Mục Tài Sản Thiết Bị Kỹ Thuật ĐH Phan Châu Trinh
          </h2>
          <p className="text-xs text-slate-500">
            Mỗi thiết bị có mã định danh duy nhất, mã QR nhãn dán, lịch sử bảo trì, sửa chữa và chi phí tích lũy
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm thiết bị mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã tài sản (AC-C-301, GEN-01...), tên, phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-hidden text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">Tất cả hệ thống</option>
            <option value="electric">⚡ Điện & Máy phát</option>
            <option value="water">💧 Nước & Bơm</option>
            <option value="hvac">❄️ Điều hòa HVAC</option>
            <option value="pccc">🔥 PCCC</option>
            <option value="other">🔧 Khác</option>
          </select>

          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">Tất cả khu nhà</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="operating">Hoạt động tốt</option>
            <option value="needs_maintenance">Cần bảo trì</option>
            <option value="faulty">Đang sự cố</option>
          </select>
        </div>
      </div>

      {/* Devices Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mã tài sản & QR</th>
                <th className="p-3">Tên thiết bị</th>
                <th className="p-3">Hệ thống</th>
                <th className="p-3">Vị trí khu nhà / phòng</th>
                <th className="p-3">Hãng & Model</th>
                <th className="p-3">Công suất / Thông số</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <button
                      onClick={() => onOpenQrModal(dev)}
                      className="font-mono font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1.5 group"
                      title="Mở mã QR thiết bị"
                    >
                      <QrCode className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      {dev.code}
                    </button>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{dev.name}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-700">
                      {dev.category === 'electric' ? '⚡ Điện' :
                       dev.category === 'water' ? '💧 Cấp thoát nước' :
                       dev.category === 'hvac' ? '❄️ Điều hòa' :
                       dev.category === 'pccc' ? '🔥 PCCC' : '🔧 Khác'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">
                    {dev.buildingName} • Phòng <strong className="text-slate-900">{dev.roomCode}</strong>
                  </td>
                  <td className="p-3 text-slate-600">
                    {dev.brand} {dev.model}
                  </td>
                  <td className="p-3 text-slate-800 font-medium">
                    {dev.capacity || 'Tiêu chuẩn'}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusBadgeClass(dev.status)}`}>
                      {getStatusLabel(dev.status)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingDevice(dev)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-md transition-colors"
                      >
                        Xem hồ sơ
                      </button>
                      <button
                        onClick={() => onOpenQrModal(dev)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="In mã QR dán thiết bị"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem Hồ Sơ Thiết Bị Chi Tiết */}
      {viewingDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-600 rounded">
                  {viewingDevice.code}
                </span>
                <h3 className="text-sm font-bold truncate">Hồ Sơ Kỹ Thuật: {viewingDevice.name}</h3>
              </div>
              <button onClick={() => setViewingDevice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Device Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">Vị trí lắp đặt:</span>
                  <div className="font-bold text-slate-800">{viewingDevice.buildingName} - {viewingDevice.roomCode}</div>
                </div>
                <div>
                  <span className="text-slate-400">Hãng & Model:</span>
                  <div className="font-bold text-slate-800">{viewingDevice.brand} {viewingDevice.model}</div>
                </div>
                <div>
                  <span className="text-slate-400">Công suất:</span>
                  <div className="font-bold text-slate-800">{viewingDevice.capacity || 'Tiêu chuẩn'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Trạng thái:</span>
                  <div className="mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeClass(viewingDevice.status)}`}>
                      {getStatusLabel(viewingDevice.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Master Data Controls */}
              <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dữ liệu gốc thiết bị kỹ thuật:</span>
                </div>
                <div className="flex items-center gap-2">
                  {isSuperAdmin && (
                    <button
                      onClick={() => setIsEditDeviceModalOpen(true)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                      title="Chỉnh sửa Dữ liệu gốc thiết bị (Quyền Cấp 1 - Thầy Hiển)"
                    >
                      <Shield className="w-3 h-3" />
                      <span>Sửa Dữ liệu gốc</span>
                    </button>
                  )}

                  {isProposer && (
                    <button
                      onClick={() => {
                        setProposalConfig({
                          targetId: viewingDevice.id,
                          targetCode: viewingDevice.code,
                          targetName: viewingDevice.name,
                          availableFields: [
                            { name: 'name', label: 'Tên thiết bị', currentValue: viewingDevice.name },
                            { name: 'brand', label: 'Hãng sản xuất', currentValue: viewingDevice.brand },
                            { name: 'model', label: 'Model', currentValue: viewingDevice.model },
                            { name: 'capacity', label: 'Công suất / Thông số', currentValue: viewingDevice.capacity || '' },
                            { name: 'roomCode', label: 'Phòng lắp đặt', currentValue: viewingDevice.roomCode || '' },
                            { name: 'warrantyUntil', label: 'Hạn bảo hành', currentValue: viewingDevice.warrantyUntil || '' }
                          ]
                        });
                        setIsProposalModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                      title="Gửi đề xuất điều chỉnh thông số kỹ thuật cho Tổ trưởng"
                    >
                      <FileCheck className="w-3 h-3" />
                      <span>Đề xuất điều chỉnh</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setHistoryTarget({
                        id: viewingDevice.id,
                        title: `Lịch sử Dữ liệu gốc: ${viewingDevice.name} (${viewingDevice.code})`
                      });
                      setIsHistoryModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    title="Xem lịch sử thay đổi thông số thiết bị"
                  >
                    <History className="w-3 h-3 text-slate-500" />
                    <span>Lịch sử sửa đổi</span>
                  </button>
                </div>
              </div>

              {/* Maintenance & Warranty timeline */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500">Ngày lắp đặt</span>
                  <div className="font-bold text-slate-900 mt-0.5">{formatDate(viewingDevice.installDate)}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500">Bảo hành đến</span>
                  <div className="font-bold text-slate-900 mt-0.5">{formatDate(viewingDevice.warrantyUntil)}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500">Bảo trì kế tiếp</span>
                  <div className="font-bold text-rose-600 mt-0.5">{formatDate(viewingDevice.nextMaintenanceDate)}</div>
                </div>
              </div>

              {/* Repair History for this device */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600" />
                  Lịch sử sửa chữa & thay thế linh kiện ({deviceRepairs.length})
                </h4>

                {deviceRepairs.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400">
                    Chưa có lịch sử sự cố hoặc sửa chữa ghi nhận cho thiết bị này.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deviceRepairs.map((rep) => (
                      <div key={rep.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{rep.repairDate} • {rep.performerName}</span>
                          <span className="text-emerald-700 font-mono">{formatVND(rep.cost)}</span>
                        </div>
                        <div className="text-slate-600">Sự cố: {rep.problem}</div>
                        <div className="text-slate-600">Xử lý: <strong>{rep.solution}</strong></div>
                        {rep.partsReplaced && rep.partsReplaced.length > 0 && (
                          <div className="text-slate-500 text-[11px]">Vật tư thay: {rep.partsReplaced.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Maintenance History */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Lịch sử bảo trì định kỳ ({deviceMaints.length})
                </h4>

                {deviceMaints.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400">
                    Chưa có nhật ký bảo trì định kỳ.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deviceMaints.map((mnt) => (
                      <div key={mnt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{mnt.date} • {mnt.performerName}</span>
                          <span className="text-emerald-600 font-bold">ĐẠT CHUẨN</span>
                        </div>
                        <div className="text-slate-600">Nội dung: {mnt.tasksPerformed.join(', ')}</div>
                        {mnt.notes && <div className="text-slate-500 text-[11px]">{mnt.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => onOpenQrModal(viewingDevice)}
                className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>Xem & In Mã QR Thiết Bị</span>
              </button>

              <button
                onClick={() => setViewingDevice(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Thiết Bị Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Thêm Thiết Bị Mới Vào Hệ Thống</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mã tài sản *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TB-2026-001, AC-A-201..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tên thiết bị *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Quạt trần Panasonic, Bơm chìm..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Hệ thống *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DeviceCategory)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="electric">⚡ Điện & Chiếu sáng</option>
                    <option value="water">💧 Nước & Vệ sinh</option>
                    <option value="hvac">❄️ Điều hòa HVAC</option>
                    <option value="pccc">🔥 PCCC</option>
                    <option value="other">🔧 Khác</option>
                  </select>
                </div>
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
                  <label className="block text-slate-600 font-semibold mb-1">Phòng học / Vị trí *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: A102, C301..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Hãng sản xuất</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Công suất / Thông số</label>
                  <input
                    type="text"
                    placeholder="VD: 75W, 1.5kW..."
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nhà cung cấp</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bảo hành đến ngày</label>
                  <input
                    type="date"
                    value={warrantyUntil}
                    onChange={(e) => setWarrantyUntil(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
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
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Lưu Thiết Bị & Tạo Mã QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Dữ Liệu Gốc Thiết Bị (Cấp 1 - Thầy Hiển) */}
      {isEditDeviceModalOpen && viewingDevice && (
        <MasterDataEditModal
          isOpen={isEditDeviceModalOpen}
          onClose={() => setIsEditDeviceModalOpen(false)}
          targetType="device"
          targetId={viewingDevice.id}
          targetCode={viewingDevice.code}
          targetName={viewingDevice.name}
          initialValues={{
            name: viewingDevice.name,
            brand: viewingDevice.brand,
            model: viewingDevice.model,
            capacity: viewingDevice.capacity,
            roomCode: viewingDevice.roomCode,
            vendor: viewingDevice.vendor,
            warrantyUntil: viewingDevice.warrantyUntil
          }}
          fieldsConfig={[
            { key: 'name', label: 'Tên thiết bị', type: 'text' },
            { key: 'brand', label: 'Hãng sản xuất', type: 'text' },
            { key: 'model', label: 'Ký hiệu / Model', type: 'text' },
            { key: 'capacity', label: 'Công suất kỹ thuật', type: 'text' },
            { key: 'roomCode', label: 'Phòng lắp đặt', type: 'text' },
            { key: 'vendor', label: 'Nhà cung cấp', type: 'text' },
            { key: 'warrantyUntil', label: 'Thời hạn bảo hành', type: 'text' }
          ]}
        />
      )}

      {/* Modal Đề Xuất Cập Nhật Thiết Bị (Cấp 2 - Thầy Huy) */}
      {isProposalModalOpen && proposalConfig && (
        <ProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => {
            setIsProposalModalOpen(false);
            setProposalConfig(null);
          }}
          targetType="device"
          targetId={proposalConfig.targetId}
          targetCode={proposalConfig.targetCode}
          targetName={proposalConfig.targetName}
          availableFields={proposalConfig.availableFields}
        />
      )}

      {/* Modal Lịch Sử Thay Đổi Dữ Liệu Gốc Thiết Bị */}
      <MasterDataHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        targetId={historyTarget.id}
        targetType="device"
        title={historyTarget.title}
      />
    </div>
  );
};
