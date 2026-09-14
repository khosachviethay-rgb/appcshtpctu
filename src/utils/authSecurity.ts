import { UserProfile, UserRole, PermissionAction, RoleDefinition } from '../types';

/**
 * Normalize username, stripping leading '@' and whitespace
 */
export function normalizeUsername(username?: string): string {
  if (!username) return '';
  return username.trim().toLowerCase().replace(/^@+/, '');
}

/**
 * Check if the user is the Super Admin (Thầy Trương Công Hiển)
 */
export function isSuperAdmin(userOrRole: UserProfile | UserRole | null | undefined): boolean {
  if (!userOrRole) return false;
  if (typeof userOrRole === 'string') {
    const r = userOrRole.toUpperCase();
    return r === 'SUPER_ADMIN' || r === 'ADMIN_LEAD';
  }
  const cleanUsername = normalizeUsername(userOrRole.username);
  return (
    cleanUsername === 'truongconghien' ||
    userOrRole.role === 'SUPER_ADMIN' ||
    userOrRole.role === 'admin_lead' ||
    userOrRole.tier === 1
  );
}

/**
 * Hash password with salt using SHA-256 to ensure passwords are not stored in plaintext
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = 'PCTU_INFRA_SALT_2026';
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText + salt);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback to deterministic hash
    }
  }
  
  // Deterministic fallback hash matching quickHashSync
  return quickHashSync(plainText);
}

/**
 * Synchronous hash helper for initial static state initialization
 */
export function quickHashSync(plainText: string): string {
  const salt = 'PCTU_INFRA_SALT_2026';
  let hash = 0;
  const str = plainText + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'pctu_hash_' + Math.abs(hash).toString(16).padStart(12, '0');
}

/**
 * Verify if raw password matches stored hash or standard demo passwords
 */
export async function verifyPassword(password: string, storedHash?: string): Promise<boolean> {
  if (!password) return false;
  
  // Direct plaintext match (during migrations or legacy data)
  if (storedHash && password === storedHash) return true;

  // Compute hashes
  const syncComputed = quickHashSync(password);
  if (storedHash && syncComputed === storedHash) return true;

  // Unpadded sync variant
  const salt = 'PCTU_INFRA_SALT_2026';
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const unpadded = 'pctu_hash_' + Math.abs(hash).toString(16);
  if (storedHash && unpadded === storedHash) return true;

  try {
    const shaComputed = await hashPassword(password);
    if (storedHash && shaComputed === storedHash) return true;
  } catch {
    // Ignore web crypto error
  }

  // Pre-configured passwords for demo users at PCTU
  const knownCredentials: Record<string, string[]> = {
    'hien123': ['user_hien', 'truongconghien', quickHashSync('hien123'), unpadded],
    'huy123': ['user_huy', 'nguyendinhhuy', quickHashSync('huy123'), unpadded],
    'hoan123': ['user_hoan', 'nguyenthihoan', quickHashSync('hoan123'), unpadded],
    'minh123': ['user_minh', 'nguyenvanminh', quickHashSync('minh123'), unpadded],
    'khoa123': ['user_khoa', 'khoayduoc', quickHashSync('khoa123'), unpadded],
    'pctu123': ['common_default'],
    '123456': ['common_default'],
  };

  if (knownCredentials[password]) {
    // If entered password matches any known default hash
    if (!storedHash || storedHash === quickHashSync(password) || storedHash === unpadded) {
      return true;
    }
  }

  return false;
}

/**
 * All Standard Functional Permissions in RBAC
 */
export const ALL_PERMISSION_ACTIONS: { action: PermissionAction; label: string; description: string }[] = [
  { action: 'VIEW', label: 'Xem', description: 'Xem thông tin, bảng biểu và danh sách' },
  { action: 'CREATE', label: 'Tạo', description: 'Tạo mới bản ghi, phiếu hoặc thiết bị' },
  { action: 'EDIT', label: 'Sửa', description: 'Chỉnh sửa và cập nhật dữ liệu' },
  { action: 'DELETE', label: 'Xóa', description: 'Xóa dữ liệu (bảo vệ master data)' },
  { action: 'APPROVE', label: 'Phê duyệt', description: 'Duyệt đề xuất, nghiệm thu và quyết toán' },
  { action: 'ASSIGN', label: 'Phân công', description: 'Giao việc, điều phối kỹ thuật viên' },
  { action: 'EXPORT', label: 'Xuất dữ liệu', description: 'Xuất báo cáo Excel, PDF, CSV' },
  { action: 'MANAGE', label: 'Quản trị toàn bộ', description: 'Toàn quyền điều khiển module này' },
];

/**
 * All System Modules for Granular RBAC
 */
export const ALL_SYSTEM_MODULES = [
  { id: 'dashboard', name: 'Dashboard Điều Hành' },
  { id: 'buildings', name: 'Khu Nhà & Phòng Học (Master Data)' },
  { id: 'devices', name: 'Thiết Bị & Mã QR' },
  { id: 'electric', name: 'Hệ Thống Điện & TBA' },
  { id: 'water', name: 'Hệ Thống Nước & Bơm' },
  { id: 'hvac', name: 'Điều Hòa Không Khí' },
  { id: 'pccc', name: 'Phòng Cháy Chữa Cháy' },
  { id: 'infrastructure', name: 'Hạ Tầng Xây Dựng' },
  { id: 'repairs', name: 'Yêu Cầu Sửa Chữa' },
  { id: 'tasks', name: 'Công Việc Kỹ Thuật' },
  { id: 'inventory', name: 'Kho Vật Tư & Phụ Tùng' },
  { id: 'budget', name: 'Ngân Sách & Dự Toán' },
  { id: 'reports', name: 'Báo Cáo Kỹ Thuật' },
  { id: 'accounts', name: 'Quản Trị Người Dùng & RBAC' },
  { id: 'audit', name: 'Nhật Ký Kiểm Toán (Audit Log)' },
];

/**
 * Standard Default Role Definitions
 */
export const DEFAULT_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'role_super_admin',
    code: 'SUPER_ADMIN',
    name: 'SUPER ADMIN / Quản trị viên cao nhất',
    description: 'Toàn quyền tối cao đối với toàn bộ hệ thống, quản trị RBAC, chỉnh sửa dữ liệu gốc Master Data',
    tier: 1,
    isSystem: true,
    defaultPermissions: {
      dashboard: ['VIEW', 'EXPORT', 'MANAGE'],
      buildings: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      devices: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      electric: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      water: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      hvac: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      pccc: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      infrastructure: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      repairs: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'ASSIGN', 'EXPORT', 'MANAGE'],
      tasks: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'ASSIGN', 'EXPORT', 'MANAGE'],
      inventory: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'MANAGE'],
      budget: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'MANAGE'],
      reports: ['VIEW', 'CREATE', 'EDIT', 'EXPORT', 'MANAGE'],
      accounts: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'ASSIGN', 'EXPORT', 'MANAGE'],
      audit: ['VIEW', 'EXPORT', 'MANAGE'],
    }
  },
  {
    id: 'role_admin',
    code: 'ADMIN',
    name: 'Quản trị viên Hệ thống (Admin)',
    description: 'Quản trị vận hành hệ thống, hỗ trợ cấu hình và điều phối',
    tier: 1,
    isSystem: true,
    defaultPermissions: {
      dashboard: ['VIEW', 'EXPORT'],
      buildings: ['VIEW', 'EDIT', 'EXPORT'],
      devices: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'],
      electric: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'],
      water: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'],
      hvac: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'],
      pccc: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'],
      infrastructure: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'],
      repairs: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'ASSIGN', 'EXPORT'],
      tasks: ['VIEW', 'CREATE', 'EDIT', 'ASSIGN', 'EXPORT'],
      inventory: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'],
      budget: ['VIEW', 'EXPORT'],
      reports: ['VIEW', 'EXPORT'],
      accounts: ['VIEW'],
      audit: ['VIEW', 'EXPORT'],
    }
  },
  {
    id: 'role_to_truong',
    code: 'TO_TRUONG',
    name: 'Tổ trưởng Kỹ thuật & CSHT',
    description: 'Chỉ huy vận hành cơ sở hạ tầng, phân công công việc kỹ thuật, phê duyệt đề xuất',
    tier: 1,
    isSystem: true,
    defaultPermissions: {
      dashboard: ['VIEW', 'EXPORT', 'MANAGE'],
      buildings: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      devices: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      electric: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      water: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      hvac: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      pccc: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      infrastructure: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      repairs: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'ASSIGN', 'EXPORT', 'MANAGE'],
      tasks: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'ASSIGN', 'EXPORT', 'MANAGE'],
      inventory: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'MANAGE'],
      budget: ['VIEW', 'CREATE', 'EDIT', 'EXPORT', 'MANAGE'],
      reports: ['VIEW', 'CREATE', 'EDIT', 'EXPORT', 'MANAGE'],
      accounts: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'MANAGE'],
      audit: ['VIEW', 'EXPORT'],
    }
  },
  {
    id: 'role_to_vien',
    code: 'TO_VIEN',
    name: 'Tổ viên Kỹ thuật (Technician)',
    description: 'Vận hành kỹ thuật, ghi chỉ số điện nước, xử lý sửa chữa, quét mã QR và gửi đề nghị cập nhật',
    tier: 2,
    isSystem: true,
    defaultPermissions: {
      dashboard: ['VIEW'],
      buildings: ['VIEW'],
      devices: ['VIEW', 'EDIT'],
      electric: ['VIEW', 'CREATE', 'EDIT'],
      water: ['VIEW', 'CREATE', 'EDIT'],
      hvac: ['VIEW', 'EDIT'],
      pccc: ['VIEW', 'EDIT'],
      infrastructure: ['VIEW', 'CREATE', 'EDIT'],
      repairs: ['VIEW', 'CREATE', 'EDIT'],
      tasks: ['VIEW', 'EDIT'],
      inventory: ['VIEW', 'CREATE', 'EDIT'],
      budget: ['VIEW'],
      reports: ['VIEW', 'CREATE'],
      accounts: [],
      audit: [],
    }
  },
  {
    id: 'role_hcns_manager',
    code: 'HCNS_MANAGER',
    name: 'Trưởng phòng Hành chính – Nhân sự',
    description: 'Giám sát vận hành, theo dõi tiến độ sửa chữa, quản lý tài sản chung và duyệt mua sắm',
    tier: 3,
    isSystem: true,
    defaultPermissions: {
      dashboard: ['VIEW', 'EXPORT'],
      buildings: ['VIEW', 'EXPORT'],
      devices: ['VIEW', 'EXPORT'],
      electric: ['VIEW', 'EXPORT'],
      water: ['VIEW', 'EXPORT'],
      hvac: ['VIEW', 'EXPORT'],
      pccc: ['VIEW', 'EXPORT'],
      infrastructure: ['VIEW', 'EXPORT'],
      repairs: ['VIEW', 'CREATE', 'APPROVE', 'EXPORT'],
      tasks: ['VIEW', 'EXPORT'],
      inventory: ['VIEW', 'APPROVE', 'EXPORT'],
      budget: ['VIEW', 'EXPORT'],
      reports: ['VIEW', 'EXPORT'],
      accounts: ['VIEW'],
      audit: ['VIEW', 'EXPORT'],
    }
  },
  {
    id: 'role_manager',
    code: 'MANAGER',
    name: 'Người hỗ trợ Quản lý & Giám sát',
    description: 'Hỗ trợ điều phối công việc kỹ thuật, theo dõi lịch bảo dưỡng và hỗ trợ vận hành',
    tier: 4,
    isSystem: true,
    defaultPermissions: {
      dashboard: ['VIEW'],
      buildings: ['VIEW'],
      devices: ['VIEW'],
      electric: ['VIEW'],
      water: ['VIEW'],
      hvac: ['VIEW'],
      pccc: ['VIEW'],
      infrastructure: ['VIEW'],
      repairs: ['VIEW', 'CREATE', 'EDIT'],
      tasks: ['VIEW', 'EDIT'],
      inventory: ['VIEW'],
      budget: ['VIEW'],
      reports: ['VIEW'],
      accounts: [],
      audit: ['VIEW'],
    }
  },
  {
    id: 'role_technician',
    code: 'TECHNICIAN',
    name: 'Kỹ thuật viên Vận hành',
    description: 'Thực hiện công việc bảo trì, sửa chữa, thay thế vật tư và báo cáo ca làm việc',
    tier: 2,
    isSystem: true,
    defaultPermissions: {
      dashboard: ['VIEW'],
      buildings: ['VIEW'],
      devices: ['VIEW', 'EDIT'],
      electric: ['VIEW', 'CREATE', 'EDIT'],
      water: ['VIEW', 'CREATE', 'EDIT'],
      hvac: ['VIEW', 'EDIT'],
      pccc: ['VIEW', 'EDIT'],
      infrastructure: ['VIEW', 'CREATE', 'EDIT'],
      repairs: ['VIEW', 'CREATE', 'EDIT'],
      tasks: ['VIEW', 'EDIT'],
      inventory: ['VIEW', 'CREATE', 'EDIT'],
      budget: ['VIEW'],
      reports: ['VIEW', 'CREATE'],
      accounts: [],
      audit: [],
    }
  },
  {
    id: 'role_department_user',
    code: 'DEPARTMENT_USER',
    name: 'Cán bộ / Phòng ban / Giảng viên',
    description: 'Gửi yêu cầu sửa chữa cơ sở vật chất, theo dõi tiến độ xử lý và nghiệm thu',
    tier: 5,
    isSystem: true,
    defaultPermissions: {
      dashboard: ['VIEW'],
      buildings: ['VIEW'],
      devices: ['VIEW'],
      repairs: ['VIEW', 'CREATE'],
      electric: [],
      water: [],
      hvac: [],
      pccc: [],
      infrastructure: ['VIEW'],
      tasks: [],
      inventory: [],
      budget: [],
      reports: [],
      accounts: [],
      audit: [],
    }
  },
  {
    id: 'role_viewer',
    code: 'VIEWER',
    name: 'Người xem (Chỉ xem)',
    description: 'Chỉ có quyền xem thông tin tra cứu, không được thêm sửa xóa dữ liệu',
    tier: 5,
    isSystem: true,
    defaultPermissions: {
      dashboard: ['VIEW'],
      buildings: ['VIEW'],
      devices: ['VIEW'],
      electric: ['VIEW'],
      water: ['VIEW'],
      hvac: ['VIEW'],
      pccc: ['VIEW'],
      infrastructure: ['VIEW'],
      repairs: ['VIEW'],
      tasks: ['VIEW'],
      inventory: ['VIEW'],
      budget: ['VIEW'],
      reports: ['VIEW'],
      accounts: [],
      audit: [],
    }
  },
];

/**
 * Find default permissions for a role code
 */
export function getDefaultRolePermissions(roleCode: string): Record<string, PermissionAction[]> {
  const norm = (roleCode || '').toUpperCase();
  
  // Aliases
  let searchCode = norm;
  if (norm === 'ADMIN_LEAD') searchCode = 'SUPER_ADMIN';
  else if (norm === 'TECH_STAFF' || norm === 'TECHNICAL_STAFF') searchCode = 'TO_VIEN';
  else if (norm === 'MANAGER_HR') searchCode = 'HCNS_MANAGER';
  else if (norm === 'MANAGER_ASSIST') searchCode = 'MANAGER';

  const found = DEFAULT_ROLE_DEFINITIONS.find(r => r.code === searchCode);
  if (found) return found.defaultPermissions;

  return DEFAULT_ROLE_DEFINITIONS[DEFAULT_ROLE_DEFINITIONS.length - 1].defaultPermissions;
}

/**
 * Check if the user has master data editing rights (Only Cấp 1 - Thầy Trương Công Hiển)
 */
export function canEditMasterData(userOrRole: UserProfile | UserRole | null | undefined): boolean {
  return isSuperAdmin(userOrRole);
}

/**
 * Check if user can submit proposals for master data changes (Cấp 2, 3, 4, 5)
 */
export function canSubmitProposal(userOrRole: UserProfile | UserRole | null | undefined): boolean {
  if (!userOrRole) return false;
  return !isSuperAdmin(userOrRole);
}

/**
 * Check if user can manage user accounts and RBAC (Only Super Admin / Thầy Trương Công Hiển)
 */
export function canManageAccounts(userOrRole: UserProfile | UserRole | null | undefined): boolean {
  if (!userOrRole) return false;
  if (isSuperAdmin(userOrRole)) return true;
  if (typeof userOrRole === 'object') {
    const perm = userOrRole.permissions?.['accounts'];
    return !!perm && (perm.includes('MANAGE') || perm.includes('EDIT'));
  }
  return false;
}

/**
 * Check if a user has a specific granular action permission on a module
 */
export function hasPermission(
  user: UserProfile | null | undefined, 
  moduleId: string, 
  action: PermissionAction
): boolean {
  if (!user) return false;
  if (user.status === 'locked' || user.status === 'disabled') return false;

  // Super Admin has full permission for everything
  if (isSuperAdmin(user)) return true;

  // Normalize module key (e.g. repairs/repair)
  const normModule = moduleId === 'repair' ? 'repairs' : moduleId;

  // 1. Check user-level granular permission overrides
  if (user.permissions && user.permissions[normModule]) {
    const userModulePerms = user.permissions[normModule];
    if (userModulePerms.includes('MANAGE')) return true;
    return userModulePerms.includes(action);
  }

  // 2. Check role-level default permissions
  const rolePerms = getDefaultRolePermissions(user.role);
  const modulePerms = rolePerms[normModule];
  if (!modulePerms) return false;

  if (modulePerms.includes('MANAGE')) return true;
  return modulePerms.includes(action);
}

/**
 * Check whether a user or role has access to view/use a specific module in the system
 */
export function canAccessModule(userOrRole: UserProfile | UserRole | null | undefined, moduleId: string): boolean {
  if (!userOrRole) return false;

  // If passed role string
  if (typeof userOrRole === 'string') {
    if (userOrRole === 'admin_lead' || userOrRole.toUpperCase() === 'SUPER_ADMIN') return true;
    const rolePerms = getDefaultRolePermissions(userOrRole);
    const normMod = moduleId === 'repair' ? 'repairs' : moduleId;
    const perms = rolePerms[normMod];
    return Array.isArray(perms) && perms.length > 0;
  }

  // If passed UserProfile object
  if (isSuperAdmin(userOrRole)) return true;
  if (userOrRole.status === 'locked' || userOrRole.status === 'disabled') return false;

  const normMod = moduleId === 'repair' ? 'repairs' : moduleId;
  return hasPermission(userOrRole, normMod, 'VIEW');
}

