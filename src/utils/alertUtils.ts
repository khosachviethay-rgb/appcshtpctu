export interface AlertModuleMeta {
  tab: string;
  name: string;
  categoryName: string;
  actionText: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: 'Wrench' | 'CheckSquare' | 'Zap' | 'Droplets' | 'Wind' | 'Flame' | 'Building2' | 'Package' | 'ShieldCheck' | 'FileText' | 'AlertTriangle';
}

export const normalizeAlertModule = (module?: string): string => {
  if (!module) return 'dashboard';
  const m = module.toLowerCase().trim();
  if (m === 'repair' || m === 'repairs' || m === 'ticket' || m === 'tickets') return 'repairs';
  if (m === 'task' || m === 'tasks') return 'tasks';
  if (m === 'electric' || m === 'electricity') return 'electric';
  if (m === 'water') return 'water';
  if (m === 'hvac' || m === 'ac') return 'hvac';
  if (m === 'pccc' || m === 'fire') return 'pccc';
  if (m === 'infrastructure' || m === 'infra') return 'infrastructure';
  if (m === 'inventory' || m === 'warehouse') return 'inventory';
  if (m === 'device' || m === 'devices') return 'devices';
  if (m === 'accounts' || m === 'account' || m === 'rbac' || m === 'proposal' || m === 'proposals') return 'accounts';
  if (m === 'report' || m === 'reports') return 'reports';
  if (m === 'budget') return 'budget';
  if (m === 'building' || m === 'buildings') return 'buildings';
  if (m === 'audit' || m === 'logs') return 'audit';
  return 'dashboard';
};

export const getAlertModuleMeta = (module?: string, actionId?: string): AlertModuleMeta => {
  const m = (module || '').toLowerCase().trim();

  if (m === 'repair' || m === 'repairs' || m === 'ticket' || m === 'tickets') {
    return {
      tab: 'repairs',
      name: 'Yêu cầu sửa chữa',
      categoryName: 'Phiếu sửa chữa cơ sở hạ tầng',
      actionText: actionId ? `Mở phiếu #${actionId}` : 'Đến danh sách Phiếu sửa chữa',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-700',
      borderColor: 'border-orange-200',
      iconName: 'Wrench',
    };
  }

  if (m === 'tasks' || m === 'task') {
    return {
      tab: 'tasks',
      name: 'Lịch công việc kỹ thuật',
      categoryName: 'Nhiệm vụ & Bảo trì kỹ thuật viên',
      actionText: actionId ? `Mở công việc #${actionId}` : 'Đến Lịch công việc kỹ thuật',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      borderColor: 'border-blue-200',
      iconName: 'CheckSquare',
    };
  }

  if (m === 'electric' || m === 'electricity') {
    return {
      tab: 'electric',
      name: 'Hệ thống Điện & TBA',
      categoryName: 'Giám sát chỉ số & Cảnh báo quá tải điện',
      actionText: 'Đến Giám sát Hệ thống Điện',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      borderColor: 'border-amber-200',
      iconName: 'Zap',
    };
  }

  if (m === 'water') {
    return {
      tab: 'water',
      name: 'Hệ thống Nước & Bơm',
      categoryName: 'Mực nước bể chứa & Cảnh báo rò rỉ',
      actionText: 'Đến Giám sát Hệ thống Nước',
      badgeBg: 'bg-cyan-50',
      badgeText: 'text-cyan-700',
      borderColor: 'border-cyan-200',
      iconName: 'Droplets',
    };
  }

  if (m === 'hvac' || m === 'ac') {
    return {
      tab: 'hvac',
      name: 'Điều hòa & Thông gió (HVAC)',
      categoryName: 'Hồ sơ máy lạnh & Lịch bảo trì định kỳ',
      actionText: actionId ? `Kiểm tra thiết bị #${actionId}` : 'Đến Phân hệ Điều hòa HVAC',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-700',
      borderColor: 'border-sky-200',
      iconName: 'Wind',
    };
  }

  if (m === 'pccc' || m === 'fire') {
    return {
      tab: 'pccc',
      name: 'PCCC & Bình chữa cháy',
      categoryName: 'Kiểm định PCCC & Bơm chữa cháy',
      actionText: actionId ? `Kiểm tra thiết bị #${actionId}` : 'Đến Phân hệ PCCC',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      borderColor: 'border-rose-200',
      iconName: 'Flame',
    };
  }

  if (m === 'infrastructure' || m === 'infra') {
    return {
      tab: 'infrastructure',
      name: 'Hạ tầng & Xây dựng',
      categoryName: 'Sự cố xây dựng & Kiến trúc',
      actionText: 'Đến Sự cố Hạ tầng Xây dựng',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      iconName: 'Building2',
    };
  }

  if (m === 'inventory' || m === 'warehouse') {
    return {
      tab: 'inventory',
      name: 'Kho vật tư & Linh kiện',
      categoryName: 'Tồn kho & Dự trù vật tư',
      actionText: 'Đến Kho vật tư kỹ thuật',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
      borderColor: 'border-purple-200',
      iconName: 'Package',
    };
  }

  if (m === 'devices' || m === 'device') {
    return {
      tab: 'devices',
      name: 'Hồ sơ thiết bị kỹ thuật',
      categoryName: 'Danh mục thiết bị kỹ thuật cơ sở',
      actionText: actionId ? `Xem hồ sơ #${actionId}` : 'Đến Danh mục Thiết bị',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-700',
      borderColor: 'border-indigo-200',
      iconName: 'Wrench',
    };
  }

  if (m === 'accounts' || m === 'proposals' || m === 'proposal' || m === 'rbac') {
    return {
      tab: 'accounts',
      name: 'Quản trị Dữ liệu & Phân quyền',
      categoryName: 'Đề xuất cập nhật Dữ liệu gốc',
      actionText: 'Đến Duyệt đề xuất dữ liệu gốc',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-800',
      borderColor: 'border-slate-300',
      iconName: 'ShieldCheck',
    };
  }

  return {
    tab: 'dashboard',
    name: 'Tổng quan hệ thống',
    categoryName: 'Thông tin cảnh báo chung',
    actionText: 'Về Dashboard tổng quan',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    borderColor: 'border-slate-200',
    iconName: 'AlertTriangle',
  };
};

export interface AlertSeverityMeta {
  label: string;
  badgeClass: string;
  cardBorderClass: string;
  cardBgClass: string;
  textColor: string;
  pillColor: string;
}

export const getAlertSeverityMeta = (severity: string): AlertSeverityMeta => {
  switch (severity) {
    case 'red':
      return {
        label: 'Khẩn cấp / Sự cố',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        cardBorderClass: 'border-l-red-500',
        cardBgClass: 'bg-red-50/40 hover:bg-red-50/80',
        textColor: 'text-red-900',
        pillColor: 'bg-red-600 text-white',
      };
    case 'orange':
      return {
        label: 'Cảnh báo cao / Quá hạn',
        badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
        cardBorderClass: 'border-l-orange-500',
        cardBgClass: 'bg-orange-50/40 hover:bg-orange-50/80',
        textColor: 'text-orange-900',
        pillColor: 'bg-orange-600 text-white',
      };
    case 'yellow':
      return {
        label: 'Cần bảo trì / Tồn kho',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        cardBorderClass: 'border-l-amber-500',
        cardBgClass: 'bg-amber-50/40 hover:bg-amber-50/80',
        textColor: 'text-amber-900',
        pillColor: 'bg-amber-600 text-white',
      };
    case 'blue':
      return {
        label: 'Yêu cầu mới',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        cardBorderClass: 'border-l-blue-500',
        cardBgClass: 'bg-blue-50/40 hover:bg-blue-50/80',
        textColor: 'text-blue-900',
        pillColor: 'bg-blue-600 text-white',
      };
    case 'green':
      return {
        label: 'Hoàn thành / Nghiệm thu',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        cardBorderClass: 'border-l-emerald-500',
        cardBgClass: 'bg-emerald-50/40 hover:bg-emerald-50/80',
        textColor: 'text-emerald-900',
        pillColor: 'bg-emerald-600 text-white',
      };
    default:
      return {
        label: 'Thông báo',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        cardBorderClass: 'border-l-slate-400',
        cardBgClass: 'bg-slate-50/50 hover:bg-slate-100',
        textColor: 'text-slate-900',
        pillColor: 'bg-slate-600 text-white',
      };
  }
};
