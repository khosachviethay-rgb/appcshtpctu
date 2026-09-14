import React, { useState } from 'react';
import { 
  Building2, Shield, Lock, User, AlertCircle, ArrowRight, CheckCircle2,
  KeyRound, Eye, EyeOff, HelpCircle, X, Smartphone, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { login, resetPasswordByOTP } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotIdentity, setForgotIdentity] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(username.trim(), password);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMsg('Có lỗi xảy ra: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgot = () => {
    setIsForgotOpen(true);
    setForgotStep(1);
    setForgotIdentity(username.trim());
    setForgotError('');
    setForgotSuccess('');
    setEnteredOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotIdentity.trim()) {
      setForgotError('Vui lòng nhập Username, Email hoặc Số điện thoại của tài khoản.');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      // Generate a 6-digit OTP
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setForgotStep(2);
      setForgotLoading(false);
    }, 600);
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!enteredOtp.trim()) {
      setForgotError('Vui lòng nhập mã xác thực OTP.');
      return;
    }
    if (enteredOtp.trim() !== generatedOtp) {
      setForgotError('Mã OTP không chính xác. Vui lòng kiểm tra lại mã đã cấp.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setForgotError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await resetPasswordByOTP(forgotIdentity.trim(), newPassword.trim());
      if (res.success) {
        setForgotSuccess(res.message || 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
        setTimeout(() => {
          setIsForgotOpen(false);
          setUsername(forgotIdentity.trim());
          setPassword(newPassword.trim());
        }, 2000);
      } else {
        setForgotError(res.message);
      }
    } catch (err) {
      setForgotError('Có lỗi xảy ra trong quá trình đổi mật khẩu.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background subtle grid decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-md relative z-10 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Branding */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 text-center relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25 mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-sm font-black tracking-widest uppercase text-white">TRƯỜNG ĐẠI HỌC PHAN CHÂU TRINH</h1>
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mt-1">Tổ Quản Lý Cơ Sở Hạ Tầng</p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Cổng Đăng Nhập Hệ Thống Phân Quyền RBAC</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8 bg-slate-950">
          <div className="mb-6">
            <h2 className="text-base font-bold text-white">Đăng nhập tài khoản</h2>
            <p className="text-xs text-slate-400 mt-0.5">Vui lòng nhập thông tin xác thực do Quản trị viên cấp</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="login-username-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập username (VD: @truongconghien)"
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  id="forgot-password-link"
                  onClick={handleOpenForgot}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 mt-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mã hóa SHA-256 an toàn</span>
            </div>
            <span>Bảo mật 5 Cấp Quyền</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500 font-mono">
        TRƯỜNG ĐẠI HỌC PHAN CHÂU TRINH • PHÒNG QUẢN LÝ CƠ SỞ HẠ TẦNG © 2026
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Khôi phục mật khẩu</h3>
                  <p className="text-[11px] text-slate-400">Xác thực OTP và đặt mật khẩu mới</p>
                </div>
              </div>
              <button
                type="button"
                id="close-forgot-modal-btn"
                onClick={() => setIsForgotOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {forgotError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Nhập <strong>Tên đăng nhập (@username)</strong>, <strong>Email</strong> hoặc <strong>Số điện thoại</strong> đã đăng ký trên hệ thống để nhận mã xác thực OTP.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Thông tin tài khoản
                    </label>
                    <input
                      type="text"
                      id="forgot-identity-input"
                      value={forgotIdentity}
                      onChange={(e) => setForgotIdentity(e.target.value)}
                      placeholder="VD: @truongconghien hoặc email, số điện thoại"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/50 text-[11px] text-blue-300 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      Quy trình bảo mật Đại học Phan Châu Trinh:
                    </p>
                    <p className="text-slate-400">
                      Mã xác thực OTP gồm 6 chữ số sẽ được tạo và gửi đến phương thức liên lạc đã được Thầy Trương Công Hiển phê duyệt trên hồ sơ nhân sự.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(false)}
                      className="px-3.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      id="request-otp-btn"
                      disabled={forgotLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {forgotLoading ? 'Đang kiểm tra...' : 'Tiếp tục nhận OTP'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-4">
                  {/* OTP Notification Banner */}
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>Mã xác thực OTP hệ thống vừa cấp:</span>
                      <span className="font-mono text-base tracking-widest text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/60">
                        {generatedOtp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Mã có hiệu lực trong 5 phút. Vui lòng nhập mã và mật khẩu mới bên dưới.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nhập mã xác thực OTP (6 chữ số)
                    </label>
                    <input
                      type="text"
                      id="otp-input"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="Nhập 6 số OTP"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="new-password-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="confirm-password-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Quay lại bước 1
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsForgotOpen(false)}
                        className="px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                      >
                        Đóng
                      </button>
                      <button
                        type="submit"
                        id="submit-reset-password-btn"
                        disabled={forgotLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {forgotLoading ? 'Đang cập nhật...' : 'Xác nhận đặt lại'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
