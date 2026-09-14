import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Search, Bell, Plus, Shield, User,
  ChevronDown, CheckCircle2, AlertTriangle, Clock, X,
  Settings, LogOut, Lock, UserCheck, Key, ArrowRight, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { UserProfileModal } from './UserProfileModal';
import { getAlertModuleMeta, getAlertSeverityMeta } from '../utils/alertUtils';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch?: () => void;
  onOpenNewTicket?: () => void;
  onOpenQuickTicketModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onOpenSearch, 
  onOpenNewTicket,
  onOpenQuickTicketModal 
}) => {
  const { 
    currentUser, setCurrentUser, users, currentTab, setCurrentTab,
    alerts, markAlertRead, markAllAlertsRead, openAlertDetail, navigateToAlertTarget,
    setIsSearchModalOpen, logout 
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isAlertMenuOpen, setIsAlertMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const alertMenuRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  const unreadAlerts = (alerts || []).filter(a => a && !a.isRead);

  // Trigger ticket modal
  const handleOpenTicket = () => {
    if (onOpenNewTicket) onOpenNewTicket();
    else if (onOpenQuickTicketModal) onOpenQuickTicketModal();
  };

  const handleOpenSearchModal = () => {
    if (onOpenSearch) onOpenSearch();
    else setIsSearchModalOpen(true);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
      if (alertMenuRef.current && !alertMenuRef.current.contains(event.target as Node)) {
        setIsAlertMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleOpenSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Formatted date string: Thứ..., dd/mm/yyyy
  const todayFormatted = (() => {
    const d = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[d.getDay()];
    const date = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${dayName}, ${date}/${month}/${year}`;
  })();

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Điều Hành Tổng Quan';
      case 'buildings': return 'Hạ Tầng 8 Khu Nhà & Phòng Học';
      case 'electric': return 'Chỉ Số Điện & Trạm Biến Áp';
      case 'water': return 'Hệ Thống Nước & Bể Chứa';
      case 'hvac': return 'Hệ Thống Điều Hòa Không Khí';
      case 'pccc': return 'An Toàn Phòng Cháy Chữa Cháy';
      case 'infrastructure': return 'Cơ Sở Hạ Tầng Xây Dựng';
      case 'devices': return 'Danh Mục Thiết Bị & Mã QR';
      case 'repairs': 
      case 'repair': return 'Phiếu Yêu Cầu Sửa Chữa';
      case 'tasks': return 'Quản Lý Công Việc Kỹ Thuật';
      case 'inventory': return 'Kho Vật Tư & Phụ Tùng';
      case 'budget': return 'Dự Toán & Ngân Sách Vận Hành';
      case 'reports': return 'Báo Cáo Kỹ Thuật & Hành Chính';
      case 'audit': return 'Nhật Ký Hoạt Động & Kiểm Toán';
      case 'accounts': return 'Phân Quyền RBAC & Quản Trị Tài Khoản';
      default: return 'Quản Lý Hạ Tầng & Kỹ Thuật';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-xs shrink-0 z-20">
      {/* Left: Mobile Toggle & High Density Heading */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-tighter truncate flex items-center gap-2">
            <span>HỆ THỐNG QUẢN LÝ HẠ TẦNG & VẬN HÀNH KỸ THUẬT</span>
            <span className="hidden md:inline-block text-slate-300 font-normal">|</span>
            <span className="hidden md:inline-block text-xs font-semibold text-blue-600 tracking-normal capitalize">
              {getTabLabel(currentTab)}
            </span>
          </h2>
        </div>
      </div>

      {/* Right Side: High Density Date, Actions & Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        {/* Date and Manager Banner */}
        <div className="text-xs text-right leading-tight border-r border-slate-200 pr-3 sm:pr-4 hidden sm:block">
          <p className="text-slate-500 font-medium text-[11px]">
            Hôm nay: <span className="text-slate-800 font-semibold">{todayFormatted}</span>
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded text-white ${
              currentUser.tier === 1 ? 'bg-blue-600' :
              currentUser.tier === 2 ? 'bg-amber-600' :
              currentUser.tier === 3 ? 'bg-emerald-600' :
              currentUser.tier === 4 ? 'bg-indigo-600' : 'bg-purple-600'
            }`}>
              Cấp {currentUser.tier}
            </span>
            <p className="text-blue-700 font-bold text-[11px] truncate">
              {currentUser.name}
            </p>
          </div>
        </div>

        {/* Quick Search Button */}
        <button
          onClick={handleOpenSearchModal}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
          title="Tìm kiếm nhanh (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px]">Tìm nhanh</span>
          <kbd className="px-1 text-[9px] font-mono bg-white rounded border border-slate-300 text-slate-500">
            Ctrl+K
          </kbd>
        </button>

        {/* New Ticket Quick Button */}
        <button
          onClick={handleOpenTicket}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-2xs"
          title="Tạo phiếu yêu cầu sửa chữa"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px] uppercase tracking-tight">+ Yêu cầu sửa chữa</span>
        </button>

        {/* Notifications Icon Button */}
        <div className="relative" ref={alertMenuRef}>
          <button
            onClick={() => setIsAlertMenuOpen(!isAlertMenuOpen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 text-sm relative transition-colors"
            title="Cảnh báo hệ thống"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown */}
          {isAlertMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 bg-red-50/90 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-red-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Cảnh báo hệ thống ({unreadAlerts.length})
                </span>
                {unreadAlerts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAlertsRead()}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Đã đọc hết
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1 space-y-1">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                    <span>Không có cảnh báo mới nào</span>
                  </div>
                ) : (
                  alerts.slice(0, 8).map((alert, idx) => {
                    const moduleMeta = getAlertModuleMeta(alert.actionModule, alert.actionId);
                    const severityMeta = getAlertSeverityMeta(alert.severity);

                    return (
                      <div 
                        key={`${alert.id || 'alt'}-${idx}`}
                        onClick={() => {
                          openAlertDetail(alert);
                          setIsAlertMenuOpen(false);
                        }}
                        className={`p-2.5 hover:bg-slate-50 transition-all cursor-pointer rounded border-l-4 ${severityMeta.cardBorderClass} ${
                          alert.isRead ? 'bg-white opacity-85' : 'bg-slate-50/80 shadow-2xs'
                        }`}
                        title="Nhấp để xem chi tiết cảnh báo"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {!alert.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                            )}
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {alert.title}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0">
                            {alert.timestamp.substring(11, 16) || alert.timestamp}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {alert.message}
                        </p>

                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${moduleMeta.badgeBg} ${moduleMeta.badgeText} ${moduleMeta.borderColor} truncate max-w-[150px]`}>
                            {moduleMeta.name} {alert.actionId ? `#${alert.actionId}` : ''}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToAlertTarget(alert);
                              setIsAlertMenuOpen(false);
                            }}
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                            title="Chuyển ngay đến công việc hoặc phân hệ"
                          >
                            <span>Đến việc</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setIsAlertMenuOpen(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                >
                  Xem trên Bảng điều khiển →
                </button>
                <span className="text-slate-400">Đồng bộ tức thời</span>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
            title="Đổi vai trò người dùng (Mô phỏng 5 cấp quyền)"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Cấp {currentUser.tier}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden text-xs">
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Chuyển đổi tài khoản (RBAC)</div>
                  <div className="font-bold text-xs mt-0.5">5 Cấp Quản trị ĐH Phan Châu Trinh</div>
                </div>
                <Shield className="w-4 h-4 text-blue-400" />
              </div>

              <div className="p-1 space-y-0.5 max-h-72 overflow-y-auto">
                {users.map(u => {
                  const isLocked = u.status === 'locked';

                  return (
                    <button
                      key={u.id}
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) {
                          setCurrentUser(u);
                          setIsRoleMenuOpen(false);
                        }
                      }}
                      className={`w-full text-left p-2 rounded flex items-center justify-between transition-colors ${
                        currentUser.id === u.id 
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' 
                          : isLocked
                          ? 'opacity-50 cursor-not-allowed bg-slate-50'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1 rounded text-white shrink-0 ${
                            u.tier === 1 ? 'bg-blue-600' :
                            u.tier === 2 ? 'bg-amber-600' :
                            u.tier === 3 ? 'bg-emerald-600' :
                            u.tier === 4 ? 'bg-indigo-600' : 'bg-purple-600'
                          }`}>
                            Cấp {u.tier}
                          </span>
                          <span className="text-xs font-semibold truncate">{u.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {u.title} • {u.department}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isLocked ? (
                          <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Khóa
                          </span>
                        ) : currentUser.id === u.id ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-200 bg-slate-50 space-y-1">
                <button
                  onClick={() => {
                    setIsRoleMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-slate-700 hover:text-blue-700 hover:bg-slate-100 p-1.5 rounded transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Hồ sơ cá nhân & Đổi mật khẩu
                  </span>
                  <Key className="w-3 h-3 text-slate-400" />
                </button>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setCurrentTab('accounts');
                      setIsRoleMenuOpen(false);
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Quản lý tài khoản & phân quyền →
                  </button>

                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Button */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-full transition-all group"
          title="Xem hồ sơ cá nhân & Đổi mật khẩu"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform">
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="text-left hidden lg:block">
            <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
              {currentUser.displayName || currentUser.name}
            </div>
          </div>
        </button>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </header>
  );
};
