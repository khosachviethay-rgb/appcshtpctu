import React, { useState } from 'react';
import { 
  FileCheck, X, AlertCircle, ArrowRight, CheckCircle2, Building, Wrench, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'building' | 'floor' | 'room' | 'device';
  targetId: string;
  targetCode: string;
  targetName: string;
  initialField?: {
    name: string;
    label: string;
    currentValue: string | number;
  };
  availableFields?: Array<{
    name: string;
    label: string;
    currentValue: string | number;
  }>;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetCode,
  targetName,
  initialField,
  availableFields = []
}) => {
  const { currentUser, submitProposal } = useApp();

  const [selectedField, setSelectedField] = useState(
    initialField || availableFields[0] || { name: 'capacity', label: 'Thông số kỹ thuật', currentValue: '' }
  );
  const [proposedValue, setProposedValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedValue.trim()) {
      setErrorMsg('Vui lòng nhập giá trị đề xuất mới.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Vui lòng ghi rõ lý do đề xuất (ví dụ: phát hiện thực tế kiểm tra sai lệch).');
      return;
    }

    submitProposal({
      targetType,
      targetId,
      targetCode,
      targetName,
      fieldName: selectedField.name,
      fieldLabel: selectedField.label,
      currentValue: selectedField.currentValue,
      proposedValue: proposedValue.trim(),
      reason: reason.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
        {/* Header */}
        <div className="p-3.5 bg-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider text-xs">
              Đề nghị cập nhật thông tin Dữ liệu gốc
            </span>
          </div>
          <button onClick={onClose} className="text-amber-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">Đã gửi đề xuất thành công!</h4>
            <p className="text-xs text-slate-500">
              Đề xuất cập nhật đã chuyển đến Thầy Trương Công Hiển (Tổ trưởng) để kiểm tra và phê duyệt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            {/* Explanatory note */}
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Theo quy định phân quyền, Kỹ thuật viên (Cấp 2) không được trực tiếp sửa dữ liệu gốc. Hãy gửi đề xuất chi tiết để Tổ trưởng phê duyệt vào hệ thống.
              </span>
            </div>

            {/* Target info card */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Đối tượng dữ liệu gốc:</span>
                <span className="font-bold text-slate-900">{targetName}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-500">Mã định danh:</span>
                <span className="font-bold text-blue-600">{targetCode} ({targetType})</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Người gửi đề xuất:</span>
                <span className="font-semibold text-slate-700">{currentUser?.name} ({currentUser?.title})</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2 rounded bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Field selection */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Trường dữ liệu gốc cần hiệu chỉnh:
              </label>
              {availableFields.length > 1 ? (
                <select
                  value={selectedField.name}
                  onChange={(e) => {
                    const found = availableFields.find((f) => f.name === e.target.value);
                    if (found) setSelectedField(found);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium focus:border-blue-500 focus:outline-hidden"
                >
                  {availableFields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label} (Hiện tại: {f.currentValue})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2 bg-slate-100 rounded text-slate-800 font-semibold">
                  {selectedField.label}
                </div>
              )}
            </div>

            {/* Values comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Giá trị hiện tại trên hệ thống:
                </label>
                <input
                  type="text"
                  disabled
                  value={String(selectedField.currentValue)}
                  className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded font-mono text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Giá trị mới đề xuất thay đổi: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số liệu đo đạc thực tế..."
                  value={proposedValue}
                  onChange={(e) => setProposedValue(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-blue-400 rounded font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Căn cứ / Lý do đề xuất thay đổi: *
              </label>
              <textarea
                rows={3}
                required
                placeholder="VD: Kiểm tra thực địa phát hiện số phòng đã ngăn đôi hoặc tem thông số thiết bị hiển thị công suất khác..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Actions */}
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
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Gửi đề xuất tới Thầy Hiển</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
