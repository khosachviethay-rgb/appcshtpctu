import React, { useState } from 'react';
import { 
  ShieldAlert, X, CheckCircle2, History, AlertTriangle, Building, Wrench, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MasterDataEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'building' | 'room' | 'device';
  targetId: string;
  targetCode: string;
  targetName: string;
  buildingId?: string;
  floorNumber?: number;
  initialValues: Record<string, any>;
  fieldsConfig: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'select' | 'textarea';
    options?: string[];
  }>;
}

export const MasterDataEditModal: React.FC<MasterDataEditModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetCode,
  targetName,
  buildingId,
  floorNumber,
  initialValues,
  fieldsConfig
}) => {
  const { 
    currentUser, updateBuildingMasterData, updateRoomMasterData, updateDeviceMasterData 
  } = useApp();

  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [reason, setReason] = useState('Chuẩn hóa dữ liệu theo hồ sơ hoàn công thực tế 2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Bắt buộc phải nhập Lý do chỉnh sửa để ghi vết vào Audit Trail.');
      return;
    }

    // Check if anything actually changed
    const hasChanges = fieldsConfig.some(f => formData[f.key] !== initialValues[f.key]);
    if (!hasChanges) {
      setErrorMsg('Không phát hiện thay đổi dữ liệu nào so với giá trị hiện tại.');
      return;
    }

    if (targetType === 'building') {
      updateBuildingMasterData(targetId, formData, reason.trim());
    } else if (targetType === 'room' && buildingId !== undefined && floorNumber !== undefined) {
      updateRoomMasterData(buildingId, floorNumber, targetId, formData, reason.trim());
    } else if (targetType === 'device') {
      updateDeviceMasterData(targetId, formData, reason.trim());
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-3.5 bg-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-300" />
            <span className="font-bold uppercase tracking-wider text-xs">
              Chỉnh sửa Dữ liệu gốc (Thẩm quyền Cấp 1 – Thầy Trương Công Hiển)
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">Cập nhật Dữ liệu gốc thành công!</h4>
            <p className="text-xs text-slate-500">
              Các thông số mới đã áp dụng đồng bộ vào hạ tầng và tự động ghi vết Before/After trong Master Data Audit Trail.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            {/* Target info */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px] block">Đối tượng hiệu chỉnh:</span>
                <span className="font-bold text-slate-900 text-xs">{targetName}</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {targetCode} ({targetType})
              </span>
            </div>

            {errorMsg && (
              <div className="p-2 rounded bg-red-50 text-red-700 text-xs border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Dynamic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {fieldsConfig.map((field) => {
                const isChanged = formData[field.key] !== initialValues[field.key];

                return (
                  <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>{field.label}</span>
                      {isChanged && (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 rounded">
                          Đã sửa
                        </span>
                      )}
                    </label>

                    {field.type === 'select' && field.options ? (
                      <select
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:border-blue-500 focus:outline-hidden"
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={2}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={formData[field.key] !== undefined ? formData[field.key] : ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value 
                        })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden font-medium"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mandatory Reason */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-slate-800 font-bold mb-1 flex items-center gap-1 text-xs">
                <span>Lý do chỉnh sửa Dữ liệu gốc *</span>
                <span className="text-red-500">(Bắt buộc ghi vết kiểm toán)</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nghiệm thu hoàn công bổ sung phòng ban, thay đổi diện tích thực tế..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-1.5 border border-blue-300 rounded bg-blue-50/40 focus:border-blue-600 focus:outline-hidden font-medium text-slate-800"
              />
            </div>

            <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Toàn bộ thao tác sửa đổi này sẽ được lưu vĩnh viễn vào Master Data Audit Trail với chữ ký của {currentUser?.name}.
              </span>
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-2xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lưu & Ghi vết Dữ liệu gốc</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
