import React, { useState } from 'react';
import { 
  Wind, Search, Plus, Filter, AlertTriangle, CheckCircle2, 
  Calendar, Wrench, RefreshCw, QrCode, ArrowUpRight, X, Droplet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Device, DeviceStatus } from '../types';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../utils/formatters';

interface HvacViewProps {
  onOpenQrModal: (device: Device) => void;
}

export const HvacView: React.FC<HvacViewProps> = ({ onOpenQrModal }) => {
  const { devices, buildings, addDevice, updateDevice, setSelectedDeviceId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New HVAC Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Daikin');
  const [model, setModel] = useState('FTKB35WAVMV');
  const [capacity, setCapacity] = useState('12,000 BTU (1.5 HP)');
  const [gasType, setGasType] = useState('R32');
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const [roomCode, setRoomCode] = useState('A102');
  const [installDate, setInstallDate] = useState('2024-05-15');

  // Filter only HVAC devices
  const hvacDevices = devices.filter(d => d.category === 'hvac');

  const filteredDevices = hvacDevices.filter(d => {
    if (!d) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (d.code || '').toLowerCase().includes(q) ||
      (d.name || '').toLowerCase().includes(q) ||
      (d.brand || '').toLowerCase().includes(q) ||
      (d.roomCode || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesBuilding = buildingFilter === 'all' || d.buildingId === buildingFilter;

    return matchesSearch && matchesStatus && matchesBuilding;
  });

  const totalCount = hvacDevices.length;
  const goodCount = hvacDevices.filter(d => d.status === 'operating').length;
  const needsMaintCount = hvacDevices.filter(d => d.status === 'needs_maintenance').length;
  const brokenCount = hvacDevices.filter(d => d.status === 'faulty' || d.status === 'replace_needed').length;

  const handleCreateHvac = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    const targetBuilding = buildings.find(b => b.id === buildingId);

    const nextMaint = new Date();
    nextMaint.setMonth(nextMaint.getMonth() + 3);

    const newHvac: Device = {
      id: `dev_${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category: 'hvac',
      buildingId,
      buildingName: targetBuilding?.name || 'Khối lớp học',
      floorNumber: 1,
      roomCode: roomCode.trim().toUpperCase(),
      brand,
      model,
      capacity,
      gasType,
      installDate,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate: nextMaint.toISOString().split('T')[0],
      maintenanceCycleDays: 90,
      status: 'operating',
      totalRepairCostAccumulated: 0,
      qrCodeUrl: `https://pctu.edu.vn/asset/${code.trim().toUpperCase()}`,
    };

    addDevice(newHvac);
    setIsAddModalOpen(false);
    setCode('');
    setName('');
  };

  const handleQuickCleanMaintenance = (device: Device) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 3);

    updateDevice(device.id, {
      status: 'operating',
      lastMaintenanceDate: todayStr,
      nextMaintenanceDate: nextDate.toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wind className="w-5 h-5 text-sky-600" />
            Hệ Thống Điều Hòa Không Khí (HVAC) ĐH Phan Châu Trinh
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý mã tài sản, công suất BTU, loại ga lạnh R32/R410A, chu kỳ vệ sinh lưới lọc và nạp ga
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm máy điều hòa</span>
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tổng số máy điều hòa</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount} <span className="text-xs font-normal text-slate-500">máy</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">Daikin, Panasonic, Casper, VRV</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Hoạt động tốt</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{goodCount} <span className="text-xs font-normal text-slate-500">máy</span></div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Làm mát bình thường</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đến hạn bảo trì / vệ sinh</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{needsMaintCount} <span className="text-xs font-normal text-slate-500">máy</span></div>
          <div className="text-[11px] text-amber-700 mt-0.5">Cần xịt rửa dàn lạnh & lưới</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đang hỏng / Cần thay</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{brokenCount} <span className="text-xs font-normal text-slate-500">máy</span></div>
          <div className="text-[11px] text-rose-700 mt-0.5">Lỗi bo mạch hoặc xì ga</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã máy (AC-C-301...), tên phòng, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-hidden text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
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
            <option value="faulty">Đang hỏng</option>
          </select>
        </div>
      </div>

      {/* HVAC Devices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mã tài sản</th>
                <th className="p-3">Tên thiết bị</th>
                <th className="p-3">Vị trí phòng học</th>
                <th className="p-3">Hãng & Model</th>
                <th className="p-3">Công suất & Ga</th>
                <th className="p-3">Bảo trì gần nhất</th>
                <th className="p-3">Hạn kế tiếp</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map((dev) => {
                const isOverdue = new Date(dev.nextMaintenanceDate || '').getTime() < Date.now();

                return (
                  <tr key={dev.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <button
                        onClick={() => onOpenQrModal(dev)}
                        className="font-mono font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1"
                        title="Xem mã QR"
                      >
                        <QrCode className="w-3 h-3" />
                        {dev.code}
                      </button>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{dev.name}</td>
                    <td className="p-3 text-slate-700 font-medium">
                      {dev.buildingName} • Phòng <strong className="text-slate-900">{dev.roomCode}</strong>
                    </td>
                    <td className="p-3 text-slate-600">
                      {dev.brand} {dev.model}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{dev.capacity}</span>
                      <span className="text-[10px] ml-1.5 px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-mono">
                        {dev.gasType || 'R32'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{formatDate(dev.lastMaintenanceDate)}</td>
                    <td className="p-3">
                      <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {formatDate(dev.nextMaintenanceDate)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusBadgeClass(dev.status)}`}>
                        {getStatusLabel(dev.status)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickCleanMaintenance(dev)}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition-colors flex items-center gap-1"
                          title="Ghi nhận vệ sinh bảo trì hôm nay"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Vệ sinh xong</span>
                        </button>
                        <button
                          onClick={() => onOpenQrModal(dev)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="In mã QR dán vỏ máy"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Điều Hòa */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Thêm Máy Điều Hòa Không Khí Mới</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHvac} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mã tài sản *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: AC-C-305, AC-B-101..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tên máy điều hòa *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Điều hòa ĐH Daikin 18000BTU"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

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
                  <label className="block text-slate-600 font-semibold mb-1">Phòng học / Vị trí *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: C301, A102..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
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
                  <label className="block text-slate-600 font-semibold mb-1">Công suất</label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="18,000 BTU"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Loại gas lạnh</label>
                  <select
                    value={gasType}
                    onChange={(e) => setGasType(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="R32">Gas R32</option>
                    <option value="R410A">Gas R410A</option>
                    <option value="R22">Gas R22</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Model máy</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Ngày lắp đặt</label>
                  <input
                    type="date"
                    value={installDate}
                    onChange={(e) => setInstallDate(e.target.value)}
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
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Lưu Máy Điều Hòa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
