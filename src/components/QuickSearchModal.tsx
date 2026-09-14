import React, { useState, useMemo } from 'react';
import { 
  Search, X, Building2, Wrench, FileText, CheckSquare, 
  Package, Zap, Droplets, Wind, Flame, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickSearchModal: React.FC = () => {
  const { 
    isSearchModalOpen, setIsSearchModalOpen, setActiveTab, 
    setSelectedBuildingId, setSelectedDeviceId,
    buildings, devices, repairRequests, dailyTasks, inventory 
  } = useApp();

  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const results: {
      type: 'building' | 'device' | 'ticket' | 'task' | 'inventory';
      id: string;
      code: string;
      title: string;
      subtitle: string;
      tab: string;
    }[] = [];

    // Search buildings
    (buildings || []).forEach((b) => {
      if (!b) return;
      const bName = (b.name || '').toLowerCase();
      const bCode = (b.code || '').toLowerCase();
      const bDesc = (b.description || '').toLowerCase();
      if (bName.includes(q) || bCode.includes(q) || bDesc.includes(q)) {
        results.push({
          type: 'building',
          id: b.id,
          code: b.code,
          title: b.name,
          subtitle: `${b.floorsCount} tầng • ${b.functionType}`,
          tab: 'buildings',
        });
      }
      // Also search rooms inside building
      (b.floors || []).forEach((fl) => {
        (fl.rooms || []).forEach((rm) => {
          if (!rm) return;
          const rmCode = (rm.code || '').toLowerCase();
          const rmName = (rm.name || '').toLowerCase();
          if (rmCode.includes(q) || rmName.includes(q)) {
            results.push({
              type: 'building',
              id: b.id,
              code: rm.code,
              title: `${rm.name} (${rm.code})`,
              subtitle: `${b.name} • Tầng ${fl.floorNumber}`,
              tab: 'buildings',
            });
          }
        });
      });
    });

    // Search devices
    (devices || []).forEach((d) => {
      if (!d) return;
      const dCode = (d.code || '').toLowerCase();
      const dName = (d.name || '').toLowerCase();
      const dBrand = (d.brand || '').toLowerCase();
      const dModel = (d.model || '').toLowerCase();
      const dRoom = (d.roomCode || '').toLowerCase();
      if (
        dCode.includes(q) || 
        dName.includes(q) || 
        dBrand.includes(q) || 
        dModel.includes(q) ||
        dRoom.includes(q)
      ) {
        results.push({
          type: 'device',
          id: d.id,
          code: d.code,
          title: d.name,
          subtitle: `${d.buildingName || ''} - Phòng ${d.roomCode || ''} • ${d.brand || ''} ${d.model || ''}`,
          tab: d.category === 'hvac' ? 'hvac' : d.category === 'pccc' ? 'pccc' : 'devices',
        });
      }
    });

    // Search tickets
    (repairRequests || []).forEach((t) => {
      if (!t) return;
      const tCode = (t.ticketCode || '').toLowerCase();
      const tDesc = (t.issueDescription || '').toLowerCase();
      const tReq = (t.requesterName || '').toLowerCase();
      const tDept = (t.department || '').toLowerCase();
      if (
        tCode.includes(q) || 
        tDesc.includes(q) || 
        tReq.includes(q) ||
        tDept.includes(q)
      ) {
        results.push({
          type: 'ticket',
          id: t.id,
          code: t.ticketCode,
          title: t.issueDescription,
          subtitle: `${t.requesterName || ''} (${t.department || ''}) • ${t.buildingName || ''} ${t.roomCode || ''}`,
          tab: 'repair',
        });
      }
    });

    // Search tasks
    (dailyTasks || []).forEach((tk) => {
      if (!tk) return;
      const tkCode = (tk.taskCode || '').toLowerCase();
      const tkTitle = (tk.title || '').toLowerCase();
      const tkDesc = (tk.description || '').toLowerCase();
      const tkAssigned = (tk.assignedToName || '').toLowerCase();
      if (
        tkCode.includes(q) || 
        tkTitle.includes(q) || 
        tkDesc.includes(q) ||
        tkAssigned.includes(q)
      ) {
        results.push({
          type: 'task',
          id: tk.id,
          code: tk.taskCode,
          title: tk.title,
          subtitle: `Giao cho: ${tk.assignedToName || ''} • Hạn: ${tk.deadline || ''}`,
          tab: 'tasks',
        });
      }
    });

    // Search inventory
    (inventory || []).forEach((inv) => {
      if (!inv) return;
      const invName = (inv.name || '').toLowerCase();
      const invCode = (inv.code || '').toLowerCase();
      const invCat = (inv.category || '').toLowerCase();
      if (invName.includes(q) || invCode.includes(q) || invCat.includes(q)) {
        results.push({
          type: 'inventory',
          id: inv.id,
          code: inv.code,
          title: inv.name,
          subtitle: `Tồn kho: ${inv.currentStock} ${inv.unit} • ${inv.storageLocation || inv.shelfLocation || 'Kho kỹ thuật'}`,
          tab: 'inventory',
        });
      }
    });

    return results.slice(0, 15);
  }, [query, buildings, devices, repairRequests, dailyTasks, inventory]);

  if (!isSearchModalOpen) return null;

  const handleSelect = (result: typeof searchResults[0]) => {
    setActiveTab(result.tab);
    if (result.type === 'building') {
      setSelectedBuildingId(result.id);
    } else if (result.type === 'device') {
      setSelectedDeviceId(result.id);
    }
    setIsSearchModalOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-100">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã thiết bị (AC-C-301, PCCC...), phòng học (C301, A102...), phiếu sửa chữa, việc..."
            className="w-full text-sm sm:text-base outline-hidden text-slate-800 placeholder:text-slate-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div className="text-sm font-medium text-slate-600">Tìm kiếm nhanh mọi thông tin cơ sở hạ tầng</div>
              <div className="text-xs text-slate-400 mt-1">
                Gõ mã thiết bị (ví dụ: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">AC-C-301</span>, <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">GEN-01</span>), tên phòng học, hoặc người yêu cầu.
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <div className="text-sm font-medium text-slate-600">Không tìm thấy kết quả nào phù hợp</div>
              <div className="text-xs text-slate-400 mt-1">Vui lòng thử từ khóa khác</div>
            </div>
          ) : (
            searchResults.map((item, idx) => (
              <button
                key={`${item.type}_${item.id}_${idx}`}
                onClick={() => handleSelect(item)}
                className="w-full p-3 text-left rounded-xl hover:bg-blue-50/70 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors shrink-0">
                    {item.type === 'building' && <Building2 className="w-4 h-4" />}
                    {item.type === 'device' && <Wrench className="w-4 h-4" />}
                    {item.type === 'ticket' && <FileText className="w-4 h-4" />}
                    {item.type === 'task' && <CheckSquare className="w-4 h-4" />}
                    {item.type === 'inventory' && <Package className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 shrink-0">
                        {item.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Tìm kiếm liên kết đa chiều trong hệ thống ĐH Phan Châu Trinh</span>
          <span className="hidden sm:inline">Nhấn Enter để chọn</span>
        </div>
      </div>
    </div>
  );
};
