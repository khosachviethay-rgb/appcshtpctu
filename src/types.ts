export type PermissionAction = 
  | 'VIEW' 
  | 'CREATE' 
  | 'EDIT' 
  | 'DELETE' 
  | 'APPROVE' 
  | 'ASSIGN' 
  | 'EXPORT' 
  | 'MANAGE';

export type StandardRoleCode = 
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TO_TRUONG'
  | 'TO_VIEN'
  | 'HCNS_MANAGER'
  | 'MANAGER'
  | 'TECHNICIAN'
  | 'DEPARTMENT_USER'
  | 'VIEWER'
  // Legacy aliases for backward compatibility
  | 'admin_lead'
  | 'tech_staff'
  | 'technical_staff'
  | 'manager_hr'
  | 'manager_assist'
  | string;

export type UserRole = StandardRoleCode;

export type AccountStatus = 'active' | 'locked' | 'disabled';

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  loginAt: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

export interface RoleDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3 | 4 | 5;
  isSystem?: boolean;
  defaultPermissions: Record<string, PermissionAction[]>;
}

export interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  username: string; // e.g. truongconghien or @truongconghien
  passwordHash: string; // Mật khẩu bảo mật dạng mã hóa băm SHA-256
  title: string;
  department: string;
  phone: string;
  email: string;
  bio?: string;
  status: AccountStatus; // Hoạt động, Khóa, hoặc Vô hiệu hóa
  role: UserRole;
  tier: 1 | 2 | 3 | 4 | 5; // Phân cấp bậc 1 đến 5
  createdAt: string; // Ngày tạo tài khoản
  lastLoginAt?: string; // Lần đăng nhập gần nhất
  avatar?: string; // Base64 data URL hoặc URL ảnh đại diện
  permissions?: Record<string, PermissionAction[]>; // Phân quyền chi tiết theo từng module
  sessions?: UserSession[]; // Danh sách các thiết bị/phiên đang đăng nhập
  failedLoginAttempts?: number; // Số lần đăng nhập sai liên tiếp
}

export interface Room {
  id: string;
  code: string;
  name: string;
  type: 'classroom' | 'office' | 'lab' | 'auditorium' | 'dormitory' | 'sports' | 'library' | 'technical' | 'hospital_sim';
  areaM2?: number;
  capacity?: number;
  devicesCount?: number;
  responsiblePerson?: string;
  notes?: string;
}

export interface Floor {
  floorNumber: number;
  name: string;
  rooms: Room[];
}

export interface Building {
  id: string;
  code: string; // Khu A, Khu B, Khu C, Khu TV, Khu YSH, Khu TDTT, KTX A, KTX B
  name: string;
  floorsCount: number;
  description: string;
  functionType: string;
  floors: Floor[];
  totalDevices?: number;
  totalAreaM2?: number;
  yearBuilt?: number;
  structuralStatus?: 'good' | 'fair' | 'damaged' | string;
  hasSubstation?: boolean;
  image?: string;
  powerMeterCode?: string;
  waterMeterCode?: string;
}

export type DeviceCategory = 
  | 'hvac'            // Điều hòa không khí
  | 'pccc'            // Phòng cháy chữa cháy
  | 'electric'        // Hệ thống điện, tủ điện, máy phát
  | 'water'           // Bơm nước, bể nước, van
  | 'infrastructure'  // Hạ tầng xây dựng (cửa, trần, tường...)
  | 'generator'       // Máy phát điện dự phòng
  | 'other';

export type DeviceStatus = 
  | 'operating'         // Hoạt động tốt
  | 'needs_maintenance' // Cần bảo trì/vệ sinh
  | 'faulty'            // Đang hỏng / sự cố
  | 'replace_needed';   // Cần thay thế

export interface Device {
  id: string;
  code: string; // Mã tài sản duy nhất ví dụ AC-C-301, PCCC-A-101
  name: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  serialNumber?: string;
  capacity?: string; // e.g. 18000 BTU, 15 kW, 50 m3/h
  gasType?: string;
  buildingId: string;
  buildingName?: string;
  floorNumber: number;
  roomCode: string;
  installDate: string;
  status: DeviceStatus;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceCycleDays?: number;
  totalRepairCostAccumulated?: number;
  vendor?: string;
  purchaseCost?: number;
  warrantyUntil?: string;
  notes?: string;
  // Specific for HVAC
  refrigerantType?: string;
  lastFilterCleanDate?: string;
  // Specific for PCCC
  pcccExpiryDate?: string;
  pcccType?: 'extinguisher_abc' | 'extinguisher_co2' | 'pump_electric' | 'pump_diesel' | 'pump_jockey' | 'alarm_panel' | 'smoke_detector' | 'heat_detector' | 'exit_light' | 'emergency_light' | 'fire_hydrant' | 'fire_hose_cabinet';
  pcccInspectionStatus?: 'passed' | 'warning' | 'failed';
  pcccLastInspector?: string;
  qrCodeUrl?: string;
}

export interface ElectricityRecord {
  id: string;
  buildingId: string;
  buildingName: string;
  meterCode: string;
  meterName?: string;
  periodMonthYear: string; // YYYY-MM
  recordedDate?: string;
  recordDate?: string;
  recordedBy: string;
  previousReading?: number; // kWh
  currentReading?: number;  // kWh
  previousIndex?: number;
  currentIndex?: number;
  consumptionKwh: number;
  ratePerKwh: number; // VND/kWh, e.g. 2,650 VND
  totalCost: number;
  prevMonthConsumption?: number;
  sameMonthLastYearConsumption?: number;
  isAbnormalSpike?: boolean; // >20% increase
  spikeReason?: string;
  notes?: string;
}

export interface WaterRecord {
  id: string;
  buildingId: string;
  buildingName: string;
  meterCode: string;
  meterName?: string;
  periodMonthYear: string;
  recordedDate?: string;
  recordDate?: string;
  recordedBy: string;
  previousReading?: number; // m3
  currentReading?: number;  // m3
  previousIndex?: number;
  currentIndex?: number;
  consumptionM3: number;
  ratePerM3: number; // VND/m3, e.g. 13,500 VND
  totalCost: number;
  prevMonthConsumption?: number;
  isAbnormalLeak?: boolean;
  leakAlertReason?: string;
  notes?: string;
}

export interface WaterInfrastructure {
  tanks: {
    id: string;
    name: string;
    location: string;
    capacityM3: number;
    currentLevelPercent: number; // 0 - 100%
    minSafeLevelPercent: number;
    sensorStatus?: 'normal' | 'low_warning' | 'critical';
    lastCleanedDate?: string;
  }[];
  pumps: {
    id: string;
    name: string;
    type?: 'main_supply' | 'booster' | 'drainage' | 'fire_backup';
    location: string;
    status: 'running' | 'standby' | 'fault';
    flowRateM3H?: number;
    pressureBar?: number;
    lastServiceDate?: string;
    powerKw?: number;
    runningHours?: number;
  }[];
}

export type InfraCategory = 
  | 'Tường' 
  | 'Trần thạch cao' 
  | 'Sàn' 
  | 'Mái' 
  | 'Cửa & Cửa sổ' 
  | 'Lan can & Cầu thang' 
  | 'Hệ thống thoát nước' 
  | 'Nhà vệ sinh' 
  | 'Hệ thống chiếu sáng' 
  | 'Đường nội bộ & Sân bãi' 
  | 'Cây xanh & Sân bãi' 
  | 'Khác';

export type SeverityLevel = 'low' | 'medium' | 'critical';

export interface InfrastructureIssue {
  id: string;
  category: InfraCategory | string;
  buildingId: string;
  buildingName: string;
  floorNumber?: number;
  roomOrArea: string;
  severity: SeverityLevel;
  damageDescription: string;
  imageUrl?: string;
  detectedDate?: string;
  detectedBy?: string;
  reportedBy?: string;
  reportedDate?: string;
  proposedAction?: string;
  proposedSolution?: string;
  estimatedCost?: number;
  status: 'pending' | 'pending_approval' | 'in_progress' | 'resolved';
  completedDate?: string;
}

export type TicketStatus = 
  | 'new'            // Mới
  | 'received'       // Đã tiếp nhận
  | 'in_progress'    // Đang xử lý
  | 'waiting_parts'  // Chờ vật tư
  | 'completed'      // Hoàn thành
  | 'accepted'       // Đã nghiệm thu
  | 'closed';        // Đóng yêu cầu

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RepairRequest {
  id: string;
  ticketCode: string; // e.g. SC-2026-001
  requesterName: string;
  department: string;
  phoneNumber: string;
  buildingId: string;
  buildingName: string;
  floorNumber?: number;
  roomCode: string;
  category: DeviceCategory | 'infrastructure';
  issueDescription: string;
  priority: TicketPriority;
  imageUrl?: string;
  requestedDate?: string;
  status: TicketStatus;
  assignedTo?: string;
  assignedToId?: string;
  assignedToName?: string;
  expectedCompletionDate?: string;
  expectedDeadline?: string;
  actualCost?: number;
  partsUsed?: string[];
  materialsUsed?: { materialId: string; materialName: string; quantity: number; unit: string; cost: number }[];
  repairNotes?: string;
  resolutionNotes?: string;
  acceptedByRequester?: boolean;
  acceptedDate?: string;
  completedDate?: string;
  rating?: number;
  feedback?: string;
}

export type TaskStatus = 'assigned' | 'pending' | 'in_progress' | 'paused' | 'completed' | 'approved';
export type TaskType = 'routine_maintenance' | 'repair_ticket' | 'daily_inspection' | 'emergency';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TechTask {
  id: string;
  title: string;
  type: TaskType;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  assignedById?: string;
  assignedByName?: string;
  location: string;
  startDate?: string;
  deadline: string;
  status: TaskStatus;
  description: string;
  completedDate?: string;
}

export interface DailyTask {
  id: string;
  taskCode: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedTo: string;
  assignedToName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  progress: number;
  status: TaskStatus;
  buildingId?: string;
  buildingName?: string;
  roomCode?: string;
  deviceId?: string;
  deviceCode?: string;
  checklist: { text: string; done: boolean }[];
  materialsUsed?: { materialId: string; materialName: string; quantity: number; unit: string; cost: number }[];
  beforeImage?: string;
  afterImage?: string;
  notes?: string;
  completedDate?: string;
  timeSpentHours?: number;
  approvedByLead?: boolean;
  leadNotes?: string;
}

export interface MaintenanceSchedule {
  id: string;
  title: string;
  targetCategory: DeviceCategory;
  targetDeviceId?: string;
  targetDeviceName?: string;
  buildingId?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'yearly' | 'custom';
  frequencyLabel: string;
  lastPerformedDate: string;
  nextDueDate: string;
  assignedToName: string;
  description: string;
  isAutoTaskEnabled: boolean;
  standardChecklist: string[];
}

export interface RepairHistoryItem {
  id: string;
  deviceId: string;
  deviceCode: string;
  deviceName?: string;
  buildingName?: string;
  date?: string;
  repairDate?: string;
  problem?: string;
  solution?: string;
  repairContent?: string;
  rootCause?: string;
  performerName?: string;
  technicianName?: string;
  contractorOrVendor?: string;
  partsReplaced?: string[];
  cost: number;
  downtimeHours?: number;
  result?: 'Hoàn tất - Đạt chuẩn' | 'Tạm thời' | 'Cần theo dõi thêm';
  notes?: string;
  photoBefore?: string;
  photoAfter?: string;
}

export interface MaintenanceHistoryItem {
  id: string;
  deviceId: string;
  deviceCode: string;
  deviceName?: string;
  buildingName?: string;
  date: string;
  performerName?: string;
  tasksPerformed?: string[];
  maintenanceContent?: string;
  technicianName?: string;
  vendor?: string;
  suppliesUsed?: string[];
  cost?: number;
  result?: 'Đạt chuẩn' | 'Cảnh báo hao mòn' | 'Yêu cầu thay thế sớm';
  recommendationNextTime?: string;
  notes?: string;
  photoBefore?: string;
  photoAfter?: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: DeviceCategory | 'Điện' | 'Nước' | 'Điều hòa' | 'PCCC' | 'Xây dựng' | 'Khác';
  unit: string;
  currentStock: number;
  minThreshold?: number;
  minStockThreshold?: number;
  unitPrice: number;
  shelfLocation?: string;
  storageLocation?: string;
  specification?: string;
  lastRestockDate?: string;
  lastUpdated?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'import' | 'export';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: string;
  performedBy?: string;
  performerName?: string;
  recipientOrSupplier?: string;
  referenceTaskId?: string;
  reasonOrTaskId?: string;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  year?: number;
  fiscalYear?: number;
  quarter?: string;
  category: string;
  allocatedAmount?: number;
  allocatedBudget?: number;
  spentAmount?: number;
  usedBudget?: number;
  committedBudget?: number;
  notes?: string;
}

export interface TechnicianDailyReport {
  id: string;
  date: string;
  technicianId: string;
  technicianName: string;
  completedTasksSummary: string;
  unfinishedTasksSummary: string;
  unfinishedReason: string;
  incidentsEncountered: string;
  materialsUsedSummary: string;
  workingHours: number;
  photos: string[];
  tomorrowProposals: string;
  isApprovedByLead: boolean;
  leadApprovalDate?: string;
  leadFeedback?: string;
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'overdue' | 'maintenance' | 'ticket' | 'completed' | 'inventory' | 'utility_spike';
  severity: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionModule?: string;
  actionId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName?: string;
  userRole?: string;
  actorName?: string;
  actorRole?: string;
  action?: string;
  actionType?: 'TẠO' | 'CẬP NHẬT' | 'XÓA' | 'PHÊ DUYỆT' | 'CHUYỂN TRẠNG THÁI';
  entity?: string;
  entityType?: string;
  entityId?: string;
  entityIdentifier?: string;
  details: string;
}

// BẢO VỆ DỮ LIỆU GỐC QUAN TRỌNG: Tự động lưu lịch sử thay đổi (Trước/Sau, Người sửa, Thời gian, Lý do)
export interface MasterDataChangeLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: 'building' | 'floor' | 'room' | 'device' | 'infra';
  targetId: string;
  targetCode: string;
  targetName: string;
  fieldName: string;
  fieldLabel: string;
  beforeValue: string | number;
  afterValue: string | number;
  reason?: string;
}

// CẤP 2 - KỸ THUẬT VIÊN: Đề nghị cập nhật thông tin gửi Tổ trưởng phê duyệt
export interface MasterDataProposal {
  id: string;
  proposalCode: string; // DX-2026-xxx
  proposerId: string;
  proposerName: string;
  proposerRole: string;
  createdAt: string;
  targetType: 'building' | 'floor' | 'room' | 'device';
  targetId: string;
  targetCode: string;
  targetName: string;
  fieldName: string;
  fieldLabel: string;
  currentValue: string | number;
  proposedValue: string | number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

// NHẬT KÝ KIỂM TOÁN PHÂN QUYỀN RBAC (Không thể xóa, ghi lại đầy đủ người thực hiện, đối tượng, role, permission, thời gian)
export interface RbacAuditLog {
  id: string;
  timestamp: string; // e.g. "18:30 – 04/09/2026"
  actorUsername: string; // e.g. "@truongconghien"
  actorName: string; // e.g. "Thầy Trương Công Hiển"
  targetUserId: string;
  targetUsername: string; // e.g. "@nguyendinhhuy"
  targetName: string; // e.g. "Thầy Nguyễn Đình Huy"
  action: 
    | 'CHANGE_ROLE' 
    | 'UPDATE_PERMISSION' 
    | 'LOCK_USER' 
    | 'UNLOCK_USER' 
    | 'DISABLE_USER' 
    | 'REACTIVATE_USER' 
    | 'RESET_PASSWORD' 
    | 'CREATE_USER' 
    | 'UPDATE_USER' 
    | 'DELETE_USER';
  oldRole?: string;
  newRole?: string;
  oldPermissions?: Record<string, PermissionAction[]>;
  newPermissions?: Record<string, PermissionAction[]>;
  description: string;
}

