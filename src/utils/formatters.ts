export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'operating':
    case 'passed':
    case 'completed':
    case 'approved':
    case 'resolved':
    case 'accepted':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'needs_maintenance':
    case 'warning':
    case 'in_progress':
    case 'waiting_parts':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'faulty':
    case 'failed':
    case 'urgent':
    case 'critical':
      return 'bg-rose-100 text-rose-800 border border-rose-200';
    case 'replace_needed':
    case 'paused':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'new':
    case 'received':
    case 'pending':
    default:
      return 'bg-blue-100 text-blue-800 border border-blue-200';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'operating': return 'Hoạt động tốt';
    case 'needs_maintenance': return 'Cần bảo trì';
    case 'faulty': return 'Đang sự cố/hỏng';
    case 'replace_needed': return 'Cần thay thế';
    case 'passed': return 'Đạt chuẩn';
    case 'warning': return 'Cảnh báo/Cần nạp';
    case 'failed': return 'Không đạt';
    case 'new': return 'Mới gửi';
    case 'received': return 'Đã tiếp nhận';
    case 'in_progress': return 'Đang xử lý';
    case 'waiting_parts': return 'Chờ vật tư';
    case 'completed': return 'Hoàn thành';
    case 'accepted': return 'Đã nghiệm thu';
    case 'closed': return 'Đóng yêu cầu';
    case 'pending': return 'Chờ thực hiện';
    case 'paused': return 'Tạm dừng';
    case 'approved': return 'Đã phê duyệt';
    case 'resolved': return 'Đã giải quyết';
    default: return status;
  }
};
