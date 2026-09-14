import { 
  Building, Device, ElectricityRecord, WaterRecord, WaterInfrastructure,
  InfrastructureIssue, RepairRequest, DailyTask, MaintenanceSchedule,
  RepairHistoryItem, MaintenanceHistoryItem, InventoryItem, InventoryTransaction,
  BudgetItem, TechnicianDailyReport, AlertItem, AuditLog, UserProfile,
  MasterDataChangeLog, MasterDataProposal, RoleDefinition, RbacAuditLog
} from '../types';
import { quickHashSync, DEFAULT_ROLE_DEFINITIONS } from '../utils/authSecurity';

export const INITIAL_ROLES: RoleDefinition[] = DEFAULT_ROLE_DEFINITIONS;

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_hien',
    name: 'Thầy Trương Công Hiển',
    displayName: 'Thầy Trương Công Hiển',
    username: 'truongconghien',
    passwordHash: quickHashSync('hien123'),
    role: 'SUPER_ADMIN',
    tier: 1,
    title: 'Tổ trưởng Kỹ thuật & CSHT (SUPER ADMIN / Quản trị cao nhất)',
    department: 'Tổ Cơ sở Hạ tầng / Kỹ thuật',
    phone: '0905.123.456',
    email: 'hien.tc@pctu.edu.vn',
    bio: 'Quản trị viên cao nhất hệ thống cơ sở hạ tầng ĐH Phan Châu Trinh. Toàn quyền quản lý RBAC, phân quyền chức năng, vận hành và dữ liệu gốc Master Data.',
    status: 'active',
    createdAt: '2024-01-10 08:00',
    lastLoginAt: '2026-09-02 08:15',
    sessions: [
      {
        id: 'sess_hien_01',
        device: 'MacBook Pro 16" (Apple M3 Max)',
        browser: 'Google Chrome 128 (macOS)',
        ipAddress: '118.69.182.45 (LAN PCTU Khu A)',
        loginAt: '2026-09-02 08:15',
        lastActiveAt: 'Đang hoạt động',
        isCurrent: true,
      },
      {
        id: 'sess_hien_02',
        device: 'iPhone 15 Pro Max',
        browser: 'Mobile Safari 17.5 (iOS)',
        ipAddress: '118.69.182.88 (Wi-Fi PCTU Giảng đường)',
        loginAt: '2026-09-01 19:40',
        lastActiveAt: '1 ngày trước',
        isCurrent: false,
      }
    ]
  },
  {
    id: 'user_huy',
    name: 'Thầy Nguyễn Đình Huy',
    displayName: 'Thầy Nguyễn Đình Huy',
    username: 'nguyendinhhuy',
    passwordHash: quickHashSync('huy123'),
    role: 'TO_VIEN',
    tier: 2,
    title: 'Tổ viên Kỹ thuật Vận hành',
    department: 'Tổ Cơ sở Hạ tầng / Kỹ thuật',
    phone: '0914.234.567',
    email: 'huy.nd@pctu.edu.vn',
    bio: 'Kỹ thuật viên điện nước, điều hòa và PCCC. Trực tiếp vận hành hiện trường và đề xuất cập nhật.',
    status: 'active',
    createdAt: '2024-02-15 08:30',
    lastLoginAt: '2026-09-02 07:45',
    sessions: [
      {
        id: 'sess_huy_01',
        device: 'Samsung Galaxy S24 Ultra',
        browser: 'Chrome Mobile 128 (Android)',
        ipAddress: '118.69.182.112 (Wi-Fi PCTU Khu B)',
        loginAt: '2026-09-02 07:45',
        lastActiveAt: '15 phút trước',
        isCurrent: true,
      }
    ]
  },
  {
    id: 'user_hoan',
    name: 'Cô Nguyễn Thị Hoàn',
    displayName: 'Cô Nguyễn Thị Hoàn',
    username: 'nguyenthihoan',
    passwordHash: quickHashSync('hoan123'),
    role: 'HCNS_MANAGER',
    tier: 3,
    title: 'Trưởng phòng Hành chính – Nhân sự',
    department: 'Phòng Hành chính – Nhân sự',
    phone: '0903.345.678',
    email: 'hoan.nt@pctu.edu.vn',
    bio: 'Giám sát tổng thể hoạt động hành chính, cơ sở vật chất và phê duyệt mua sắm trang thiết bị trường.',
    status: 'active',
    createdAt: '2024-01-15 09:00',
    lastLoginAt: '2026-09-01 16:20',
    sessions: [
      {
        id: 'sess_hoan_01',
        device: 'Dell Latitude 7440',
        browser: 'Microsoft Edge 127 (Windows 11)',
        ipAddress: '118.69.182.20 (Văn phòng BGH)',
        loginAt: '2026-09-01 16:20',
        lastActiveAt: 'Hôm qua',
        isCurrent: true,
      }
    ]
  },
  {
    id: 'user_minh',
    name: 'Thầy Nguyễn Văn Minh',
    displayName: 'Thầy Nguyễn Văn Minh',
    username: 'nguyenvanminh',
    passwordHash: quickHashSync('minh123'),
    role: 'MANAGER',
    tier: 4,
    title: 'Người hỗ trợ Quản trị & Giám sát',
    department: 'Ban Giám sát Hạ tầng ĐH Phan Châu Trinh',
    phone: '0988.456.789',
    email: 'minh.nv@pctu.edu.vn',
    bio: 'Điều phối ca trực, theo dõi tiến độ bảo dưỡng kỹ thuật các khối công trình.',
    status: 'active',
    createdAt: '2024-03-01 08:00',
    lastLoginAt: '2026-08-30 14:10',
    sessions: [
      {
        id: 'sess_minh_01',
        device: 'HP EliteBook 840',
        browser: 'Google Chrome 128 (Windows 11)',
        ipAddress: '118.69.182.33',
        loginAt: '2026-08-30 14:10',
        lastActiveAt: '3 ngày trước',
        isCurrent: true,
      }
    ]
  },
  {
    id: 'user_khoa_y',
    name: 'Khoa Y - Dược ĐH Phan Châu Trinh',
    displayName: 'Khoa Y - Dược ĐH Phan Châu Trinh',
    username: 'khoayduoc',
    passwordHash: quickHashSync('khoa123'),
    role: 'DEPARTMENT_USER',
    tier: 5,
    title: 'Đại diện Phòng ban / Giảng viên',
    department: 'Khoa Y Đa khoa & Dược',
    phone: '0235.3757.999',
    email: 'khoay@pctu.edu.vn',
    bio: 'Tài khoản đại diện giảng viên và phòng thí nghiệm thực hành Y khoa gửi phiếu yêu cầu sửa chữa.',
    status: 'active',
    createdAt: '2024-04-10 10:00',
    lastLoginAt: '2026-09-02 09:05',
    sessions: [
      {
        id: 'sess_khoa_01',
        device: 'PC Lab Dược C201',
        browser: 'Google Chrome 128',
        ipAddress: '118.69.182.60',
        loginAt: '2026-09-02 09:05',
        lastActiveAt: '1 giờ trước',
        isCurrent: true,
      }
    ]
  }
];

export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'bld_a',
    code: 'Khu A',
    name: 'Nhà làm việc – Khu A',
    floorsCount: 2,
    description: 'Khu làm việc hành chính, Ban Giám hiệu, Phòng Hành chính - Nhân sự, Phòng Kế toán và các phòng họp',
    functionType: 'Khối Văn phòng Điều hành',
    powerMeterCode: 'PE-A-01',
    waterMeterCode: 'WT-A-01',
    totalDevices: 42,
    floors: [
      {
        floorNumber: 1,
        name: 'Tầng 1 - Khu A',
        rooms: [
          { id: 'a_101', code: 'A101', name: 'Phòng Tiếp đón & Văn thư', type: 'office', areaM2: 55, devicesCount: 5 },
          { id: 'a_102', code: 'A102', name: 'Phòng Hành chính – Nhân sự (Cô Hoàn)', type: 'office', areaM2: 70, devicesCount: 7 },
          { id: 'a_103', code: 'A103', name: 'Phòng Kế toán – Tài chính', type: 'office', areaM2: 65, devicesCount: 6 },
          { id: 'a_104', code: 'A104', name: 'Phòng Ban Giám hiệu', type: 'office', areaM2: 60, devicesCount: 6 },
          { id: 'a_105', code: 'A105', name: 'Phòng Họp Hội đồng A1', type: 'office', areaM2: 90, devicesCount: 8 },
        ]
      },
      {
        floorNumber: 2,
        name: 'Tầng 2 - Khu A',
        rooms: [
          { id: 'a_201', code: 'A201', name: 'Phòng Quản lý Đào tạo', type: 'office', areaM2: 75, devicesCount: 6 },
          { id: 'a_202', code: 'A202', name: 'Văn phòng Tổ Kỹ thuật & CSHT (Thầy Hiển, Thầy Huy)', type: 'technical', areaM2: 45, devicesCount: 8 },
          { id: 'a_203', code: 'A203', name: 'Phòng Công nghệ Thông tin & Server', type: 'technical', areaM2: 50, devicesCount: 12 },
          { id: 'a_204', code: 'A204', name: 'Phòng Họp VIP A2', type: 'office', areaM2: 80, devicesCount: 6 },
        ]
      }
    ]
  },
  {
    id: 'bld_b',
    code: 'Khu B',
    name: 'Khối lớp học – Khu B',
    floorsCount: 4,
    description: 'Giảng đường lý thuyết, phòng học thông minh, hệ thống chiếu sáng, điều hòa và thiết bị kỹ thuật',
    functionType: 'Khối Giảng đường & Lớp học',
    powerMeterCode: 'PE-B-01',
    waterMeterCode: 'WT-B-01',
    totalDevices: 86,
    floors: [
      {
        floorNumber: 1,
        name: 'Tầng 1 - Khu B',
        rooms: [
          { id: 'b_101', code: 'B101', name: 'Giảng đường B101 (120 chỗ)', type: 'classroom', areaM2: 130, devicesCount: 10 },
          { id: 'b_102', code: 'B102', name: 'Giảng đường B102 (120 chỗ)', type: 'classroom', areaM2: 130, devicesCount: 10 },
          { id: 'b_103', code: 'B103', name: 'Phòng học B103 (60 chỗ)', type: 'classroom', areaM2: 70, devicesCount: 6 },
          { id: 'b_104', code: 'B104', name: 'Phòng Kỹ thuật & Kho dụng cụ B1', type: 'technical', areaM2: 30, devicesCount: 4 },
        ]
      },
      {
        floorNumber: 2,
        name: 'Tầng 2 - Khu B',
        rooms: [
          { id: 'b_201', code: 'B201', name: 'Phòng học B201', type: 'classroom', areaM2: 70, devicesCount: 6 },
          { id: 'b_202', code: 'B202', name: 'Phòng học B202', type: 'classroom', areaM2: 70, devicesCount: 6 },
          { id: 'b_203', code: 'B203', name: 'Phòng học B203 (Điều hòa Daikin)', type: 'classroom', areaM2: 70, devicesCount: 6 },
          { id: 'b_204', code: 'B204', name: 'Phòng học B204', type: 'classroom', areaM2: 70, devicesCount: 6 },
        ]
      },
      {
        floorNumber: 3,
        name: 'Tầng 3 - Khu B',
        rooms: [
          { id: 'b_301', code: 'B301', name: 'Phòng học B301', type: 'classroom', areaM2: 70, devicesCount: 6 },
          { id: 'b_302', code: 'B302', name: 'Phòng học B302', type: 'classroom', areaM2: 70, devicesCount: 6 },
          { id: 'b_303', code: 'B303', name: 'Phòng học Ngoại ngữ tương tác', type: 'classroom', areaM2: 85, devicesCount: 10 },
          { id: 'b_304', code: 'B304', name: 'Phòng học B304', type: 'classroom', areaM2: 70, devicesCount: 6 },
        ]
      },
      {
        floorNumber: 4,
        name: 'Tầng 4 - Khu B',
        rooms: [
          { id: 'b_401', code: 'B401', name: 'Phòng Máy tính Lab 1 (50 máy)', type: 'lab', areaM2: 95, devicesCount: 16 },
          { id: 'b_402', code: 'B402', name: 'Phòng Máy tính Lab 2 (50 máy)', type: 'lab', areaM2: 95, devicesCount: 16 },
          { id: 'b_403', code: 'B403', name: 'Phòng Tự học & Thảo luận nhóm', type: 'classroom', areaM2: 80, devicesCount: 8 },
        ]
      }
    ]
  },
  {
    id: 'bld_c',
    code: 'Khu C',
    name: 'Khu học tập chính & Hội trường – Khu C',
    floorsCount: 5,
    description: 'Hội trường lớn 500 chỗ, Bệnh viện mô phỏng Y đa khoa, phòng thực hành lâm sàng và hệ thống kỹ thuật trung tâm',
    functionType: 'Hội trường & Bệnh viện Mô phỏng Y khoa',
    powerMeterCode: 'PE-C-01',
    waterMeterCode: 'WT-C-01',
    totalDevices: 124,
    floors: [
      {
        floorNumber: 1,
        name: 'Tầng 1 - Khu C',
        rooms: [
          { id: 'c_101', code: 'C101', name: 'Đại Hội trường Trịnh Công Sơn (500 chỗ)', type: 'auditorium', areaM2: 450, devicesCount: 28 },
          { id: 'c_102', code: 'C102', name: 'Phòng Điều khiển Âm thanh & Ánh sáng sân khấu', type: 'technical', areaM2: 35, devicesCount: 14 },
          { id: 'c_103', code: 'C103', name: 'Sảnh Đón tiếp & Triển lãm Khu C', type: 'office', areaM2: 180, devicesCount: 10 },
        ]
      },
      {
        floorNumber: 2,
        name: 'Tầng 2 - Khu C',
        rooms: [
          { id: 'c_201', code: 'C201', name: 'Bệnh viện Mô phỏng - Khoa Cấp cứu & Hồi sức tích cực', type: 'hospital_sim', areaM2: 160, devicesCount: 22 },
          { id: 'c_202', code: 'C202', name: 'Bệnh viện Mô phỏng - Phòng Phẫu thuật thực nghiệm', type: 'hospital_sim', areaM2: 120, devicesCount: 18 },
          { id: 'c_203', code: 'C203', name: 'Phòng Tiệt trùng & Khử khuẩn dụng cụ y tế', type: 'technical', areaM2: 50, devicesCount: 8 },
        ]
      },
      {
        floorNumber: 3,
        name: 'Tầng 3 - Khu C',
        rooms: [
          { id: 'c_301', code: 'C301', name: 'Bệnh viện Mô phỏng - Phòng Khám đa khoa & Nhi - Sản', type: 'hospital_sim', areaM2: 140, devicesCount: 16 },
          { id: 'c_302', code: 'C302', name: 'Trung tâm Thực hành Kỹ năng Y khoa (Skillslab)', type: 'hospital_sim', areaM2: 150, devicesCount: 18 },
          { id: 'c_303', code: 'C303', name: 'Giảng đường dốc C303 (150 chỗ)', type: 'classroom', areaM2: 160, devicesCount: 12 },
        ]
      },
      {
        floorNumber: 4,
        name: 'Tầng 4 - Khu C',
        rooms: [
          { id: 'c_401', code: 'C401', name: 'Trung tâm Mô phỏng Chẩn đoán Hình ảnh & Giải phẫu', type: 'lab', areaM2: 130, devicesCount: 14 },
          { id: 'c_402', code: 'C402', name: 'Phòng Thực hành Điều dưỡng & Chăm sóc người bệnh', type: 'hospital_sim', areaM2: 140, devicesCount: 15 },
          { id: 'c_403', code: 'C403', name: 'Phòng Hội thảo Quốc tế C403', type: 'auditorium', areaM2: 110, devicesCount: 10 },
        ]
      },
      {
        floorNumber: 5,
        name: 'Tầng 5 - Khu C',
        rooms: [
          { id: 'c_501', code: 'C501', name: 'Trung tâm Khảo thí & Đánh giá năng lực OSCE', type: 'office', areaM2: 190, devicesCount: 18 },
          { id: 'c_502', code: 'C502', name: 'Phòng Giảng viên Khối Y học lâm sàng', type: 'office', areaM2: 120, devicesCount: 10 },
          { id: 'c_503', code: 'C503', name: 'Phòng Kỹ thuật Điện lạnh trung tâm tầng 5', type: 'technical', areaM2: 45, devicesCount: 8 },
        ]
      }
    ]
  },
  {
    id: 'bld_tv',
    code: 'Khu Bảo tàng – TV',
    name: 'Khu Bảo tàng – Thư viện',
    floorsCount: 2,
    description: 'Không gian văn hóa truyền thống, Bảo tàng Y học Phan Châu Trinh, Thư viện số và phòng đọc chuyên ngành',
    functionType: 'Văn hóa, Bảo tồn & Thư viện',
    powerMeterCode: 'PE-TV-01',
    waterMeterCode: 'WT-TV-01',
    totalDevices: 38,
    floors: [
      {
        floorNumber: 1,
        name: 'Tầng 1 - Thư viện & Bảo tàng',
        rooms: [
          { id: 'tv_101', code: 'TV101', name: 'Bảo tàng Danh nhân Phan Châu Trinh & Y học', type: 'library', areaM2: 240, devicesCount: 16 },
          { id: 'tv_102', code: 'TV102', name: 'Quầy Tra cứu sách & Thủ thư', type: 'office', areaM2: 40, devicesCount: 5 },
          { id: 'tv_103', code: 'TV103', name: 'Kho Lưu trữ Sách quý & Văn bản cổ', type: 'library', areaM2: 90, devicesCount: 8 },
        ]
      },
      {
        floorNumber: 2,
        name: 'Tầng 2 - Thư viện',
        rooms: [
          { id: 'tv_201', code: 'TV201', name: 'Phòng Đọc sách Tổng hợp (200 chỗ ngồi)', type: 'library', areaM2: 260, devicesCount: 14 },
          { id: 'tv_202', code: 'TV202', name: 'Phòng Đọc Kỹ thuật số & Cơ sở dữ liệu Y khoa', type: 'library', areaM2: 110, devicesCount: 18 },
        ]
      }
    ]
  },
  {
    id: 'bld_ysh',
    code: 'Khu Y sinh học',
    name: 'Trung tâm Nghiên cứu Y sinh học',
    floorsCount: 3,
    description: 'Khu phòng thí nghiệm chuyên sâu: Sinh học phân tử, Di truyền, Tế bào gốc, Vi sinh và Dược lý học',
    functionType: 'Nghiên cứu & Thí nghiệm Chuyên sâu',
    powerMeterCode: 'PE-YSH-01',
    waterMeterCode: 'WT-YSH-01',
    totalDevices: 64,
    floors: [
      {
        floorNumber: 1,
        name: 'Tầng 1 - Khu Y sinh',
        rooms: [
          { id: 'ysh_101', code: 'YSH101', name: 'Lab Sinh học Phân tử & Di truyền Y học', type: 'lab', areaM2: 120, devicesCount: 18 },
          { id: 'ysh_102', code: 'YSH102', name: 'Phòng Kho Lạnh bảo quản mẫu sinh học (-80°C)', type: 'technical', areaM2: 45, devicesCount: 10 },
          { id: 'ysh_103', code: 'YSH103', name: 'Phòng Chuẩn bị Hóa chất & Môi trường nuôi cấy', type: 'lab', areaM2: 60, devicesCount: 8 },
        ]
      },
      {
        floorNumber: 2,
        name: 'Tầng 2 - Khu Y sinh',
        rooms: [
          { id: 'ysh_201', code: 'YSH201', name: 'Lab Vi sinh vật & Ký sinh trùng', type: 'lab', areaM2: 115, devicesCount: 14 },
          { id: 'ysh_202', code: 'YSH202', name: 'Lab Miễn dịch học & Hóa sinh lâm sàng', type: 'lab', areaM2: 110, devicesCount: 14 },
        ]
      },
      {
        floorNumber: 3,
        name: 'Tầng 3 - Khu Y sinh',
        rooms: [
          { id: 'ysh_301', code: 'YSH301', name: 'Lab Nghiên cứu Dược lý & Bào chế Thực nghiệm', type: 'lab', areaM2: 130, devicesCount: 16 },
          { id: 'ysh_302', code: 'YSH302', name: 'Văn phòng Nghiên cứu sinh & Chuyên gia', type: 'office', areaM2: 70, devicesCount: 6 },
        ]
      }
    ]
  },
  {
    id: 'bld_tdtt',
    code: 'Khu Thể chất',
    name: 'Khu Rèn luyện thể chất',
    floorsCount: 1,
    description: 'Nhà thi đấu đa năng trong nhà và khu phức hợp sân vận động thể thao ngoài trời',
    functionType: 'Thể thao & Hoạt động Sinh viên',
    powerMeterCode: 'PE-TDTT-01',
    waterMeterCode: 'WT-TDTT-01',
    totalDevices: 28,
    floors: [
      {
        floorNumber: 1,
        name: 'Tầng Trệt & Khuôn viên Thể thao',
        rooms: [
          { id: 'td_101', code: 'TD101', name: 'Nhà thi đấu đa năng trong nhà (Bóng chuyền, Cầu lông, Bóng rổ)', type: 'sports', areaM2: 650, devicesCount: 16 },
          { id: 'td_102', code: 'TD102', name: 'Phòng Gym & Thể lực sinh viên', type: 'sports', areaM2: 120, devicesCount: 10 },
          { id: 'td_103', code: 'TD103', name: 'Phòng Y tế Thể thao & Thay đồ', type: 'office', areaM2: 60, devicesCount: 4 },
          { id: 'td_104', code: 'TD104', name: 'Khu Thể thao Ngoài trời (Sân bóng đá cỏ nhân tạo & Tennis)', type: 'sports', areaM2: 1800, devicesCount: 8 },
        ]
      }
    ]
  },
  {
    id: 'bld_ktxa',
    code: 'KTX A',
    name: 'Ký túc xá A',
    floorsCount: 3,
    description: 'Khu nhà nội trú sinh viên y khoa và điều dưỡng, trang bị hệ thống nước nóng, giặt ủi và PCCC vách tường',
    functionType: 'Nội trú Sinh viên',
    powerMeterCode: 'PE-KTXA-01',
    waterMeterCode: 'WT-KTXA-01',
    totalDevices: 52,
    floors: [
      {
        floorNumber: 1,
        name: 'Tầng 1 - KTX A',
        rooms: [
          { id: 'ka_101', code: 'KA101', name: 'Phòng Quản lý KTX & An ninh trực ban', type: 'office', areaM2: 35, devicesCount: 5 },
          { id: 'ka_102', code: 'KA102', name: 'Phòng Sinh hoạt chung & Nhà ăn tự phục vụ', type: 'dormitory', areaM2: 110, devicesCount: 8 },
          { id: 'ka_103', code: 'KA103', name: 'Phòng ở Sinh viên KA103', type: 'dormitory', areaM2: 32, devicesCount: 4 },
          { id: 'ka_104', code: 'KA104', name: 'Phòng ở Sinh viên KA104', type: 'dormitory', areaM2: 32, devicesCount: 4 },
        ]
      },
      {
        floorNumber: 2,
        name: 'Tầng 2 - KTX A',
        rooms: [
          { id: 'ka_201', code: 'KA201', name: 'Dãy Phòng ở KA201 - KA210', type: 'dormitory', areaM2: 320, devicesCount: 20 },
          { id: 'ka_202', code: 'KA202', name: 'Khu Giặt phơi & Bàn ủi tập trung Tầng 2', type: 'technical', areaM2: 45, devicesCount: 6 },
        ]
      },
      {
        floorNumber: 3,
        name: 'Tầng 3 - KTX A',
        rooms: [
          { id: 'ka_301', code: 'KA301', name: 'Dãy Phòng ở KA301 - KA310', type: 'dormitory', areaM2: 320, devicesCount: 20 },
          { id: 'ka_302', code: 'KA302', name: 'Phòng Tự học đêm KTX A', type: 'dormitory', areaM2: 50, devicesCount: 6 },
        ]
      }
    ]
  },
  {
    id: 'bld_ktxb',
    code: 'KTX B',
    name: 'Ký túc xá B',
    floorsCount: 2,
    description: 'Khu lưu trú chuyên gia, giảng viên thỉnh giảng quốc tế và học viên sau đại học',
    functionType: 'Nội trú Chuyên gia & Sau Đại học',
    powerMeterCode: 'PE-KTXB-01',
    waterMeterCode: 'WT-KTXB-01',
    totalDevices: 36,
    floors: [
      {
        floorNumber: 1,
        name: 'Tầng 1 - KTX B',
        rooms: [
          { id: 'kb_101', code: 'KB101', name: 'Sảnh đón tiếp chuyên gia', type: 'office', areaM2: 40, devicesCount: 4 },
          { id: 'kb_102', code: 'KB102', name: 'Căn hộ Chuyên gia KB102', type: 'dormitory', areaM2: 45, devicesCount: 7 },
          { id: 'kb_103', code: 'KB103', name: 'Căn hộ Chuyên gia KB103', type: 'dormitory', areaM2: 45, devicesCount: 7 },
        ]
      },
      {
        floorNumber: 2,
        name: 'Tầng 2 - KTX B',
        rooms: [
          { id: 'kb_201', code: 'KB201', name: 'Căn hộ Chuyên gia KB201', type: 'dormitory', areaM2: 45, devicesCount: 7 },
          { id: 'kb_202', code: 'KB202', name: 'Căn hộ Chuyên gia KB202', type: 'dormitory', areaM2: 45, devicesCount: 7 },
          { id: 'kb_203', code: 'KB203', name: 'Phòng Thảo luận chuyên môn', type: 'office', areaM2: 50, devicesCount: 6 },
        ]
      }
    ]
  }
];

export const INITIAL_DEVICES: Device[] = [
  // HVAC
  {
    id: 'dev_ac_01',
    code: 'AC-C-301',
    name: 'Máy điều hòa Inverter Treo tường Daikin 2.5HP',
    category: 'hvac',
    brand: 'Daikin',
    model: 'FTKC60UVMV',
    serialNumber: 'DK-2023-88219',
    capacity: '21,500 BTU (2.5 HP)',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    floorNumber: 3,
    roomCode: 'C301',
    installDate: '2023-08-15',
    status: 'operating',
    lastMaintenanceDate: '2026-06-10',
    nextMaintenanceDate: '2026-09-10',
    vendor: 'Điện Lạnh Quảng Nam Center',
    purchaseCost: 22500000,
    warrantyUntil: '2026-08-15',
    refrigerantType: 'R-32',
    lastFilterCleanDate: '2026-07-01',
    notes: 'Điều hòa phòng thực hành Nhi - Sản, hoạt động êm, hiệu suất tốt'
  },
  {
    id: 'dev_ac_02',
    code: 'AC-A-102',
    name: 'Điều hòa Inverter Panasonic 2.0HP Phòng HC-NS',
    category: 'hvac',
    brand: 'Panasonic',
    model: 'CU/CS-PU18XKH-8',
    serialNumber: 'PANA-2022-4411',
    capacity: '18,000 BTU (2.0 HP)',
    buildingId: 'bld_a',
    buildingName: 'Nhà làm việc – Khu A',
    floorNumber: 1,
    roomCode: 'A102',
    installDate: '2022-05-10',
    status: 'operating',
    lastMaintenanceDate: '2026-06-15',
    nextMaintenanceDate: '2026-09-15',
    vendor: 'Công ty Cơ Điện Miền Trung',
    purchaseCost: 17800000,
    warrantyUntil: '2025-05-10',
    refrigerantType: 'R-32',
    lastFilterCleanDate: '2026-07-15',
    notes: 'Phòng Cô Hoàn - Trưởng phòng HC-NS'
  },
  {
    id: 'dev_ac_03',
    code: 'AC-B-203',
    name: 'Điều hòa Cassette Âm trần Daikin 4.0HP Giảng đường',
    category: 'hvac',
    brand: 'Daikin',
    model: 'FCFC100DVM',
    serialNumber: 'DK-2021-9921',
    capacity: '34,100 BTU (4.0 HP)',
    buildingId: 'bld_b',
    buildingName: 'Khối lớp học – Khu B',
    floorNumber: 2,
    roomCode: 'B203',
    installDate: '2021-09-01',
    status: 'needs_maintenance',
    lastMaintenanceDate: '2026-04-10',
    nextMaintenanceDate: '2026-07-10', // Đã quá hạn!
    vendor: 'Điện Máy Xanh Đà Nẵng',
    purchaseCost: 36000000,
    warrantyUntil: '2024-09-01',
    refrigerantType: 'R-410A',
    lastFilterCleanDate: '2026-04-10',
    notes: 'Quạt dàn lạnh kêu nhẹ, cần xịt rửa lưới lọc và nạp bổ sung gas'
  },
  {
    id: 'dev_ac_04',
    code: 'AC-C-101',
    name: 'Hệ thống Điều hòa Trung tâm VRV Hội trường lớn',
    category: 'hvac',
    brand: 'Daikin VRV',
    model: 'RXYQ16UAYM',
    serialNumber: 'VRV-DK-5510',
    capacity: '16 HP (154,000 BTU)',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    floorNumber: 1,
    roomCode: 'C101',
    installDate: '2023-01-20',
    status: 'operating',
    lastMaintenanceDate: '2026-08-01',
    nextMaintenanceDate: '2026-11-01',
    vendor: 'Daikin Việt Nam CN Đà Nẵng',
    purchaseCost: 185000000,
    warrantyUntil: '2026-01-20',
    refrigerantType: 'R-410A',
    notes: 'Phục vụ Đại Hội trường Trịnh Công Sơn 500 chỗ'
  },
  {
    id: 'dev_ac_05',
    code: 'AC-YSH-102',
    name: 'Điều hòa Chính xác Phòng Lab Mẫu phẩm Y sinh (-80°C)',
    category: 'hvac',
    brand: 'Liebert Emerson',
    model: 'CRV020',
    serialNumber: 'EMR-2024-101',
    capacity: '20 kW Precision Cooling',
    buildingId: 'bld_ysh',
    buildingName: 'Trung tâm Nghiên cứu Y sinh học',
    floorNumber: 1,
    roomCode: 'YSH102',
    installDate: '2024-03-12',
    status: 'operating',
    lastMaintenanceDate: '2026-08-10',
    nextMaintenanceDate: '2026-09-10',
    vendor: 'Công ty Thiết bị Y tế Khoa học Sao Mai',
    purchaseCost: 240000000,
    warrantyUntil: '2027-03-12',
    notes: 'Hệ thống điều hòa chính xác nhiệt độ & độ ẩm 24/7'
  },

  // PCCC
  {
    id: 'dev_pccc_01',
    code: 'PCCC-PUMP-01',
    name: 'Máy bơm chữa cháy động cơ Điện chính (Main Electric Pump)',
    category: 'pccc',
    brand: 'Ebara (Japan)',
    model: 'FSA 100-80-250',
    serialNumber: 'EBR-PMP-2022',
    capacity: '75 kW (100 HP), Lưu lượng 150 m3/h',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    floorNumber: 1,
    roomCode: 'Phòng Bơm PCCC Trung tâm',
    installDate: '2022-06-15',
    status: 'operating',
    lastMaintenanceDate: '2026-08-05',
    nextMaintenanceDate: '2026-09-05',
    vendor: 'Công ty Cổ phần PCCC Quảng Nam',
    purchaseCost: 98000000,
    pcccType: 'pump_electric',
    pcccInspectionStatus: 'passed',
    pcccLastInspector: 'Thầy Trương Công Hiển',
    notes: 'Áp lực vận hành ổn định 8.5 bar, van hồi lưu tốt'
  },
  {
    id: 'dev_pccc_02',
    code: 'PCCC-PUMP-02',
    name: 'Máy bơm chữa cháy Diesel dự phòng (Diesel Backup Pump)',
    category: 'pccc',
    brand: 'Hyundai - Ebara',
    model: 'D4BB-FSA',
    serialNumber: 'HY-DSL-2022',
    capacity: '85 HP Diesel Engine',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    floorNumber: 1,
    roomCode: 'Phòng Bơm PCCC Trung tâm',
    installDate: '2022-06-15',
    status: 'operating',
    lastMaintenanceDate: '2026-08-20',
    nextMaintenanceDate: '2026-09-20',
    vendor: 'Công ty Cổ phần PCCC Quảng Nam',
    purchaseCost: 115000000,
    pcccType: 'pump_diesel',
    pcccInspectionStatus: 'passed',
    pcccLastInspector: 'Thầy Nguyễn Đình Huy',
    notes: 'Đề nổ ắc quy nhạy, nhiên liệu dầu diesel đầy bình (90L)'
  },
  {
    id: 'dev_pccc_03',
    code: 'PCCC-PUMP-03',
    name: 'Bơm bù áp tự động PCCC (Jockey Pump)',
    category: 'pccc',
    brand: 'Pentax (Italy)',
    model: 'MSV 4-16',
    serialNumber: 'PTX-JK-2022',
    capacity: '5.5 kW, Áp lực 12 bar',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    floorNumber: 1,
    roomCode: 'Phòng Bơm PCCC Trung tâm',
    installDate: '2022-06-15',
    status: 'operating',
    lastMaintenanceDate: '2026-08-05',
    nextMaintenanceDate: '2026-09-05',
    vendor: 'Công ty Cổ phần PCCC Quảng Nam',
    purchaseCost: 28000000,
    pcccType: 'pump_jockey',
    pcccInspectionStatus: 'passed',
    pcccLastInspector: 'Thầy Trương Công Hiển',
    notes: 'Duy trì áp lực đường ống tự động ở 7.5 - 8.5 bar'
  },
  {
    id: 'dev_pccc_04',
    code: 'PCCC-A-101',
    name: 'Tủ PCCC vách tường & Bình bột ABC 4kg Tầng 1 Khu A',
    category: 'pccc',
    brand: 'Dragon Fire',
    model: 'MFZL4 (Bột ABC)',
    capacity: '4 kg x 2 bình + Cuộn vòi D50 20m',
    buildingId: 'bld_a',
    buildingName: 'Nhà làm việc – Khu A',
    floorNumber: 1,
    roomCode: 'Hành lang Tầng 1',
    installDate: '2023-01-10',
    status: 'operating',
    lastMaintenanceDate: '2026-08-01',
    nextMaintenanceDate: '2026-09-01',
    vendor: 'PCCC Miền Trung',
    purchaseCost: 3500000,
    pcccType: 'extinguisher_abc',
    pcccInspectionStatus: 'passed',
    pcccLastInspector: 'Thầy Nguyễn Đình Huy',
    notes: 'Kim đồng hồ chỉ vạch xanh, vòi mềm không rạn nứt'
  },
  {
    id: 'dev_pccc_05',
    code: 'PCCC-B-201',
    name: 'Bình khí chữa cháy CO2 5kg Hành lang Tầng 2 Khu B',
    category: 'pccc',
    brand: 'Tomoken',
    model: 'MT5 CO2',
    capacity: '5 kg CO2',
    buildingId: 'bld_b',
    buildingName: 'Khối lớp học – Khu B',
    floorNumber: 2,
    roomCode: 'Hành lang B201',
    installDate: '2023-03-15',
    status: 'needs_maintenance',
    lastMaintenanceDate: '2026-06-05',
    nextMaintenanceDate: '2026-08-05', // Đã quá hạn kiểm tra!
    vendor: 'PCCC Miền Trung',
    purchaseCost: 1650000,
    pcccType: 'extinguisher_co2',
    pcccInspectionStatus: 'warning',
    pcccLastInspector: 'Thầy Nguyễn Đình Huy',
    notes: 'Trọng lượng cân hao hụt 0.4kg, cần nạp lại khí CO2 đạt chuẩn'
  },

  // Điện & Máy phát
  {
    id: 'dev_elec_01',
    code: 'GEN-01',
    name: 'Máy phát điện dự phòng Cummins 350 kVA Toàn trường',
    category: 'generator',
    brand: 'Cummins Power Generation',
    model: 'C350D5',
    serialNumber: 'CUM-2021-9988',
    capacity: '350 kVA / 280 kW',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    floorNumber: 1,
    roomCode: 'Trạm Kỹ thuật Điện & Máy phát ngoài trời',
    installDate: '2021-11-20',
    status: 'operating',
    lastMaintenanceDate: '2026-08-25',
    nextMaintenanceDate: '2026-09-25',
    vendor: 'Cummins DK Electric Vietnam',
    purchaseCost: 650000000,
    warrantyUntil: '2024-11-20',
    notes: 'Bộ chuyển nguồn tự động ATS hoạt động hoàn hảo trong 8 giây khi mất điện lưới'
  },
  {
    id: 'dev_elec_02',
    code: 'MSB-TOTAL',
    name: 'Tủ điện tổng hạ thế MSB Trường ĐH Phan Châu Trinh',
    category: 'electric',
    brand: 'Schneider Electric',
    model: 'Prisma Plus 1600A',
    capacity: '1600A, 3P+N 380V',
    buildingId: 'bld_a',
    buildingName: 'Nhà làm việc – Khu A',
    floorNumber: 1,
    roomCode: 'Phòng Trạm Biến Áp & MSB',
    installDate: '2021-04-10',
    status: 'operating',
    lastMaintenanceDate: '2026-07-20',
    nextMaintenanceDate: '2026-10-20',
    vendor: 'Schneider Electric Việt Nam',
    purchaseCost: 280000000,
    notes: 'Có gắn đồng hồ đo đa năng Schneider PM5350 giám sát điện năng từ xa'
  },

  // Nước & Bơm sinh hoạt
  {
    id: 'dev_water_01',
    code: 'PUMP-WT-01',
    name: 'Cụm máy bơm cấp nước sinh hoạt trung tâm (2 Bơm luân phiên)',
    category: 'water',
    brand: 'Wilo (Germany)',
    model: 'Helix V 1605',
    capacity: '15 m3/h, Cột áp 45m',
    buildingId: 'bld_ktxa',
    buildingName: 'Ký túc xá A',
    floorNumber: 1,
    roomCode: 'Phòng Bơm ngầm KTX',
    installDate: '2022-08-01',
    status: 'operating',
    lastMaintenanceDate: '2026-08-15',
    nextMaintenanceDate: '2026-09-15',
    vendor: 'Wilo Việt Nam',
    purchaseCost: 52000000,
    notes: 'Cấp nước từ bể ngầm 80m3 lên các bồn nước mái Khu A, Khu B, Khu C và KTX'
  }
];

export const INITIAL_ELECTRIC_RECORDS: ElectricityRecord[] = [
  {
    id: 'elec_rec_01',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    meterCode: 'PE-C-01',
    meterName: 'Công tơ 3 pha Khu C',
    periodMonthYear: '2026-08',
    recordedDate: '2026-08-31',
    recordedBy: 'Thầy Nguyễn Đình Huy',
    previousReading: 142500,
    currentReading: 153820,
    consumptionKwh: 11320,
    ratePerKwh: 2650,
    totalCost: 29998000,
    prevMonthConsumption: 10800,
    sameMonthLastYearConsumption: 9950,
    isAbnormalSpike: false,
    notes: 'Tháng cao điểm chạy điều hòa Hội trường và Bệnh viện mô phỏng'
  },
  {
    id: 'elec_rec_02',
    buildingId: 'bld_b',
    buildingName: 'Khối lớp học – Khu B',
    meterCode: 'PE-B-01',
    meterName: 'Công tơ 3 pha Khu B',
    periodMonthYear: '2026-08',
    recordedDate: '2026-08-31',
    recordedBy: 'Thầy Nguyễn Đình Huy',
    previousReading: 88900,
    currentReading: 96350,
    consumptionKwh: 7450,
    ratePerKwh: 2650,
    totalCost: 19742500,
    prevMonthConsumption: 7100,
    sameMonthLastYearConsumption: 6800,
    isAbnormalSpike: false,
    notes: 'Ổn định theo lịch học kỳ hè của sinh viên'
  },
  {
    id: 'elec_rec_03',
    buildingId: 'bld_a',
    buildingName: 'Nhà làm việc – Khu A',
    meterCode: 'PE-A-01',
    meterName: 'Công tơ Khối Hành chính',
    periodMonthYear: '2026-08',
    recordedDate: '2026-08-31',
    recordedBy: 'Thầy Trương Công Hiển',
    previousReading: 54100,
    currentReading: 58920,
    consumptionKwh: 4820,
    ratePerKwh: 2650,
    totalCost: 12773000,
    prevMonthConsumption: 4750,
    sameMonthLastYearConsumption: 4600,
    isAbnormalSpike: false
  },
  {
    id: 'elec_rec_04',
    buildingId: 'bld_ysh',
    buildingName: 'Trung tâm Nghiên cứu Y sinh học',
    meterCode: 'PE-YSH-01',
    meterName: 'Công tơ Khu Lab Y sinh',
    periodMonthYear: '2026-08',
    recordedDate: '2026-08-31',
    recordedBy: 'Thầy Nguyễn Đình Huy',
    previousReading: 38200,
    currentReading: 44650,
    consumptionKwh: 6450,
    ratePerKwh: 2650,
    totalCost: 17092500,
    prevMonthConsumption: 5100, // Tăng 26.4%!
    sameMonthLastYearConsumption: 4800,
    isAbnormalSpike: true,
    notes: 'CẢNH BÁO: Tiêu thụ điện tăng 26.4% do vận hành thêm buồng nuôi cấy và tủ lạnh âm sâu -80°C mới lắp'
  },
  {
    id: 'elec_rec_05',
    buildingId: 'bld_ktxa',
    buildingName: 'Ký túc xá A',
    meterCode: 'PE-KTXA-01',
    meterName: 'Công tơ KTX A',
    periodMonthYear: '2026-08',
    recordedDate: '2026-08-31',
    recordedBy: 'Thầy Nguyễn Đình Huy',
    previousReading: 62100,
    currentReading: 66800,
    consumptionKwh: 4700,
    ratePerKwh: 2650,
    totalCost: 12455000,
    prevMonthConsumption: 4500,
    sameMonthLastYearConsumption: 4400,
    isAbnormalSpike: false
  }
];

export const INITIAL_WATER_RECORDS: WaterRecord[] = [
  {
    id: 'water_rec_01',
    buildingId: 'bld_ktxa',
    buildingName: 'Ký túc xá A',
    meterCode: 'WT-KTXA-01',
    meterName: 'Đồng hồ nước KTX A',
    periodMonthYear: '2026-08',
    recordedDate: '2026-08-31',
    recordedBy: 'Thầy Nguyễn Đình Huy',
    previousReading: 8940,
    currentReading: 9460,
    consumptionM3: 520,
    ratePerM3: 13500,
    totalCost: 7020000,
    prevMonthConsumption: 495,
    isAbnormalLeak: false,
    notes: 'Khu sinh hoạt nội trú sinh viên'
  },
  {
    id: 'water_rec_02',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    meterCode: 'WT-C-01',
    meterName: 'Đồng hồ nước Khu C',
    periodMonthYear: '2026-08',
    recordedDate: '2026-08-31',
    recordedBy: 'Thầy Nguyễn Đình Huy',
    previousReading: 5120,
    currentReading: 5430,
    consumptionM3: 310,
    ratePerM3: 13500,
    totalCost: 4185000,
    prevMonthConsumption: 290,
    isAbnormalLeak: false
  },
  {
    id: 'water_rec_03',
    buildingId: 'bld_b',
    buildingName: 'Khối lớp học – Khu B',
    meterCode: 'WT-B-01',
    meterName: 'Đồng hồ nước Khu B',
    periodMonthYear: '2026-08',
    recordedDate: '2026-08-31',
    recordedBy: 'Thầy Nguyễn Đình Huy',
    previousReading: 3850,
    currentReading: 4195,
    consumptionM3: 345,
    ratePerM3: 13500,
    totalCost: 4657500,
    prevMonthConsumption: 260, // Tăng >30%
    isAbnormalLeak: true,
    notes: 'CẢNH BÁO RÒ RỈ: Phát hiện van phao bồn cầu vệ sinh tầng 3 Khu B bị kẹt đóng không khít'
  }
];

export const INITIAL_WATER_INFRASTRUCTURE: WaterInfrastructure = {
  tanks: [
    {
      id: 'tank_ground_01',
      name: 'Bể nước ngầm trung tâm ĐH Phan Châu Trinh',
      location: 'Sân sau Khu C',
      capacityM3: 120,
      currentLevelPercent: 82,
      minSafeLevelPercent: 30,
      sensorStatus: 'normal'
    },
    {
      id: 'tank_roof_c',
      name: 'Bể nước mái Khu C (Bồn Inox Sơn Hà 5000L x 4)',
      location: 'Sân thượng Khu C (Tầng 5)',
      capacityM3: 20,
      currentLevelPercent: 75,
      minSafeLevelPercent: 25,
      sensorStatus: 'normal'
    },
    {
      id: 'tank_roof_ktxa',
      name: 'Bể nước mái Ký túc xá A',
      location: 'Sân thượng KTX A (Tầng 3)',
      capacityM3: 15,
      currentLevelPercent: 22, // Xuống thấp!
      minSafeLevelPercent: 25,
      sensorStatus: 'low_warning'
    },
    {
      id: 'tank_pccc_underground',
      name: 'Bể nước ngầm chuyên dụng PCCC 100m3',
      location: 'Cạnh Trạm Bơm PCCC Trung tâm',
      capacityM3: 100,
      currentLevelPercent: 95,
      minSafeLevelPercent: 80,
      sensorStatus: 'normal'
    }
  ],
  pumps: [
    {
      id: 'pmp_main_01',
      name: 'Bơm cấp nước sinh hoạt số 1 (Chính)',
      type: 'main_supply',
      location: 'Hầm kỹ thuật Khu C',
      status: 'running',
      flowRateM3H: 15,
      pressureBar: 4.2,
      lastServiceDate: '2026-08-15'
    },
    {
      id: 'pmp_main_02',
      name: 'Bơm cấp nước sinh hoạt số 2 (Dự phòng)',
      type: 'main_supply',
      location: 'Hầm kỹ thuật Khu C',
      status: 'standby',
      flowRateM3H: 15,
      pressureBar: 4.2,
      lastServiceDate: '2026-08-15'
    },
    {
      id: 'pmp_booster_c',
      name: 'Bơm tăng áp tầng 4-5 Khu C (Y khoa)',
      type: 'booster',
      location: 'Sân thượng Khu C',
      status: 'running',
      flowRateM3H: 8,
      pressureBar: 3.5,
      lastServiceDate: '2026-07-28'
    }
  ]
};

export const INITIAL_INFRASTRUCTURE_ISSUES: InfrastructureIssue[] = [
  {
    id: 'infra_01',
    category: 'Cửa & Cửa sổ',
    buildingId: 'bld_ktxa',
    buildingName: 'Ký túc xá A',
    floorNumber: 3,
    roomOrArea: 'Hành lang phòng KA304',
    severity: 'medium',
    damageDescription: 'Bản lề cửa sổ nhôm kính bị rỉ sét do mưa gió, kẹt cứng không đóng kín được',
    detectedDate: '2026-08-28',
    detectedBy: 'Thầy Nguyễn Đình Huy',
    proposedAction: 'Thay thế bộ bản lề chữ A inox 304 và tra mỡ bảo dưỡng',
    estimatedCost: 350000,
    status: 'in_progress'
  },
  {
    id: 'infra_02',
    category: 'Trần',
    buildingId: 'bld_b',
    buildingName: 'Khối lớp học – Khu B',
    floorNumber: 4,
    roomOrArea: 'Phòng Lab máy tính B401',
    severity: 'critical',
    damageDescription: 'Tấm thạch cao trần nổi có dấu hiệu ố vàng và võng do thấm nước mưa từ khe co giãn mái',
    detectedDate: '2026-08-30',
    detectedBy: 'Thầy Trương Công Hiển',
    proposedAction: 'Chống thấm khe mái bằng màng khò bitum và thay mới 4 tấm trần thạch cao chống ẩm',
    estimatedCost: 2800000,
    status: 'pending'
  },
  {
    id: 'infra_03',
    category: 'Hệ thống thoát nước',
    buildingId: 'bld_tdtt',
    buildingName: 'Khu Rèn luyện thể chất',
    floorNumber: 1,
    roomOrArea: 'Mương thoát nước phía Nam Sân bóng đá',
    severity: 'low',
    damageDescription: 'Lá cây và rác ứ đọng nắp hố ga thoát nước làm nước thoát chậm khi mưa rào',
    detectedDate: '2026-09-01',
    detectedBy: 'Thầy Nguyễn Văn Minh',
    proposedAction: 'Nạo vét bùn rác và gia cố lưới chắn rác inox',
    estimatedCost: 200000,
    status: 'resolved'
  }
];

export const INITIAL_REPAIR_REQUESTS: RepairRequest[] = [
  {
    id: 'req_01',
    ticketCode: 'SC-2026-001',
    requesterName: 'Cô Nguyễn Thị Hoàn',
    department: 'Phòng Hành chính – Nhân sự',
    phoneNumber: '0903.345.678',
    buildingId: 'bld_a',
    buildingName: 'Nhà làm việc – Khu A',
    floorNumber: 1,
    roomCode: 'A102',
    category: 'electric',
    issueDescription: 'Bóng đèn LED tuýp panel phòng làm việc bị nhấp nháy liên tục, gây chói mắt và khó chịu khi làm việc',
    priority: 'medium',
    requestedDate: '2026-09-01 08:30',
    status: 'completed',
    assignedTo: 'user_huy',
    assignedToName: 'Thầy Nguyễn Đình Huy',
    expectedCompletionDate: '2026-09-01 16:00',
    actualCost: 185000,
    materialsUsed: [
      { materialId: 'inv_01', materialName: 'Bóng LED tuýp T8 1.2m Rạng Đông 18W', quantity: 2, unit: 'bóng', cost: 130000 },
      { materialId: 'inv_05', materialName: 'Tăng phô Driver LED Rạng Đông', quantity: 1, unit: 'cái', cost: 55000 }
    ],
    resolutionNotes: 'Đã thay mới bộ bóng LED tuýp và driver nguồn, đèn sáng đều và hoạt động tốt',
    acceptedByRequester: true,
    acceptedDate: '2026-09-01 15:30'
  },
  {
    id: 'req_02',
    ticketCode: 'SC-2026-002',
    requesterName: 'Khoa Y Đa khoa (BS. Trần Văn Hưng)',
    department: 'Khoa Y - Bệnh viện Mô phỏng',
    phoneNumber: '0905.777.888',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    floorNumber: 2,
    roomCode: 'C201',
    category: 'water',
    issueDescription: 'Vòi nước rửa tay cảm ứng tiệt trùng phòng Cấp cứu mô phỏng bị chảy yếu và rò rỉ dưới gầm lavabo',
    priority: 'high',
    requestedDate: '2026-09-02 09:15',
    status: 'in_progress',
    assignedTo: 'user_huy',
    assignedToName: 'Thầy Nguyễn Đình Huy',
    expectedCompletionDate: '2026-09-02 17:00',
    actualCost: 280000,
    materialsUsed: [
      { materialId: 'inv_06', materialName: 'Dây cấp nước inox mềm áp lực cao 60cm', quantity: 1, unit: 'sợi', cost: 95000 },
      { materialId: 'inv_07', materialName: 'Van góc khóa nước inox 304', quantity: 1, unit: 'cái', cost: 185000 }
    ],
    resolutionNotes: 'Thầy Huy đang tháo thay gioăng cao su và siết lại đầu nối rắc co'
  },
  {
    id: 'req_03',
    ticketCode: 'SC-2026-003',
    requesterName: 'Thầy Lê Thanh Tuấn',
    department: 'Bộ môn Ngoại ngữ & Đào tạo',
    phoneNumber: '0912.333.444',
    buildingId: 'bld_b',
    buildingName: 'Khối lớp học – Khu B',
    floorNumber: 2,
    roomCode: 'B203',
    category: 'hvac',
    issueDescription: 'Máy điều hòa cassette bật 18 độ nhưng chỉ ra gió thoảng, không lạnh sâu, sinh viên học rất nóng',
    priority: 'high',
    requestedDate: '2026-09-02 10:45',
    status: 'waiting_parts',
    assignedTo: 'user_huy',
    assignedToName: 'Thầy Nguyễn Đình Huy',
    expectedCompletionDate: '2026-09-03 11:00',
    resolutionNotes: 'Đã kiểm tra đồng hồ đo áp suất ga R410A thiếu còn 75 PSI (chuẩn 120-140 PSI), chờ mang bình nạp ga từ kho KTX lên'
  },
  {
    id: 'req_04',
    ticketCode: 'SC-2026-004',
    requesterName: 'Ban Quản lý KTX (Thầy Đặng Quốc)',
    department: 'Tổ Quản lý Ký túc xá',
    phoneNumber: '0935.666.999',
    buildingId: 'bld_ktxa',
    buildingName: 'Ký túc xá A',
    floorNumber: 1,
    roomCode: 'KA104',
    category: 'infrastructure',
    issueDescription: 'Ổ khóa tay nắm tròn cửa phòng KA104 bị kẹt lẫy, sinh viên khó mở khóa vào phòng',
    priority: 'medium',
    requestedDate: '2026-09-02 14:00',
    status: 'new'
  }
];

export const INITIAL_DAILY_TASKS: DailyTask[] = [
  {
    id: 'task_01',
    taskCode: 'CV-2026-001',
    title: 'Kiểm tra & Vận hành thử Máy phát điện Cummins 350kVA định kỳ tuần 1 tháng 9',
    description: 'Kiểm tra mức dầu bôi trơn máy, nước làm mát két tản nhiệt, điện áp bình ắc quy đề 24VDC, nổ máy chạy không tải 15 phút',
    assignedBy: 'Thầy Trương Công Hiển',
    assignedTo: 'user_huy',
    assignedToName: 'Thầy Nguyễn Đình Huy',
    priority: 'high',
    deadline: '2026-09-02 11:30',
    progress: 100,
    status: 'approved',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    deviceId: 'dev_elec_01',
    deviceCode: 'GEN-01',
    checklist: [
      { text: 'Kiểm tra que thăm nhớt động cơ ở mức an toàn', done: true },
      { text: 'Kiểm tra mức nước tản nhiệt két làm mát', done: true },
      { text: 'Đo điện áp ắc quy đề đạt >= 25.6 VDC', done: true },
      { text: 'Khởi động máy nổ 15 phút, ghi nhận tần số 50Hz, áp 380V', done: true },
      { text: 'Ghi nhật ký vận hành máy phát vào sổ kỹ thuật', done: true }
    ],
    timeSpentHours: 1.5,
    completedDate: '2026-09-02 11:00',
    approvedByLead: true,
    leadNotes: 'Thầy Hiển đã nghiệm thu kết quả, máy hoạt động êm, không có rò rỉ dầu'
  },
  {
    id: 'task_02',
    taskCode: 'CV-2026-002',
    title: 'Xử lý sự cố rò rỉ vòi tiệt trùng phòng Cấp cứu mô phỏng C201 (Phiếu SC-2026-002)',
    description: 'Thay dây cấp nước mềm cao áp và van khóa inox phòng Cấp cứu mô phỏng',
    assignedBy: 'Thầy Trương Công Hiển',
    assignedTo: 'user_huy',
    assignedToName: 'Thầy Nguyễn Đình Huy',
    priority: 'urgent',
    deadline: '2026-09-02 16:30',
    progress: 75,
    status: 'in_progress',
    buildingId: 'bld_c',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    roomCode: 'C201',
    checklist: [
      { text: 'Khóa van nước cục bộ tầng 2 Khu C', done: true },
      { text: 'Tháo dây cấp nước cũ bị nứt vỏ bọc inox', done: true },
      { text: 'Lắp cụm van khóa inox 304 mới', done: true },
      { text: 'Mở nước kiểm tra áp lực và thử xả không rò rỉ', done: false }
    ],
    materialsUsed: [
      { materialId: 'inv_06', materialName: 'Dây cấp nước inox mềm', quantity: 1, unit: 'sợi', cost: 95000 },
      { materialId: 'inv_07', materialName: 'Van góc khóa nước inox 304', quantity: 1, unit: 'cái', cost: 185000 }
    ],
    timeSpentHours: 2.0
  },
  {
    id: 'task_03',
    taskCode: 'CV-2026-003',
    title: 'Kiểm tra áp lực các bình chữa cháy và cụm tủ PCCC Tầng 1-2 Khu B',
    description: 'Cân trọng lượng bình CO2, kiểm tra kim áp kế bình bột ABC, kiểm tra van và cuộn vòi lăng phun PCCC',
    assignedBy: 'Thầy Trương Công Hiển',
    assignedTo: 'user_huy',
    assignedToName: 'Thầy Nguyễn Đình Huy',
    priority: 'medium',
    deadline: '2026-09-03 16:00',
    progress: 30,
    status: 'in_progress',
    buildingId: 'bld_b',
    buildingName: 'Khối lớp học – Khu B',
    checklist: [
      { text: 'Kiểm tra 6 bình bột ABC tầng 1 Khu B', done: true },
      { text: 'Kiểm tra bình CO2 hành lang B201 (cần nạp sạc)', done: true },
      { text: 'Kiểm tra vòi PCCC tầng 2 Khu B', done: false },
      { text: 'Dán tem kiểm định kỹ thuật định kỳ tháng 9/2026', done: false }
    ]
  },
  {
    id: 'task_04',
    taskCode: 'CV-2026-004',
    title: 'Ghi chỉ số điện nước toàn trường đầu tháng 9/2026 và lập bảng tổng hợp',
    description: 'Chốt chỉ số các công tơ điện tổng, công tơ phụ từng khu nhà và chỉ số đồng hồ nước sạch',
    assignedBy: 'Thầy Trương Công Hiển',
    assignedTo: 'user_hien',
    assignedToName: 'Thầy Trương Công Hiển',
    priority: 'high',
    deadline: '2026-09-01 17:00',
    progress: 100,
    status: 'approved',
    checklist: [
      { text: 'Chốt công tơ điện Khu A, B, C, TV, YSH, KTX', done: true },
      { text: 'Chốt đồng hồ nước sạch toàn trường', done: true },
      { text: 'Nhập dữ liệu vào phần mềm quản lý', done: true },
      { text: 'Lập báo cáo đối chiếu mức tiêu thụ với tháng trước', done: true }
    ],
    completedDate: '2026-09-01 16:45',
    approvedByLead: true
  }
];

export const INITIAL_MAINTENANCE_SCHEDULES: MaintenanceSchedule[] = [
  {
    id: 'maint_01',
    title: 'Vệ sinh lưới lọc, bảo dưỡng dàn lạnh điều hòa các phòng học Khu B',
    targetCategory: 'hvac',
    frequency: 'quarterly',
    frequencyLabel: 'Hàng quý (3 tháng/lần)',
    lastPerformedDate: '2026-06-10',
    nextDueDate: '2026-09-10',
    assignedToName: 'Thầy Nguyễn Đình Huy & Thợ điện lạnh ngoài',
    description: 'Xịt rửa lưới lọc bụi, tẩy dàn tản nhiệt, kiểm tra độ ồn quạt lồng sóc và đo dòng điện Ampe máy nén',
    isAutoTaskEnabled: true,
    standardChecklist: [
      'Ngắt CB nguồn điện điều hòa an toàn',
      'Tháo và vệ sinh lưới lọc bụi bằng vòi xịt nước',
      'Xịt rửa cánh tản nhiệt dàn lạnh bằng dung dịch chuyên dụng',
      'Thông tắc đường ống thoát nước ngưng chống tràn',
      'Đo dòng khởi động và dòng chạy có tải (Ampe)',
      'Đo áp suất ga R-32 / R-410A'
    ]
  },
  {
    id: 'maint_02',
    title: 'Kiểm tra bảo dưỡng định kỳ hệ thống máy bơm chữa cháy PCCC Ebara',
    targetCategory: 'pccc',
    frequency: 'monthly',
    frequencyLabel: 'Hàng tháng',
    lastPerformedDate: '2026-08-05',
    nextDueDate: '2026-09-05',
    assignedToName: 'Thầy Trương Công Hiển',
    description: 'Khởi động kiểm tra bơm điện chính, bơm diesel dự phòng và bơm bù áp. Kiểm tra tủ điều khiển tự động',
    isAutoTaskEnabled: true,
    standardChecklist: [
      'Kiểm tra van hút, van đẩy của 3 máy bơm PCCC',
      'Đo điện trở cách điện cuộn dây mô-tơ bơm điện',
      'Chạy thử bơm Diesel, kiểm tra mức dầu bôi trơn và ắc quy',
      'Kiểm tra rơ le áp lực đóng ngắt bơm bù áp',
      'Thử chuông báo và tín hiệu tủ trung tâm báo cháy'
    ]
  },
  {
    id: 'maint_03',
    title: 'Vệ sinh thau rửa khử trùng bể nước ngầm trung tâm 120m3',
    targetCategory: 'water',
    frequency: 'semi_annual',
    frequencyLabel: '6 tháng/lần',
    lastPerformedDate: '2026-03-20',
    nextDueDate: '2026-09-20',
    assignedToName: 'Tổ Kỹ thuật phối hợp Trung tâm Kiểm soát bệnh tật',
    description: 'Hút cạn đáy bùn, cọ rửa thành bể bằng Cloramin B, kiểm tra nắp đậy kín chống côn trùng và kiểm nghiệm mẫu nước',
    isAutoTaskEnabled: true,
    standardChecklist: [
      'Bơm cạn nước bể chứa ngầm',
      'Dùng máy xịt rửa áp lực cao cọ sạch rong rêu thành bể',
      'Khử trùng bằng dung dịch Cloramin B đúng nồng độ',
      'Xả sạch nước rửa và bơm đầy nước máy cấp mới',
      'Lấy mẫu nước sinh hoạt gửi xét nghiệm chỉ tiêu lý hóa - vi sinh'
    ]
  },
  {
    id: 'maint_04',
    title: 'Kiểm định an toàn & siết ốc dàn thanh cái tủ điện tổng hạ thế MSB',
    targetCategory: 'electric',
    frequency: 'semi_annual',
    frequencyLabel: '6 tháng/lần',
    lastPerformedDate: '2026-04-15',
    nextDueDate: '2026-10-15',
    assignedToName: 'Thầy Trương Công Hiển & Công ty Thí nghiệm điện',
    description: 'Dùng camera nhiệt kiểm tra phát nhiệt các đầu cốt thanh cái đồng, hút bụi công nghiệp buồng tủ và kiểm tra tiếp địa',
    isAutoTaskEnabled: true,
    standardChecklist: [
      'Chụp ảnh nhiệt hồng ngoại các điểm nối cáp và aptomat',
      'Vệ sinh hút bụi buồng tủ điện MSB',
      'Dùng cờ lê lực siết kiểm tra bu-lông dàn thanh cái đồng',
      'Đo điện trở bãi cọc tiếp địa chống sét và tiếp địa an toàn (< 4 Ohm)'
    ]
  }
];

export const INITIAL_REPAIR_HISTORY: RepairHistoryItem[] = [
  {
    id: 'rh_01',
    deviceId: 'dev_ac_03',
    deviceCode: 'AC-B-203',
    deviceName: 'Điều hòa Cassette Daikin 4.0HP B203',
    buildingName: 'Khối lớp học – Khu B',
    date: '2026-04-10',
    repairContent: 'Thay tụ kích khởi động quạt dàn nóng và nạp 0.5kg gas R-410A',
    rootCause: 'Tụ ngậm bị phù rò rỉ điện dung sau 4 năm hoạt động liên tục trong mùa thi',
    technicianName: 'Thầy Nguyễn Đình Huy',
    contractorOrVendor: 'Điện Lạnh Quảng Nam Center',
    partsReplaced: ['Tụ quạt dàn nóng 4uF 450V', 'Gas R-410A Ấn Độ'],
    cost: 850000,
    downtimeHours: 4,
    result: 'Hoàn tất - Đạt chuẩn',
    notes: 'Nhiệt độ cửa gió xuống đạt 14°C, dòng chạy ổn định 14.2A'
  },
  {
    id: 'rh_02',
    deviceId: 'dev_water_01',
    deviceCode: 'PUMP-WT-01',
    deviceName: 'Bơm nước sinh hoạt trung tâm Wilo số 1',
    buildingName: 'Ký túc xá A',
    date: '2026-06-18',
    repairContent: 'Thay phốt cơ khí làm kín trục bơm và vòng bi SKF đầu trục',
    rootCause: 'Phốt bị mòn gây rò rỉ nước nhỏ giọt vào buồng động cơ',
    technicianName: 'Thầy Trương Công Hiển',
    contractorOrVendor: 'Xưởng Cơ Khí Bơm Nước Hội An',
    partsReplaced: ['Phốt cơ khí Wilo 25mm', 'Vòng bi SKF 6306-2RS'],
    cost: 1650000,
    downtimeHours: 6,
    result: 'Hoàn tất - Đạt chuẩn',
    notes: 'Đã chạy thử tải liên tục 2 giờ không có tiếng ồn lạ và không rò rỉ'
  }
];

export const INITIAL_MAINTENANCE_HISTORY: MaintenanceHistoryItem[] = [
  {
    id: 'mh_01',
    deviceId: 'dev_ac_01',
    deviceCode: 'AC-C-301',
    deviceName: 'Điều hòa Daikin Inverter 2.5HP C301',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    date: '2026-06-10',
    maintenanceContent: 'Bảo dưỡng định kỳ quý 2: Xịt rửa lưới lọc, vệ sinh dàn lạnh và dàn nóng, khử mùi diệt khuẩn',
    technicianName: 'Thầy Nguyễn Đình Huy',
    suppliesUsed: ['Dung dịch tẩy rửa Coil Cleaner', 'Khăn lau vi sợi'],
    cost: 250000,
    result: 'Đạt chuẩn',
    recommendationNextTime: 'Dàn nóng đặt gần giếng trời thông gió tốt, quý sau kiểm tra lại đầu nối cáp tín hiệu'
  },
  {
    id: 'mh_02',
    deviceId: 'dev_pccc_01',
    deviceCode: 'PCCC-PUMP-01',
    deviceName: 'Máy bơm chữa cháy điện chính Ebara',
    buildingName: 'Khu học tập chính & Hội trường – Khu C',
    date: '2026-08-05',
    maintenanceContent: 'Bảo dưỡng định kỳ tháng 8: Bơm mỡ bôi trơn bạc đạn, kiểm tra khớp nối mềm cao su, xiết chặt các mặt bích',
    technicianName: 'Thầy Trương Công Hiển',
    suppliesUsed: ['Mỡ bò chịu nhiệt Shell Gadus S2', 'Gioăng cao su chịu áp D100'],
    cost: 450000,
    result: 'Đạt chuẩn',
    recommendationNextTime: 'Cần sơn dặm lại vị trí chân đế bơm có đốm rỉ sét nhẹ do hơi ẩm phòng bơm'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv_01',
    code: 'VT-LED-01',
    name: 'Bóng đèn LED tuýp T8 1.2m Rạng Đông 18W',
    category: 'Điện',
    unit: 'bóng',
    currentStock: 38,
    minStockThreshold: 20,
    unitPrice: 65000,
    storageLocation: 'Kệ A1 - Kho Kỹ thuật KTX A',
    lastUpdated: '2026-09-01'
  },
  {
    id: 'inv_02',
    code: 'VT-LED-02',
    name: 'Bóng đèn LED tròn đui E27 9W ánh sáng trắng',
    category: 'Điện',
    unit: 'bóng',
    currentStock: 12,
    minStockThreshold: 15, // Dưới ngưỡng tồn tối thiểu!
    unitPrice: 38000,
    storageLocation: 'Kệ A2 - Kho Kỹ thuật KTX A',
    lastUpdated: '2026-08-25'
  },
  {
    id: 'inv_03',
    code: 'VT-CB-01',
    name: 'Aptomat tép MCB 1P 16A Schneider',
    category: 'Điện',
    unit: 'cái',
    currentStock: 18,
    minStockThreshold: 10,
    unitPrice: 92000,
    storageLocation: 'Ngăn kéo B1',
    lastUpdated: '2026-08-10'
  },
  {
    id: 'inv_04',
    code: 'VT-CB-02',
    name: 'Aptomat tép MCB 2P 32A Schneider (Chuyên dùng điều hòa)',
    category: 'Điện',
    unit: 'cái',
    currentStock: 14,
    minStockThreshold: 8,
    unitPrice: 185000,
    storageLocation: 'Ngăn kéo B2',
    lastUpdated: '2026-08-15'
  },
  {
    id: 'inv_05',
    code: 'VT-DRV-01',
    name: 'Tăng phô Driver LED Rạng Đông 18W',
    category: 'Điện',
    unit: 'cái',
    currentStock: 9,
    minStockThreshold: 10, // Sắp hết
    unitPrice: 55000,
    storageLocation: 'Kệ A3',
    lastUpdated: '2026-09-01'
  },
  {
    id: 'inv_06',
    code: 'VT-ONG-01',
    name: 'Dây cấp nước inox mềm áp lực cao 60cm',
    category: 'Nước',
    unit: 'sợi',
    currentStock: 22,
    minStockThreshold: 15,
    unitPrice: 95000,
    storageLocation: 'Thùng C1',
    lastUpdated: '2026-09-02'
  },
  {
    id: 'inv_07',
    code: 'VT-VAN-01',
    name: 'Van góc khóa nước inox 304 phi 21',
    category: 'Nước',
    unit: 'cái',
    currentStock: 16,
    minStockThreshold: 10,
    unitPrice: 185000,
    storageLocation: 'Thùng C2',
    lastUpdated: '2026-09-02'
  },
  {
    id: 'inv_08',
    code: 'VT-VOI-01',
    name: 'Vòi xịt vệ sinh inox 304 kèm dây và đế cài',
    category: 'Nước',
    unit: 'bộ',
    currentStock: 15,
    minStockThreshold: 10,
    unitPrice: 145000,
    storageLocation: 'Thùng C3',
    lastUpdated: '2026-08-20'
  },
  {
    id: 'inv_09',
    code: 'VT-GAS-01',
    name: 'Bình ga lạnh R-32 Dupont 3kg nạp bổ sung',
    category: 'Điều hòa',
    unit: 'bình',
    currentStock: 4,
    minStockThreshold: 2,
    unitPrice: 650000,
    storageLocation: 'Kho gas chuyên dụng',
    lastUpdated: '2026-08-15'
  },
  {
    id: 'inv_10',
    code: 'VT-PCCC-01',
    name: 'Bình chữa cháy bột ABC MFZL4 (4kg) dự phòng mới',
    category: 'PCCC',
    unit: 'bình',
    currentStock: 8,
    minStockThreshold: 5,
    unitPrice: 280000,
    storageLocation: 'Kho PCCC Khu C',
    lastUpdated: '2026-08-01'
  },
  {
    id: 'inv_11',
    code: 'VT-XD-01',
    name: 'Tấm thạch cao trần thả chống ẩm 60x60cm Vĩnh Tường',
    category: 'Xây dựng',
    unit: 'tấm',
    currentStock: 45,
    minStockThreshold: 20,
    unitPrice: 42000,
    storageLocation: 'Kho Vật tư xây dựng',
    lastUpdated: '2026-08-18'
  },
  {
    id: 'inv_12',
    code: 'VT-SON-01',
    name: 'Thùng sơn nước nội thất Dulux màu trắng sứ 18L',
    category: 'Xây dựng',
    unit: 'thùng',
    currentStock: 3,
    minStockThreshold: 2,
    unitPrice: 1450000,
    storageLocation: 'Kho Vật tư xây dựng',
    lastUpdated: '2026-08-10'
  }
];

export const INITIAL_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'txn_01',
    itemId: 'inv_01',
    itemName: 'Bóng đèn LED tuýp T8 1.2m Rạng Đông 18W',
    type: 'export',
    quantity: 2,
    unitPrice: 65000,
    totalAmount: 130000,
    date: '2026-09-01 14:00',
    performedBy: 'Thầy Nguyễn Đình Huy',
    recipientOrSupplier: 'Phòng Hành chính - Nhân sự A102',
    referenceTaskId: 'SC-2026-001',
    notes: 'Thay thế bóng đèn chập chờn phòng Cô Hoàn'
  },
  {
    id: 'txn_02',
    itemId: 'inv_06',
    itemName: 'Dây cấp nước inox mềm áp lực cao 60cm',
    type: 'export',
    quantity: 1,
    unitPrice: 95000,
    totalAmount: 95000,
    date: '2026-09-02 10:00',
    performedBy: 'Thầy Nguyễn Đình Huy',
    recipientOrSupplier: 'Phòng Cấp cứu mô phỏng C201',
    referenceTaskId: 'SC-2026-002',
    notes: 'Thay thế dây mềm lavabo bị nứt rò nước'
  },
  {
    id: 'txn_03',
    itemId: 'inv_01',
    itemName: 'Bóng đèn LED tuýp T8 1.2m Rạng Đông 18W',
    type: 'import',
    quantity: 40,
    unitPrice: 65000,
    totalAmount: 2600000,
    date: '2026-08-20 09:30',
    performedBy: 'Thầy Trương Công Hiển',
    recipientOrSupplier: 'Đại lý Thiết bị Điện Quang Nam',
    notes: 'Nhập kho dự phòng đầu năm học mới'
  }
];

export const INITIAL_BUDGET: BudgetItem[] = [
  {
    id: 'bdg_01',
    year: 2026,
    category: 'Điện',
    allocatedBudget: 550000000, // 550 triệu
    usedBudget: 345200000,
    committedBudget: 58000000,
    notes: 'Tiền điện lưới EVN toàn bộ các khu nhà năm 2026'
  },
  {
    id: 'bdg_02',
    year: 2026,
    category: 'Nước',
    allocatedBudget: 110000000, // 110 triệu
    usedBudget: 68400000,
    committedBudget: 12000000,
    notes: 'Tiền nước sinh hoạt sạch và xử lý nước thải'
  },
  {
    id: 'bdg_03',
    year: 2026,
    category: 'Bảo trì',
    allocatedBudget: 220000000, // 220 triệu
    usedBudget: 135000000,
    committedBudget: 35000000,
    notes: 'Bảo dưỡng định kỳ thang máy, máy phát, trạm điện, PCCC'
  },
  {
    id: 'bdg_04',
    year: 2026,
    category: 'Sửa chữa',
    allocatedBudget: 180000000, // 180 triệu
    usedBudget: 98500000,
    committedBudget: 22000000,
    notes: 'Sửa chữa đột xuất thiết bị, điện nước, thiết bị y khoa mô phỏng'
  },
  {
    id: 'bdg_05',
    year: 2026,
    category: 'Vật tư',
    allocatedBudget: 90000000, // 90 triệu
    usedBudget: 52400000,
    committedBudget: 14000000,
    notes: 'Mua sắm vật tư tiêu hao điện, nước, phụ kiện thay thế kho'
  },
  {
    id: 'bdg_06',
    year: 2026,
    category: 'Điều hòa',
    allocatedBudget: 140000000, // 140 triệu
    usedBudget: 76000000,
    committedBudget: 18000000,
    notes: 'Vệ sinh định kỳ, nạp gas, thay thế điều hòa cũ hỏng'
  },
  {
    id: 'bdg_07',
    year: 2026,
    category: 'PCCC',
    allocatedBudget: 120000000, // 120 triệu
    usedBudget: 64500000,
    committedBudget: 15000000,
    notes: 'Kiểm định, nạp sạc bình chữa cháy, bảo dưỡng cụm bơm chữa cháy'
  },
  {
    id: 'bdg_08',
    year: 2026,
    category: 'Xây dựng',
    allocatedBudget: 250000000, // 250 triệu
    usedBudget: 162000000,
    committedBudget: 40000000,
    notes: 'Chống thấm mái, sơn sửa tường lớp học, cải tạo sân bãi'
  },
  {
    id: 'bdg_09',
    year: 2026,
    category: 'Cây xanh',
    allocatedBudget: 60000000, // 60 triệu
    usedBudget: 38000000,
    committedBudget: 6000000,
    notes: 'Chăm sóc cảnh quan, cắt tỉa cành cây phòng chống bão'
  },
  {
    id: 'bdg_10',
    year: 2026,
    category: 'Vệ sinh',
    allocatedBudget: 130000000, // 130 triệu
    usedBudget: 84000000,
    committedBudget: 20000000,
    notes: 'Dịch vụ thu gom rác, hóa chất xử lý bể phốt, lau kính tòa nhà'
  },
  {
    id: 'bdg_11',
    year: 2026,
    category: 'Khác',
    allocatedBudget: 50000000, // 50 triệu
    usedBudget: 18200000,
    committedBudget: 5000000,
    notes: 'Các chi phí phát sinh kỹ thuật đột xuất ngoài dự toán'
  }
];

export const INITIAL_DAILY_REPORTS: TechnicianDailyReport[] = [
  {
    id: 'rep_01',
    date: '2026-09-01',
    technicianId: 'user_huy',
    technicianName: 'Thầy Nguyễn Đình Huy',
    completedTasksSummary: '1. Thay mới 2 bóng LED tuýp Rạng Đông phòng HC-NS A102 (SC-2026-001).\n2. Ghi chốt chỉ số công tơ điện nước toàn bộ các khu nhà đầu tháng 9.\n3. Kiểm tra vận hành máy bơm nước sinh hoạt Wilo hầm KTX.',
    unfinishedTasksSummary: 'Bảo dưỡng cụm điều hòa Cassette phòng B203 chưa làm do phòng có lớp học bù buổi chiều.',
    unfinishedReason: 'Giảng viên đang dạy lớp Ngoại ngữ y khoa từ 13h30 đến 17h00.',
    incidentsEncountered: 'Phát hiện đồng hồ nước Khu B có lưu lượng rò rỉ nhẹ van phao bồn cầu tầng 3.',
    materialsUsedSummary: '2 bóng LED tuýp 18W, 1 tăng phô LED driver (Tổng tiền: 185.000 VNĐ).',
    workingHours: 8,
    photos: [],
    tomorrowProposals: 'Sáng mai 8h30 sang phòng B203 kiểm tra nạp bổ sung gas điều hòa; xử lý thay gioăng van phao bồn cầu Khu B.',
    isApprovedByLead: true,
    leadApprovalDate: '2026-09-01 17:30',
    leadFeedback: 'Đã duyệt báo cáo. Thầy Huy ưu tiên xử lý van nước Khu B trước 10h sáng mai để tránh lãng phí nước sạch.'
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt_01',
    type: 'critical',
    severity: 'red',
    title: 'CẢNH BÁO RÒ RỈ NƯỚC BẤT THƯỜNG',
    message: 'Chỉ số tiêu thụ nước Khu B tăng vọt >30% (345 m³). Nghi ngờ rò rỉ van phao bồn cầu vệ sinh tầng 3.',
    timestamp: '2026-09-02 08:00',
    isRead: false,
    actionModule: 'water',
    actionId: 'water_rec_03'
  },
  {
    id: 'alt_02',
    type: 'overdue',
    severity: 'orange',
    title: 'THIẾT BỊ QUÁ HẠN BẢO TRÌ',
    message: 'Điều hòa Cassette Daikin B203 (AC-B-203) đã quá hạn bảo trì 53 ngày (hạn: 10/07/2026). Hiện máy làm lạnh kém.',
    timestamp: '2026-09-02 07:30',
    isRead: false,
    actionModule: 'hvac',
    actionId: 'dev_ac_03'
  },
  {
    id: 'alt_03',
    type: 'maintenance',
    severity: 'yellow',
    title: 'SẮP ĐẾN HẠN BẢO TRÌ ĐỊNH KỲ',
    message: 'Máy bơm PCCC Ebara chính và Điều hòa C301 đến hạn bảo dưỡng định kỳ trong 3 ngày tới (05/09 & 10/09).',
    timestamp: '2026-09-01 14:00',
    isRead: false,
    actionModule: 'pccc',
    actionId: 'dev_pccc_01'
  },
  {
    id: 'alt_04',
    type: 'ticket',
    severity: 'blue',
    title: 'YÊU CẦU SỬA CHỮA MỚI TỪ PHÒNG BAN',
    message: 'Ban Quản lý KTX A vừa gửi yêu cầu SC-2026-004: Ổ khóa tay nắm tròn cửa phòng KA104 bị kẹt lẫy.',
    timestamp: '2026-09-02 14:05',
    isRead: false,
    actionModule: 'repair',
    actionId: 'req_04'
  },
  {
    id: 'alt_05',
    type: 'completed',
    severity: 'green',
    title: 'CÔNG VIỆC KỸ THUẬT ĐÃ HOÀN THÀNH',
    message: 'Thầy Nguyễn Đình Huy đã hoàn thành bảo dưỡng & thử tải máy phát điện Cummins 350kVA (CV-2026-001).',
    timestamp: '2026-09-02 11:15',
    isRead: true,
    actionModule: 'tasks',
    actionId: 'task_01'
  },
  {
    id: 'alt_06',
    type: 'inventory',
    severity: 'yellow',
    title: 'CẢNH BÁO TỒN KHO DƯỚI MỨC TỐI THIỂU',
    message: 'Bóng LED tròn 9W (còn 12 bóng, tối thiểu 15) và Driver Rạng Đông (còn 9 cái, tối thiểu 10) cần nhập bổ sung.',
    timestamp: '2026-09-01 16:00',
    isRead: false,
    actionModule: 'inventory',
    actionId: 'inv_02'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    timestamp: '2026-09-01 08:30:15',
    actorName: 'Cô Nguyễn Thị Hoàn',
    actorRole: 'Trưởng phòng HC-NS',
    actionType: 'TẠO',
    entity: 'Yêu cầu sửa chữa',
    entityIdentifier: 'SC-2026-001',
    details: 'Gửi yêu cầu sửa chữa bóng đèn LED phòng A102 nhấp nháy'
  },
  {
    id: 'log_02',
    timestamp: '2026-09-01 09:00:22',
    actorName: 'Thầy Trương Công Hiển',
    actorRole: 'Tổ trưởng CSHT',
    actionType: 'PHÊ DUYỆT',
    entity: 'Yêu cầu sửa chữa',
    entityIdentifier: 'SC-2026-001',
    details: 'Tiếp nhận phiếu và phân công Thầy Nguyễn Đình Huy xử lý'
  },
  {
    id: 'log_03',
    timestamp: '2026-09-01 15:30:40',
    actorName: 'Thầy Nguyễn Đình Huy',
    actorRole: 'Tổ viên Kỹ thuật',
    actionType: 'CHUYỂN TRẠNG THÁI',
    entity: 'Công việc kỹ thuật',
    entityIdentifier: 'SC-2026-001',
    details: 'Hoàn thành thay 2 bóng LED và nghiệm thu với Phòng HC-NS'
  },
  {
    id: 'log_04',
    timestamp: '2026-09-01 17:35:00',
    actorName: 'Thầy Trương Công Hiển',
    actorRole: 'Tổ trưởng CSHT',
    actionType: 'PHÊ DUYỆT',
    entity: 'Báo cáo ngày KTV',
    entityIdentifier: 'REP-2026-09-01',
    details: 'Phê duyệt báo cáo ca làm việc ngày 01/09/2026 của Thầy Huy'
  },
  {
    id: 'log_05',
    timestamp: '2026-09-02 09:30:10',
    actorName: 'Thầy Trương Công Hiển',
    actorRole: 'Tổ trưởng CSHT',
    actionType: 'TẠO',
    entity: 'Công việc kỹ thuật',
    entityIdentifier: 'CV-2026-002',
    details: 'Giao việc sửa chữa rò rỉ vòi tiệt trùng phòng C201 cho Thầy Huy'
  }
];

// LỊCH SỬ THAY ĐỔI DỮ LIỆU GỐC (Bảo vệ dữ liệu quan trọng: Trước/Sau, Người sửa, Lý do - Không được xóa)
export const INITIAL_MASTER_DATA_LOGS: MasterDataChangeLog[] = [
  {
    id: 'md_log_01',
    timestamp: '2026-08-25 14:20:15',
    actorId: 'user_hien',
    actorName: 'Thầy Trương Công Hiển',
    actorRole: 'Tổ trưởng Tổ CSHT (Cấp 1)',
    targetType: 'building',
    targetId: 'bld_b',
    targetCode: 'Khu B',
    targetName: 'Nhà học lý thuyết – Khu B',
    fieldName: 'totalAreaM2',
    fieldLabel: 'Diện tích khu nhà',
    beforeValue: '2.500 m²',
    afterValue: '2.650 m²',
    reason: 'Đo đạc hoàn công sau khi cơi nới mở rộng sảnh kết nối hành lang sang Khu C'
  },
  {
    id: 'md_log_02',
    timestamp: '2026-08-28 09:15:30',
    actorId: 'user_hien',
    actorName: 'Thầy Trương Công Hiển',
    actorRole: 'Tổ trưởng Tổ CSHT (Cấp 1)',
    targetType: 'room',
    targetId: 'rm_c201',
    targetCode: 'C-201',
    targetName: 'Phòng thực hành Dược lâm sàng',
    fieldName: 'areaM2',
    fieldLabel: 'Diện tích phòng',
    beforeValue: '65 m²',
    afterValue: '78 m²',
    reason: 'Sáp nhập kho phụ vào phòng thực hành theo công văn số 12/ĐHPCT-BGH'
  },
  {
    id: 'md_log_03',
    timestamp: '2026-09-01 10:45:00',
    actorId: 'user_hien',
    actorName: 'Thầy Trương Công Hiển',
    actorRole: 'Tổ trưởng Tổ CSHT (Cấp 1)',
    targetType: 'device',
    targetId: 'dev_ac_c301',
    targetCode: 'AC-C-301',
    targetName: 'Điều hòa Daikin Inverter 2.5 HP',
    fieldName: 'capacity',
    fieldLabel: 'Công suất thiết bị',
    beforeValue: '18.000 BTU',
    afterValue: '24.000 BTU',
    reason: 'Thay mới cụm máy nén và dàn lạnh công suất lớn hơn phục vụ phòng máy chủ mới'
  }
];

// DANH SÁCH ĐỀ NGHỊ CẬP NHẬT THÔNG TIN DỮ LIỆU GỐC (Từ Tổ viên KTV gửi Tổ trưởng Thầy Hiển duyệt)
export const INITIAL_MASTER_DATA_PROPOSALS: MasterDataProposal[] = [
  {
    id: 'prop_01',
    proposalCode: 'DX-2026-001',
    proposerId: 'user_huy',
    proposerName: 'Thầy Nguyễn Đình Huy',
    proposerRole: 'Tổ viên Kỹ thuật (Cấp 2)',
    createdAt: '2026-09-02 08:30',
    targetType: 'device',
    targetId: 'dev_pump_01',
    targetCode: 'PUMP-MAIN-01',
    targetName: 'Máy bơm cấp nước tăng áp trục đứng Pentax',
    fieldName: 'capacity',
    fieldLabel: 'Công suất bơm',
    currentValue: '7.5 kW',
    proposedValue: '11 kW',
    reason: 'Kiểm tra thực tế tem máy sau khi thay động cơ dự phòng thấy ghi 11 kW - 15 HP, đề nghị Tổ trưởng cập nhật lại dữ liệu gốc tài sản.',
    status: 'pending'
  },
  {
    id: 'prop_02',
    proposalCode: 'DX-2026-002',
    proposerId: 'user_huy',
    proposerName: 'Thầy Nguyễn Đình Huy',
    proposerRole: 'Tổ viên Kỹ thuật (Cấp 2)',
    createdAt: '2026-09-01 14:00',
    targetType: 'room',
    targetId: 'rm_a105',
    targetCode: 'A-105',
    targetName: 'Phòng học chuyên đề 105',
    fieldName: 'capacity',
    fieldLabel: 'Sức chứa phòng',
    currentValue: '40 sinh viên',
    proposedValue: '55 sinh viên',
    reason: 'Đã bổ sung thêm 5 bộ bàn ghế đôi theo yêu cầu của Phòng Đào tạo.',
    status: 'approved',
    reviewedBy: 'Thầy Trương Công Hiển',
    reviewedAt: '2026-09-01 16:00',
    reviewNotes: 'Đã kiểm tra thực địa, đồng ý cập nhật sức chứa lên 55 chỗ.'
  }
];

export const INITIAL_RBAC_AUDIT_LOGS: RbacAuditLog[] = [
  {
    id: 'rbac_log_001',
    timestamp: '18:30 – 04/09/2026',
    actorUsername: '@truongconghien',
    actorName: 'Thầy Trương Công Hiển',
    targetUserId: 'user_huy',
    targetUsername: '@nguyendinhhuy',
    targetName: 'Thầy Nguyễn Đình Huy',
    action: 'CHANGE_ROLE',
    oldRole: 'TECHNICIAN',
    newRole: 'TO_VIEN',
    description: 'Điều chỉnh chức vụ Tổ viên Kỹ thuật Vận hành, giao phụ trách hệ thống trạm bơm và PCCC.'
  },
  {
    id: 'rbac_log_002',
    timestamp: '14:15 – 03/09/2026',
    actorUsername: '@truongconghien',
    actorName: 'Thầy Trương Công Hiển',
    targetUserId: 'user_huy',
    targetUsername: '@nguyendinhhuy',
    targetName: 'Thầy Nguyễn Đình Huy',
    action: 'UPDATE_PERMISSION',
    description: 'Cấp quyền EDIT cho module Thiết bị (cập nhật thông số vận hành và kiểm tra bảo dưỡng định kỳ).'
  },
  {
    id: 'rbac_log_003',
    timestamp: '09:20 – 02/09/2026',
    actorUsername: '@truongconghien',
    actorName: 'Thầy Trương Công Hiển',
    targetUserId: 'user_minh',
    targetUsername: '@nguyenvanminh',
    targetName: 'Thầy Nguyễn Văn Minh',
    action: 'RESET_PASSWORD',
    description: 'Thầy Trương Công Hiển đã đặt lại mật khẩu an toàn theo yêu cầu xác minh bảo mật của cán bộ.'
  },
  {
    id: 'rbac_log_004',
    timestamp: '08:00 – 01/09/2026',
    actorUsername: '@truongconghien',
    actorName: 'Thầy Trương Công Hiển',
    targetUserId: 'user_khoayduoc',
    targetUsername: '@khoayduoc',
    targetName: 'Khoa Y - Dược',
    action: 'CREATE_USER',
    newRole: 'DEPARTMENT_USER',
    description: 'Khởi tạo tài khoản Khoa Y - Dược (Cấp 5 - Giảng viên / Phòng ban), cấp quyền gửi yêu cầu sửa chữa và xem thông báo hạ tầng.'
  }
];


