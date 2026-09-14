import React, { useState } from 'react';
import { 
  Users, Shield, KeyRound, Lock, Unlock, UserPlus, Trash2, CheckCircle2,
  AlertTriangle, History, FileCheck, Search, Filter, RefreshCw, X, ShieldAlert,
  Calendar, Eye, Phone, Mail, Building, Clock, ChevronRight, Check, Edit3,
  Sliders, ShieldCheck, Download, Copy, CheckCheck, UserCheck, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  UserProfile, UserRole, AccountStatus, MasterDataProposal, MasterDataChangeLog, 
  RbacAuditLog, PermissionAction 
} from '../types';
import { 
  canManageAccounts, canEditMasterData, ALL_SYSTEM_MODULES, ALL_PERMISSION_ACTIONS,
  getDefaultRolePermissions
} from '../utils/authSecurity';

export const AccountsAndRbacView: React.FC = () => {
  const { 
    currentUser, users, createUser, updateUserProfile, toggleLockUser, setUserStatus,
    resetUserPassword, updateUserRole, updateUserPermissions, deleteUser,
    masterDataLogs, proposals, approveProposal, rejectProposal, rbacAuditLogs
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'rbac_matrix' | 'rbac_audit' | 'proposals' | 'master_logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked' | 'disabled'>('all');
  
  // User creation Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    username: '',
    rawPassword: '',
    title: '',
    department: 'Tổ Quản Lý Cơ Sở Hạ Tầng',
    phone: '',
    email: '',
    role: 'technical_staff' as UserRole,
    tier: 2 as 1 | 2 | 3 | 4 | 5,
    status: 'active' as AccountStatus
  });

  // Action feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Proposal Review Modal
  const [reviewingProposal, setReviewingProposal] = useState<MasterDataProposal | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Super Admin Management Modals
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editUserData, setEditUserData] = useState({
    name: '',
    displayName: '',
    title: '',
    department: '',
    phone: '',
    email: '',
    bio: ''
  });

  // Change Role Modal
  const [roleChangeUser, setRoleChangeUser] = useState<UserProfile | null>(null);
  const [selectedRoleTier, setSelectedRoleTier] = useState<{ role: UserRole; tier: 1 | 2 | 3 | 4 | 5 }>({
    role: 'technical_staff',
    tier: 2
  });
  const [roleChangeReason, setRoleChangeReason] = useState('');

  // Granular Permission Matrix Modal
  const [permEditUser, setPermEditUser] = useState<UserProfile | null>(null);
  const [userPermMatrix, setUserPermMatrix] = useState<Record<string, PermissionAction[]>>({});

  // Reset Password Modal
  const [resetPassUser, setResetPassUser] = useState<UserProfile | null>(null);
  const [customResetPassword, setCustomResetPassword] = useState('');
  const [lastGeneratedPassword, setLastGeneratedPassword] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // RBAC Audit Log Filters
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');

  const isSuperAdmin = currentUser?.tier === 1; // Thầy Trương Công Hiển

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.username.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ Họ tên và Tên đăng nhập.' });
      return;
    }

    const cleanNewUsername = (newUserData.username || '').trim().toLowerCase().replace(/^@+/, '');
    if ((users || []).some(u => (u?.username || '').toLowerCase().replace(/^@+/, '') === cleanNewUsername)) {
      setFeedbackMsg({ type: 'error', text: 'Tên đăng nhập này đã được sử dụng.' });
      return;
    }

    try {
      await createUser({
        ...newUserData,
        username: cleanNewUsername
      });
      setIsAddUserModalOpen(false);
      setNewUserData({
        name: '',
        username: '',
        rawPassword: '',
        title: '',
        department: 'Tổ Quản Lý Cơ Sở Hạ Tầng',
        phone: '',
        email: '',
        role: 'technical_staff',
        tier: 2,
        status: 'active'
      });
      setFeedbackMsg({ type: 'success', text: `Đã tạo tài khoản thành công cho ${newUserData.name} (@${cleanNewUsername}).` });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Có lỗi xảy ra khi tạo tài khoản.' });
    }
  };

  // Open Edit User Info Modal
  const handleOpenEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name || '',
      displayName: user.displayName || user.name || '',
      title: user.title || '',
      department: user.department || '',
      phone: user.phone || '',
      email: user.email || '',
      bio: user.bio || ''
    });
  };

  // Save Edit User Info
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editUserData.name.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Họ tên không được để trống.' });
      return;
    }

    updateUserProfile(editingUser.id, {
      name: editUserData.name.trim(),
      displayName: editUserData.displayName.trim() || editUserData.name.trim(),
      title: editUserData.title.trim(),
      department: editUserData.department.trim(),
      phone: editUserData.phone.trim(),
      email: editUserData.email.trim(),
      bio: editUserData.bio.trim()
    });

    setEditingUser(null);
    setFeedbackMsg({ type: 'success', text: `Đã cập nhật thông tin hồ sơ cho tài khoản ${editingUser.name}.` });
  };

  // Open Role Change Modal
  const handleOpenChangeRole = (user: UserProfile) => {
    setRoleChangeUser(user);
    setSelectedRoleTier({ role: user.role, tier: user.tier });
    setRoleChangeReason(`Thầy Trương Công Hiển điều chỉnh nhiệm vụ công tác tại Trường ĐH Phan Châu Trinh.`);
  };

  // Confirm Role Change
  const handleConfirmRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleChangeUser) return;

    updateUserRole(roleChangeUser.id, selectedRoleTier.role, selectedRoleTier.tier, roleChangeReason);
    setRoleChangeUser(null);
    setFeedbackMsg({ 
      type: 'success', 
      text: `Đã cập nhật vai trò mới cho ${roleChangeUser.name}: Cấp ${selectedRoleTier.tier} (${selectedRoleTier.role}).` 
    });
  };

  // Open Granular Permission Editor
  const handleOpenPermMatrix = (user: UserProfile) => {
    setPermEditUser(user);
    const existing = user.permissions ? JSON.parse(JSON.stringify(user.permissions)) : getDefaultRolePermissions(String(user.role));
    setUserPermMatrix(existing);
  };

  // Toggle single action in matrix
  const handleTogglePermAction = (moduleId: string, action: PermissionAction) => {
    setUserPermMatrix(prev => {
      const current = prev[moduleId] || [];
      const updated = current.includes(action)
        ? current.filter(a => a !== action)
        : [...current, action];
      return { ...prev, [moduleId]: updated };
    });
  };

  // Save Granular Permissions
  const handleSavePermMatrix = () => {
    if (!permEditUser) return;
    updateUserPermissions(permEditUser.id, userPermMatrix);
    setPermEditUser(null);
    setFeedbackMsg({
      type: 'success',
      text: `Đã lưu cấu hình ma trận phân quyền chi tiết cho ${permEditUser.name}.`
    });
  };

  // Open Reset Password Modal
  const handleOpenResetPassword = (user: UserProfile) => {
    setResetPassUser(user);
    setCustomResetPassword('');
    setLastGeneratedPassword(null);
    setCopiedPassword(false);
  };

  // Confirm Reset Password
  const handleExecuteResetPassword = async (isRandom: boolean) => {
    if (!resetPassUser) return;
    const finalPass = isRandom 
      ? ('Pctu@' + Math.floor(100000 + Math.random() * 900000))
      : customResetPassword.trim();

    if (!isRandom && (!finalPass || finalPass.length < 6)) {
      setFeedbackMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    const generated = await resetUserPassword(resetPassUser.id, finalPass);
    setLastGeneratedPassword(generated);
    setFeedbackMsg({
      type: 'success',
      text: `Đã đặt lại mật khẩu mới cho ${resetPassUser.name}. Vui lòng sao chép và gửi cho nhân sự.`
    });
  };

  // Copy password to clipboard
  const handleCopyPassword = () => {
    if (!lastGeneratedPassword) return;
    navigator.clipboard.writeText(lastGeneratedPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Filtered Users List
  const filteredUsers = (users || []).filter(u => {
    if (!u) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchSearch = (u.name || '').toLowerCase().includes(term) ||
      (u.username || '').toLowerCase().includes(term) ||
      (u.department || '').toLowerCase().includes(term) ||
      (u.title || '').toLowerCase().includes(term);
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered RBAC Audit Logs
  const filteredAuditLogs = (rbacAuditLogs || []).filter(log => {
    if (!log) return false;
    const term = (auditSearchTerm || '').toLowerCase();
    const matchSearch = (log.actorName || '').toLowerCase().includes(term) ||
      (log.actorUsername || '').toLowerCase().includes(term) ||
      (log.targetName || '').toLowerCase().includes(term) ||
      (log.targetUsername || '').toLowerCase().includes(term) ||
      (log.description || '').toLowerCase().includes(term);
    const matchAction = auditActionFilter === 'ALL' || log.action === auditActionFilter;
    return matchSearch && matchAction;
  });

  // Export RBAC Audit Logs to JSON
  const handleExportAuditLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rbacAuditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PCTU_RBAC_Audit_Logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const pendingProposalsCount = (proposals || []).filter(p => p && p.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-blue-600 text-white shadow-xs">
                <Shield className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                QUẢN TRỊ TÀI KHOẢN, PHÂN QUYỀN RBAC & DỮ LIỆU GỐC
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Phân cấp quản trị 5 Cấp Quyền • Kiểm soát dữ liệu hạ tầng gốc • Nhật ký phân quyền kiểm toán bất biến
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Cấp 1 – Toàn quyền Quản trị (Thầy Trương Công Hiển)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <Lock className="w-3.5 h-3.5" />
                Cấp {currentUser?.tier} – Chế độ {currentUser?.tier === 3 ? 'Giám sát & Xem' : 'Vận hành'}
              </span>
            )}
          </div>
        </div>

        {/* Action feedback toast */}
        {feedbackMsg && (
          <div className={`mt-3 p-3 rounded-md text-xs flex items-center justify-between ${
            feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-500 hover:text-slate-900 font-bold px-2 py-0.5">×</button>
          </div>
        )}

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 mt-3 pt-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'users' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Danh sách tài khoản ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rbac_matrix')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'rbac_matrix' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Mô hình phân quyền 5 Cấp</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rbac_audit')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'rbac_audit' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Nhật ký Phân quyền RBAC (Audit Log) ({rbacAuditLogs?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('proposals')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 shrink-0 relative cursor-pointer ${
              activeSubTab === 'proposals' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Đề nghị cập nhật thông tin</span>
            {pendingProposalsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {pendingProposalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('master_logs')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'master_logs' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử thay đổi Dữ liệu gốc ({masterDataLogs.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: DANH SÁCH TÀI KHOẢN (USER MANAGEMENT) */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          {/* Controls toolbar */}
          <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo họ tên, username (@...), chức vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-blue-500 text-slate-700"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Bị khóa</option>
                <option value="disabled">Vô hiệu hóa</option>
              </select>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Thêm tài khoản mới</span>
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Họ và tên / Username</th>
                  <th className="py-2.5 px-3">Chức vụ & Đơn vị</th>
                  <th className="py-2.5 px-3 text-center">Cấp quyền (RBAC)</th>
                  <th className="py-2.5 px-3">Liên hệ</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3">Đăng nhập gần nhất</th>
                  {isSuperAdmin && <th className="py-2.5 px-3 text-right">Thao tác quản trị</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isUserHien = u.username.replace(/^@+/, '').toLowerCase() === 'truongconghien';

                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.status === 'locked' ? 'bg-amber-50/30' : u.status === 'disabled' ? 'bg-red-50/20' : ''}`}>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {u.avatar ? (
                            <img 
                              src={u.avatar} 
                              alt={u.name} 
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${
                              u.tier === 1 ? 'bg-blue-600' :
                              u.tier === 2 ? 'bg-amber-600' :
                              u.tier === 3 ? 'bg-emerald-600' :
                              u.tier === 4 ? 'bg-indigo-600' : 'bg-purple-600'
                            }`}>
                              {u.name.split(' ').slice(-1)[0][0]}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">Bạn</span>
                              )}
                              {isUserHien && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold">Quản trị tối cao</span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 font-medium">@{u.username.replace(/^@+/, '')}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{u.title}</div>
                        <div className="text-[11px] text-slate-500">{u.department}</div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.tier === 1 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          u.tier === 2 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          u.tier === 3 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          u.tier === 4 ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                          'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          Cấp {u.tier} – {
                            u.tier === 1 ? 'Quản trị cao nhất' :
                            u.tier === 2 ? 'Vận hành kỹ thuật' :
                            u.tier === 3 ? 'Giám sát & Báo cáo' :
                            u.tier === 4 ? 'Hỗ trợ vận hành' : 'Người dùng cơ bản'
                          }
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {u.phone || 'Chưa cập nhật'}</div>
                        {u.email && <div className="flex items-center gap-1 text-slate-500"><Mail className="w-3 h-3 text-slate-400" /> {u.email}</div>}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {u.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Hoạt động
                          </span>
                        )}
                        {u.status === 'locked' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <Lock className="w-2.5 h-2.5" />
                            Đã khóa
                          </span>
                        )}
                        {u.status === 'disabled' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Vô hiệu hóa
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-[11px] text-slate-500 font-mono">
                        {u.lastLoginAt ? u.lastLoginAt : 'Chưa đăng nhập'}
                      </td>

                      {isSuperAdmin && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Profile Info */}
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              title="Sửa thông tin hồ sơ"
                              className="p-1.5 rounded text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Change Role / Tier (disabled for Super Admin self) */}
                            {!isUserHien && (
                              <button
                                onClick={() => handleOpenChangeRole(u)}
                                title="Điều chỉnh vai trò & Cấp bậc RBAC"
                                className="p-1.5 rounded text-xs text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Granular Permission Matrix */}
                            <button
                              onClick={() => handleOpenPermMatrix(u)}
                              title="Phân quyền chi tiết từng module"
                              className="p-1.5 rounded text-xs text-purple-600 hover:bg-purple-50 border border-purple-200 transition-colors cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => handleOpenResetPassword(u)}
                              title="Đặt lại mật khẩu bảo mật mới"
                              className="p-1.5 rounded text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Lock / Unlock (Protected: cannot lock Thầy Hiển) */}
                            {!isUserHien && (
                              <>
                                <button
                                  onClick={() => toggleLockUser(u.id)}
                                  title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                                    u.status === 'active' 
                                      ? 'text-amber-600 hover:bg-amber-50 border border-amber-200' 
                                      : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                                  }`}
                                >
                                  {u.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  onClick={() => {
                                    if (window.confirm(`Xác nhận xóa vĩnh viễn tài khoản của ${u.name} (@${u.username}) khỏi hệ thống?`)) {
                                      deleteUser(u.id);
                                      setFeedbackMsg({ type: 'success', text: `Đã xóa tài khoản ${u.name}.` });
                                    }
                                  }}
                                  title="Xóa vĩnh viễn tài khoản"
                                  className="p-1.5 rounded text-xs text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MA TRẬN PHÂN QUYỀN 5 CẤP (RBAC ARCHITECTURE) */}
      {activeSubTab === 'rbac_matrix' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Cấp 1 */}
            <div className="bg-white rounded-lg border-2 border-blue-500 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                  CẤP 1
                </span>
                <span className="text-xs font-bold text-blue-700">Tổ trưởng</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs mt-2">Thầy Trương Công Hiển</h4>
              <p className="text-[11px] text-slate-500 mb-2">Tổ CSHT • Quản trị cao nhất</p>
              <ul className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1 text-emerald-700 font-bold"><Check className="w-3 h-3" /> Toàn quyền hệ thống</li>
                <li className="flex items-center gap-1 text-emerald-700 font-bold"><Check className="w-3 h-3" /> Duy nhất sửa Dữ liệu gốc</li>
                <li className="flex items-center gap-1 text-emerald-700 font-bold"><Check className="w-3 h-3" /> Thêm/xóa khu nhà, phòng, thiết bị</li>
                <li className="flex items-center gap-1 text-emerald-700 font-bold"><Check className="w-3 h-3" /> Phê duyệt đề xuất KTV</li>
                <li className="flex items-center gap-1 text-emerald-700 font-bold"><Check className="w-3 h-3" /> Quản trị & cấp tài khoản</li>
              </ul>
            </div>

            {/* Cấp 2 */}
            <div className="bg-white rounded-lg border border-amber-300 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-600 text-white">
                  CẤP 2
                </span>
                <span className="text-xs font-bold text-amber-700">Kỹ thuật viên</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs mt-2">Thầy Nguyễn Đình Huy</h4>
              <p className="text-[11px] text-slate-500 mb-2">Tổ CSHT • Vận hành kỹ thuật</p>
              <ul className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Ghi chỉ số điện, nước</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Cập nhật phiếu sửa chữa</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Thực hiện bảo trì, quét QR</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Xuất/nhập kho vật tư</li>
                <li className="flex items-center gap-1 text-amber-700 font-bold"><FileCheck className="w-3 h-3" /> Gửi Đề nghị cập nhật thông tin</li>
                <li className="flex items-center gap-1 text-red-600 font-semibold"><Lock className="w-3 h-3" /> Không tự sửa dữ liệu gốc</li>
              </ul>
            </div>

            {/* Cấp 3 */}
            <div className="bg-white rounded-lg border border-emerald-300 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                  CẤP 3
                </span>
                <span className="text-xs font-bold text-emerald-700">Phó phòng HC-NS</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs mt-2">Cô Nguyễn Thị Hoàn</h4>
              <p className="text-[11px] text-slate-500 mb-2">Phòng HC-NS • Giám sát & Báo cáo</p>
              <ul className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Xem toàn bộ dữ liệu & hạ tầng</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Giám sát tiến độ công việc</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Xem báo cáo tổng hợp</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Nhận cảnh báo sự cố</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Phê duyệt mua sắm/thay thế lớn</li>
                <li className="flex items-center gap-1 text-blue-700 font-bold"><Eye className="w-3 h-3" /> Xem phân quyền & Audit log</li>
              </ul>
            </div>

            {/* Cấp 4 */}
            <div className="bg-white rounded-lg border border-indigo-200 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                  CẤP 4
                </span>
                <span className="text-xs font-bold text-indigo-700">Tổ phó HC-NS</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs mt-2">Thầy Nguyễn Văn Minh</h4>
              <p className="text-[11px] text-slate-500 mb-2">Tổ HC-NS • Hỗ trợ vận hành</p>
              <ul className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Theo dõi lịch bảo dưỡng</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Phối hợp điều phối công việc</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Báo cáo sự cố khi phát hiện</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Theo dõi tiến độ sửa chữa</li>
              </ul>
            </div>

            {/* Cấp 5 */}
            <div className="bg-white rounded-lg border border-purple-200 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600 text-white">
                  CẤP 5
                </span>
                <span className="text-xs font-bold text-purple-700">Người dùng cơ bản</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs mt-2">Các Khoa / Phòng ban</h4>
              <p className="text-[11px] text-slate-500 mb-2">Khoa Y, Dược, Hành chính...</p>
              <ul className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Gửi phiếu yêu cầu sửa chữa</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Theo dõi trạng thái phiếu yêu cầu</li>
                <li className="flex items-center gap-1 text-emerald-700"><Check className="w-3 h-3" /> Tra cứu thông tin phòng/khu nhà</li>
                <li className="flex items-center gap-1 text-red-600 font-semibold"><Lock className="w-3 h-3" /> Bị ẩn các chức năng kỹ thuật</li>
              </ul>
            </div>
          </div>

          {/* Detailed Role Permission Matrix Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase text-slate-800 flex items-center justify-between">
              <span>Bảng quy định thẩm quyền chi tiết từng chức năng</span>
              <span className="text-[11px] text-slate-500 font-normal">Chỉ Thầy Trương Công Hiển có quyền điều chỉnh phân cấp</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Phân hệ chức năng</th>
                    <th className="py-2.5 px-2 text-center text-blue-700">Cấp 1 (Thầy Hiển)</th>
                    <th className="py-2.5 px-2 text-center text-amber-700">Cấp 2 (Thầy Huy)</th>
                    <th className="py-2.5 px-2 text-center text-emerald-700">Cấp 3 (Cô Hoàn)</th>
                    <th className="py-2.5 px-2 text-center text-indigo-700">Cấp 4 (Thầy Minh)</th>
                    <th className="py-2.5 px-2 text-center text-purple-700">Cấp 5 (Khoa/Phòng)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Chỉnh sửa trực tiếp Dữ liệu gốc (Khu nhà, Phòng, Thiết bị)</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Toàn quyền sửa trực tiếp</td>
                    <td className="py-2.5 px-2 text-center text-amber-600 font-semibold">Chỉ gửi Đề nghị</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">Chỉ xem</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">Chỉ xem</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">Không có quyền</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Phê duyệt đề xuất thay đổi Dữ liệu gốc</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Duyệt & Áp dụng</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">Không</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">Chỉ xem</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">Không</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">Không</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Quản trị người dùng & Phân quyền tài khoản</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Toàn quyền (Tạo/Khóa/Reset)</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">Không</td>
                    <td className="py-2.5 px-2 text-center text-blue-600 font-semibold">Xem danh sách</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">Không</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">Không</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Nhập chỉ số điện, nước, điều hòa, PCCC</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Nhập & Quản lý</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Nhập hàng ngày</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">Chỉ xem</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">Chỉ xem</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">Không truy cập</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Tạo phiếu yêu cầu sửa chữa</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Có</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Có</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Có</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Có</td>
                    <td className="py-2.5 px-2 text-center text-purple-700 font-bold">Có (Chức năng chính)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Xử lý phiếu & Cập nhật kết quả sửa chữa</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Điều phối & Duyệt</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Trực tiếp xử lý</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">Giám sát tiến độ</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">Theo dõi phối hợp</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">Xem tiến độ phiếu của mình</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Xem Báo cáo kỹ thuật & Ngân sách vận hành</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Toàn quyền duyệt</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600">Lập báo cáo ngày</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">Giám sát & Duyệt chi</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">Chỉ xem</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">Không</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NHẬT KÝ KIỂM TOÁN PHÂN QUYỀN RBAC (AUDIT LOG - BẤT BIẾN) */}
      {activeSubTab === 'rbac_audit' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          {/* Header & Policy Notice */}
          <div className="p-4 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Nhật Ký Kiểm Toán Phân Quyền RBAC (Tamper-Proof Audit Trail)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ghi vết tự động mọi hành vi: Bổ nhiệm vai trò, thay đổi quyền module, reset mật khẩu, khóa/mở khóa tài khoản.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportAuditLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất dữ liệu Audit (JSON)</span>
            </button>
          </div>

          {/* Policy Banner */}
          <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Chính sách bảo mật PCTU:</strong> Nhật ký kiểm toán được lưu trữ bất biến. Không một tài khoản nào (kể cả Super Admin) được phép xóa lịch sử kiểm toán để đảm bảo tính minh bạch và an toàn hệ thống.
            </span>
          </div>

          {/* Controls toolbar */}
          <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo người thực hiện, đối tượng, nội dung..."
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-blue-500 text-slate-700"
              >
                <option value="ALL">Tất cả hành động ({rbacAuditLogs?.length || 0})</option>
                <option value="CHANGE_ROLE">Đổi vai trò / Cấp bậc (CHANGE_ROLE)</option>
                <option value="UPDATE_PERMISSION">Phân quyền module (UPDATE_PERMISSION)</option>
                <option value="RESET_PASSWORD">Đặt lại mật khẩu (RESET_PASSWORD)</option>
                <option value="LOCK_USER">Khóa tài khoản (LOCK_USER)</option>
                <option value="UNLOCK_USER">Mở khóa tài khoản (UNLOCK_USER)</option>
                <option value="CREATE_USER">Tạo mới tài khoản (CREATE_USER)</option>
                <option value="DISABLE_USER">Vô hiệu hóa (DISABLE_USER)</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Hiển thị: <strong>{filteredAuditLogs.length}</strong> / {rbacAuditLogs?.length || 0} bản ghi
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Thời gian ghi vết</th>
                  <th className="py-2.5 px-3">Người thực hiện</th>
                  <th className="py-2.5 px-3">Tài khoản đối tượng</th>
                  <th className="py-2.5 px-3 text-center">Hành động RBAC</th>
                  <th className="py-2.5 px-3">Nội dung thay đổi chi tiết</th>
                  <th className="py-2.5 px-3 text-center">Bảo mật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Không tìm thấy bản ghi nhật ký kiểm toán phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => {
                    const actionBadge = (() => {
                      switch (log.action) {
                        case 'CHANGE_ROLE':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Đổi vai trò</span>;
                        case 'UPDATE_PERMISSION':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Cập nhật quyền</span>;
                        case 'RESET_PASSWORD':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Reset mật khẩu</span>;
                        case 'LOCK_USER':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">Khóa tài khoản</span>;
                        case 'UNLOCK_USER':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Mở khóa</span>;
                        case 'CREATE_USER':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Tạo tài khoản</span>;
                        case 'DISABLE_USER':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">Vô hiệu hóa</span>;
                        default:
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{log.action}</span>;
                      }
                    })();

                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{log.actorName}</div>
                          <div className="text-[10px] font-mono text-blue-600 font-semibold">{log.actorUsername}</div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{log.targetName}</div>
                          <div className="text-[10px] font-mono text-slate-500">{log.targetUsername}</div>
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {actionBadge}
                        </td>

                        <td className="py-2.5 px-3 max-w-md">
                          <p className="text-slate-800 leading-snug">{log.description}</p>
                          {log.oldRole && log.newRole && (
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono">
                              <span className="line-through text-red-600 bg-red-50 px-1 rounded">{log.oldRole}</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded">{log.newRole}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã xác thực
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DANH SÁCH ĐỀ NGHỊ CẬP NHẬT THÔNG TIN (PROPOSALS) */}
      {activeSubTab === 'proposals' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">
                Quy trình Đề nghị cập nhật Dữ liệu gốc
              </h3>
              <p className="text-[11px] text-slate-500">
                Kỹ thuật viên (Cấp 2) gửi đề xuất khi phát hiện sai lệch thực địa. Thầy Trương Công Hiển (Cấp 1) xem xét và phê duyệt.
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {proposals.length} đề xuất
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Mã & Thời gian</th>
                  <th className="py-2.5 px-3">Người đề xuất</th>
                  <th className="py-2.5 px-3">Đối tượng dữ liệu gốc</th>
                  <th className="py-2.5 px-3">Trường thay đổi</th>
                  <th className="py-2.5 px-3">Hiện tại → Đề xuất</th>
                  <th className="py-2.5 px-3">Lý do thay đổi</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  {isSuperAdmin && <th className="py-2.5 px-3 text-right">Phê duyệt</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {proposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-blue-600">{prop.proposalCode}</span>
                      <div className="text-[10px] text-slate-400">{prop.createdAt}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{prop.proposerName}</div>
                      <div className="text-[10px] text-slate-500">{prop.proposerRole}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-800">{prop.targetName}</span>
                      <div className="text-[10px] font-mono text-slate-500">Mã: {prop.targetCode} ({prop.targetType})</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 border border-slate-200">
                        {prop.fieldLabel}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="line-through text-red-500 bg-red-50 px-1 rounded">{String(prop.currentValue)}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded">{String(prop.proposedValue)}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 max-w-xs">
                      <p className="text-slate-700 italic text-[11px] leading-tight">"{prop.reason}"</p>
                      {prop.reviewNotes && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          <span className="font-semibold">{prop.reviewedBy}:</span> {prop.reviewNotes}
                        </p>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {prop.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Chờ Thầy Hiển duyệt
                        </span>
                      )}
                      {prop.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Đã phê duyệt
                        </span>
                      )}
                      {prop.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          Đã từ chối
                        </span>
                      )}
                    </td>

                    {isSuperAdmin && (
                      <td className="py-2.5 px-3 text-right">
                        {prop.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setReviewingProposal(prop);
                                setReviewNotes('Đã đối chiếu hồ sơ thực địa, thống nhất cập nhật');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                            >
                              Xử lý
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Đã đóng</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: LỊCH SỬ THAY ĐỔI DỮ LIỆU GỐC (MASTER DATA AUDIT TRAIL) */}
      {activeSubTab === 'master_logs' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight">
                  Nhật ký kiểm toán thay đổi Dữ liệu gốc (Master Data Audit Trail)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Quy định an toàn: Toàn bộ thao tác sửa đổi Dữ liệu gốc được ghi vết tự động kèm thông số Before/After. Không được phép xóa.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {masterDataLogs.length} bản ghi bất biến
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Thời gian ghi vết</th>
                  <th className="py-2.5 px-3">Người thực hiện</th>
                  <th className="py-2.5 px-3">Đối tượng (Khu / Phòng / Thiết bị)</th>
                  <th className="py-2.5 px-3">Trường dữ liệu</th>
                  <th className="py-2.5 px-3">Giá trị trước (Before)</th>
                  <th className="py-2.5 px-3">Giá trị sau (After)</th>
                  <th className="py-2.5 px-3">Lý do thay đổi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {masterDataLogs.map((log, idx) => (
                  <tr key={`${log.id || 'md_log'}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">{log.actorRole}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-800">{log.targetName}</span>
                      <div className="text-[10px] font-mono text-slate-500">{log.targetCode} ({log.targetType})</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-800 border border-slate-200">
                        {log.fieldLabel}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-mono text-[11px] line-through">
                        {log.beforeValue}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-bold">
                        {log.afterValue}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 max-w-sm">
                      <p className="text-slate-700 leading-snug">{log.reason}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: THÊM TÀI KHOẢN MỚI */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span className="font-bold uppercase tracking-wider text-xs">Thêm tài khoản người dùng mới</span>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-4 space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thầy Trần Văn Bình"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tên đăng nhập *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: tranvanbinh"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mật khẩu khởi tạo</label>
                  <input
                    type="text"
                    placeholder="Mặc định: pctu123"
                    value={newUserData.rawPassword}
                    onChange={(e) => setNewUserData({ ...newUserData, rawPassword: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chức vụ</label>
                  <input
                    type="text"
                    placeholder="VD: Kỹ thuật viên điện lạnh"
                    value={newUserData.title}
                    onChange={(e) => setNewUserData({ ...newUserData, title: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bộ phận / Phòng ban</label>
                  <input
                    type="text"
                    value={newUserData.department}
                    onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="VD: 0905.xxx.xxx"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cấp quyền (RBAC)</label>
                  <select
                    value={newUserData.tier}
                    onChange={(e) => {
                      const tier = Number(e.target.value) as 1 | 2 | 3 | 4 | 5;
                      let role: UserRole = 'tech_staff';
                      if (tier === 1) role = 'admin_lead';
                      else if (tier === 2) role = 'tech_staff';
                      else if (tier === 3) role = 'manager_hr';
                      else if (tier === 4) role = 'manager_assist';
                      else if (tier === 5) role = 'department_user';
                      setNewUserData({ ...newUserData, tier, role });
                    }}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value={2}>Cấp 2 – Kỹ thuật viên (Vận hành)</option>
                    <option value={3}>Cấp 3 – Giám sát & Báo cáo (Cô Hoàn)</option>
                    <option value={4}>Cấp 4 – Hỗ trợ vận hành (Thầy Minh)</option>
                    <option value={5}>Cấp 5 – Người dùng khoa/phòng</option>
                    <option value={1}>Cấp 1 – Quản trị cao nhất (Thầy Hiển)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-2xs cursor-pointer"
                >
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SỬA THÔNG TIN HỒ SƠ (SUPER ADMIN EDIT USER INFO) */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-3 bg-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-300" />
                <span className="font-bold uppercase tracking-wider text-xs">
                  Cập nhật thông tin: {editingUser.name} (@{editingUser.username})
                </span>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-4 space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên hiển thị thường gọi</label>
                <input
                  type="text"
                  value={editUserData.displayName}
                  onChange={(e) => setEditUserData({ ...editUserData, displayName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chức vụ</label>
                  <input
                    type="text"
                    value={editUserData.title}
                    onChange={(e) => setEditUserData({ ...editUserData, title: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bộ phận / Đơn vị</label>
                  <input
                    type="text"
                    value={editUserData.department}
                    onChange={(e) => setEditUserData({ ...editUserData, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editUserData.phone}
                    onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ghi chú chuyên môn / Trách nhiệm</label>
                <textarea
                  rows={2}
                  value={editUserData.bio}
                  onChange={(e) => setEditUserData({ ...editUserData, bio: e.target.value })}
                  placeholder="Nhiệm vụ, phạm vi phụ trách..."
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-2xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ĐIỀU CHỈNH VAI TRÒ & CẤP QUYỀN RBAC */}
      {roleChangeUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-3 bg-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                <span className="font-bold uppercase tracking-wider text-xs">
                  Điều chỉnh vai trò RBAC: {roleChangeUser.name}
                </span>
              </div>
              <button onClick={() => setRoleChangeUser(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRoleChange} className="p-4 space-y-3">
              <div className="p-3 rounded bg-purple-50 border border-purple-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tài khoản:</span>
                  <span className="font-bold text-slate-900">{roleChangeUser.name} (@{roleChangeUser.username})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cấp quyền hiện tại:</span>
                  <span className="font-bold text-purple-700">Cấp {roleChangeUser.tier} ({roleChangeUser.role})</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chọn vai trò & Cấp bậc phân quyền mới</label>
                <select
                  value={selectedRoleTier.tier}
                  onChange={(e) => {
                    const tier = Number(e.target.value) as 1 | 2 | 3 | 4 | 5;
                    let role: UserRole = 'tech_staff';
                    if (tier === 1) role = 'admin_lead';
                    else if (tier === 2) role = 'tech_staff';
                    else if (tier === 3) role = 'manager_hr';
                    else if (tier === 4) role = 'manager_assist';
                    else if (tier === 5) role = 'department_user';
                    setSelectedRoleTier({ tier, role });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-semibold text-slate-800 focus:border-purple-500 focus:outline-hidden"
                >
                  <option value={2}>Cấp 2 – Kỹ thuật viên (Vận hành kỹ thuật, ghi số, bảo trì)</option>
                  <option value={3}>Cấp 3 – Phó phòng HC-NS (Giám sát, xem báo cáo, duyệt mua sắm)</option>
                  <option value={4}>Cấp 4 – Tổ phó HC-NS (Hỗ trợ vận hành & điều phối)</option>
                  <option value={5}>Cấp 5 – Cán bộ / Giảng viên / Khoa phòng (Gửi yêu cầu sửa chữa)</option>
                  <option value={1}>Cấp 1 – Quản trị viên cao nhất (Toàn quyền hệ thống)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lý do điều chỉnh / Căn cứ phân công nhiệm vụ</label>
                <textarea
                  rows={2}
                  required
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                  placeholder="Nhập lý do thay đổi vai trò (sẽ lưu vĩnh viễn vào Audit Log)..."
                  className="w-full p-2 border border-slate-300 rounded focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Hành động này sẽ được ghi vết tự động vào Nhật ký kiểm toán phân quyền RBAC.</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoleChangeUser(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold shadow-2xs cursor-pointer"
                >
                  Xác nhận đổi vai trò
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PHÂN QUYỀN CHI TIẾT TỪNG MODULE (GRANULAR PERMISSION MATRIX) */}
      {permEditUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-xs block">
                    Ma trận Phân quyền Chi tiết: {permEditUser.name}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    @{permEditUser.username} • Cấp {permEditUser.tier} ({permEditUser.title})
                  </span>
                </div>
              </div>
              <button onClick={() => setPermEditUser(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 border-b border-blue-100 text-[11px] text-blue-900 flex items-center justify-between shrink-0">
              <span>Bật/tắt từng hành vi thao tác cụ thể cho từng module hệ thống:</span>
              <button
                type="button"
                onClick={() => {
                  const resetDefaults = getDefaultRolePermissions(String(permEditUser.role));
                  setUserPermMatrix(resetDefaults);
                }}
                className="text-blue-700 hover:underline font-bold cursor-pointer"
              >
                Khôi phục theo Cấp {permEditUser.tier}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {ALL_SYSTEM_MODULES.map((mod) => {
                const currentActions = userPermMatrix[mod.id] || [];
                return (
                  <div key={mod.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs">{mod.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">module: {mod.id}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {ALL_PERMISSION_ACTIONS.map((p) => {
                        const isGranted = currentActions.includes(p.action);
                        return (
                          <button
                            key={p.action}
                            type="button"
                            onClick={() => handleTogglePermAction(mod.id, p.action)}
                            title={p.description}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                              isGranted
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {isGranted && <Check className="w-3 h-3" />}
                            <span>{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPermEditUser(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSavePermMatrix}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-2xs cursor-pointer"
              >
                Lưu ma trận phân quyền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ĐẶT LẠI MẬT KHẨU (RESET USER PASSWORD) */}
      {resetPassUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-3 bg-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-300" />
                <span className="font-bold uppercase tracking-wider text-xs">
                  Đặt lại mật khẩu: {resetPassUser.name}
                </span>
              </div>
              <button onClick={() => setResetPassUser(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Thầy Trương Công Hiển có thẩm quyền khởi tạo mật khẩu mới an toàn cho tài khoản <strong>{resetPassUser.name} (@{resetPassUser.username})</strong>. Mật khẩu cũ sẽ lập tức mất hiệu lực.
              </p>

              {lastGeneratedPassword ? (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <span className="text-xs font-semibold text-emerald-800 block">Mật khẩu mới đã được khởi tạo thành công:</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-base font-bold bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-900 tracking-wider">
                      {lastGeneratedPassword}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      title="Sao chép mật khẩu"
                    >
                      {copiedPassword ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Vui lòng gửi mật khẩu này cho nhân sự để đăng nhập.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Tùy chọn 1: Nhập mật khẩu tùy chỉnh
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                      value={customResetPassword}
                      onChange={(e) => setCustomResetPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold">Hoặc</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExecuteResetPassword(true)}
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tạo ngẫu nhiên mật khẩu bảo mật (Pctu@XXXXXX)</span>
                  </button>
                </>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  {lastGeneratedPassword ? 'Đóng' : 'Hủy'}
                </button>
                {!lastGeneratedPassword && (
                  <button
                    type="button"
                    onClick={() => handleExecuteResetPassword(false)}
                    disabled={!customResetPassword.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-bold shadow-2xs cursor-pointer"
                  >
                    Áp dụng mật khẩu này
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PHÊ DUYỆT ĐỀ XUẤT THAY ĐỔI DỮ LIỆU GỐC (Thầy Hiển duyệt) */}
      {reviewingProposal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="p-3 bg-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-300" />
                <span className="font-bold uppercase tracking-wider text-xs">
                  Phê duyệt Đề xuất Dữ liệu gốc: {reviewingProposal.proposalCode}
                </span>
              </div>
              <button onClick={() => setReviewingProposal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Người đề xuất:</span>
                  <span className="font-bold text-slate-900">{reviewingProposal.proposerName} ({reviewingProposal.proposerRole})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Đối tượng:</span>
                  <span className="font-bold text-slate-900">{reviewingProposal.targetName} ({reviewingProposal.targetCode})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trường thay đổi:</span>
                  <span className="font-bold text-blue-700">{reviewingProposal.fieldLabel}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-mono">
                  <span className="text-slate-500">Thay đổi:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-red-600 bg-red-50 px-1 rounded">{String(reviewingProposal.currentValue)}</span>
                    <span>→</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded">{String(reviewingProposal.proposedValue)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Lý do đề xuất từ KTV:</label>
                <p className="p-2 bg-slate-100 rounded text-slate-800 italic">"{reviewingProposal.reason}"</p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ý kiến phê duyệt của Thầy Trương Công Hiển:</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                  placeholder="Ghi chú thẩm định thực địa..."
                />
              </div>

              <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Sau khi phê duyệt, Dữ liệu gốc sẽ lập tức cập nhật và tự động ghi vết vào Master Data Audit Trail.</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    rejectProposal(reviewingProposal.id, reviewNotes || 'Từ chối sau khi kiểm tra thực địa');
                    setReviewingProposal(null);
                    setFeedbackMsg({ type: 'success', text: `Đã từ chối đề xuất ${reviewingProposal.proposalCode}.` });
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded font-semibold transition-colors cursor-pointer"
                >
                  Từ chối đề xuất
                </button>
                <button
                  type="button"
                  onClick={() => {
                    approveProposal(reviewingProposal.id, reviewNotes);
                    setReviewingProposal(null);
                    setFeedbackMsg({ type: 'success', text: `Đã phê duyệt và áp dụng thành công đề xuất ${reviewingProposal.proposalCode} vào Dữ liệu gốc.` });
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  Đồng ý & Phê duyệt ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
