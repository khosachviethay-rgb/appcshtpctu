import React, { useState, useRef } from 'react';
import { 
  X, User, Lock, Smartphone, Shield, History, Camera, Check, 
  AlertCircle, CheckCircle2, Eye, EyeOff, LogOut, Laptop, Globe,
  Calendar, KeyRound, Sparkles, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { isSuperAdmin } from '../utils/authSecurity';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, updateUserProfile, changePassword, 
    logoutOtherSessions, auditLogs, logout 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'sessions' | 'logs'>('info');

  // Profile fields state
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    displayName: currentUser?.displayName || currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    title: currentUser?.title || '',
    department: currentUser?.department || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || '',
  });

  // Password fields state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    logoutOthers: true,
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  // Initials for avatar
  const initials = (currentUser.displayName || currentUser.name || 'P')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  // Handle avatar upload and resize using Canvas
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB raw)
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Kích thước ảnh tối đa là 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 256;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Crop center square
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setFormData(prev => ({ ...prev, avatar: dataUrl }));
        setFeedback({ type: 'success', message: 'Đã tải ảnh lên thành công. Bấm "Lưu thay đổi" để áp dụng.' });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
    setFeedback({ type: 'success', message: 'Đã gỡ ảnh đại diện. Bấm "Lưu thay đổi" để sử dụng avatar mặc định.' });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'Họ và tên không được để trống.' });
      return;
    }

    setIsSubmitting(true);
    try {
      updateUserProfile(currentUser.id, {
        name: formData.name.trim(),
        displayName: formData.displayName.trim() || formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        title: formData.title.trim(),
        department: formData.department.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar,
      });

      setFeedback({ type: 'success', message: 'Cập nhật hồ sơ cá nhân thành công!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Lỗi cập nhật: ' + (err instanceof Error ? err.message : String(err)) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!passData.currentPassword) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }
    if (!passData.newPassword) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập mật khẩu mới.' });
      return;
    }
    if (passData.newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      setFeedback({ type: 'error', message: 'Xác nhận mật khẩu mới không khớp.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword(
        currentUser.id,
        passData.currentPassword,
        passData.newPassword,
        passData.logoutOthers
      );

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setPassData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          logoutOthers: true,
        });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Lỗi đổi mật khẩu: ' + (err instanceof Error ? err.message : String(err)) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutOthers = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác?')) {
      logoutOtherSessions(currentUser.id);
      setFeedback({ type: 'success', message: 'Đã đăng xuất khỏi tất cả các thiết bị khác thành công.' });
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Chưa nhập', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
    return { score: 3, label: 'Mạnh & An toàn', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(passData.newPassword);

  // My audit logs
  const myAuditLogs = (auditLogs || []).filter(
    log => log.userName === currentUser.username || log.actorName === currentUser.name
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-5 text-white flex items-start justify-between shrink-0 relative">
          <div className="flex items-center gap-4">
            {/* Avatar with status and edit trigger */}
            <div className="relative group">
              {formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt={currentUser.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-blue-400/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl text-white shadow-md border-2 border-white/80 ${
                  currentUser.tier === 1 ? 'bg-gradient-to-br from-blue-600 to-indigo-700' :
                  currentUser.tier === 2 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                  currentUser.tier === 3 ? 'bg-gradient-to-br from-emerald-600 to-teal-700' :
                  currentUser.tier === 4 ? 'bg-gradient-to-br from-indigo-600 to-purple-700' :
                  'bg-gradient-to-br from-purple-600 to-pink-600'
                }`}>
                  {initials}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-sm transition-transform group-hover:scale-110"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {formData.displayName || currentUser.name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider ${
                  currentUser.tier === 1 ? 'bg-blue-500 shadow-xs shadow-blue-500/50' :
                  currentUser.tier === 2 ? 'bg-amber-500' :
                  currentUser.tier === 3 ? 'bg-emerald-500' :
                  currentUser.tier === 4 ? 'bg-indigo-500' : 'bg-purple-500'
                }`}>
                  Cấp {currentUser.tier} • {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-blue-200 font-mono mt-0.5">
                @{currentUser.username}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {currentUser.title} • <span className="text-slate-400">{currentUser.department}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 gap-1 shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => { setActiveTab('info'); setFeedback(null); }}
            className={`py-3 px-3.5 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'info' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => { setActiveTab('password'); setFeedback(null); }}
            className={`py-3 px-3.5 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'password' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Đổi mật khẩu</span>
          </button>

          <button
            onClick={() => { setActiveTab('sessions'); setFeedback(null); }}
            className={`py-3 px-3.5 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sessions' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Phiên đăng nhập ({currentUser.sessions?.length || 1})</span>
          </button>

          <button
            onClick={() => { setActiveTab('logs'); setFeedback(null); }}
            className={`py-3 px-3.5 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'logs' 
                ? 'border-blue-600 text-blue-600 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Nhật ký của tôi</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mx-5 mt-4 p-3 rounded-lg text-xs flex items-start gap-2.5 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3 text-slate-700 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900">Quy tắc bảo mật thông tin tài khoản:</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Bạn được phép chỉnh sửa tên hiển thị, số điện thoại, email, chức danh và ảnh đại diện.
                    Tên đăng nhập (<span className="font-mono font-bold">@{currentUser.username}</span>), Vai trò và Quyền hạn được bảo vệ và do Quản trị viên cao nhất (<span className="font-bold text-blue-800">Thầy Trương Công Hiển</span>) quản lý theo quy định RBAC.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ và tên */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Thầy Trương Công Hiển"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Tên hiển thị */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên hiển thị trên giao diện
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="VD: Thầy Hiển (CSHT)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0905.xxx.xxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Địa chỉ Email PCTU
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="hien.tc@pctu.edu.vn"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Chức vụ */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chức vụ / Vị trí công tác
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Tổ trưởng Kỹ thuật & CSHT"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Phòng ban */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phòng ban / Đơn vị
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Tổ Cơ sở Hạ tầng / Kỹ thuật"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Giới thiệu bản thân */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Giới thiệu ngắn (Bio)
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Ghi chú về trách nhiệm, lịch trực hoặc chuyên môn phụ trách..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Read-Only System Fields */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Thông tin tài khoản hệ thống (Không thể tự sửa đổi)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">TÊN ĐĂNG NHẬP</span>
                    <span className="font-mono font-bold text-slate-900">@{currentUser.username}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">VAI TRÒ & PHÂN CẤP</span>
                    <span className="font-semibold text-blue-700">Cấp {currentUser.tier} • {currentUser.role}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">TRẠNG THÁI TÀI KHOẢN</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>

              {/* Avatar management actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    <span>Tải ảnh đại diện</span>
                  </button>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Gỡ ảnh
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: ĐỔI MẬT KHẨU */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg mx-auto py-2">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-slate-700 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">Bảo mật mật khẩu tài khoản:</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Mật khẩu được mã hóa an toàn bằng thuật toán băm SHA-256 kèm salt hệ thống.
                    Nên sử dụng ít nhất 6 ký tự kết hợp chữ cái và số để đảm bảo an toàn.
                  </p>
                </div>
              </div>

              {/* Current Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={passData.currentPassword}
                    onChange={(e) => setPassData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3 pr-10 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={passData.newPassword}
                    onChange={(e) => setPassData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full px-3 pr-10 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {passData.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                      <span className="font-bold text-slate-700">{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                  required
                />
              </div>

              {/* Logout others option */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={passData.logoutOthers}
                    onChange={(e) => setPassData(prev => ({ ...prev, logoutOthers: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Đăng xuất khỏi tất cả các thiết bị khác sau khi đổi mật khẩu
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: THIẾT BỊ ĐANG ĐĂNG NHẬP */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Quản lý các phiên đăng nhập (Sessions)</h4>
                  <p className="text-[11px] text-slate-500">
                    Theo dõi các thiết bị, trình duyệt và địa chỉ IP đã xác thực tài khoản này
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogoutOthers}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất thiết bị khác</span>
                </button>
              </div>

              <div className="space-y-2">
                {(currentUser.sessions && currentUser.sessions.length > 0 ? currentUser.sessions : [
                  {
                    id: 'current_sess',
                    device: 'Thiết bị hiện tại',
                    browser: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'Trình duyệt web',
                    ipAddress: '118.69.182.45 (PCTU LAN)',
                    loginAt: currentUser.lastLoginAt || 'Hôm nay',
                    lastActiveAt: 'Đang hoạt động',
                    isCurrent: true,
                  }
                ]).map((sess) => (
                  <div 
                    key={sess.id}
                    className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                      sess.isCurrent 
                        ? 'bg-blue-50/50 border-blue-200' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        sess.isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sess.device.toLowerCase().includes('phone') ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{sess.device}</span>
                          {sess.isCurrent && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white">
                              Phiên này
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{sess.browser}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px]">{sess.ipAddress}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px]">
                      <div className="text-slate-400 font-mono text-[10px]">Đăng nhập: {sess.loginAt}</div>
                      <div className="text-emerald-600 font-semibold mt-0.5">{sess.lastActiveAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NHẬT KÝ HOẠT ĐỘNG CỦA TÔI */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Lịch sử hoạt động của tài khoản</h4>
                  <p className="text-[11px] text-slate-500">
                    Ghi vết kiểm toán các thao tác thực hiện trên hệ thống gần đây
                  </p>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {myAuditLogs.length} sự kiện
                </span>
              </div>

              {myAuditLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Chưa có lịch sử hoạt động ghi nhận cho tài khoản này.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {myAuditLogs.slice(0, 15).map((log, idx) => (
                    <div 
                      key={`${log.id}-${idx}`}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            log.actionType === 'TẠO' ? 'bg-green-100 text-green-800' :
                            log.actionType === 'CẬP NHẬT' ? 'bg-blue-100 text-blue-800' :
                            log.actionType === 'PHÊ DUYỆT' ? 'bg-purple-100 text-purple-800' :
                            log.actionType === 'XÓA' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {log.actionType || 'THAO TÁC'}
                          </span>
                          <span className="font-bold text-slate-900 truncate">
                            {log.entity || 'Hệ thống'}
                          </span>
                          {log.entityIdentifier && (
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                              {log.entityIdentifier}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 truncate">
                          {log.details}
                        </p>
                      </div>

                      <div className="shrink-0 text-[10px] font-mono text-slate-400">
                        {log.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 px-5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Hệ thống phân quyền RBAC Đại học Phan Châu Trinh © 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
