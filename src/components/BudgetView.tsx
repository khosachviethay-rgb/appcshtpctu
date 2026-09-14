import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, AlertTriangle, CheckCircle2, 
  Calendar, Plus, PieChart, BarChart3, FileSpreadsheet,
  ArrowUpRight, X, ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BudgetItem } from '../types';
import { formatVND, formatNumber } from '../utils/formatters';

export const BudgetView: React.FC = () => {
  const { budgetItems = [], budget = [], addBudgetItem, updateBudgetItem } = useApp();

  const [selectedYear, setSelectedYear] = useState('2026');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New budget item state
  const [category, setCategory] = useState('Điện lực EVN');
  const [allocated, setAllocated] = useState(250000000);
  const [notes, setNotes] = useState('');

  const rawBudget = (budgetItems && budgetItems.length > 0) ? budgetItems : (budget || []);
  const currentBudgetItems = (rawBudget || []).filter(b => b.fiscalYear === Number(selectedYear));
  const totalAllocated = currentBudgetItems.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
  const totalSpent = currentBudgetItems.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallSpentPercent = Math.round((totalSpent / (totalAllocated || 1)) * 100);

  const handleCreateBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: BudgetItem = {
      id: `budget_${Date.now()}`,
      category,
      allocatedAmount: Number(allocated),
      spentAmount: 0,
      fiscalYear: Number(selectedYear),
      quarter: 'Q3',
      notes,
    };

    addBudgetItem(newItem);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Dự Toán Ngân Sách & Chi Phí Vận Hành Kỹ Thuật (Năm {selectedYear})
          </h2>
          <p className="text-xs text-slate-500">
            Kế hoạch tài chính trình Phòng Hành chính - Nhân sự và Ban Giám hiệu ĐH Phan Châu Trinh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="2026">Năm tài chính 2026</option>
            <option value="2025">Năm tài chính 2025</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mục dự toán</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tổng dự toán phê duyệt</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatVND(totalAllocated)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kế hoạch cả năm {selectedYear}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đã giải ngân thực tế</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{formatVND(totalSpent)}</div>
          <div className="text-[11px] text-blue-700 font-semibold mt-0.5">Tiến độ: {overallSpentPercent}% dự toán</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Ngân sách còn lại</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{formatVND(totalRemaining)}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Dành cho Q3 - Q4/2026</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Quỹ dự phòng khẩn cấp</span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {formatVND(totalAllocated * 0.1)}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Tỷ lệ 10% sự cố thiên tai / bão</div>
        </div>
      </div>

      {/* Budget Allocation Progress Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          Tiến Độ Giải Ngân Chi Tiết Từng Hạng Mục Kỹ Thuật
        </h3>

        <div className="space-y-4">
          {currentBudgetItems.map((item) => {
            const spentPct = Math.round((item.spentAmount / (item.allocatedAmount || 1)) * 100);
            const isWarning = spentPct > 85;

            return (
              <div key={item.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{item.category}</span>
                    {item.notes && <span className="text-slate-500 text-[11px] ml-2">({item.notes})</span>}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">
                      Đã chi: <strong className="text-slate-900 font-mono">{formatVND(item.spentAmount)}</strong> / <span className="font-mono">{formatVND(item.allocatedAmount)}</span>
                    </span>
                    <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                      isWarning ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {spentPct}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      spentPct > 90 ? 'bg-rose-500' : spentPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, spentPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Thêm Hạng Mục Dự Toán Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Thêm Mục Dự Toán Ngân Sách Mới</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudgetItem} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tên hạng mục ngân sách *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kiểm định định kỳ PCCC & Bơm..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Hạn mức ngân sách phê duyệt (VNĐ) *</label>
                <input
                  type="number"
                  required
                  value={allocated}
                  onChange={(e) => setAllocated(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Ghi chú mục đích sử dụng</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Căn cứ hợp đồng hoặc dự toán bảo trì..."
                  className="w-full p-2 border border-slate-300 rounded-lg resize-none"
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
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Lưu Dự Toán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
