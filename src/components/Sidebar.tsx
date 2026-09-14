import React from 'react';
import { 
  LayoutDashboard, Building2, Zap, Droplets, Wind, Flame,
  Hammer, Wrench, FileText, CheckSquare, Package, DollarSign, 
  BarChart3, ShieldCheck, X, LogOut, Users, KeyRound, Shield, Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { canAccessModule } from '../utils/authSecurity';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavGroup {
  groupName: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { 
    currentTab, setCurrentTab, repairRequests, dailyTasks, currentUser, logout, proposals,
    setIsDatabaseModalOpen, lastSavedTime, dbSaveStatus
  } = useApp();

  if (!currentUser) return null;

  const pendingRequestsCount = (repairRequests || []).filter(r => r && (r.status === 'new' || r.status === 'received')).length;
  const pendingTasksCount = (dailyTasks || []).filter(t => t && (t.status === 'pending' || t.status === 'in_progress')).length;
  const pendingProposalsCount = (proposals || []).filter(p => p && p.status === 'pending').length;

  const allNavGroups: NavGroup[] = [
    {
      groupName: 'Tổng quan',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'buildings', label: 'Khu nhà', icon: Building2 },
      ]
    },
    {
      groupName: 'Kỹ thuật & Vận hành',
      items: [
        { id: 'electric', label: 'Điện', icon: Zap },
        { id: 'water', label: 'Nước', icon: Droplets },
        { id: 'hvac', label: 'Điều hòa', icon: Wind },
        { id: 'pccc', label: 'PCCC', icon: Flame },
        { id: 'infrastructure', label: 'Hạ tầng', icon: Hammer },
        { id: 'devices', label: 'Thiết bị & QR', icon: Wrench },
      ]
    },
    {
      groupName: 'Quản lý công việc',
      items: [
        { 
          id: 'repairs', 
          label: 'Sửa chữa', 
          icon: FileText, 
          badge: pendingRequestsCount > 0 ? (pendingRequestsCount < 10 ? `0${pendingRequestsCount}` : pendingRequestsCount) : null,
          badgeColor: 'bg-red-500'
        },
        { 
          id: 'tasks', 
          label: 'Công việc', 
          icon: CheckSquare, 
          badge: pendingTasksCount > 0 ? (pendingTasksCount < 10 ? `0${pendingTasksCount}` : pendingTasksCount) : null,
          badgeColor: 'bg-amber-500'
        },
      ]
    },
    {
      groupName: 'Tài chính & Báo cáo',
      items: [
        { id: 'inventory', label: 'Vật tư', icon: Package },
        { id: 'budget', label: 'Ngân sách', icon: DollarSign },
        { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
        { id: 'audit', label: 'Nhật ký', icon: ShieldCheck },
      ]
    },
    {
      groupName: 'Quản trị hệ thống',
      items: [
        { 
          id: 'accounts', 
          label: 'Phân quyền & Tài khoản', 
          icon: Users,
          badge: currentUser.tier === 1 && pendingProposalsCount > 0 ? pendingProposalsCount : null,
          badgeColor: 'bg-blue-500'
        },
      ]
    }
  ];

  // Filter items according to the user's role in the RBAC matrix
  const navGroups = allNavGroups.map(group => ({
    ...group,
    items: group.items.filter(item => canAccessModule(currentUser, item.id))
  })).filter(group => group.items.length > 0);

  // User initials
  const initials = (currentUser?.name || 'P')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-56 bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0 border-r border-slate-800 shadow-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-950 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-white tracking-wider uppercase leading-tight">
              PHAN CHAU TRINH<br />
              <span className="text-blue-400 font-semibold text-xs tracking-normal">University Infra</span>
            </h1>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-2 text-xs divide-y divide-slate-800/40">
          {navGroups.map((group, gIdx) => (
            <div key={group.groupName} className={gIdx > 0 ? 'pt-2 mt-1' : ''}>
              <div className="px-4 py-1 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                {group.groupName}
              </div>
              <div className="space-y-0.5 mt-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id || (item.id === 'repairs' && currentTab === 'repair');

                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => handleSelectTab(item.id)}
                      className={`
                        w-full flex items-center px-4 py-2 text-xs transition-colors text-left font-medium
                        ${isActive 
                          ? 'bg-blue-600 text-white font-bold' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                      `}
                    >
                      <span className="mr-2.5 shrink-0 opacity-85">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="truncate flex-1">{item.label}</span>

                      {item.badge && (
                        <span className={`
                          ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0
                          ${item.badgeColor || 'bg-red-500'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Database Status & Center Bar */}
        <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[11px] shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className={`w-2 h-2 rounded-full shrink-0 ${dbSaveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-[11px] font-mono text-slate-300">CSDL: {lastSavedTime}</span>
          </div>
          <button
            onClick={() => setIsDatabaseModalOpen(true)}
            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Mở Trung tâm Quản trị & Đồng bộ Cơ sở dữ liệu"
          >
            <Database className="w-3 h-3 text-blue-400" />
            <span>Quản trị CSDL</span>
          </button>
        </div>

        {/* User Card with Role Badge and Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs min-w-0 flex-1 mr-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-2 shrink-0 text-xs shadow-xs ${
                currentUser.tier === 1 ? 'bg-blue-600' :
                currentUser.tier === 2 ? 'bg-amber-600' :
                currentUser.tier === 3 ? 'bg-emerald-600' :
                currentUser.tier === 4 ? 'bg-indigo-600' : 'bg-purple-600'
              }`}>
                {initials}
              </div>
              <div className="overflow-hidden min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold truncate text-white leading-tight text-xs">{currentUser.name}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[9px] font-bold px-1 rounded text-white ${
                    currentUser.tier === 1 ? 'bg-blue-600' :
                    currentUser.tier === 2 ? 'bg-amber-600' :
                    currentUser.tier === 3 ? 'bg-emerald-600' :
                    currentUser.tier === 4 ? 'bg-indigo-600' : 'bg-purple-600'
                  }`}>
                    Cấp {currentUser.tier}
                  </span>
                  <p className="text-slate-400 text-[10px] truncate">{currentUser.title}</p>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Đăng xuất tài khoản"
              className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

