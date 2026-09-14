import React, { useState } from 'react';
import { 
  Droplets, AlertTriangle, Play, Square, RefreshCw, 
  Plus, Shield, Activity, FileSpreadsheet, CheckCircle2,
  ArrowUpRight, Waves, X, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WaterRecord } from '../types';
import { formatVND, formatNumber } from '../utils/formatters';

export const WaterView: React.FC = () => {
  const { 
    buildings, waterRecords, waterInfrastructure, 
    addWaterRecord, updateWaterTankLevel, toggleWaterPump, currentUser 
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Record Form State
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const [meterCode, setMeterCode] = useState('DN-W-01');
  const [previousIndex, setPreviousIndex] = useState(4820);
  const [currentIndex, setCurrentIndex] = useState(5015);
  const [ratePerM3, setRatePerM3] = useState(13500);
  const [notes, setNotes] = useState('');

  const consumptionM3 = Math.max(0, currentIndex - previousIndex);
  const totalCost = consumptionM3 * ratePerM3;

  const currentRecords = waterRecords.filter(r => r.periodMonthYear === selectedMonth);
  const totalM3 = currentRecords.reduce((sum, r) => sum + r.consumptionM3, 0);
  const totalMoney = currentRecords.reduce((sum, r) => sum + r.totalCost, 0);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBuilding = buildings.find(b => b.id === buildingId);
    const isAbnormalLeak = consumptionM3 > 250;

    const newRecord: WaterRecord = {
      id: `water_${Date.now()}`,
      buildingId,
      buildingName: targetBuilding?.name || 'Chưa xác định',
      meterCode,
      periodMonthYear: selectedMonth,
      recordDate: new Date().toISOString().split('T')[0],
      recordedBy: currentUser.name,
      previousIndex: Number(previousIndex),
      currentIndex: Number(currentIndex),
      consumptionM3,
      ratePerM3: Number(ratePerM3),
      totalCost,
      isAbnormalLeak,
      leakAlertReason: isAbnormalLeak ? 'Tiêu thụ vượt ngưỡng cảnh báo tự động 250 m³' : undefined,
      notes,
    };

    addWaterRecord(newRecord);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            Hệ Thống Quản Lý Nước Sạch & Bể Chứa Trường ĐH Phan Châu Trinh
          </h2>
          <p className="text-xs text-slate-500">
            Giám sát mức nước 4 bể chứa ngầm/mái, hệ thống trạm bơm Wilo và phát hiện rò rỉ đường ống
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
          >
            <option value="2026-08">Kỳ ghi: Tháng 08/2026</option>
            <option value="2026-07">Kỳ ghi: Tháng 07/2026</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi chỉ số nước mới</span>
          </button>
        </div>
      </div>

      {/* Real-time Water Tanks Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-600" />
            Mức Nước Các Bể Chứa Ngầm & Bồn Mái Toàn Trường
          </h3>
          <span className="text-xs text-slate-500">Cập nhật cảm biến phao tự động</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {waterInfrastructure.tanks.map((tank) => {
            const isLow = tank.currentLevelPercent <= tank.minSafeLevelPercent;
            const currentVolumeM3 = Math.round((tank.capacityM3 * tank.currentLevelPercent) / 100);

            return (
              <div 
                key={tank.id} 
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{tank.name}</span>
                    <span className="text-[11px] text-slate-500">{tank.location}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isLow ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isLow ? 'CẢNH BÁO THẤP' : 'AN TOÀN'}
                  </span>
                </div>

                {/* Animated Water Level Gauge */}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-black text-blue-900 font-mono">
                      {tank.currentLevelPercent}%
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {currentVolumeM3} / {tank.capacityM3} m³ nước
                    </div>
                  </div>

                  {/* Level Slider Simulation */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => updateWaterTankLevel(tank.id, Math.max(10, tank.currentLevelPercent - 10))}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      title="Giảm 10%"
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateWaterTankLevel(tank.id, Math.min(100, tank.currentLevelPercent + 10))}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      title="Tăng 10%"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Progress bar representing water tank level */}
                <div className="mt-3 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    }`}
                    style={{ width: `${tank.currentLevelPercent}%` }}
                  />
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Ngưỡng tối thiểu: {tank.minSafeLevelPercent}%</span>
                  <span>VS gần nhất: {tank.lastCleanedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Water Pumps Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Hệ Thống Trạm Bơm Nước Wilo & Bơm Tăng Áp
          </h3>
          <span className="text-xs text-slate-500">Điều khiển tự động qua tủ điều khiển áp lực</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {waterInfrastructure.pumps.map((pump) => {
            const isRunning = pump.status === 'running';

            return (
              <div 
                key={pump.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
                    <span className="text-xs font-bold text-slate-900">{pump.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Công suất: <strong>{pump.powerKw} kW</strong> • Vị trí: {pump.location}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Giờ chạy tích lũy: <span className="font-mono font-semibold text-slate-800">{formatNumber(pump.runningHours)} giờ</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleWaterPump(pump.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs shrink-0 ${
                    isRunning 
                      ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? 'Dừng bơm' : 'Chạy bơm'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Water Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            Bảng Kê Chỉ Số Đồng Hồ Nước Từng Khu Vực ({selectedMonth})
          </h3>
          <span className="text-xs text-slate-500">4 đồng hồ nhánh & đồng hồ tổng</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mã đồng hồ</th>
                <th className="p-3">Khu vực / Tòa nhà</th>
                <th className="p-3">Ngày ghi</th>
                <th className="p-3 text-right">Chỉ số cũ</th>
                <th className="p-3 text-right">Chỉ số mới</th>
                <th className="p-3 text-right">Tiêu thụ (m³)</th>
                <th className="p-3 text-right">Đơn giá (VNĐ)</th>
                <th className="p-3 text-right">Thành tiền (VNĐ)</th>
                <th className="p-3">Người ghi</th>
                <th className="p-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-blue-700">{rec.meterCode}</td>
                  <td className="p-3 font-semibold text-slate-900">{rec.buildingName}</td>
                  <td className="p-3 text-slate-500">{rec.recordDate}</td>
                  <td className="p-3 font-mono text-right text-slate-600">{formatNumber(rec.previousIndex)}</td>
                  <td className="p-3 font-mono text-right text-slate-900 font-bold">{formatNumber(rec.currentIndex)}</td>
                  <td className="p-3 font-mono text-right font-black text-slate-900">
                    {formatNumber(rec.consumptionM3)}
                  </td>
                  <td className="p-3 font-mono text-right text-slate-600">{formatNumber(rec.ratePerM3)}</td>
                  <td className="p-3 font-mono text-right font-bold text-emerald-700">
                    {formatVND(rec.totalCost)}
                  </td>
                  <td className="p-3 text-slate-600">{rec.recordedBy}</td>
                  <td className="p-3 text-center">
                    {rec.isAbnormalLeak ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> Nghi ngờ rò rỉ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Chuẩn
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 font-bold text-xs border-t border-slate-200">
              <tr>
                <td colSpan={5} className="p-3 text-slate-900 text-right">Tổng cộng kỳ này:</td>
                <td className="p-3 text-right font-black text-blue-700">{formatNumber(totalM3)} m³</td>
                <td></td>
                <td className="p-3 text-right font-black text-emerald-700">{formatVND(totalMoney)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Ghi Chỉ Số Nước */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Ghi Chỉ Số Đồng Hồ Nước Mới</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Khu vực / Tòa nhà *</label>
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
                  <label className="block text-slate-600 font-semibold mb-1">Mã đồng hồ nước *</label>
                  <input
                    type="text"
                    required
                    value={meterCode}
                    onChange={(e) => setMeterCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Chỉ số cũ (m³) *</label>
                  <input
                    type="number"
                    required
                    value={previousIndex}
                    onChange={(e) => setPreviousIndex(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Chỉ số mới (m³) *</label>
                  <input
                    type="number"
                    required
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Lượng nước tiêu thụ:</span>
                  <div className="text-base font-black text-blue-900 font-mono">
                    {formatNumber(consumptionM3)} m³
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Ước tính thành tiền:</span>
                  <div className="text-base font-black text-emerald-800 font-mono">
                    {formatVND(totalCost)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Ghi chú (nếu có)</label>
                <input
                  type="text"
                  placeholder="Ghi chú về kiểm tra van phao hoặc rò rỉ..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
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
                  Lưu Chỉ Số
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
