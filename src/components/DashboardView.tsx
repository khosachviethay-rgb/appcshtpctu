import React, { useState } from 'react';
import { 
  Building2, Layers, DoorOpen, Wrench, CheckCircle2, Clock, 
  AlertTriangle, Flame, Wind, Droplets, Zap, DollarSign,
  TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Activity,
  Calendar, FileText, ChevronRight, Filter, Plus, Download,
  ExternalLink, Bell, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatNumber } from '../utils/formatters';
import { getAlertModuleMeta, getAlertSeverityMeta } from '../utils/alertUtils';

interface DashboardViewProps {
  onNavigateTab?: (tab: string) => void;
  onOpenNewTicket?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenNewTicket }) => {
  const { 
    buildings, devices, dailyTasks, repairRequests, 
    maintenanceSchedules, infraIssues, electricRecords, 
    waterRecords, budget, alerts, setCurrentTab, setSelectedDeviceId,
    openAlertDetail, navigateToAlertTarget, markAlertRead
  } = useApp();

  const [alertFilter, setAlertFilter] = useState<'all' | 'unread'>('all');

  const handleNav = (tab: string) => {
    if (onNavigateTab) onNavigateTab(tab);
    else setCurrentTab(tab);
  };

  const handleAlertNavigate = (alertItem: any) => {
    if (onNavigateTab) {
      markAlertRead(alertItem.id);
      navigateToAlertTarget(alertItem);
    } else {
      navigateToAlertTarget(alertItem);
    }
  };

  // Metrics calculation
  const totalBuildings = (buildings || []).length;
  const totalFloors = (buildings || []).reduce((sum, b) => sum + (b?.floorsCount || 0), 0);
  const totalRooms = (buildings || []).reduce((sum, b) => 
    sum + (b?.floors || []).reduce((fSum, fl) => fSum + (fl?.rooms?.length || 0), 0), 0);

  const pendingRequests = (repairRequests || []).filter(r => r && (r.status === 'new' || r.status === 'received' || r.status === 'in_progress')).length;
  const upcomingMaintenance = (maintenanceSchedules || []).length;

  const totalAllocatedBudget = (budget || []).reduce((sum, b) => sum + (b?.allocatedAmount || (b as any)?.allocatedBudget || 0), 0);
  const totalUsedBudget = (budget || []).reduce((sum, b) => sum + (b?.spentAmount || (b as any)?.usedBudget || 0), 0);
  const budgetPercentage = totalAllocatedBudget > 0 ? Math.round((totalUsedBudget / totalAllocatedBudget) * 100) : 62;

  const totalElectricKwh = (electricRecords || []).reduce((sum, r) => sum + (r?.consumptionKwh || 0), 0);

  // Staff status mock/live data
  const staffStatus = [
    { name: 'Trương Công Hiển', role: 'Tổ trưởng CSHT', status: 'active', job: 'Kiểm tra TBA Khu A (JOB#128)' },
    { name: 'Nguyễn Văn Huy', role: 'KTV Điện lạnh', status: 'busy', job: 'Sửa điều hòa P302 Khu C (JOB#131)' },
    { name: 'Lê Đình Nam', role: 'KTV Điện - Nước', status: 'available', job: 'Trực vận hành trạm bơm tự động' },
    { name: 'Trần Văn Toàn', role: 'KTV Đa năng', status: 'available', job: 'Trực sẵn sàng tiếp nhận xử lý' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Row: 5 compact High Density metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Cơ sở vật chất */}
        <div 
          onClick={() => handleNav('buildings')}
          className="bg-white p-3 border border-slate-200 rounded shadow-2xs hover:border-blue-300 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cơ sở vật chất</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            {totalBuildings < 10 ? `0${totalBuildings}` : totalBuildings}{' '}
            <span className="text-xs font-normal text-slate-400">Khu nhà</span>
          </p>
          <p className="text-[10px] text-blue-600 font-medium mt-1 truncate">
            {totalFloors} Tầng | {totalRooms} Phòng
          </p>
        </div>

        {/* Card 2: Yêu cầu sửa chữa */}
        <div 
          onClick={() => handleNav('repairs')}
          className="bg-white p-3 border border-slate-200 rounded shadow-2xs hover:border-red-300 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Yêu cầu sửa chữa</p>
          <p className="text-2xl font-black text-red-600 tracking-tight mt-0.5">
            {pendingRequests < 10 ? `0${pendingRequests}` : pendingRequests}{' '}
            <span className="text-xs font-normal text-slate-400">Đang chờ</span>
          </p>
          <p className="text-[10px] text-slate-600 font-medium mt-1 truncate">
            +3 yêu cầu mới hôm nay
          </p>
        </div>

        {/* Card 3: Lịch bảo trì */}
        <div 
          onClick={() => handleNav('repairs')}
          className="bg-white p-3 border border-slate-200 rounded shadow-2xs hover:border-orange-300 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lịch bảo trì</p>
          <p className="text-2xl font-black text-orange-500 tracking-tight mt-0.5">
            {upcomingMaintenance < 10 ? `0${upcomingMaintenance}` : upcomingMaintenance}{' '}
            <span className="text-xs font-normal text-slate-400">Sắp đến</span>
          </p>
          <p className="text-[10px] text-slate-600 font-medium mt-1 truncate">
            HVAC: 04 | PCCC: 02
          </p>
        </div>

        {/* Card 4: Điện năng */}
        <div 
          onClick={() => handleNav('electric')}
          className="bg-white p-3 border border-slate-200 rounded shadow-2xs hover:border-blue-300 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Điện năng T09</p>
          <p className="text-2xl font-black text-blue-800 tracking-tight mt-0.5">
            {formatNumber(totalElectricKwh || 4280)}{' '}
            <span className="text-xs font-normal text-slate-400">kWh</span>
          </p>
          <p className="text-[10px] text-red-500 font-medium mt-1 truncate flex items-center gap-0.5">
            <span>▲ 12% so với tháng trước</span>
          </p>
        </div>

        {/* Card 5: Ngân sách vận hành */}
        <div 
          onClick={() => handleNav('budget')}
          className="bg-white p-3 border border-slate-200 rounded shadow-2xs hover:border-emerald-300 transition-colors cursor-pointer col-span-2 sm:col-span-1"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngân sách vận hành</p>
          <p className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5">
            {budgetPercentage}%{' '}
            <span className="text-xs font-normal text-slate-400">Đã dùng</span>
          </p>
          <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Main Visualizations: 12-Column High Density Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 flex flex-col space-y-3 sm:space-y-4">
          {/* Building Status Table */}
          <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-tight flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Trạng thái vận hành các khu nhà
              </h3>
              <div className="flex items-center space-x-3 text-[10px] text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Tốt
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> Bảo trì
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Sự cố
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-100 font-semibold bg-white">
                    <th className="px-4 py-2">Khu vực</th>
                    <th className="px-3 py-2">Điều hòa</th>
                    <th className="px-3 py-2">Điện / Nước</th>
                    <th className="px-3 py-2">PCCC</th>
                    <th className="px-4 py-2 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {buildings.slice(0, 7).map((b, idx) => {
                    const status = idx === 1 ? 'warning' : idx === 3 ? 'issue' : 'good';

                    return (
                      <tr 
                        key={b.id} 
                        onClick={() => handleNav('buildings')}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-2.5 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {b.code}
                            </span>
                            <div>
                              <div className="text-xs font-semibold text-slate-800">{b.name}</div>
                              <div className="text-[10px] text-slate-400">{b.floorsCount} tầng • {b.usageType || 'Giảng đường & Thực hành'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {status === 'warning' ? (
                            <span className="text-orange-600 font-medium text-[11px]">8/10 Hoạt động (2 bảo dưỡng)</span>
                          ) : status === 'issue' ? (
                            <span className="text-red-600 font-medium text-[11px]">Cần thay ga P302</span>
                          ) : (
                            <span className="text-emerald-700 font-medium text-[11px]">100% Hoạt động bình thường</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 font-medium">
                          {idx === 0 ? 'TBA 400kVA • Áp lực ổn' : 'Lưới điện ổn định • Bể 45m³'}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đạt chuẩn
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {status === 'good' && (
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-green-100 text-green-700">
                              ỔN ĐỊNH
                            </span>
                          )}
                          {status === 'warning' && (
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-orange-100 text-orange-700">
                              BẢO TRÌ
                            </span>
                          )}
                          {status === 'issue' && (
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-700">
                              CÓ SỰ CỐ
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Task and Maintenance Timeline: 2-Column High Density Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Left Card: Kế hoạch bảo trì định kỳ */}
            <div className="bg-white p-3 border border-slate-200 rounded shadow-2xs flex flex-col">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>📅</span> Kế hoạch bảo trì định kỳ
                </span>
                <button 
                  onClick={() => handleNav('repairs')}
                  className="text-blue-600 hover:underline text-[10px] font-medium"
                >
                  Xem tất cả
                </button>
              </h4>

              <div className="space-y-2 overflow-y-auto max-h-48 pr-1">
                <div className="flex items-center text-xs border-l-2 border-blue-400 pl-2 py-1 bg-slate-50/50 rounded-r">
                  <div className="shrink-0 text-[10px] font-mono text-slate-500 w-14 font-semibold">25 Sep</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 leading-tight truncate">Vệ sinh Điều hòa Khu B</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Phân công: Thầy Huy • KTV Điện lạnh</p>
                  </div>
                </div>

                <div className="flex items-center text-xs border-l-2 border-orange-400 pl-2 py-1 bg-slate-50/50 rounded-r">
                  <div className="shrink-0 text-[10px] font-mono text-slate-500 w-14 font-semibold">28 Sep</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 leading-tight truncate">Kiểm tra Bơm PCCC Khu C</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Phân công: Thầy Hiển • Tổ trưởng CSHT</p>
                  </div>
                </div>

                <div className="flex items-center text-xs border-l-2 border-emerald-400 pl-2 py-1 bg-slate-50/50 rounded-r">
                  <div className="shrink-0 text-[10px] font-mono text-slate-500 w-14 font-semibold">01 Oct</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 leading-tight truncate">Thay lõi lọc nước TT Y sinh</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Phân công: Đơn vị ngoài • Hợp đồng định kỳ</p>
                  </div>
                </div>

                <div className="flex items-center text-xs border-l-2 border-purple-400 pl-2 py-1 bg-slate-50/50 rounded-r">
                  <div className="shrink-0 text-[10px] font-mono text-slate-500 w-14 font-semibold">05 Oct</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 leading-tight truncate">Kiểm tra tiếp địa chống sét Khu A</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Phân công: Thầy Nam • KTV Điện nước</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Yêu cầu sửa chữa mới */}
            <div className="bg-white p-3 border border-slate-200 rounded shadow-2xs flex flex-col">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>🔧</span> Yêu cầu sửa chữa mới
                </span>
                <button 
                  onClick={() => handleNav('repairs')}
                  className="text-blue-600 hover:underline text-[10px] font-medium"
                >
                  Xử lý ({pendingRequests})
                </button>
              </h4>

              <div className="space-y-2 overflow-y-auto max-h-48 pr-1">
                <div 
                  onClick={() => handleNav('repairs')}
                  className="bg-slate-50 p-2 rounded border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-xs text-slate-800 leading-tight truncate">Hỏng ổ cắm phòng 304B</p>
                    <span className="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-600 font-bold rounded">URGENT</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Yêu cầu: Cô Thảo (P. Đào tạo) • 25 phút trước</p>
                </div>

                <div 
                  onClick={() => handleNav('repairs')}
                  className="bg-slate-50 p-2 rounded border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-xs text-slate-800 leading-tight truncate">Rò rỉ nước nhà vệ sinh Tầng 2 Khu E</p>
                    <span className="text-[9px] px-1.5 py-0.2 bg-orange-100 text-orange-600 font-bold rounded">MEDIUM</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Yêu cầu: Bảo vệ ca sáng • 1 giờ trước</p>
                </div>

                <div 
                  onClick={() => handleNav('repairs')}
                  className="bg-slate-50 p-2 rounded border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-xs text-slate-800 leading-tight truncate">Đèn chiếu sáng hành lang Tầng 3 Khu A</p>
                    <span className="text-[9px] px-1.5 py-0.2 bg-slate-200 text-slate-700 font-bold rounded">NORMAL</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Yêu cầu: Khoa Y đa khoa • Hôm qua</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Personnel, Alerts & Quick Links */}
        <div className="lg:col-span-4 flex flex-col space-y-3 sm:space-y-4">
          {/* Personnel Status */}
          <div className="bg-slate-800 text-white p-3.5 sm:p-4 rounded shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Tình trạng đội ngũ kỹ thuật
              </h4>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> 4 Trực ban
              </span>
            </div>

            <div className="space-y-2.5">
              {staffStatus.map((staff, idx) => (
                <div key={idx} className="flex items-start text-xs border-b border-slate-700/60 pb-2 last:border-b-0 last:pb-0">
                  <div className="mr-2 mt-0.5 shrink-0">
                    {staff.status === 'active' ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    ) : staff.status === 'busy' ? (
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-200 text-xs">{staff.name}</p>
                      <span className="text-[10px] text-slate-400">{staff.role}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{staff.job}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts Center */}
          <div className="bg-white border border-slate-200 rounded flex-1 flex flex-col shadow-2xs overflow-hidden">
            <div className="p-2.5 sm:p-3 border-b border-slate-100 bg-red-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1">
                  <span>⚠️</span> Cảnh báo hệ thống ({alerts.length})
                </h4>
                {alerts.filter(a => !a.isRead).length > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-bold rounded-full animate-pulse">
                    {alerts.filter(a => !a.isRead).length} mới
                  </span>
                )}
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAlertFilter('all')}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors ${
                    alertFilter === 'all' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-red-100'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setAlertFilter('unread')}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors ${
                    alertFilter === 'unread' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-red-100'
                  }`}
                >
                  Chưa đọc
                </button>
              </div>
            </div>

            {/* Interactive Alerts List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-64">
              {(() => {
                const displayedAlerts = alertFilter === 'unread' 
                  ? alerts.filter(a => !a.isRead) 
                  : alerts;

                if (displayedAlerts.length === 0) {
                  return (
                    <div className="p-4 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                      <span>{alertFilter === 'unread' ? 'Đã xử lý tất cả cảnh báo' : 'Hệ thống an toàn, không có cảnh báo nào'}</span>
                    </div>
                  );
                }

                return displayedAlerts.map((alert) => {
                  const moduleMeta = getAlertModuleMeta(alert.actionModule, alert.actionId);
                  const severityMeta = getAlertSeverityMeta(alert.severity);

                  return (
                    <div 
                      key={alert.id}
                      onClick={() => openAlertDetail(alert)}
                      className={`p-2.5 rounded-lg border-l-4 border transition-all cursor-pointer group hover:shadow-xs relative ${severityMeta.cardBorderClass} ${severityMeta.cardBgClass} ${
                        alert.isRead ? 'border-slate-200 opacity-90' : 'border-slate-300 shadow-2xs'
                      }`}
                      title="Nhấp để xem thông tin chi tiết hoặc chuyển đến công việc xử lý"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {!alert.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping" title="Chưa xử lý" />
                          )}
                          <p className={`font-bold text-[11px] truncate ${severityMeta.textColor}`}>
                            {alert.title}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 shrink-0 whitespace-nowrap">
                          {alert.timestamp.substring(11, 16) || alert.timestamp}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {alert.message}
                      </p>

                      {/* Footer row with target link & direct jump button */}
                      <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between gap-1 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${moduleMeta.badgeBg} ${moduleMeta.badgeText} ${moduleMeta.borderColor} flex items-center gap-1 shrink-0`}>
                          <span>{moduleMeta.name}</span>
                          {alert.actionId && <span className="font-mono">#{alert.actionId}</span>}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertNavigate(alert);
                            }}
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1 shadow-2xs group-hover:bg-blue-700"
                            title="Chuyển ngay đến công việc hoặc phân hệ xử lý"
                          >
                            <span>Đến việc</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Helper footer */}
            <div className="px-2.5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
              <span className="flex items-center gap-1">
                <span>💡</span> Nhấp cảnh báo để xem thông tin
              </span>
              <span className="text-blue-600 font-bold">Tự động đồng bộ</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <button 
              onClick={() => handleNav('tasks')}
              className="bg-blue-600 text-white p-2 rounded text-[10px] font-bold uppercase hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tạo công việc</span>
            </button>
            <button 
              onClick={() => handleNav('reports')}
              className="bg-slate-700 text-white p-2 rounded text-[10px] font-bold uppercase hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
