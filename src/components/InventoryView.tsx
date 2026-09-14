import React, { useState } from 'react';
import { 
  Package, Search, Plus, AlertTriangle, ArrowDownRight, 
  ArrowUpRight, DollarSign, History, Filter, X, CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InventoryItem, InventoryTransaction, DeviceCategory } from '../types';
import { formatVND, formatDate } from '../utils/formatters';

export const InventoryView: React.FC = () => {
  const { 
    inventory, inventoryTransactions, addInventoryItem, 
    addInventoryTransaction, currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLowStockOnly, setIsLowStockOnly] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedItemForTxn, setSelectedItemForTxn] = useState<InventoryItem | null>(null);

  // Transaction form state
  const [txnType, setTxnType] = useState<'import' | 'export'>('export');
  const [txnQuantity, setTxnQuantity] = useState(1);
  const [txnReason, setTxnReason] = useState('Sửa chữa thay thế');

  // New Item form state
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<DeviceCategory>('electric');
  const [specification, setSpecification] = useState('');
  const [unit, setUnit] = useState('Cái');
  const [currentStock, setCurrentStock] = useState(10);
  const [minThreshold, setMinThreshold] = useState(5);
  const [unitPrice, setUnitPrice] = useState(50000);
  const [shelfLocation, setShelfLocation] = useState('Kệ E-01');

  const filteredItems = (inventory || []).filter(item => {
    if (!item) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const code = (item.code || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const spec = (item.specification || '').toLowerCase();
    const shelf = (item.shelfLocation || item.storageLocation || '').toLowerCase();

    const matchesSearch = !q ||
      code.includes(q) ||
      name.includes(q) ||
      spec.includes(q) ||
      shelf.includes(q);

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const minThresh = item.minThreshold ?? item.minStockThreshold ?? 0;
    const matchesLowStock = !isLowStockOnly || item.currentStock <= minThresh;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const totalValue = (inventory || []).reduce((sum, item) => sum + ((item?.currentStock || 0) * (item?.unitPrice || 0)), 0);
  const lowStockCount = (inventory || []).filter(item => item && (item.currentStock <= (item.minThreshold ?? item.minStockThreshold ?? 0))).length;

  const handleOpenTransaction = (item: InventoryItem, type: 'import' | 'export') => {
    setSelectedItemForTxn(item);
    setTxnType(type);
    setTxnQuantity(1);
    setTxnReason(type === 'export' ? 'Sửa chữa thay thế định kỳ' : 'Nhập kho bổ sung từ nhà cung cấp');
    setIsTransactionModalOpen(true);
  };

  const handleConfirmTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForTxn || txnQuantity <= 0) return;

    if (txnType === 'export' && txnQuantity > selectedItemForTxn.currentStock) {
      alert(`Số lượng xuất (${txnQuantity}) vượt quá tồn kho hiện tại (${selectedItemForTxn.currentStock})!`);
      return;
    }

    const newTxn: InventoryTransaction = {
      id: `txn_${Date.now()}`,
      itemId: selectedItemForTxn.id,
      itemName: selectedItemForTxn.name,
      type: txnType,
      quantity: txnQuantity,
      unitPrice: selectedItemForTxn.unitPrice,
      totalAmount: selectedItemForTxn.unitPrice * txnQuantity,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      performerName: currentUser.name,
      reasonOrTaskId: txnReason,
    };

    addInventoryTransaction(newTxn);
    setIsTransactionModalOpen(false);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode || !itemName) return;

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      code: itemCode.trim().toUpperCase(),
      name: itemName.trim(),
      category: itemCategory,
      specification: specification.trim(),
      unit: unit.trim(),
      currentStock: Number(currentStock),
      minThreshold: Number(minThreshold),
      unitPrice: Number(unitPrice),
      shelfLocation: shelfLocation.trim(),
      lastRestockDate: new Date().toISOString().split('T')[0],
    };

    addInventoryItem(newItem);
    setIsAddItemModalOpen(false);
    setItemCode('');
    setItemName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            Quản Lý Kho Vật Tư, Phụ Tùng & Linh Kiện Kỹ Thuật
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi tồn kho an toàn, vị trí ngăn kệ, nhập xuất kho gắn với phiếu sửa chữa và định mức tối thiểu
          </p>
        </div>

        <button
          onClick={() => setIsAddItemModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mã vật tư mới</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tổng danh mục vật tư</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{inventory.length} <span className="text-xs font-normal text-slate-500">mã</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">Điện, nước, điều hòa, PCCC</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tổng giá trị tồn kho</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{formatVND(totalValue)}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Giá trị lưu kho định lượng</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Cảnh báo chạm ngưỡng tối thiểu</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{lowStockCount} <span className="text-xs font-normal text-slate-500">mã</span></div>
          <div className="text-[11px] text-rose-700 mt-0.5">Cần làm đề xuất mua bổ sung</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Giao dịch nhập / xuất kỳ này</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{inventoryTransactions.length}</div>
          <div className="text-[11px] text-blue-700 mt-0.5">Lịch sử xuất sửa chữa</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã vật tư (VT-ELE-01...), tên linh kiện, vị trí kệ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-hidden text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">Tất cả hệ thống</option>
            <option value="electric">Vật tư Điện</option>
            <option value="water">Vật tư Nước</option>
            <option value="hvac">Vật tư Điều hòa</option>
            <option value="pccc">Vật tư PCCC</option>
          </select>

          <button
            onClick={() => setIsLowStockOnly(!isLowStockOnly)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
              isLowStockOnly 
                ? 'bg-rose-50 border-rose-300 text-rose-800' 
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Chỉ xem sắp hết ({lowStockCount})</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Mã vật tư</th>
                <th className="p-3">Tên linh kiện / Vật tư</th>
                <th className="p-3">Quy cách & Kỹ thuật</th>
                <th className="p-3">Đơn vị</th>
                <th className="p-3 text-right">Tồn kho</th>
                <th className="p-3 text-right">Ngưỡng tối thiểu</th>
                <th className="p-3 text-right">Đơn giá (VNĐ)</th>
                <th className="p-3">Vị trí kệ</th>
                <th className="p-3 text-center">Tình trạng</th>
                <th className="p-3 text-right">Thao tác kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const minThresh = item.minThreshold ?? item.minStockThreshold ?? 0;
                const isLow = item.currentStock <= minThresh;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-700">{item.code}</td>
                    <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="p-3 text-slate-600">{item.specification || 'Theo tiêu chuẩn'}</td>
                    <td className="p-3 text-slate-600">{item.unit}</td>
                    <td className="p-3 font-mono text-right font-black text-slate-900">
                      {item.currentStock}
                    </td>
                    <td className="p-3 font-mono text-right text-slate-500">{minThresh}</td>
                    <td className="p-3 font-mono text-right text-slate-800">{formatVND(item.unitPrice)}</td>
                    <td className="p-3 font-medium text-slate-700">{item.shelfLocation || item.storageLocation || 'Kho kỹ thuật'}</td>
                    <td className="p-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> Cần nhập thêm
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Đủ định mức
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenTransaction(item, 'import')}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition-colors flex items-center gap-1"
                          title="Nhập thêm hàng"
                        >
                          <ArrowDownRight className="w-3 h-3" /> Nhập
                        </button>
                        <button
                          onClick={() => handleOpenTransaction(item, 'export')}
                          className="px-2 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors flex items-center gap-1"
                          title="Xuất vật tư cho sửa chữa"
                        >
                          <ArrowUpRight className="w-3 h-3" /> Xuất
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

      {/* Transaction Modal (Nhập / Xuất) */}
      {isTransactionModalOpen && selectedItemForTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {txnType === 'import' ? 'Phiếu Nhập Vật Tư' : 'Phiếu Xuất Kho Sửa Chữa'}
              </h3>
              <button onClick={() => setIsTransactionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransaction} className="p-5 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{selectedItemForTxn.name} ({selectedItemForTxn.code})</div>
                <div className="text-slate-500 text-[11px]">
                  Tồn kho hiện tại: <strong className="text-slate-800">{selectedItemForTxn.currentStock} {selectedItemForTxn.unit}</strong> • Đơn giá: {formatVND(selectedItemForTxn.unitPrice)}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Số lượng {txnType === 'import' ? 'nhập' : 'xuất'} ({selectedItemForTxn.unit}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={txnQuantity}
                  onChange={(e) => setTxnQuantity(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Lý do / Căn cứ phiếu *</label>
                <input
                  type="text"
                  required
                  value={txnReason}
                  onChange={(e) => setTxnReason(e.target.value)}
                  placeholder="VD: Sửa chữa theo phiếu SC-2026-001..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="text-slate-600">Tổng thành tiền:</span>
                <span className="text-sm font-black text-emerald-800 font-mono">
                  {formatVND(selectedItemForTxn.unitPrice * txnQuantity)}
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-lg font-bold text-white ${
                    txnType === 'import' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Xác Nhận {txnType === 'import' ? 'Nhập Kho' : 'Xuất Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Mã Vật Tư Mới */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Thêm Mã Vật Tư Kỹ Thuật Mới</h3>
              </div>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mã vật tư *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: VT-ELE-05, VT-PLU-03..."
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tên vật tư / Phụ tùng *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Van phao cơ inox D27, Cầu dao..."
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Hệ thống kỹ thuật</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as DeviceCategory)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="electric">⚡ Điện & Chiếu sáng</option>
                    <option value="water">💧 Nước & Vệ sinh</option>
                    <option value="hvac">❄️ Điều hòa không khí</option>
                    <option value="pccc">🔥 PCCC & Cứu hộ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Đơn vị tính *</label>
                  <input
                    type="text"
                    required
                    placeholder="Cái, Mét, Bình, Cuộn..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Quy cách kỹ thuật</label>
                <input
                  type="text"
                  placeholder="VD: Rạng Đông 1.2m 18W, Tiền Phong D27..."
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tồn kho ban đầu</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Ngưỡng tối thiểu</label>
                  <input
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-rose-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Đơn giá nhập (VNĐ)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-emerald-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Vị trí ngăn kệ trong kho</label>
                <input
                  type="text"
                  placeholder="VD: Kệ E-03, Tủ A ngăn 2..."
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Lưu Vào Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
