import React from 'react';
import { 
  AlertTriangle, AlertCircle, CheckCircle2, Clock, 
  ArrowRight, X, Wrench, CheckSquare, Zap, Droplets, 
  Wind, Flame, Building2, Package, ShieldCheck, FileText, 
  ExternalLink, Check
} from 'lucide-react';
import { AlertItem } from '../types';
import { getAlertModuleMeta, getAlertSeverityMeta } from '../utils/alertUtils';

interface AlertDetailModalProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToWork: (alert: AlertItem) => void;
  onMarkRead: (alertId: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  isOpen,
  onClose,
  onNavigateToWork,
  onMarkRead,
}) => {
  if (!isOpen || !alert) return null;

  const moduleMeta = getAlertModuleMeta(alert.actionModule, alert.actionId);
  const severityMeta = getAlertSeverityMeta(alert.severity);

  const renderModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'CheckSquare': return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Droplets': return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'Wind': return <Wind className="w-4 h-4 text-sky-600" />;
      case 'Flame': return <Flame className="w-4 h-4 text-rose-600" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'Package': return <Package className="w-4 h-4 text-purple-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-slate-700" />;
      case 'FileText': return <FileText className="w-4 h-4 text-teal-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleGoToWork = () => {
    onNavigateToWork(alert);
    onClose();
  };

  const handleMarkAsRead = () => {
    onMarkRead(alert.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${severityMeta.badgeClass} flex items-center gap-1.5`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {severityMeta.label}
            </span>
            <span className="text-xs font-mono text-slate-500">#{alert.id}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Title & Metadata */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {alert.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{alert.timestamp}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-300">•</span>
                {alert.isRead ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã đọc
                  </span>
                ) : (
                  <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-red-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" /> Chưa xử lý
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Alert Message Box */}
          <div className={`p-3.5 rounded-lg border-l-4 text-xs ${severityMeta.cardBorderClass} bg-slate-50 border border-slate-200`}>
            <p className="font-semibold text-slate-800 leading-relaxed">
              {alert.message}
            </p>
          </div>

          {/* Target Work Item / Linked Information Card */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>ĐIỀU HƯỚNG CÔNG VIỆC & PHÂN HỆ LIÊN QUAN</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center gap-2">
                <div className="p-1.5 rounded bg-slate-100 shrink-0">
                  {renderModuleIcon(moduleMeta.iconName)}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-medium">Phân hệ xử lý</p>
                  <p className="font-bold text-slate-800 truncate">{moduleMeta.name}</p>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center gap-2">
                <div className="p-1.5 rounded bg-slate-100 shrink-0">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-medium">Mã tham chiếu / Đối tượng</p>
                  <p className="font-bold font-mono text-blue-700 truncate">
                    {alert.actionId ? `#${alert.actionId}` : 'Theo dõi chung'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded text-[11px] text-blue-900 leading-normal flex items-start gap-2">
              <div className="mt-0.5 shrink-0 text-blue-600">ℹ️</div>
              <div>
                <strong>Khuyến nghị vận hành:</strong> Bấm nút bên dưới để chuyển trực tiếp đến phân hệ <strong>{moduleMeta.name}</strong> và xem chi tiết công việc hoặc thiết bị liên quan để xử lý.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="w-full sm:w-auto flex items-center gap-2">
            {!alert.isRead && (
              <button
                type="button"
                onClick={handleMarkAsRead}
                className="w-full sm:w-auto px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-slate-500" />
                <span>Đánh dấu đã đọc</span>
              </button>
            )}
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleGoToWork}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 group"
            >
              <span>{moduleMeta.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
