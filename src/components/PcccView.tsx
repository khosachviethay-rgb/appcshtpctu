import React, { useState } from 'react';
import { 
  Flame, Shield, AlertTriangle, CheckCircle2, RefreshCw, 
  Calendar, Plus, QrCode, ArrowUpRight, Search, Play, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Device, DeviceStatus } from '../types';
import { formatDate, getStatusBadgeClass } from '../utils/formatters';

interface PcccViewProps {
  onOpenQrModal: (device: Device) => void;
}

export const PcccView: React.FC<PcccViewProps> = ({ onOpenQrModal }) => {
  const { devices, buildings, updateDevice, addDevice, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [inspectingDevice, setInspectingDevice] = useState<Device | null>(null);

  // Inspection form state
  const [pressureStatus, setPressureStatus] = useState<'normal' | 'low' | 'high'>('normal');
  const [sealIntact, setSealIntact] = useState(true);
  const [hoseIntact, setHoseIntact] = useState(true);
  const [testResult, setTestResult] = useState<'passed' | 'warning' | 'failed'>('passed');
  const [inspectorNotes, setInspectorNotes] = useState('');

  // Filter only PCCC devices
  const pcccDevices = (devices || []).filter(d => d && d.category === 'pccc');

  const filteredPccc = pcccDevices.filter(d => {
    if (!d) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const dName = (d.name || '').toLowerCase();
    const matchesSearch = !q ||
      (d.code || '').toLowerCase().includes(q) ||
      dName.includes(q) ||
      (d.buildingName || '').toLowerCase().includes(q) ||
      (d.roomCode || '').toLowerCase().includes(q);

    const matchesType = filterType === 'all' || 
      (filterType === 'fire_extinguisher' && dName.includes('bình')) ||
      (filterType === 'pump' && dName.includes('bơm')) ||
      (filterType === 'cabinet' && dName.includes('tủ'));

    return matchesSearch && matchesType;
  });

  const totalCount = pcccDevices.length;
  const passedCount = pcccDevices.filter(d => d.pcccInspectionStatus === 'passed').length;
  const warningCount = pcccDevices.filter(d => d.pcccInspectionStatus === 'warning').length;
  const failedCount = pcccDevices.filter(d => d.pcccInspectionStatus === 'failed' || d.status === 'needs_maintenance').length;

  const handleOpenInspect = (dev: Device) => {
    setInspectingDevice(dev);
    setPressureStatus('normal');
    setSealIntact(true);
    setHoseIntact(true);
    setTestResult('passed');
    setInspectorNotes('');
    setIsInspectModalOpen(true);
  };

  const handleSubmitInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingDevice) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextInspection = new Date();
    nextInspection.setMonth(nextInspection.getMonth() + 1); // Monthly inspection

    const updatedStatus: DeviceStatus = testResult === 'passed' ? 'operating' : testResult === 'warning' ? 'needs_maintenance' : 'faulty';

    updateDevice(inspectingDevice.id, {
      lastMaintenanceDate: todayStr,
      nextMaintenanceDate: nextInspection.toISOString().split('T')[0],
      pcccInspectionStatus: testResult,
      status: updatedStatus,
    });

    setIsInspectModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-600" />
            Hệ Thống PCCC & Cứu Nạn Cứu Hộ ĐH Phan Châu Trinh
          </h2>
          <p className="text-xs text-slate-500">
            Giám sát bình chữa cháy bột ABC/CO2, máy bơm Ebara/Hyundai diesel, họng nước vách tường và hạn kiểm định
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Bể nước PCCC 100m³: Sẵn sàng 95%
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Thiết bị PCCC toàn trường</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Bình ABC, CO2, bơm, tủ vách tường</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đạt chuẩn an toàn</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{passedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Áp lực xanh, tem kiểm định hợp lệ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Cần kiểm tra / Nạp lại</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{warningCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Áp lực chớm vàng, sắp hết hạn</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Hỏng hóc / Quá hạn</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{failedCount}</div>
          <div className="text-[11px] text-rose-700 mt-0.5">Cần nạp sạc hoặc thay thế ngay</div>
        </div>
      </div>

      {/* PCCC Equipment Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã bình (PCCC-01...), vị trí khu nhà, phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent outline-hidden text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
            >
              <option value="all">Tất cả loại thiết bị</option>
              <option value="fire_extinguisher">Bình chữa cháy</option>
              <option value="pump">Máy bơm PCCC</option>
              <option value="cabinet">Tủ vách tường</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mã thiết bị</th>
                <th className="p-3">Tên thiết bị PCCC</th>
                <th className="p-3">Vị trí lắp đặt</th>
                <th className="p-3">Thông số & Quy cách</th>
                <th className="p-3">Kiểm tra gần nhất</th>
                <th className="p-3">Hạn kiểm định</th>
                <th className="p-3 text-center">Tình trạng</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPccc.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3">
                    <button
                      onClick={() => onOpenQrModal(dev)}
                      className="font-mono font-bold text-rose-700 hover:text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3" />
                      {dev.code}
                    </button>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{dev.name}</td>
                  <td className="p-3 text-slate-700 font-medium">
                    {dev.buildingName} • Tầng {dev.floorNumber} ({dev.roomCode})
                  </td>
                  <td className="p-3 text-slate-600">
                    {dev.capacity || dev.brand}
                  </td>
                  <td className="p-3 text-slate-500">{formatDate(dev.lastMaintenanceDate)}</td>
                  <td className="p-3 font-semibold text-slate-800">{formatDate(dev.pcccExpiryDate || dev.nextMaintenanceDate)}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      dev.pcccInspectionStatus === 'passed' ? 'bg-emerald-100 text-emerald-800' :
                      dev.pcccInspectionStatus === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {dev.pcccInspectionStatus === 'passed' ? 'Đạt chuẩn' :
                       dev.pcccInspectionStatus === 'warning' ? 'Cần nạp' : 'Hỏng / Hết hạn'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenInspect(dev)}
                        className="px-2 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
                      >
                        Kiểm tra định kỳ
                      </button>
                      <button
                        onClick={() => onOpenQrModal(dev)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="In mã QR dán bình"
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

      {/* Modal Kiểm Tra Định Kỳ PCCC */}
      {isInspectModalOpen && inspectingDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Biên Bản Kiểm Tra PCCC Định Kỳ - {inspectingDevice.code}
                </h3>
              </div>
              <button onClick={() => setIsInspectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInspection} className="p-5 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{inspectingDevice.name}</div>
                <div className="text-slate-500 text-[11px]">
                  Vị trí: {inspectingDevice.buildingName} • Tầng {inspectingDevice.floorNumber} ({inspectingDevice.roomCode})
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Áp lực đồng hồ đo (Bình bột/khí)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setPressureStatus('normal'); setTestResult('passed'); }}
                    className={`p-2 rounded-lg border font-semibold text-center transition-all ${
                      pressureStatus === 'normal' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    🟢 Vạch Xanh (Chuẩn)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPressureStatus('low'); setTestResult('warning'); }}
                    className={`p-2 rounded-lg border font-semibold text-center transition-all ${
                      pressureStatus === 'low' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    🟡 Vạch Vàng (Chớm tụt)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPressureStatus('high'); setTestResult('failed'); }}
                    className={`p-2 rounded-lg border font-semibold text-center transition-all ${
                      pressureStatus === 'high' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    🔴 Vạch Đỏ (Mất áp)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="seal"
                    checked={sealIntact}
                    onChange={(e) => setSealIntact(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <label htmlFor="seal" className="text-slate-700 font-medium">Chốt hãm & kẹp chì còn nguyên</label>
                </div>

                <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="hose"
                    checked={hoseIntact}
                    onChange={(e) => setHoseIntact(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <label htmlFor="hose" className="text-slate-700 font-medium">Vòi phun, loa phun không nứt vỡ</label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kết luận đánh giá *</label>
                <select
                  value={testResult}
                  onChange={(e) => setTestResult(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="passed">Đạt chuẩn - Tiếp tục sử dụng</option>
                  <option value="warning">Cần nạp sạc lại trong 15 ngày</option>
                  <option value="failed">Không đạt - Thu hồi thay thế khẩn cấp</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Ghi chú kiểm tra</label>
                <textarea
                  rows={2}
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="Ghi nhận tình trạng vỏ bình, tem kiểm định PCCC..."
                  className="w-full p-2 border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInspectModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Lưu Biên Bản Kiểm Tra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
