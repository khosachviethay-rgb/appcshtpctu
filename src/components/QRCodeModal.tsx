import React, { useState } from 'react';
import { X, QrCode, Printer, CheckCircle, ExternalLink, Wrench, Shield, Zap, Search } from 'lucide-react';
import { Device } from '../types';
import { formatVND, formatDate } from '../utils/formatters';

interface QRCodeModalProps {
  device: Device | null;
  onClose: () => void;
  onOpenDeviceDetail?: (deviceId: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ device, onClose, onOpenDeviceDetail }) => {
  const [copied, setCopied] = useState(false);

  if (!device) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(device.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate SVG QR Matrix based on device code hash
  const generateQRCodeSvg = (code: string) => {
    // Generate deterministic 21x21 grid
    const size = 21;
    let seed = 0;
    for (let i = 0; i < code.length; i++) {
      seed = (seed * 31 + code.charCodeAt(i)) & 0xffffffff;
    }

    const grid: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

    // Fill corner finder patterns
    const setFinder = (r: number, c: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (
            i === 0 || i === 6 || j === 0 || j === 6 ||
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)
          ) {
            grid[r + i][c + j] = true;
          }
        }
      }
    };

    setFinder(0, 0);
    setFinder(0, size - 7);
    setFinder(size - 7, 0);

    // Random pattern based on seed
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finders
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= size - 8) ||
          (r >= size - 8 && c < 8)
        ) {
          continue;
        }
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        grid[r][c] = (seed % 2) === 0;
      }
    }

    return (
      <svg viewBox="0 0 21 21" className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-white p-2 rounded-lg border border-slate-300 shadow-xs">
        {grid.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width="1"
                height="1"
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Mã QR Quản Lý Tài Sản Thiết Bị</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 text-center space-y-4 bg-slate-50 border-b border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            TRƯỜNG ĐẠI HỌC PHAN CHÂU TRINH
          </div>
          <div className="text-xs font-semibold text-slate-700">
            TỔ CƠ SỞ HẠ TẦNG & KỸ THUẬT
          </div>

          {/* QR Code */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm inline-block">
            {generateQRCodeSvg(device.code)}
          </div>

          <div>
            <div className="text-xl font-mono font-black text-slate-900 tracking-wider">
              {device.code}
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">{device.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {device.buildingName} • Phòng {device.roomCode} (Tầng {device.floorNumber})
            </div>
          </div>
        </div>

        {/* Specs and Details */}
        <div className="p-4 space-y-2 text-xs bg-white">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Hãng & Model:</span>
            <span className="font-semibold text-slate-800">{device.brand} {device.model}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Công suất:</span>
            <span className="font-semibold text-slate-800">{device.capacity || 'Tiêu chuẩn'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Ngày lắp đặt:</span>
            <span className="font-semibold text-slate-800">{formatDate(device.installDate)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Bảo trì tiếp theo:</span>
            <span className="font-semibold text-rose-600">{formatDate(device.nextMaintenanceDate)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Nhà cung cấp:</span>
            <span className="font-semibold text-slate-800">{device.vendor || 'Đang cập nhật'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Wrench className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Đã chép mã!' : 'Sao chép mã'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>In nhãn dán QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
