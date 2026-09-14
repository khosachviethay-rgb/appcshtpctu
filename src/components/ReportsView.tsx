import React, { useState } from 'react';
import { 
  FileText, Download, Printer, Calendar, CheckCircle2, 
  TrendingUp, Zap, Droplets, Flame, Wrench, DollarSign,
  Share2, Eye, ShieldCheck, Sparkles, AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDate, formatNumber } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { 
    buildings = [], devices = [], electricRecords = [], waterRecords = [], 
    repairRequests = [], techTasks = [], budgetItems = [], currentUser 
  } = useApp();

  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'pccc' | 'energy'>('monthly');
  const [reportPeriod, setReportPeriod] = useState('Tháng 08/2026');

  // Aggregated data for the report
  const totalKwh = (electricRecords || []).reduce((sum, r) => sum + (r.consumptionKwh || 0), 0);
  const totalElecCost = (electricRecords || []).reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const totalWaterM3 = (waterRecords || []).reduce((sum, r) => sum + (r.consumptionM3 || 0), 0);
  const totalWaterCost = (waterRecords || []).reduce((sum, r) => sum + (r.totalCost || 0), 0);

  const completedTickets = (repairRequests || []).filter(r => r.status === 'completed' || r.status === 'accepted').length;
  const pendingTickets = (repairRequests || []).filter(r => r.status !== 'completed' && r.status !== 'accepted').length;
  const totalRepairSpent = (repairRequests || []).reduce((sum, r) => sum + (r.actualCost || 0), 0);

  const pcccDevices = (devices || []).filter(d => d.category === 'pccc');
  const pcccPassed = pcccDevices.filter(d => d.pcccInspectionStatus === 'passed').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "BÁO CÁO VẬN HÀNH KỸ THUẬT & CƠ SỞ VẬT CHẤT - ĐH PHAN CHÂU TRINH\n"
      + `Kỳ báo cáo: ${reportPeriod}\n`
      + `Người lập: ${currentUser.name} (${currentUser.title})\n\n`
      + "Hạng mục,Chỉ tiêu,Đơn vị,Chi phí (VNĐ)\n"
      + `Điện năng tiêu thụ,${totalKwh},kWh,${totalElecCost}\n`
      + `Nước sạch tiêu thụ,${totalWaterM3},m3,${totalWaterCost}\n`
      + `Sửa chữa khắc phục,${completedTickets},Phiếu,${totalRepairSpent}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao_Cao_Van_Hanh_PCTU_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Trung Tâm Báo Cáo Kỹ Thuật & Xuất Bản Văn Bản Hành Chính
          </h2>
          <p className="text-xs text-slate-500">
            Tổng hợp dữ liệu trình Trưởng phòng HC-NS (Cô Nguyễn Thị Hoàn) & Ban Giám Hiệu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>In / Xuất PDF Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setReportType('monthly')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            reportType === 'monthly' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Báo cáo tháng (Điện - Nước - Sửa chữa)
        </button>
        <button
          onClick={() => setReportType('weekly')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            reportType === 'weekly' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Báo cáo tuần (Tiến độ KTV & Công việc)
        </button>
        <button
          onClick={() => setReportType('pccc')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            reportType === 'pccc' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Báo cáo chuyên đề an toàn PCCC
        </button>
        <button
          onClick={() => setReportType('energy')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            reportType === 'energy' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Báo cáo tiêu thụ năng lượng & Tiết kiệm
        </button>
      </div>

      {/* Official Report Document Container */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-lg p-6 sm:p-10 max-w-4xl mx-auto space-y-6 text-slate-900 font-sans">
        {/* University Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">TRƯỜNG ĐẠI HỌC PHAN CHÂU TRINH</div>
            <div className="text-xs font-semibold text-slate-600">PHÒNG HÀNH CHÍNH - NHÂN SỰ • TỔ KỸ THUẬT VẬN HÀNH</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Số: 18/BC-TKT-PCTU</div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div className="text-xs font-bold text-slate-800 tracking-wider">Độc lập - Tự do - Hạnh phúc</div>
            <div className="text-[11px] italic text-slate-500 mt-1">Điện Bàn, ngày 31 tháng 08 năm 2026</div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center py-2">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
            {reportType === 'monthly' && 'BÁO CÁO TỔNG KẾT VẬN HÀNH KỸ THUẬT CƠ SỞ VẬT CHẤT'}
            {reportType === 'weekly' && 'BÁO CÁO TIẾN ĐỘ CÔNG VIỆC TUẦN - TỔ KỸ THUẬT'}
            {reportType === 'pccc' && 'BIÊN BẢN TỔNG HỢP KIỂM TRA ĐỊNH KỲ HỆ THỐNG PCCC TOÀN TRƯỜNG'}
            {reportType === 'energy' && 'BÁO CÁO GIÁM SÁT TIÊU THỤ ĐIỆN NĂNG & NƯỚC SẠCH'}
          </h1>
          <p className="text-xs text-slate-600 mt-1 italic font-medium">
            Kỳ đánh giá: {reportPeriod} • Kính gửi: Cô Nguyễn Thị Hoàn - Trưởng phòng Hành chính - Nhân sự
          </p>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500">Điện năng tháng:</span>
            <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
              {formatNumber(totalKwh)} kWh
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">{formatVND(totalElecCost)}</span>
          </div>

          <div>
            <span className="text-slate-500">Nước sạch tiêu thụ:</span>
            <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
              {formatNumber(totalWaterM3)} m³
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">{formatVND(totalWaterCost)}</span>
          </div>

          <div>
            <span className="text-slate-500">Phiếu sửa chữa:</span>
            <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
              {completedTickets} / {repairRequests.length} xong
            </div>
            <span className="text-[11px] text-blue-700 font-semibold">Tỷ lệ: 85% đúng hẹn</span>
          </div>

          <div>
            <span className="text-slate-500">An toàn PCCC:</span>
            <div className="text-base font-black text-emerald-700 mt-0.5 font-mono">
              {pcccPassed} / {pcccDevices.length} đạt chuẩn
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">Bơm & Bể 100m³ sẵn sàng</span>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-4 text-xs leading-relaxed">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
              I. TÌNH HÌNH TIÊU THỤ NĂNG LƯỢNG & NƯỚC SẠCH
            </h3>
            <p className="text-slate-700">
              Trong kỳ tháng 08/2026, toàn trường tiêu thụ <strong>{formatNumber(totalKwh)} kWh</strong> điện (thành tiền {formatVND(totalElecCost)}) và <strong>{formatNumber(totalWaterM3)} m³</strong> nước sạch (thành tiền {formatVND(totalWaterCost)}).
            </p>
            <p className="text-slate-700 mt-1">
              • <strong>Ghi nhận đột biến:</strong> Khu vực Trung tâm Nghiên cứu Y sinh học có chỉ số điện tăng +32% do tăng cường chạy máy đông sâu nuôi cấy mẫu phẩm vi sinh.<br />
              • <strong>Hệ thống cấp nước:</strong> 4 bồn chứa ngầm và mái duy trì ổn định &gt;80% dung tích. Trạm bơm Wilo vận hành tự động tốt, không phát hiện rò rỉ ngầm.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
              II. CÔNG TÁC BẢO TRÌ, SỬA CHỮA & TIẾN ĐỘ KỸ THUẬT
            </h3>
            <p className="text-slate-700">
              • <strong>Sửa chữa theo yêu cầu:</strong> Tiếp nhận {repairRequests.length} phiếu yêu cầu từ các Khoa/Phòng. Đã hoàn thành xử lý {completedTickets} phiếu, còn {pendingTickets} phiếu đang xử lý hoặc theo dõi nghiệm thu.<br />
              • <strong>Điều hòa không khí (HVAC):</strong> Hoàn thành xịt rửa lưới lọc và đo gas cho 18/24 máy điều hòa tại Khối Nhà A và Nhà B chuẩn bị năm học mới.<br />
              • <strong>Hạ tầng xây dựng:</strong> Đã thay thế phụ kiện bản lề sàn thủy lực tại cửa chính Nhà C và khắc phục xong ẩm mốc trần tầng 3.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
              III. KIẾN NGHỊ & ĐỀ XUẤT PHÒNG HÀNH CHÍNH - NHÂN SỰ
            </h3>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
              <li>Phê duyệt dự toán mua bổ sung 10 bóng tuýp LED 1.2m và 2 van phao tự ngắt cho kho vật tư dự phòng.</li>
              <li>Lên lịch hợp đồng với đơn vị PCCC kiểm định và nạp sạc lại 2 bình chữa cháy bột đã tụt kim áp lực.</li>
              <li>Nhắc nhở các Khoa/Phòng tắt điều hòa và bình nóng lạnh trước khi rời phòng làm việc sau 17h30.</li>
            </ul>
          </div>
        </div>

        {/* Official Signatures */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="font-bold text-slate-800 uppercase">NGƯỜI LẬP BÁO CÁO</div>
            <div className="text-slate-500 italic">Tổ trưởng Tổ Kỹ thuật Vận hành</div>
            <div className="mt-14 font-black text-slate-900 text-sm">Trương Công Hiển</div>
          </div>

          <div>
            <div className="font-bold text-slate-800 uppercase">TRƯỞNG PHÒNG HÀNH CHÍNH - NHÂN SỰ</div>
            <div className="text-slate-500 italic">Phê duyệt & Ý kiến chỉ đạo</div>
            <div className="mt-14 font-black text-slate-900 text-sm">Nguyễn Thị Hoàn</div>
          </div>
        </div>
      </div>
    </div>
  );
};
