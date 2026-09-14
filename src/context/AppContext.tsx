import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Building, Device, ElectricityRecord, WaterRecord, WaterInfrastructure,
  InfrastructureIssue, RepairRequest, DailyTask, MaintenanceSchedule,
  RepairHistoryItem, MaintenanceHistoryItem, InventoryItem, InventoryTransaction,
  BudgetItem, TechnicianDailyReport, AlertItem, AuditLog, UserProfile,
  MasterDataChangeLog, MasterDataProposal, UserRole, AccountStatus,
  TicketStatus, TaskStatus, PermissionAction, RoleDefinition, UserSession,
  RbacAuditLog
} from '../types';
import { 
  INITIAL_USERS, INITIAL_BUILDINGS, INITIAL_DEVICES, 
  INITIAL_ELECTRIC_RECORDS, INITIAL_WATER_RECORDS, INITIAL_WATER_INFRASTRUCTURE,
  INITIAL_INFRASTRUCTURE_ISSUES, INITIAL_REPAIR_REQUESTS, INITIAL_DAILY_TASKS,
  INITIAL_MAINTENANCE_SCHEDULES, INITIAL_REPAIR_HISTORY, INITIAL_MAINTENANCE_HISTORY,
  INITIAL_INVENTORY, INITIAL_INVENTORY_TRANSACTIONS, INITIAL_BUDGET,
  INITIAL_DAILY_REPORTS, INITIAL_ALERTS, INITIAL_AUDIT_LOGS,
  INITIAL_MASTER_DATA_LOGS, INITIAL_MASTER_DATA_PROPOSALS, INITIAL_ROLES,
  INITIAL_RBAC_AUDIT_LOGS
} from '../data/initialData';
import { 
  verifyPassword, quickHashSync, hashPassword,
  normalizeUsername, isSuperAdmin, hasPermission as checkHasPermission 
} from '../utils/authSecurity';
import { normalizeAlertModule } from '../utils/alertUtils';
import { 
  safeStorageSet, calculatePctuStorageSize, broadcastDbUpdate, DB_CHANNEL_NAME 
} from '../utils/dbSyncManager';

const STORAGE_KEY = 'PCTU_FACILITY_DATA_V2';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isAuthenticated: boolean;
  isSuperAdminUser: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginAsUser: (userId: string) => { success: boolean; message: string };
  logout: () => void;

  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  createUser: (userData: Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt'> & { rawPassword?: string }) => Promise<void>;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => void;
  updateUserPermissions: (userId: string, permissions: Record<string, PermissionAction[]>) => void;
  changePassword: (userId: string, currentPass: string, newPass: string, logoutOthers?: boolean) => Promise<{ success: boolean; message: string }>;
  resetPasswordByOTP: (usernameOrEmailOrPhone: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  logoutOtherSessions: (userId: string) => void;
  toggleLockUser: (userId: string) => void;
  setUserStatus: (userId: string, status: AccountStatus, reason?: string) => void;
  resetUserPassword: (userId: string, newPassword?: string) => Promise<string>;
  updateUserRole: (userId: string, newRole: UserRole, newTier: 1 | 2 | 3 | 4 | 5, customReason?: string) => void;
  deleteUser: (userId: string) => void;

  roles: RoleDefinition[];
  createRole: (roleData: Omit<RoleDefinition, 'id'>) => void;
  updateRolePermissions: (roleId: string, permissions: Record<string, PermissionAction[]>) => void;
  hasPermission: (moduleId: string, action: PermissionAction) => boolean;

  rbacAuditLogs: RbacAuditLog[];
  addRbacAuditLog: (logData: Omit<RbacAuditLog, 'id' | 'timestamp' | 'actorUsername' | 'actorName'>) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedBuildingId: string | null;
  setSelectedBuildingId: (id: string | null) => void;
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string | null) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedAlertForDetail: AlertItem | null;
  setSelectedAlertForDetail: (alert: AlertItem | null) => void;
  openAlertDetail: (alert: AlertItem) => void;
  closeAlertDetail: () => void;
  navigateToAlertTarget: (alert: AlertItem) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;

  // Entities
  buildings: Building[];
  devices: Device[];
  electricRecords: ElectricityRecord[];
  waterRecords: WaterRecord[];
  waterInfrastructure: WaterInfrastructure;
  infraIssues: InfrastructureIssue[];
  repairRequests: RepairRequest[];
  dailyTasks: DailyTask[];
  maintenanceSchedules: MaintenanceSchedule[];
  repairHistory: RepairHistoryItem[];
  maintenanceHistory: MaintenanceHistoryItem[];
  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  budget: BudgetItem[];
  dailyReports: TechnicianDailyReport[];
  alerts: AlertItem[];
  auditLogs: AuditLog[];
  masterDataLogs: MasterDataChangeLog[];
  proposals: MasterDataProposal[];

  // Master Data CRUD & Change History
  updateBuildingMasterData: (id: string, updates: Partial<Building>, reason: string) => void;
  updateRoomMasterData: (buildingId: string, floorNumber: number, roomId: string, updates: any, reason: string) => void;
  updateDeviceMasterData: (id: string, updates: Partial<Device>, reason: string) => void;

  // Proposals
  submitProposal: (proposalData: {
    targetType: 'building' | 'floor' | 'room' | 'device';
    targetId: string;
    targetCode: string;
    targetName: string;
    fieldName: string;
    fieldLabel: string;
    currentValue: string | number;
    proposedValue: string | number;
    reason: string;
  }) => void;
  approveProposal: (proposalId: string, reviewNotes?: string) => void;
  rejectProposal: (proposalId: string, reviewNotes?: string) => void;

  // Standard CRUD actions
  addBuilding: (building: Building) => void;
  updateBuilding: (id: string, partial: Partial<Building>) => void;
  deleteBuilding: (id: string) => void;
  addRoomToBuilding: (buildingId: string, floorNumber: number, room: any) => void;

  addDevice: (device: Device) => void;
  updateDevice: (id: string, partial: Partial<Device>) => void;
  deleteDevice: (id: string) => void;

  addElectricRecord: (record: ElectricityRecord) => void;
  addWaterRecord: (record: WaterRecord) => void;
  updateWaterTankLevel: (tankId: string, level: number) => void;
  toggleWaterPump: (pumpId: string) => void;

  addInfrastructureIssue: (issue: InfrastructureIssue) => void;
  updateInfrastructureIssue: (id: string, partial: Partial<InfrastructureIssue>) => void;

  addRepairRequest: (ticket: RepairRequest) => void;
  updateRepairRequest: (id: string, partial: Partial<RepairRequest>) => void;

  addDailyTask: (task: DailyTask) => void;
  updateDailyTask: (id: string, partial: Partial<DailyTask>) => void;
  deleteDailyTask: (id: string) => void;

  addMaintenanceSchedule: (schedule: MaintenanceSchedule) => void;
  updateMaintenanceSchedule: (id: string, partial: Partial<MaintenanceSchedule>) => void;
  executeMaintenanceNow: (scheduleId: string) => void;

  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, partial: Partial<InventoryItem>) => void;
  addInventoryTransaction: (txn: InventoryTransaction) => void;

  updateBudgetItem: (id: string, partial: Partial<BudgetItem>) => void;
  addBudgetItem: (item: BudgetItem) => void;

  addDailyReport: (report: TechnicianDailyReport) => void;
  approveDailyReport: (reportId: string, leadFeedback: string) => void;

  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  addAuditLog: (actionType: AuditLog['actionType'], entity: string, entityIdentifier: string, details: string) => void;

  resetToDefaultData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;

  // Continuous Database Management & Sync
  isDatabaseModalOpen: boolean;
  setIsDatabaseModalOpen: (open: boolean) => void;
  dbSaveStatus: 'synced' | 'saving' | 'error';
  lastSavedTime: string;
  dbStats: {
    totalRecords: number;
    storageSizeKb: number;
    tablesCount: number;
  };
  forceSyncAll: () => void;

  // Compatibility aliases
  budgetItems: BudgetItem[];
  techTasks: DailyTask[];
  addTask: (task: any) => void;
  updateTask: (id: string, partial: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function safeLoadArray<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;

    // Deduplicate and ensure all items with an 'id' have unique IDs to prevent React key collisions
    const seenIds = new Set<string>();
    const sanitized: T[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (!item) continue;
      if (typeof item === 'object' && item !== null && 'id' in item) {
        let itemId = String((item as any).id || '');
        if (!itemId || seenIds.has(itemId)) {
          itemId = `${itemId || 'item'}_${i}_${Math.random().toString(36).substring(2, 6)}`;
        }
        seenIds.add(itemId);
        sanitized.push({ ...(item as any), id: itemId });
      } else {
        sanitized.push(item);
      }
    }
    return sanitized;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial stored state or defaults with schema migration support
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if parsed users contain valid username and passwordHash
          const hasValidUsernames = parsed.every((u: any) => typeof u?.username === 'string' && u.username.length > 0);
          const hasHien = parsed.some((u: any) => u?.username === 'truongconghien' || u?.id === 'user_hien');
          if (hasValidUsernames && hasHien) {
            return parsed.map((u: any) => ({
              ...u,
              username: String(u.username || '').trim().toLowerCase(),
              passwordHash: u.passwordHash || quickHashSync('pctu123'),
              status: u.status || 'active',
              tier: u.tier || 5,
            }));
          }
        }
      } catch {
        // Fallback to initial
      }
    }
    // Auto-migrate to INITIAL_USERS if saved data is from older format
    try {
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(INITIAL_USERS));
    } catch {
      // Ignore
    }
    return INITIAL_USERS;
  });

  // Current authenticated user (persisted or null for mandatory login)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedAuth = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed && (parsed.id || parsed.username)) {
          const userList = (() => {
            try {
              const raw = localStorage.getItem(`${STORAGE_KEY}_users`);
              return raw ? JSON.parse(raw) : INITIAL_USERS;
            } catch {
              return INITIAL_USERS;
            }
          })();
          const existing = userList.find((u: UserProfile) => 
            u && (u.id === parsed.id || ((u.username || '').toLowerCase() === (parsed.username || '').toLowerCase()))
          );
          if (existing && existing.status !== 'locked') {
            return existing;
          }
        }
      } catch {
        return null;
      }
    }
    return null; // Require login
  });

  // Role definitions and customizable RBAC
  const [roles, setRoles] = useState<RoleDefinition[]>(() =>
    safeLoadArray(`${STORAGE_KEY}_roles`, INITIAL_ROLES)
  );

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_roles`, JSON.stringify(roles));
  }, [roles]);

  const isSuperAdminUser = isSuperAdmin(currentUser);

  // Continuous Database Management & Sync State
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);
  const [dbSaveStatus, setDbSaveStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  });
  const [storageSizeKb, setStorageSizeKb] = useState<number>(() => {
    return calculatePctuStorageSize(STORAGE_KEY).kb;
  });

  const recordDbCommit = (tableName: string, count?: number) => {
    const d = new Date();
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    setLastSavedTime(timeStr);
    setDbSaveStatus('synced');
    setStorageSizeKb(calculatePctuStorageSize(STORAGE_KEY).kb);
    broadcastDbUpdate(tableName, count || 0);
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState<AlertItem | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  const [buildings, setBuildings] = useState<Building[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_buildings`, INITIAL_BUILDINGS)
  );

  const [devices, setDevices] = useState<Device[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_devices`, INITIAL_DEVICES)
  );

  const [electricRecords, setElectricRecords] = useState<ElectricityRecord[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_electric`, INITIAL_ELECTRIC_RECORDS)
  );

  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_water`, INITIAL_WATER_RECORDS)
  );

  const [waterInfrastructure, setWaterInfrastructure] = useState<WaterInfrastructure>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_water_infra`);
      return saved ? JSON.parse(saved) : INITIAL_WATER_INFRASTRUCTURE;
    } catch {
      return INITIAL_WATER_INFRASTRUCTURE;
    }
  });

  const [infraIssues, setInfraIssues] = useState<InfrastructureIssue[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_infra_issues`, INITIAL_INFRASTRUCTURE_ISSUES)
  );

  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_repair_requests`, INITIAL_REPAIR_REQUESTS)
  );

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_daily_tasks`, INITIAL_DAILY_TASKS)
  );

  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_maint_schedules`, INITIAL_MAINTENANCE_SCHEDULES)
  );

  const [repairHistory, setRepairHistory] = useState<RepairHistoryItem[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_repair_history`, INITIAL_REPAIR_HISTORY)
  );

  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistoryItem[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_maint_history`, INITIAL_MAINTENANCE_HISTORY)
  );

  const [inventory, setInventory] = useState<InventoryItem[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_inventory`, INITIAL_INVENTORY)
  );

  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_inv_transactions`, INITIAL_INVENTORY_TRANSACTIONS)
  );

  const [budget, setBudget] = useState<BudgetItem[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_budget`, INITIAL_BUDGET)
  );

  const [dailyReports, setDailyReports] = useState<TechnicianDailyReport[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_daily_reports`, INITIAL_DAILY_REPORTS)
  );

  const [alerts, setAlerts] = useState<AlertItem[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_alerts`, INITIAL_ALERTS)
  );

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_audit_logs`, INITIAL_AUDIT_LOGS)
  );

  const [rbacAuditLogs, setRbacAuditLogs] = useState<RbacAuditLog[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_rbac_audit_logs`, INITIAL_RBAC_AUDIT_LOGS)
  );

  const [masterDataLogs, setMasterDataLogs] = useState<MasterDataChangeLog[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_md_logs`, INITIAL_MASTER_DATA_LOGS)
  );

  const [proposals, setProposals] = useState<MasterDataProposal[]>(() => 
    safeLoadArray(`${STORAGE_KEY}_proposals`, INITIAL_MASTER_DATA_PROPOSALS)
  );

  // Multi-Tab & Cross-Window Real-Time Database Synchronization
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (!e.key || !e.key.startsWith(STORAGE_KEY) || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (e.key === `${STORAGE_KEY}_buildings` && Array.isArray(parsed)) setBuildings(parsed);
        if (e.key === `${STORAGE_KEY}_devices` && Array.isArray(parsed)) setDevices(parsed);
        if (e.key === `${STORAGE_KEY}_electric` && Array.isArray(parsed)) setElectricRecords(parsed);
        if (e.key === `${STORAGE_KEY}_water` && Array.isArray(parsed)) setWaterRecords(parsed);
        if (e.key === `${STORAGE_KEY}_water_infra`) setWaterInfrastructure(parsed);
        if (e.key === `${STORAGE_KEY}_infra_issues` && Array.isArray(parsed)) setInfraIssues(parsed);
        if (e.key === `${STORAGE_KEY}_repair_requests` && Array.isArray(parsed)) setRepairRequests(parsed);
        if (e.key === `${STORAGE_KEY}_daily_tasks` && Array.isArray(parsed)) setDailyTasks(parsed);
        if (e.key === `${STORAGE_KEY}_maint_schedules` && Array.isArray(parsed)) setMaintenanceSchedules(parsed);
        if (e.key === `${STORAGE_KEY}_repair_history` && Array.isArray(parsed)) setRepairHistory(parsed);
        if (e.key === `${STORAGE_KEY}_maint_history` && Array.isArray(parsed)) setMaintenanceHistory(parsed);
        if (e.key === `${STORAGE_KEY}_inventory` && Array.isArray(parsed)) setInventory(parsed);
        if (e.key === `${STORAGE_KEY}_inv_transactions` && Array.isArray(parsed)) setInventoryTransactions(parsed);
        if (e.key === `${STORAGE_KEY}_budget` && Array.isArray(parsed)) setBudget(parsed);
        if (e.key === `${STORAGE_KEY}_daily_reports` && Array.isArray(parsed)) setDailyReports(parsed);
        if (e.key === `${STORAGE_KEY}_alerts` && Array.isArray(parsed)) setAlerts(parsed);
        if (e.key === `${STORAGE_KEY}_audit_logs` && Array.isArray(parsed)) setAuditLogs(parsed);
        if (e.key === `${STORAGE_KEY}_rbac_audit_logs` && Array.isArray(parsed)) setRbacAuditLogs(parsed);
        if (e.key === `${STORAGE_KEY}_md_logs` && Array.isArray(parsed)) setMasterDataLogs(parsed);
        if (e.key === `${STORAGE_KEY}_proposals` && Array.isArray(parsed)) setProposals(parsed);
        if (e.key === `${STORAGE_KEY}_users` && Array.isArray(parsed)) setUsers(parsed);
        if (e.key === `${STORAGE_KEY}_roles` && Array.isArray(parsed)) setRoles(parsed);

        const d = new Date();
        setLastSavedTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`);
        setDbSaveStatus('synced');
        setStorageSizeKb(calculatePctuStorageSize(STORAGE_KEY).kb);
      } catch (err) {
        console.warn('Lỗi khi đồng bộ sự kiện storage từ tab khác:', err);
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel(DB_CHANNEL_NAME);
        channel.onmessage = () => {
          const d = new Date();
          setLastSavedTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`);
          setStorageSizeKb(calculatePctuStorageSize(STORAGE_KEY).kb);
        };
      } catch {}
    }

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      if (channel) channel.close();
    };
  }, []);

  // Continuous Auto-Persistence to Database (LocalStorage with quota guard)
  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_users`, users);
    recordDbCommit('users', users.length);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      safeStorageSet(`${STORAGE_KEY}_current_user`, currentUser);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_md_logs`, masterDataLogs);
    recordDbCommit('masterDataLogs', masterDataLogs.length);
  }, [masterDataLogs]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_proposals`, proposals);
    recordDbCommit('proposals', proposals.length);
  }, [proposals]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_buildings`, buildings);
    recordDbCommit('buildings', buildings.length);
  }, [buildings]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_devices`, devices);
    recordDbCommit('devices', devices.length);
  }, [devices]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_electric`, electricRecords);
    recordDbCommit('electricRecords', electricRecords.length);
  }, [electricRecords]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_water`, waterRecords);
    recordDbCommit('waterRecords', waterRecords.length);
  }, [waterRecords]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_water_infra`, waterInfrastructure);
    recordDbCommit('waterInfrastructure', 1);
  }, [waterInfrastructure]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_infra_issues`, infraIssues);
    recordDbCommit('infraIssues', infraIssues.length);
  }, [infraIssues]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_repair_requests`, repairRequests);
    recordDbCommit('repairRequests', repairRequests.length);
  }, [repairRequests]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_daily_tasks`, dailyTasks);
    recordDbCommit('dailyTasks', dailyTasks.length);
  }, [dailyTasks]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_maint_schedules`, maintenanceSchedules);
    recordDbCommit('maintenanceSchedules', maintenanceSchedules.length);
  }, [maintenanceSchedules]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_repair_history`, repairHistory);
    recordDbCommit('repairHistory', repairHistory.length);
  }, [repairHistory]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_maint_history`, maintenanceHistory);
    recordDbCommit('maintenanceHistory', maintenanceHistory.length);
  }, [maintenanceHistory]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_inventory`, inventory);
    recordDbCommit('inventory', inventory.length);
  }, [inventory]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_inv_transactions`, inventoryTransactions);
    recordDbCommit('inventoryTransactions', inventoryTransactions.length);
  }, [inventoryTransactions]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_budget`, budget);
    recordDbCommit('budget', budget.length);
  }, [budget]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_daily_reports`, dailyReports);
    recordDbCommit('dailyReports', dailyReports.length);
  }, [dailyReports]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_alerts`, alerts);
    recordDbCommit('alerts', alerts.length);
  }, [alerts]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_audit_logs`, auditLogs);
    recordDbCommit('auditLogs', auditLogs.length);
  }, [auditLogs]);

  useEffect(() => {
    safeStorageSet(`${STORAGE_KEY}_rbac_audit_logs`, rbacAuditLogs);
    recordDbCommit('rbacAuditLogs', rbacAuditLogs.length);
  }, [rbacAuditLogs]);

  // Dedicated RBAC Audit Logger (Ghi lại lịch sử phân quyền, đổi role, reset mật khẩu chi tiết)
  const addRbacAuditLog = (
    logData: Omit<RbacAuditLog, 'id' | 'timestamp' | 'actorUsername' | 'actorName'>
  ) => {
    const rawActor = currentUser?.username || 'truongconghien';
    const actorUsername = rawActor.startsWith('@') ? rawActor : `@${rawActor}`;
    const actorName = currentUser?.name || 'Thầy Trương Công Hiển';

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const timestamp = `${hours}:${minutes} – ${day}/${month}/${year}`;

    const newRbacLog: RbacAuditLog = {
      id: `rbac_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      actorUsername,
      actorName,
      ...logData,
    };
    setRbacAuditLogs((prev) => [newRbacLog, ...prev]);
  };

  // Helper Audit Logger
  const addAuditLog = (
    actionType: AuditLog['actionType'],
    entity: string,
    entityIdentifier: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: currentUser?.name || 'Hệ thống Quản trị',
      actorRole: currentUser?.title || 'Quản trị viên',
      actionType,
      entity,
      entityIdentifier,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper Alert Creator
  const pushAlert = (alert: Omit<AlertItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newAlert: AlertItem = {
      ...alert,
      id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // AUTHENTICATION & LOGIN LOGIC
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const cleanUser = normalizeUsername(username);
      if (!cleanUser) {
        return { success: false, message: 'Vui lòng nhập tên đăng nhập.' };
      }

      // Find user safely by username or id
      let targetUser = users.find((u) => normalizeUsername(u?.username) === cleanUser || u?.id === cleanUser);
      
      // Fallback search in INITIAL_USERS if state is somehow missing it
      if (!targetUser) {
        const fallback = INITIAL_USERS.find((u) => normalizeUsername(u?.username) === cleanUser || u?.id === cleanUser);
        if (fallback) {
          targetUser = fallback;
          setUsers((prev) => [...prev.filter((x) => x.id !== fallback.id), fallback]);
        }
      }

      if (!targetUser) {
        return { 
          success: false, 
          message: 'Tên đăng nhập không tồn tại trên hệ thống Trường Đại học Phan Châu Trinh.' 
        };
      }

      if (targetUser.status === 'locked') {
        return { 
          success: false, 
          message: 'Tài khoản này đang bị KHÓA bởi Thầy Trương Công Hiển (Quản trị cao nhất). Vui lòng liên hệ để được mở khóa.' 
        };
      }

      if (targetUser.status === 'disabled') {
        return { 
          success: false, 
          message: 'Tài khoản này đã bị VÔ HIỆU HÓA.' 
        };
      }

      const isMatch = await verifyPassword(password, targetUser.passwordHash);
      if (!isMatch) {
        const failedCount = (targetUser.failedLoginAttempts || 0) + 1;
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser!.id ? { ...u, failedLoginAttempts: failedCount } : u))
        );

        if (failedCount >= 5) {
          return { 
            success: false, 
            message: `Mật khẩu sai liên tiếp ${failedCount} lần. Vui lòng bấm "Quên mật khẩu?" để khôi phục tài khoản.` 
          };
        }

        return { 
          success: false, 
          message: 'Mật khẩu không chính xác. Vui lòng thử lại hoặc bấm "Quên mật khẩu?".' 
        };
      }

      // Successful login -> register new active session
      const newSession: UserSession = {
        id: `sess_${Date.now()}`,
        device: 'Trình duyệt Web (Phiên hiện tại)',
        browser: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 42) : 'Chrome Web',
        ipAddress: '118.69.182.45 (PCTU Campus LAN)',
        loginAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        lastActiveAt: 'Đang hoạt động',
        isCurrent: true,
      };

      const existingSessions = (targetUser.sessions || []).map(s => ({ ...s, isCurrent: false }));
      const updatedUser: UserProfile = {
        ...targetUser,
        lastLoginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        failedLoginAttempts: 0,
        sessions: [newSession, ...existingSessions.slice(0, 4)],
      };

      setUsers((prev) => prev.map((u) => (u.id === targetUser!.id ? updatedUser : u)));
      setCurrentUser(updatedUser);

      try {
        addAuditLog('TẠO', 'Đăng nhập hệ thống', updatedUser.username, `${updatedUser.name} (${updatedUser.title}) đăng nhập thành công.`);
      } catch {
        // Safe fallback
      }
      return { success: true, message: 'Đăng nhập thành công' };
    } catch (err) {
      console.error('Login error:', err);
      return { 
        success: false, 
        message: 'Lỗi xác thực: ' + (err instanceof Error ? err.message : String(err)) 
      };
    }
  };

  const loginAsUser = (userId: string) => {
    try {
      const cleanId = normalizeUsername(userId);
      let target = users.find((u) => u && (u.id === userId || normalizeUsername(u.username) === cleanId));
      if (!target) {
        const fallback = INITIAL_USERS.find((u) => u && (u.id === userId || normalizeUsername(u.username) === cleanId));
        if (fallback) {
          target = fallback;
          setUsers((prev) => [...prev.filter((x) => x.id !== fallback.id), fallback]);
        }
      }

      if (!target) return { success: false, message: 'Không tìm thấy người dùng' };
      if (target.status === 'locked') {
        return { success: false, message: 'Tài khoản đang bị KHÓA bởi Thầy Trương Công Hiển.' };
      }

      const newSession: UserSession = {
        id: `sess_${Date.now()}`,
        device: 'Trình duyệt Web (Chuyển quyền)',
        browser: 'Web Session',
        ipAddress: '118.69.182.45',
        loginAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        lastActiveAt: 'Đang hoạt động',
        isCurrent: true,
      };

      const updated: UserProfile = {
        ...target,
        lastLoginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        failedLoginAttempts: 0,
        sessions: [newSession, ...((target.sessions || []).map(s => ({ ...s, isCurrent: false })).slice(0, 4))],
      };
      setUsers((prev) => prev.map((u) => (u.id === target!.id ? updated : u)));
      setCurrentUser(updated);
      try {
        addAuditLog('TẠO', 'Đăng nhập hệ thống', updated.username, `${updated.name} (${updated.title}) đăng nhập qua chuyển quyền nhanh.`);
      } catch {
        // Safe fallback
      }
      return { success: true, message: 'Chuyển tài khoản thành công' };
    } catch (err) {
      console.error('Quick login error:', err);
      return { success: false, message: 'Lỗi chuyển tài khoản: ' + (err instanceof Error ? err.message : String(err)) };
    }
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('CHUYỂN TRẠNG THÁI', 'Đăng xuất hệ thống', currentUser.username, `${currentUser.name} đã đăng xuất khỏi phiên làm việc.`);
    }
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY}_current_user`);
  };

  // PROFILE MANAGEMENT (Người dùng tự cập nhật thông tin cá nhân)
  const updateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        // Strip system fields that cannot be self-edited
        const sanitized = { ...updates };
        delete (sanitized as any).username;
        delete (sanitized as any).role;
        delete (sanitized as any).tier;
        delete (sanitized as any).permissions;
        delete (sanitized as any).status;
        delete (sanitized as any).passwordHash;

        return { ...u, ...sanitized };
      })
    );

    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => {
        if (!prev) return null;
        const sanitized = { ...updates };
        delete (sanitized as any).username;
        delete (sanitized as any).role;
        delete (sanitized as any).tier;
        delete (sanitized as any).permissions;
        delete (sanitized as any).status;
        delete (sanitized as any).passwordHash;
        return { ...prev, ...sanitized };
      });
    }

    addAuditLog('CẬP NHẬT', 'Hồ sơ cá nhân', userId, `Người dùng ID ${userId} đã cập nhật thông tin cá nhân.`);
  };

  // USER PERMISSIONS (Quản lý ma trận phân quyền chi tiết của từng user)
  const updateUserPermissions = (
    userId: string, 
    permissions: Record<string, PermissionAction[]>,
    customDescription?: string
  ) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const oldPerms = target.permissions || {};
    const formattedUsername = target.username.startsWith('@') ? target.username : `@${target.username}`;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return { ...u, permissions };
      })
    );

    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, permissions } : null));
    }

    addRbacAuditLog({
      targetUserId: target.id,
      targetUsername: formattedUsername,
      targetName: target.name,
      action: 'UPDATE_PERMISSION',
      oldPermissions: oldPerms,
      newPermissions: permissions,
      description: customDescription || `Thầy Trương Công Hiển đã cập nhật ma trận phân quyền chi tiết cho ${target.name}.`,
    });

    addAuditLog('CẬP NHẬT', 'Phân quyền chi tiết RBAC', target.username, `Thầy Trương Công Hiển đã cập nhật ma trận phân quyền chi tiết cho tài khoản ${target.name}`);
  };

  // CHANGE PASSWORD (Người dùng tự đổi mật khẩu cá nhân)
  const changePassword = async (
    userId: string,
    currentPass: string,
    newPass: string,
    logoutOthers = true
  ): Promise<{ success: boolean; message: string }> => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'Không tìm thấy tài khoản người dùng.' };

    const isMatch = await verifyPassword(currentPass, target.passwordHash);
    if (!isMatch) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.' };
    }

    const newHash = await hashPassword(newPass);
    const updatedSessions = logoutOthers && target.sessions
      ? target.sessions.filter((s) => s.isCurrent)
      : target.sessions;

    const updatedUser: UserProfile = {
      ...target,
      passwordHash: newHash,
      sessions: updatedSessions,
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }

    addAuditLog('CẬP NHẬT', 'Mật khẩu cá nhân', target.username, `${target.name} đã đổi mật khẩu bảo mật thành công.`);
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  // RESET PASSWORD VIA OTP (Quy trình quên mật khẩu / khôi phục)
  const resetPasswordByOTP = async (
    usernameOrEmailOrPhone: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const query = normalizeUsername(usernameOrEmailOrPhone);
    const target = users.find((u) => {
      const uNorm = normalizeUsername(u.username);
      const emailMatch = (u.email || '').trim().toLowerCase() === query;
      const phoneClean = (u.phone || '').replace(/\D/g, '');
      const queryPhoneClean = query.replace(/\D/g, '');
      return uNorm === query || emailMatch || (phoneClean.length >= 8 && phoneClean === queryPhoneClean);
    });

    if (!target) {
      return { success: false, message: 'Không tìm thấy tài khoản nào khớp với thông tin đã cung cấp.' };
    }

    const newHash = await hashPassword(newPass);
    const updatedUser: UserProfile = {
      ...target,
      passwordHash: newHash,
      failedLoginAttempts: 0,
      status: target.status === 'locked' ? 'active' : target.status,
    };

    setUsers((prev) => prev.map((u) => (u.id === target.id ? updatedUser : u)));
    addAuditLog('CẬP NHẬT', 'Khôi phục mật khẩu (OTP)', target.username, `Tài khoản ${target.name} đã đặt lại mật khẩu mới qua mã xác thực OTP.`);
    return { success: true, message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay với mật khẩu mới.' };
  };

  // LOGOUT OTHER SESSIONS
  const logoutOtherSessions = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const currentOnly = (u.sessions || []).filter((s) => s.isCurrent);
        return { ...u, sessions: currentOnly };
      })
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => prev ? { ...prev, sessions: (prev.sessions || []).filter((s) => s.isCurrent) } : null);
    }
    addAuditLog('CHUYỂN TRẠNG THÁI', 'Phiên đăng nhập', userId, `Đăng xuất khỏi tất cả thiết bị khác cho tài khoản ID: ${userId}`);
  };

  // ROLE & RBAC DEFINITIONS MANAGEMENT
  const createRole = (roleData: Omit<RoleDefinition, 'id'>) => {
    const newRole: RoleDefinition = {
      ...roleData,
      id: `role_${Date.now()}`,
    };
    setRoles((prev) => [...prev, newRole]);
    addAuditLog('TẠO', 'Vai trò & RBAC', newRole.code, `Tạo vai trò mới: ${newRole.name} (${newRole.code})`);
  };

  const updateRolePermissions = (roleId: string, permissions: Record<string, PermissionAction[]>) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId && r.code !== roleId) return r;
        return { ...r, defaultPermissions: permissions };
      })
    );
    addAuditLog('CẬP NHẬT', 'Vai trò & RBAC', roleId, `Cập nhật ma trận quyền cho vai trò ${roleId}`);
  };

  // GRANULAR PERMISSION CHECK HELPER
  const hasPermission = (moduleId: string, action: PermissionAction): boolean => {
    return checkHasPermission(currentUser, moduleId, action);
  };

  // USER MANAGEMENT (Chỉ Thầy Trương Công Hiển có thẩm quyền)
  const createUser = async (userData: Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt'> & { rawPassword?: string }) => {
    const passwordHash = userData.rawPassword 
      ? await hashPassword(userData.rawPassword) 
      : quickHashSync('pctu123');

    const cleanUsername = normalizeUsername(userData.username);
    const formattedUsername = cleanUsername.startsWith('@') ? cleanUsername : `@${cleanUsername}`;

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: String(userData.name || '').trim(),
      displayName: userData.displayName || String(userData.name || '').trim(),
      username: cleanUsername,
      passwordHash,
      title: userData.title,
      department: userData.department,
      phone: userData.phone,
      email: userData.email,
      bio: userData.bio || '',
      status: userData.status || 'active',
      role: userData.role,
      tier: userData.tier,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastLoginAt: undefined,
      sessions: [],
      failedLoginAttempts: 0,
    };

    setUsers((prev) => [...prev, newUser]);

    addRbacAuditLog({
      targetUserId: newUser.id,
      targetUsername: formattedUsername,
      targetName: newUser.name,
      action: 'CREATE_USER',
      newRole: String(newUser.role),
      description: `Thầy Trương Công Hiển khởi tạo tài khoản mới: ${newUser.name} (${newUser.title}), vai trò: ${newUser.role} (Cấp ${newUser.tier})`,
    });

    addAuditLog('TẠO', 'Tài khoản người dùng', newUser.username, `Tạo tài khoản mới: ${newUser.name} (${newUser.title}), vai trò: ${newUser.role} (Cấp ${newUser.tier})`);
  };

  const setUserStatus = (userId: string, status: AccountStatus, reason?: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const formattedUsername = target.username.startsWith('@') ? target.username : `@${target.username}`;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return { ...u, status };
      })
    );

    const actionMap: Record<AccountStatus, RbacAuditLog['action']> = {
      active: 'UNLOCK_USER',
      locked: 'LOCK_USER',
      disabled: 'DISABLE_USER',
    };

    const descMap: Record<AccountStatus, string> = {
      active: `Mở khóa / Kích hoạt lại tài khoản ${target.name} (${formattedUsername}) bởi Thầy Trương Công Hiển.`,
      locked: `Khóa tài khoản ${target.name} (${formattedUsername}) bởi Thầy Trương Công Hiển.`,
      disabled: `Vô hiệu hóa tài khoản ${target.name} (${formattedUsername}) bởi Thầy Trương Công Hiển.`,
    };

    addRbacAuditLog({
      targetUserId: target.id,
      targetUsername: formattedUsername,
      targetName: target.name,
      action: actionMap[status],
      description: reason || descMap[status],
    });

    addAuditLog(
      'CHUYỂN TRẠNG THÁI', 
      'Tài khoản người dùng', 
      target.username, 
      descMap[status]
    );
  };

  const toggleLockUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus: AccountStatus = target.status === 'active' ? 'locked' : 'active';
    setUserStatus(userId, newStatus);
  };

  const resetUserPassword = async (userId: string, newPassword?: string): Promise<string> => {
    const finalPassword = newPassword || ('pctu' + Math.floor(1000 + Math.random() * 9000));
    const hash = await hashPassword(finalPassword);
    const target = users.find((u) => u.id === userId);
    if (!target) return finalPassword;
    const formattedUsername = target.username.startsWith('@') ? target.username : `@${target.username}`;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return { ...u, passwordHash: hash, failedLoginAttempts: 0 };
      })
    );

    addRbacAuditLog({
      targetUserId: target.id,
      targetUsername: formattedUsername,
      targetName: target.name,
      action: 'RESET_PASSWORD',
      description: `Thầy Trương Công Hiển đã đặt lại mật khẩu mới cho tài khoản. Mật khẩu cũ lập tức mất hiệu lực.`,
    });

    addAuditLog('CẬP NHẬT', 'Đặt lại mật khẩu', target.username, `Thầy Trương Công Hiển đã đặt lại mật khẩu mới cho ${target.name} (${target.username}). Mật khẩu cũ hết hiệu lực.`);
    return finalPassword;
  };

  const updateUserRole = (userId: string, newRole: UserRole, newTier: 1 | 2 | 3 | 4 | 5, customReason?: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const oldRole = target.role;
    const formattedUsername = target.username.startsWith('@') ? target.username : `@${target.username}`;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return { ...u, role: newRole, tier: newTier };
      })
    );

    addRbacAuditLog({
      targetUserId: target.id,
      targetUsername: formattedUsername,
      targetName: target.name,
      action: 'CHANGE_ROLE',
      oldRole: String(oldRole),
      newRole: String(newRole),
      description: customReason || `Thầy Trương Công Hiển thay đổi chức vụ/vai trò từ ${oldRole} sang ${newRole} (Cấp ${newTier}).`,
    });

    addAuditLog('CẬP NHẬT', 'Phân quyền người dùng', target.username, `Thay đổi phân quyền ${target.name}: Cấp ${target.tier} (${oldRole}) → Cấp ${newTier} (${newRole})`);
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addAuditLog('XÓA', 'Tài khoản người dùng', target.username, `Xóa vĩnh viễn tài khoản: ${target.name} (${target.username})`);
  };

  // MASTER DATA EDITING WITH AUTOMATIC CHANGE HISTORY AUDIT TRAIL
  const updateBuildingMasterData = (id: string, updates: Partial<Building>, reason: string) => {
    const currentB = buildings.find((b) => b.id === id);
    if (!currentB) return;

    const changedLogs: MasterDataChangeLog[] = [];
    const labels: Record<string, string> = {
      name: 'Tên khu nhà',
      code: 'Mã khu nhà',
      totalAreaM2: 'Diện tích khu nhà',
      floorsCount: 'Số tầng',
      functionType: 'Công năng sử dụng',
      structuralStatus: 'Hiện trạng kết cấu',
      description: 'Mô tả hạ tầng',
      yearBuilt: 'Năm xây dựng',
    };

    Object.entries(updates).forEach(([key, val]) => {
      const oldVal = (currentB as any)[key];
      if (oldVal !== undefined && oldVal !== val) {
        changedLogs.push({
          id: `md_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actorId: currentUser?.id || 'user_hien',
          actorName: currentUser?.name || 'Thầy Trương Công Hiển',
          actorRole: currentUser?.title || 'Tổ trưởng Tổ CSHT (Cấp 1)',
          targetType: 'building',
          targetId: id,
          targetCode: currentB.code,
          targetName: currentB.name,
          fieldName: key,
          fieldLabel: labels[key] || key,
          beforeValue: typeof oldVal === 'number' && key.includes('Area') ? `${oldVal.toLocaleString()} m²` : String(oldVal),
          afterValue: typeof val === 'number' && key.includes('Area') ? `${Number(val).toLocaleString()} m²` : String(val),
          reason: reason || 'Cập nhật số liệu hạ tầng gốc chuẩn hóa',
        });
      }
    });

    if (changedLogs.length > 0) {
      setMasterDataLogs((prev) => [...changedLogs, ...prev]);
    }

    setBuildings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    addAuditLog(
      'CẬP NHẬT', 
      'Dữ liệu gốc Khu nhà', 
      currentB.code, 
      `Chỉnh sửa dữ liệu gốc ${currentB.code}: ${changedLogs.map((l) => `${l.fieldLabel} (${l.beforeValue} → ${l.afterValue})`).join(', ')}. Lý do: ${reason}`
    );
  };

  const updateRoomMasterData = (buildingId: string, floorNumber: number, roomId: string, updates: any, reason: string) => {
    const targetBuilding = buildings.find((b) => b.id === buildingId);
    if (!targetBuilding) return;

    let targetRoom: any = null;
    for (const fl of targetBuilding.floors) {
      const rm = fl.rooms.find((r) => r.id === roomId);
      if (rm) {
        targetRoom = rm;
        break;
      }
    }

    if (!targetRoom) return;

    const changedLogs: MasterDataChangeLog[] = [];
    const labels: Record<string, string> = {
      name: 'Tên phòng',
      code: 'Mã phòng',
      type: 'Loại phòng / Công năng',
      areaM2: 'Diện tích phòng',
      capacity: 'Sức chứa phòng',
      responsiblePerson: 'Người/Bộ phận phụ trách',
      notes: 'Ghi chú phòng',
    };

    Object.entries(updates).forEach(([key, val]) => {
      const oldVal = targetRoom[key];
      if (oldVal !== undefined && oldVal !== val) {
        changedLogs.push({
          id: `md_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actorId: currentUser?.id || 'user_hien',
          actorName: currentUser?.name || 'Thầy Trương Công Hiển',
          actorRole: currentUser?.title || 'Tổ trưởng Tổ CSHT (Cấp 1)',
          targetType: 'room',
          targetId: roomId,
          targetCode: targetRoom.code,
          targetName: `${targetBuilding.code} - ${targetRoom.name}`,
          fieldName: key,
          fieldLabel: labels[key] || key,
          beforeValue: typeof oldVal === 'number' && key.includes('Area') ? `${oldVal.toLocaleString()} m²` : String(oldVal),
          afterValue: typeof val === 'number' && key.includes('Area') ? `${Number(val).toLocaleString()} m²` : String(val),
          reason: reason || 'Chỉnh sửa thông số phòng gốc',
        });
      }
    });

    if (changedLogs.length > 0) {
      setMasterDataLogs((prev) => [...changedLogs, ...prev]);
    }

    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== buildingId) return b;
        return {
          ...b,
          floors: b.floors.map((fl) => {
            if (fl.floorNumber !== floorNumber) return fl;
            return {
              ...fl,
              rooms: fl.rooms.map((rm) => (rm.id === roomId ? { ...rm, ...updates } : rm)),
            };
          }),
        };
      })
    );

    addAuditLog(
      'CẬP NHẬT', 
      'Dữ liệu gốc Phòng', 
      targetRoom.code, 
      `Chỉnh sửa dữ liệu phòng ${targetRoom.code} (${targetBuilding.code}): ${changedLogs.map((l) => `${l.fieldLabel} (${l.beforeValue} → ${l.afterValue})`).join(', ')}. Lý do: ${reason}`
    );
  };

  const updateDeviceMasterData = (id: string, updates: Partial<Device>, reason: string) => {
    const currentDev = devices.find((d) => d.id === id);
    if (!currentDev) return;

    const changedLogs: MasterDataChangeLog[] = [];
    const labels: Record<string, string> = {
      code: 'Mã định danh thiết bị',
      name: 'Tên thiết bị',
      capacity: 'Thông số kỹ thuật / Công suất',
      brand: 'Hãng sản xuất',
      model: 'Model thiết bị',
      serialNumber: 'Số Serial',
      buildingName: 'Khu nhà đặt thiết bị',
      roomCode: 'Phòng đặt thiết bị',
      status: 'Trạng thái vận hành thiết bị',
      refrigerantType: 'Loại môi chất lạnh',
      pcccExpiryDate: 'Hạn kiểm định PCCC',
    };

    Object.entries(updates).forEach(([key, val]) => {
      const oldVal = (currentDev as any)[key];
      if (oldVal !== undefined && oldVal !== val) {
        changedLogs.push({
          id: `md_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actorId: currentUser?.id || 'user_hien',
          actorName: currentUser?.name || 'Thầy Trương Công Hiển',
          actorRole: currentUser?.title || 'Tổ trưởng Tổ CSHT (Cấp 1)',
          targetType: 'device',
          targetId: id,
          targetCode: currentDev.code,
          targetName: currentDev.name,
          fieldName: key,
          fieldLabel: labels[key] || key,
          beforeValue: String(oldVal),
          afterValue: String(val),
          reason: reason || 'Chỉnh sửa hồ sơ thông số thiết bị gốc',
        });
      }
    });

    if (changedLogs.length > 0) {
      setMasterDataLogs((prev) => [...changedLogs, ...prev]);
    }

    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    addAuditLog(
      'CẬP NHẬT', 
      'Dữ liệu gốc Thiết bị', 
      currentDev.code, 
      `Chỉnh sửa thiết bị ${currentDev.code}: ${changedLogs.map((l) => `${l.fieldLabel} (${l.beforeValue} → ${l.afterValue})`).join(', ')}. Lý do: ${reason}`
    );
  };

  // CHANGE REQUESTS / PROPOSALS (Từ KTV Cấp 2 gửi Thầy Hiển duyệt)
  const submitProposal = (proposalData: {
    targetType: 'building' | 'floor' | 'room' | 'device';
    targetId: string;
    targetCode: string;
    targetName: string;
    fieldName: string;
    fieldLabel: string;
    currentValue: string | number;
    proposedValue: string | number;
    reason: string;
  }) => {
    const newProposal: MasterDataProposal = {
      id: `prop_${Date.now()}`,
      proposalCode: `DX-2026-${String(proposals.length + 1).padStart(3, '0')}`,
      proposerId: currentUser?.id || 'user_huy',
      proposerName: currentUser?.name || 'Thầy Nguyễn Đình Huy',
      proposerRole: currentUser?.title || 'Tổ viên Kỹ thuật (Cấp 2)',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      targetType: proposalData.targetType,
      targetId: proposalData.targetId,
      targetCode: proposalData.targetCode,
      targetName: proposalData.targetName,
      fieldName: proposalData.fieldName,
      fieldLabel: proposalData.fieldLabel,
      currentValue: proposalData.currentValue,
      proposedValue: proposalData.proposedValue,
      reason: proposalData.reason,
      status: 'pending',
    };

    setProposals((prev) => [newProposal, ...prev]);

    pushAlert({
      type: 'maintenance',
      severity: 'blue',
      title: 'ĐỀ NGHỊ CẬP NHẬT THÔNG TIN DỮ LIỆU GỐC',
      message: `${newProposal.proposerName} đã gửi đề xuất ${newProposal.proposalCode}: Cập nhật ${newProposal.fieldLabel} cho ${newProposal.targetName} (${newProposal.currentValue} → ${newProposal.proposedValue}).`,
      actionModule: 'accounts',
      actionId: newProposal.id,
    });

    addAuditLog(
      'TẠO', 
      'Đề nghị cập nhật thông tin', 
      newProposal.proposalCode, 
      `${newProposal.proposerName} đề nghị sửa ${newProposal.fieldLabel} của ${newProposal.targetCode}: ${newProposal.currentValue} → ${newProposal.proposedValue}. Lý do: ${proposalData.reason}`
    );
  };

  const approveProposal = (proposalId: string, reviewNotes = 'Đã kiểm tra thực địa, đồng ý phê duyệt') => {
    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop) return;

    // 1. Áp dụng ngay vào Master Data
    if (prop.targetType === 'building') {
      updateBuildingMasterData(
        prop.targetId, 
        { [prop.fieldName]: prop.fieldName.includes('Area') || prop.fieldName.includes('Floors') ? Number(prop.proposedValue) : prop.proposedValue } as any, 
        `Phê duyệt đề nghị ${prop.proposalCode} từ ${prop.proposerName}: ${prop.reason} (${reviewNotes})`
      );
    } else if (prop.targetType === 'room') {
      // Tìm building và floor chứa phòng
      for (const bld of buildings) {
        for (const fl of bld.floors) {
          const rm = fl.rooms.find((r) => r.id === prop.targetId || r.code === prop.targetCode);
          if (rm) {
            updateRoomMasterData(
              bld.id, 
              fl.floorNumber, 
              rm.id, 
              { [prop.fieldName]: prop.fieldName.includes('Area') || prop.fieldName.includes('Capacity') ? Number(prop.proposedValue) : prop.proposedValue }, 
              `Phê duyệt đề nghị ${prop.proposalCode} từ ${prop.proposerName}: ${prop.reason} (${reviewNotes})`
            );
            break;
          }
        }
      }
    } else if (prop.targetType === 'device') {
      updateDeviceMasterData(
        prop.targetId, 
        { [prop.fieldName]: prop.proposedValue } as any, 
        `Phê duyệt đề nghị ${prop.proposalCode} từ ${prop.proposerName}: ${prop.reason} (${reviewNotes})`
      );
    }

    // 2. Cập nhật trạng thái đề xuất
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status: 'approved',
              reviewedBy: currentUser?.name || 'Thầy Trương Công Hiển',
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              reviewNotes,
            }
          : p
      )
    );

    addAuditLog(
      'PHÊ DUYỆT', 
      'Đề nghị cập nhật thông tin', 
      prop.proposalCode, 
      `Thầy Trương Công Hiển đã PHÊ DUYỆT đề xuất ${prop.proposalCode} và áp dụng thay đổi vào dữ liệu gốc.`
    );
  };

  const rejectProposal = (proposalId: string, reviewNotes = 'Chưa đủ căn cứ thực địa, từ chối đề xuất') => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status: 'rejected',
              reviewedBy: currentUser?.name || 'Thầy Trương Công Hiển',
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              reviewNotes,
            }
          : p
      )
    );

    const prop = proposals.find((p) => p.id === proposalId);
    if (prop) {
      addAuditLog(
        'CHUYỂN TRẠNG THÁI', 
        'Đề nghị cập nhật thông tin', 
        prop.proposalCode, 
        `Thầy Trương Công Hiển đã TỪ CHỐI đề xuất ${prop.proposalCode}. Lý do: ${reviewNotes}`
      );
    }
  };


  // CRUD Implementations
  const addBuilding = (b: Building) => {
    setBuildings((prev) => [...prev, b]);
    addAuditLog('TẠO', 'Khu nhà', b.code, `Thêm mới khu nhà: ${b.name}`);
  };

  const updateBuilding = (id: string, partial: Partial<Building>) => {
    setBuildings((prev) => prev.map((b) => (b.id === id ? { ...b, ...partial } : b)));
    addAuditLog('CẬP NHẬT', 'Khu nhà', id, `Cập nhật thông tin khu nhà`);
  };

  const deleteBuilding = (id: string) => {
    const target = buildings.find((b) => b.id === id);
    setBuildings((prev) => prev.filter((b) => b.id !== id));
    addAuditLog('XÓA', 'Khu nhà', target?.code || id, `Xóa khu nhà: ${target?.name}`);
  };

  const addRoomToBuilding = (buildingId: string, floorNumber: number, room: any) => {
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== buildingId) return b;
        const newFloors = b.floors.map((fl) => {
          if (fl.floorNumber !== floorNumber) return fl;
          return {
            ...fl,
            rooms: [...fl.rooms, room],
          };
        });
        return { ...b, floors: newFloors };
      })
    );
    addAuditLog('TẠO', 'Phòng', room.code, `Thêm phòng ${room.code} (${room.name}) vào tầng ${floorNumber}`);
  };

  const addDevice = (d: Device) => {
    setDevices((prev) => [d, ...prev]);
    addAuditLog('TẠO', 'Thiết bị', d.code, `Thêm thiết bị mới: ${d.name} (${d.code})`);
  };

  const updateDevice = (id: string, partial: Partial<Device>) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...partial } : d)));
    addAuditLog('CẬP NHẬT', 'Thiết bị', id, `Cập nhật thông số/trạng thái thiết bị`);
  };

  const deleteDevice = (id: string) => {
    const target = devices.find((d) => d.id === id);
    setDevices((prev) => prev.filter((d) => d.id !== id));
    addAuditLog('XÓA', 'Thiết bị', target?.code || id, `Xóa thiết bị: ${target?.name}`);
  };

  const addElectricRecord = (record: ElectricityRecord) => {
    setElectricRecords((prev) => [record, ...prev]);
    addAuditLog('TẠO', 'Điện năng', record.meterCode, `Ghi chỉ số điện tháng ${record.periodMonthYear} (${record.consumptionKwh} kWh)`);
    if (record.isAbnormalSpike) {
      pushAlert({
        type: 'utility_spike',
        severity: 'red',
        title: 'CẢNH BÁO TIÊU THỤ ĐIỆN TĂNG CAO',
        message: `Khu vực ${record.buildingName} có mức tiêu thụ điện tăng bất thường (+${record.consumptionKwh} kWh). Vui lòng kiểm tra rò rỉ hoặc quá tải thiết bị!`,
        actionModule: 'electric',
        actionId: record.id,
      });
    }
  };

  const addWaterRecord = (record: WaterRecord) => {
    setWaterRecords((prev) => [record, ...prev]);
    addAuditLog('TẠO', 'Nước sinh hoạt', record.meterCode, `Ghi chỉ số nước tháng ${record.periodMonthYear} (${record.consumptionM3} m³)`);
    if (record.isAbnormalLeak) {
      pushAlert({
        type: 'utility_spike',
        severity: 'red',
        title: 'CẢNH BÁO RÒ RỈ NƯỚC',
        message: `Mức tiêu thụ nước tại ${record.buildingName} tăng đột biến (>30%). Kiểm tra ngay các đường ống hoặc van phao bể chứa!`,
        actionModule: 'water',
        actionId: record.id,
      });
    }
  };

  const updateWaterTankLevel = (tankId: string, level: number) => {
    setWaterInfrastructure((prev) => ({
      ...prev,
      tanks: prev.tanks.map((t) =>
        t.id === tankId
          ? {
              ...t,
              currentLevelPercent: level,
              sensorStatus: level < t.minSafeLevelPercent ? 'low_warning' : 'normal',
            }
          : t
      ),
    }));
  };

  const toggleWaterPump = (pumpId: string) => {
    setWaterInfrastructure((prev) => ({
      ...prev,
      pumps: prev.pumps.map((p) => {
        if (p.id !== pumpId) return p;
        const newStatus = p.status === 'running' ? 'standby' : 'running';
        addAuditLog('CHUYỂN TRẠNG THÁI', 'Hệ thống Bơm', p.name, `Chuyển trạng thái bơm sang: ${newStatus}`);
        return { ...p, status: newStatus };
      }),
    }));
  };

  const addInfrastructureIssue = (issue: InfrastructureIssue) => {
    setInfraIssues((prev) => [issue, ...prev]);
    addAuditLog('TẠO', 'Hạ tầng xây dựng', issue.category, `Ghi nhận hư hỏng: ${issue.category} tại ${issue.buildingName} - ${issue.roomOrArea}`);
    if (issue.severity === 'critical') {
      pushAlert({
        type: 'critical',
        severity: 'red',
        title: `SỰ CỐ HẠ TẦNG NGHIÊM TRỌNG: ${String(issue.category || 'HẠ TẦNG').toUpperCase()}`,
        message: `${issue.damageDescription} tại ${issue.buildingName} - ${issue.roomOrArea}. Cần phê duyệt xử lý ngay!`,
        actionModule: 'infrastructure',
        actionId: issue.id,
      });
    }
  };

  const updateInfrastructureIssue = (id: string, partial: Partial<InfrastructureIssue>) => {
    setInfraIssues((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)));
    addAuditLog('CẬP NHẬT', 'Hạ tầng xây dựng', id, 'Cập nhật tình trạng sự cố hạ tầng');
  };

  const addRepairRequest = (ticket: RepairRequest) => {
    setRepairRequests((prev) => [ticket, ...prev]);
    addAuditLog('TẠO', 'Yêu cầu sửa chữa', ticket.ticketCode, `Phòng ban ${ticket.department} gửi phiếu sửa chữa: ${ticket.issueDescription}`);
    pushAlert({
      type: 'ticket',
      severity: 'blue',
      title: 'YÊU CẦU SỬA CHỮA MỚI',
      message: `${ticket.requesterName} (${ticket.department}) gửi yêu cầu ${ticket.ticketCode} tại ${ticket.buildingName} - ${ticket.roomCode}.`,
      actionModule: 'repair',
      actionId: ticket.id,
    });
  };

  const updateRepairRequest = (id: string, partial: Partial<RepairRequest>) => {
    setRepairRequests((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...partial };
        addAuditLog('CHUYỂN TRẠNG THÁI', 'Yêu cầu sửa chữa', t.ticketCode, `Cập nhật trạng thái phiếu sang: ${updated.status}`);
        return updated;
      })
    );
  };

  const addDailyTask = (task: DailyTask) => {
    setDailyTasks((prev) => [task, ...prev]);
    addAuditLog('TẠO', 'Công việc kỹ thuật', task.taskCode, `Tạo và giao việc: ${task.title} cho ${task.assignedToName}`);
    pushAlert({
      type: 'maintenance',
      severity: 'yellow',
      title: 'CÔNG VIỆC KỸ THUẬT MỚI ĐƯỢC GIAO',
      message: `${task.taskCode}: ${task.title}. Hạn chót: ${task.deadline}`,
      actionModule: 'tasks',
      actionId: task.id,
    });
  };

  const updateDailyTask = (id: string, partial: Partial<DailyTask>) => {
    setDailyTasks((prev) =>
      prev.map((tk) => {
        if (tk.id !== id) return tk;
        const updated = { ...tk, ...partial };
        addAuditLog('CẬP NHẬT', 'Công việc kỹ thuật', tk.taskCode, `Cập nhật tiến độ: ${updated.progress}% (${updated.status})`);
        return updated;
      })
    );
  };

  const deleteDailyTask = (id: string) => {
    const target = dailyTasks.find((t) => t.id === id);
    setDailyTasks((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('XÓA', 'Công việc kỹ thuật', target?.taskCode || id, `Xóa công việc: ${target?.title}`);
  };

  const addMaintenanceSchedule = (schedule: MaintenanceSchedule) => {
    setMaintenanceSchedules((prev) => [...prev, schedule]);
    addAuditLog('TẠO', 'Lịch bảo trì', schedule.title, `Thêm kế hoạch bảo trì định kỳ (${schedule.frequencyLabel})`);
  };

  const updateMaintenanceSchedule = (id: string, partial: Partial<MaintenanceSchedule>) => {
    setMaintenanceSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...partial } : s))
    );
    addAuditLog('CẬP NHẬT', 'Lịch bảo trì', id, `Cập nhật lịch bảo trì`);
  };

  const executeMaintenanceNow = (scheduleId: string) => {
    const schedule = maintenanceSchedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const newTaskCode = `BT-${Date.now().toString().slice(-4)}`;
    const newTask: DailyTask = {
      id: `task_${Date.now()}`,
      taskCode: newTaskCode,
      title: `[Bảo trì tự động] ${schedule.title}`,
      description: schedule.description,
      assignedBy: currentUser.name,
      assignedTo: 'user_huy',
      assignedToName: schedule.assignedToName || 'Thầy Nguyễn Đình Huy',
      priority: 'high',
      deadline: schedule.nextDueDate,
      progress: 0,
      status: 'pending',
      checklist: schedule.standardChecklist.map((c) => ({ text: c, done: false })),
    };

    setDailyTasks((prev) => [newTask, ...prev]);

    // Update schedule last & next date
    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    updateMaintenanceSchedule(scheduleId, {
      lastPerformedDate: todayStr,
      nextDueDate: nextDateStr,
    });

    addAuditLog('TẠO', 'Bảo trì tự động', newTaskCode, `Kích hoạt tự động công việc bảo trì định kỳ cho: ${schedule.title}`);

    pushAlert({
      type: 'maintenance',
      severity: 'yellow',
      title: 'TỰ ĐỘNG TẠO CÔNG VIỆC BẢO TRÌ',
      message: `Đã tạo công việc ${newTaskCode} theo lịch định kỳ cho: ${schedule.title}.`,
      actionModule: 'tasks',
      actionId: newTask.id,
    });
  };

  const addInventoryItem = (item: InventoryItem) => {
    setInventory((prev) => [...prev, item]);
    addAuditLog('TẠO', 'Vật tư', item.code, `Thêm vật tư mới: ${item.name} (${item.code})`);
  };

  const updateInventoryItem = (id: string, partial: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)));
    addAuditLog('CẬP NHẬT', 'Vật tư', id, `Cập nhật tồn kho hoặc thông tin vật tư`);
  };

  const addInventoryTransaction = (txn: InventoryTransaction) => {
    setInventoryTransactions((prev) => [txn, ...prev]);

    // Automatically update stock
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== txn.itemId) return item;
        const newStock = txn.type === 'import' ? item.currentStock + txn.quantity : Math.max(0, item.currentStock - txn.quantity);

        if (newStock < item.minStockThreshold) {
          pushAlert({
            type: 'inventory',
            severity: 'yellow',
            title: 'CẢNH BÁO TỒN KHO VẬT TƯ THẤP',
            message: `Vật tư "${item.name}" chỉ còn ${newStock} ${item.unit} (ngưỡng tối thiểu là ${item.minStockThreshold}). Vui lòng lập dự trù mua sắm!`,
            actionModule: 'inventory',
            actionId: item.id,
          });
        }

        return { ...item, currentStock: newStock, lastUpdated: txn.date.split(' ')[0] };
      })
    );

    addAuditLog(
      txn.type === 'import' ? 'TẠO' : 'CẬP NHẬT',
      'Kho Vật tư',
      txn.itemName,
      `${txn.type === 'import' ? 'Nhập kho' : 'Xuất kho'} ${txn.quantity} ${txn.itemName}. Tổng tiền: ${txn.totalAmount.toLocaleString()} VNĐ`
    );
  };

  const updateBudgetItem = (id: string, partial: Partial<BudgetItem>) => {
    setBudget((prev) => prev.map((b) => (b.id === id ? { ...b, ...partial } : b)));
    addAuditLog('CẬP NHẬT', 'Ngân sách', id, `Điều chỉnh ngân sách/chi phí`);
  };

  const addBudgetItem = (item: BudgetItem) => {
    setBudget((prev) => [...prev, item]);
    addAuditLog('TẠO', 'Ngân sách', item.category, `Thêm hạng mục ngân sách: ${item.category}`);
  };

  const addDailyReport = (report: TechnicianDailyReport) => {
    setDailyReports((prev) => [report, ...prev]);
    addAuditLog('TẠO', 'Báo cáo ngày KTV', report.date, `Nhân viên ${report.technicianName} nộp báo cáo ca làm việc ngày ${report.date}`);
    pushAlert({
      type: 'completed',
      severity: 'blue',
      title: 'BÁO CÁO NGÀY KỸ THUẬT VIÊN MỚI',
      message: `${report.technicianName} vừa gửi báo cáo cuối ca ngày ${report.date}. Chờ Tổ trưởng duyệt.`,
      actionModule: 'reports',
      actionId: report.id,
    });
  };

  const approveDailyReport = (reportId: string, leadFeedback: string) => {
    const today = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setDailyReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              isApprovedByLead: true,
              leadApprovalDate: today,
              leadFeedback,
            }
          : r
      )
    );
    addAuditLog('PHÊ DUYỆT', 'Báo cáo ngày KTV', reportId, `Tổ trưởng Trương Công Hiển đã phê duyệt báo cáo ngày`);
  };

  const markAlertRead = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
  };

  const markAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const openAlertDetail = (alert: AlertItem) => {
    setSelectedAlertForDetail(alert);
  };

  const closeAlertDetail = () => {
    setSelectedAlertForDetail(null);
  };

  const navigateToAlertTarget = (alert: AlertItem) => {
    markAlertRead(alert.id);
    setSelectedAlertForDetail(null);

    const mod = normalizeAlertModule(alert.actionModule);

    // If there is an actionId, map to relevant entity selector
    if (alert.actionId) {
      if (mod === 'devices' || alert.actionId.startsWith('dev_')) {
        setSelectedDeviceId(alert.actionId);
      } else if (mod === 'repairs' || alert.actionId.startsWith('req_') || alert.actionId.startsWith('SC-')) {
        setSelectedTicketId(alert.actionId);
      } else if (mod === 'tasks' || alert.actionId.startsWith('task_') || alert.actionId.startsWith('CV-') || alert.actionId.startsWith('BT-')) {
        setSelectedTaskId(alert.actionId);
      }
    }

    setActiveTab(mod);
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_buildings`);
    localStorage.removeItem(`${STORAGE_KEY}_devices`);
    localStorage.removeItem(`${STORAGE_KEY}_electric`);
    localStorage.removeItem(`${STORAGE_KEY}_water`);
    localStorage.removeItem(`${STORAGE_KEY}_water_infra`);
    localStorage.removeItem(`${STORAGE_KEY}_infra_issues`);
    localStorage.removeItem(`${STORAGE_KEY}_repair_requests`);
    localStorage.removeItem(`${STORAGE_KEY}_daily_tasks`);
    localStorage.removeItem(`${STORAGE_KEY}_maint_schedules`);
    localStorage.removeItem(`${STORAGE_KEY}_repair_history`);
    localStorage.removeItem(`${STORAGE_KEY}_maint_history`);
    localStorage.removeItem(`${STORAGE_KEY}_inventory`);
    localStorage.removeItem(`${STORAGE_KEY}_inv_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_budget`);
    localStorage.removeItem(`${STORAGE_KEY}_daily_reports`);
    localStorage.removeItem(`${STORAGE_KEY}_alerts`);
    localStorage.removeItem(`${STORAGE_KEY}_audit_logs`);
    localStorage.removeItem(`${STORAGE_KEY}_users`);

    setBuildings(INITIAL_BUILDINGS);
    setDevices(INITIAL_DEVICES);
    setElectricRecords(INITIAL_ELECTRIC_RECORDS);
    setWaterRecords(INITIAL_WATER_RECORDS);
    setWaterInfrastructure(INITIAL_WATER_INFRASTRUCTURE);
    setInfraIssues(INITIAL_INFRASTRUCTURE_ISSUES);
    setRepairRequests(INITIAL_REPAIR_REQUESTS);
    setDailyTasks(INITIAL_DAILY_TASKS);
    setMaintenanceSchedules(INITIAL_MAINTENANCE_SCHEDULES);
    setRepairHistory(INITIAL_REPAIR_HISTORY);
    setMaintenanceHistory(INITIAL_MAINTENANCE_HISTORY);
    setInventory(INITIAL_INVENTORY);
    setInventoryTransactions(INITIAL_INVENTORY_TRANSACTIONS);
    setBudget(INITIAL_BUDGET);
    setDailyReports(INITIAL_DAILY_REPORTS);
    setAlerts(INITIAL_ALERTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setUsers(INITIAL_USERS);
  };

  const exportDataJSON = () => {
    const payload = {
      exportDate: new Date().toISOString(),
      institution: 'Trường Đại học Phan Châu Trinh',
      version: '2.0.0',
      buildings,
      devices,
      electricRecords,
      waterRecords,
      waterInfrastructure,
      infraIssues,
      repairRequests,
      dailyTasks,
      maintenanceSchedules,
      repairHistory,
      maintenanceHistory,
      inventory,
      inventoryTransactions,
      budget,
      dailyReports,
      alerts,
      auditLogs,
      rbacAuditLogs,
      masterDataLogs,
      proposals,
      users,
      roles,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PCTU_CSHT_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.buildings && Array.isArray(data.buildings)) setBuildings(data.buildings);
      if (data.devices && Array.isArray(data.devices)) setDevices(data.devices);
      if (data.electricRecords && Array.isArray(data.electricRecords)) setElectricRecords(data.electricRecords);
      if (data.waterRecords && Array.isArray(data.waterRecords)) setWaterRecords(data.waterRecords);
      if (data.waterInfrastructure) setWaterInfrastructure(data.waterInfrastructure);
      if (data.infraIssues && Array.isArray(data.infraIssues)) setInfraIssues(data.infraIssues);
      if (data.repairRequests && Array.isArray(data.repairRequests)) setRepairRequests(data.repairRequests);
      if (data.dailyTasks && Array.isArray(data.dailyTasks)) setDailyTasks(data.dailyTasks);
      if (data.maintenanceSchedules && Array.isArray(data.maintenanceSchedules)) setMaintenanceSchedules(data.maintenanceSchedules);
      if (data.repairHistory && Array.isArray(data.repairHistory)) setRepairHistory(data.repairHistory);
      if (data.maintenanceHistory && Array.isArray(data.maintenanceHistory)) setMaintenanceHistory(data.maintenanceHistory);
      if (data.inventory && Array.isArray(data.inventory)) setInventory(data.inventory);
      if (data.inventoryTransactions && Array.isArray(data.inventoryTransactions)) setInventoryTransactions(data.inventoryTransactions);
      if (data.budget && Array.isArray(data.budget)) setBudget(data.budget);
      if (data.dailyReports && Array.isArray(data.dailyReports)) setDailyReports(data.dailyReports);
      if (data.alerts && Array.isArray(data.alerts)) setAlerts(data.alerts);
      if (data.auditLogs && Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
      if (data.rbacAuditLogs && Array.isArray(data.rbacAuditLogs)) setRbacAuditLogs(data.rbacAuditLogs);
      if (data.masterDataLogs && Array.isArray(data.masterDataLogs)) setMasterDataLogs(data.masterDataLogs);
      if (data.proposals && Array.isArray(data.proposals)) setProposals(data.proposals);
      if (data.users && Array.isArray(data.users)) setUsers(data.users);
      if (data.roles && Array.isArray(data.roles)) setRoles(data.roles);

      addAuditLog('CẬP NHẬT', 'Cơ sở dữ liệu', 'Backup_Import', 'Phục hồi toàn bộ cơ sở dữ liệu từ tệp sao lưu JSON');
      recordDbCommit('ALL_TABLES', 22);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const forceSyncAll = () => {
    setDbSaveStatus('saving');
    safeStorageSet(`${STORAGE_KEY}_buildings`, buildings);
    safeStorageSet(`${STORAGE_KEY}_devices`, devices);
    safeStorageSet(`${STORAGE_KEY}_electric`, electricRecords);
    safeStorageSet(`${STORAGE_KEY}_water`, waterRecords);
    safeStorageSet(`${STORAGE_KEY}_water_infra`, waterInfrastructure);
    safeStorageSet(`${STORAGE_KEY}_infra_issues`, infraIssues);
    safeStorageSet(`${STORAGE_KEY}_repair_requests`, repairRequests);
    safeStorageSet(`${STORAGE_KEY}_daily_tasks`, dailyTasks);
    safeStorageSet(`${STORAGE_KEY}_maint_schedules`, maintenanceSchedules);
    safeStorageSet(`${STORAGE_KEY}_repair_history`, repairHistory);
    safeStorageSet(`${STORAGE_KEY}_maint_history`, maintenanceHistory);
    safeStorageSet(`${STORAGE_KEY}_inventory`, inventory);
    safeStorageSet(`${STORAGE_KEY}_inv_transactions`, inventoryTransactions);
    safeStorageSet(`${STORAGE_KEY}_budget`, budget);
    safeStorageSet(`${STORAGE_KEY}_daily_reports`, dailyReports);
    safeStorageSet(`${STORAGE_KEY}_alerts`, alerts);
    safeStorageSet(`${STORAGE_KEY}_audit_logs`, auditLogs);
    safeStorageSet(`${STORAGE_KEY}_rbac_audit_logs`, rbacAuditLogs);
    safeStorageSet(`${STORAGE_KEY}_md_logs`, masterDataLogs);
    safeStorageSet(`${STORAGE_KEY}_proposals`, proposals);
    safeStorageSet(`${STORAGE_KEY}_users`, users);
    safeStorageSet(`${STORAGE_KEY}_roles`, roles);

    recordDbCommit('ALL_TABLES', 22);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated: currentUser !== null,
        isSuperAdminUser,
        login,
        loginAsUser,
        logout,

        users,
        setUsers,
        createUser,
        updateUserProfile,
        updateUserPermissions,
        changePassword,
        resetPasswordByOTP,
        logoutOtherSessions,
        toggleLockUser,
        setUserStatus,
        resetUserPassword,
        updateUserRole,
        deleteUser,

        roles,
        createRole,
        updateRolePermissions,
        hasPermission,

        rbacAuditLogs,
        addRbacAuditLog,

        activeTab,
        setActiveTab,
        currentTab: activeTab,
        setCurrentTab: setActiveTab,
        selectedBuildingId,
        setSelectedBuildingId,
        selectedDeviceId,
        setSelectedDeviceId,
        selectedTicketId,
        setSelectedTicketId,
        selectedTaskId,
        setSelectedTaskId,
        selectedAlertForDetail,
        setSelectedAlertForDetail,
        openAlertDetail,
        closeAlertDetail,
        navigateToAlertTarget,
        isSearchModalOpen,
        setIsSearchModalOpen,

        buildings,
        devices,
        electricRecords,
        waterRecords,
        waterInfrastructure,
        infraIssues,
        repairRequests,
        dailyTasks,
        maintenanceSchedules,
        repairHistory,
        maintenanceHistory,
        inventory,
        inventoryTransactions,
        budget,
        dailyReports,
        alerts,
        auditLogs,
        masterDataLogs,
        proposals,

        updateBuildingMasterData,
        updateRoomMasterData,
        updateDeviceMasterData,

        submitProposal,
        approveProposal,
        rejectProposal,

        addBuilding,
        updateBuilding,
        deleteBuilding,
        addRoomToBuilding,

        addDevice,
        updateDevice,
        deleteDevice,

        addElectricRecord,
        addWaterRecord,
        updateWaterTankLevel,
        toggleWaterPump,

        addInfrastructureIssue,
        updateInfrastructureIssue,

        addRepairRequest,
        updateRepairRequest,

        addDailyTask,
        updateDailyTask,
        deleteDailyTask,

        addMaintenanceSchedule,
        updateMaintenanceSchedule,
        executeMaintenanceNow,

        addInventoryItem,
        updateInventoryItem,
        addInventoryTransaction,

        updateBudgetItem,
        addBudgetItem,

        addDailyReport,
        approveDailyReport,

        markAlertRead,
        markAllAlertsRead,
        addAuditLog,

        resetToDefaultData,
        exportDataJSON,
        importDataJSON,

        // Database management & continuous sync
        isDatabaseModalOpen,
        setIsDatabaseModalOpen,
        dbSaveStatus,
        lastSavedTime,
        dbStats: {
          totalRecords: (buildings.length + devices.length + electricRecords.length + waterRecords.length + 1 +
            infraIssues.length + repairRequests.length + dailyTasks.length + maintenanceSchedules.length +
            repairHistory.length + maintenanceHistory.length + inventory.length + inventoryTransactions.length +
            budget.length + dailyReports.length + alerts.length + auditLogs.length + rbacAuditLogs.length +
            masterDataLogs.length + proposals.length + users.length + roles.length),
          storageSizeKb,
          tablesCount: 22,
        },
        forceSyncAll,

        // Aliases for compatibility
        budgetItems: budget,
        techTasks: dailyTasks,
        addTask: (task: any) => {
          if (task.taskCode) {
            addDailyTask(task);
          } else {
            addDailyTask({
              id: task.id || `task_${Date.now()}`,
              taskCode: `CV-2026-${String(dailyTasks.length + 1).padStart(3, '0')}`,
              title: task.title,
              description: task.description || '',
              assignedBy: task.assignedByName || 'Thầy Trương Công Hiển',
              assignedTo: task.assigneeId || 'user_huy',
              assignedToName: task.assigneeName || 'Thầy Nguyễn Đình Huy',
              priority: task.priority || 'medium',
              deadline: task.deadline || '',
              progress: task.status === 'completed' ? 100 : (task.status === 'in_progress' ? 50 : 0),
              status: task.status || 'assigned',
              buildingName: task.location || 'Khuôn viên ĐH Phan Châu Trinh',
              checklist: task.checklist || [],
            });
          }
        },
        updateTask: (id: string, partial: any) => {
          updateDailyTask(id, {
            ...partial,
            progress: partial.status === 'completed' ? 100 : (partial.status === 'in_progress' ? 50 : undefined),
          });
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
