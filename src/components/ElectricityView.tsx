import React, { useState } from 'react';
import { 
  Zap, AlertTriangle, TrendingUp, Calendar, Plus, 
  Search, Shield, CheckCircle2, ArrowUpRight, DollarSign,
  FileSpreadsheet, Sparkles, X, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ElectricityRecord } from '../types';
import { formatVND, formatNumber } from '../utils/formatters';

export const ElectricityView: React.FC = () => {
  const { buildings, electricRecords, addElectricRecord, currentUser } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Record Form State
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const [meterCode, setMeterCode] = useState('CT-EM-01');
  const [previousIndex, setPreviousIndex] = useState(128000);
  const [currentIndex, setCurrentIndex] = useState(132400);
  const [ratePerKwh, setRatePerKwh] = useState(2450);
  const [notes, setNotes] = useState('');

  const consumptionKwh = Math.max(0, currentIndex - previousIndex);
  const totalCost = consumptionKwh * ratePerKwh;

  // Filter records by month
  const currentRecords = electricRecords.filter(r => r.periodMonthYear === selectedMonth);
  const totalKwh = currentRecords.reduce((sum, r) => sum + r.consumptionKwh, 0);
  const totalMoney = currentRecords.reduce((sum, r) => sum + r.totalCost, 0);

  // Compare with previous baseline
  const prevMonthTotalKwh = 18200;
  const kwhDiff = totalKwh - prevMonthTotalKwh;
  const kwhPct = Math.round((kwhDiff / prevMonthTotalKwh) * 100);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBuilding = buildings.find(b => b.id === buildingId);
    const isAbnormalSpike = consumptionKwh > 5000;

    const newRecord: ElectricityRecord = {
      id: `elec_${Date.now()}`,
      buildingId,
      buildingName: targetBuilding?.name || 'Chưa xác định',
      meterCode,
      periodMonthYear: selectedMonth,
      recordDate: new Date().toISOString().split('T')[0],
      recordedBy: currentUser.name,
      previousIndex: Number(previousIndex),
      currentIndex: Number(currentIndex),
      consumptionKwh,
      ratePerKwh: Number(ratePerKwh),
      totalCost,
      isAbnormalSpike,
      spikeReason: isAbnormalSpike ? 'Tiêu thụ vượt ngưỡng cảnh báo tự động 5,000 kWh' : undefined,
      notes,
    };

    addElectricRecord(newRecord);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Hệ Thống Quản Lý Điện Năng & Công Tơ Trường ĐH Phan Châu Trinh
          </h2>
          <p className="text-xs text-slate-500">
            Giám sát chỉ số công tơ điện tổng, các tủ điện trạm biến áp, phát hiện rò rỉ và cảnh báo quá tải
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 outline-hidden"
          >
            <option value="2026-08">Kỳ ghi: Tháng 08/2026</option>
            <option value="2026-07">Kỳ ghi: Tháng 07/2026</option>
            <option value="2026-06">Kỳ ghi: Tháng 06/2026</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi chỉ số điện mới</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng điện năng tiêu thụ</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {formatNumber(totalKwh)} <span className="text-xs font-semibold text-slate-500">kWh</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{kwhPct}% so với tháng trước ({formatNumber(prevMonthTotalKwh)} kWh)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng chi phí tiền điện</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">
            {formatVND(totalMoney)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đơn giá bình quân: 2,450 VNĐ/kWh
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Trạm biến áp & Máy phát</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            1 TBA <span className="text-xs text-slate-500 font-normal">/ 1 Máy phát</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Máy phát Cummins 250kVA sẵn sàng ATS
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cảnh báo tiêu thụ điện</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {currentRecords.filter(r => r.isAbnormalSpike).length} cảnh báo
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">
            Khu Y Sinh học có mức tăng đột biến +32%
          </div>
        </div>
      </div>

      {/* Abnormal Spike Warning Box */}
      {currentRecords.some(r => r.isAbnormalSpike) && (
        <div className="bg-amber-50/80 border border-amber-300 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-900">Phát hiện bất thường trong kỳ ghi chỉ số tháng 08/2026:</h4>
            <p className="text-amber-800 mt-0.5">
              Công tơ <span className="font-mono font-bold">CT-EM-03</span> tại <strong>Trung tâm Nghiên cứu Y sinh học</strong> tiêu thụ 6,250 kWh (tăng hơn 30% so với định mức). Đề nghị kiểm tra hệ thống điều hòa buồng nuôi cấy vi sinh vật và tủ âm sâu (-80°C) xem có hiện tượng hở gioăng hoặc chạy quá tải không.
            </p>
          </div>
        </div>
      )}

      {/* Main Electricity Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            Bảng Kê Chỉ Số Công Tơ Điện Theo Từng Khu Nhà ({selectedMonth})
          </h3>
          <span className="text-xs text-slate-500">5 công tơ phụ & trạm tổng</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mã công tơ</th>
                <th className="p-3">Khu vực / Tòa nhà</th>
                <th className="p-3">Ngày ghi</th>
                <th className="p-3 text-right">Chỉ số cũ</th>
                <th className="p-3 text-right">Chỉ số mới</th>
                <th className="p-3 text-right">Tiêu thụ (kWh)</th>
                <th className="p-3 text-right">Đơn giá (VNĐ)</th>
                <th className="p-3 text-right">Thành tiền (VNĐ)</th>
                <th className="p-3">Người ghi</th>
                <th className="p-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-700">{rec.meterCode}</td>
                  <td className="p-3 font-semibold text-slate-900">{rec.buildingName}</td>
                  <td className="p-3 text-slate-500">{rec.recordDate}</td>
                  <td className="p-3 font-mono text-right text-slate-600">{formatNumber(rec.previousIndex)}</td>
                  <td className="p-3 font-mono text-right text-slate-900 font-bold">{formatNumber(rec.currentIndex)}</td>
                  <td className="p-3 font-mono text-right font-black text-slate-900">
                    {formatNumber(rec.consumptionKwh)}
                  </td>
                  <td className="p-3 font-mono text-right text-slate-600">{formatNumber(rec.ratePerKwh)}</td>
                  <td className="p-3 font-mono text-right font-bold text-emerald-700">
                    {formatVND(rec.totalCost)}
                  </td>
                  <td className="p-3 text-slate-600">{rec.recordedBy}</td>
                  <td className="p-3 text-center">
                    {rec.isAbnormalSpike ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> Tăng vọt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Bình thường
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 font-bold text-xs border-t border-slate-200">
              <tr>
                <td colSpan={5} className="p-3 text-slate-900 text-right">Tổng cộng kỳ này:</td>
                <td className="p-3 text-right font-black text-amber-700">{formatNumber(totalKwh)} kWh</td>
                <td></td>
                <td className="p-3 text-right font-black text-emerald-700">{formatVND(totalMoney)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Ghi Chỉ Số Điện Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Ghi Chỉ Số Công Tơ Điện Mới</h3>
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
                  <label className="block text-slate-600 font-semibold mb-1">Mã đồng hồ / Công tơ *</label>
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
                  <label className="block text-slate-600 font-semibold mb-1">Chỉ số cũ (kWh) *</label>
                  <input
                    type="number"
                    required
                    value={previousIndex}
                    onChange={(e) => setPreviousIndex(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Chỉ số mới (kWh) *</label>
                  <input
                    type="number"
                    required
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-amber-700"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Lượng điện tiêu thụ:</span>
                  <div className="text-base font-black text-amber-900 font-mono">
                    {formatNumber(consumptionKwh)} kWh
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
                <label className="block text-slate-600 font-semibold mb-1">Ghi chú (nếu có bất thường)</label>
                <input
                  type="text"
                  placeholder="Ghi chú về kiểm tra công tơ..."
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
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
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
