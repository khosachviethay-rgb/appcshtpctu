import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Search, Plus, Calendar, Clock, User, 
  AlertTriangle, CheckCircle2, ChevronRight, Filter, X, 
  BarChart2, FileSpreadsheet, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TechTask, TaskType, TaskPriority, TaskStatus } from '../types';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../utils/formatters';

export const TasksView: React.FC = () => {
  const { techTasks = [], addTask, updateTask, currentUser, dailyTasks = [], selectedTaskId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (selectedTaskId) {
      setSearchQuery(selectedTaskId);
    }
  }, [selectedTaskId]);

  // New task form state
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('routine_maintenance');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeName, setAssigneeName] = useState('Thầy Nguyễn Đình Huy');
  const [location, setLocation] = useState('Khối Nhà C - Giảng đường');
  const [deadline, setDeadline] = useState('2026-08-31T17:00');
  const [description, setDescription] = useState('');

  const rawList = (techTasks && techTasks.length > 0) ? techTasks : (dailyTasks || []);
  const tasksList: TechTask[] = (rawList || []).map((t: any) => ({
    id: t.id,
    title: t.title || '',
    type: t.type || (t.taskCode?.startsWith('BT') ? 'routine_maintenance' : t.taskCode?.startsWith('SC') ? 'repair_ticket' : 'daily_inspection'),
    priority: t.priority || 'medium',
    assigneeId: t.assignedTo || t.assigneeId || 'user_huy',
    assigneeName: t.assignedToName || t.assigneeName || 'Thầy Nguyễn Đình Huy',
    assignedById: t.assignedBy || t.assignedById || 'admin_lead',
    assignedByName: t.assignedBy || t.assignedByName || 'Thầy Trương Công Hiển',
    location: t.buildingName || t.location || 'Khuôn viên trường',
    deadline: t.deadline || '',
    status: t.status || 'assigned',
    description: t.description || '',
    completedDate: t.completedDate,
  }));

  const filteredTasks = tasksList.filter(task => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = 
      (task.title || '').toLowerCase().includes(q) ||
      (task.description || '').toLowerCase().includes(q) ||
      (task.location || '').toLowerCase().includes(q) ||
      (task.assigneeName || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalTasks = tasksList.length;
  const completedTasks = tasksList.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasksList.filter(t => t.status === 'in_progress').length;
  const onTimePercentage = Math.round((completedTasks / (totalTasks || 1)) * 100);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newTask: TechTask = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      type: taskType,
      priority,
      assigneeId: 'user_huy',
      assigneeName,
      assignedById: currentUser.id,
      assignedByName: currentUser.name,
      location,
      startDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      deadline: deadline.replace('T', ' '),
      status: 'assigned',
      description: description.trim(),
    };

    addTask(newTask);
    setIsAddModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleQuickStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, {
      status: newStatus,
      completedDate: newStatus === 'completed' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            Quản Lý Công Việc & Tiến Độ Nhân Viên Kỹ Thuật
          </h2>
          <p className="text-xs text-slate-500">
            Giao việc của Tổ trưởng Trương Công Hiển cho Thầy Huy và đội ngũ kỹ thuật vận hành
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Giao việc kỹ thuật mới</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tổng số công việc</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalTasks}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Bảo trì, kiểm tra, sửa chữa</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đang triển khai</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{inProgressTasks}</div>
          <div className="text-[11px] text-blue-700 mt-0.5">KTV đang thao tác thực địa</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đã hoàn thành</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedTasks}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Nghiệm thu đạt yêu cầu</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tỷ lệ đúng hạn (KPI)</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{onTimePercentage}%</div>
          <div className="text-[11px] text-indigo-700 mt-0.5">Mục tiêu quý: ≥ 95%</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên công việc, vị trí, người thực hiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-hidden text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">Tất cả loại việc</option>
            <option value="routine_maintenance">Bảo trì định kỳ</option>
            <option value="repair_ticket">Sửa chữa theo phiếu</option>
            <option value="daily_inspection">Kiểm tra hằng ngày</option>
            <option value="emergency">Khẩn cấp / Đột xuất</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="assigned">Đã giao</option>
            <option value="in_progress">Đang làm</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const isOverdue = new Date(task.deadline).getTime() < Date.now() && task.status !== 'completed';

          return (
            <div 
              key={task.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-indigo-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    task.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                    task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {task.priority === 'urgent' ? 'Khẩn cấp' : task.priority === 'high' ? 'Ưu tiên cao' : 'Thường'}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-2">
                    {task.type === 'routine_maintenance' ? 'Bảo trì định kỳ' :
                     task.type === 'repair_ticket' ? 'Sửa chữa theo phiếu' :
                     task.type === 'daily_inspection' ? 'Kiểm tra hằng ngày' : 'Đột xuất'}
                  </span>
                </div>

                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {task.description}
              </p>

              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Người thực hiện: <strong className="text-slate-900">{task.assigneeName}</strong></span>
                  <span className="text-slate-500">Giao bởi: {task.assignedByName}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span>Vị trí: <strong className="text-slate-800">{task.location}</strong></span>
                  <span className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    Hạn: {formatDate(task.deadline)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Tiến độ KTV:</span>
                <div className="flex items-center gap-1.5">
                  {task.status !== 'in_progress' && task.status !== 'completed' && (
                    <button
                      onClick={() => handleQuickStatusChange(task.id, 'in_progress')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      Bắt đầu làm
                    </button>
                  )}

                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleQuickStatusChange(task.id, 'completed')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Nghiệm thu hoàn thành
                    </button>
                  )}

                  {task.status === 'completed' && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đã nghiệm thu
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Giao Việc Kỹ Thuật Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Giao Việc Nhân Viên Kỹ Thuật Mới</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tên công việc / Nhiệm vụ *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kiểm tra nạp ga điều hòa phòng Hội trường lớn..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Loại công việc</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="routine_maintenance">Bảo trì định kỳ</option>
                    <option value="repair_ticket">Sửa chữa theo phiếu</option>
                    <option value="daily_inspection">Kiểm tra hằng ngày</option>
                    <option value="emergency">Khẩn cấp / Đột xuất</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mức độ ưu tiên</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Ưu tiên cao</option>
                    <option value="urgent">🔴 Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Người thực hiện *</label>
                  <select
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Thầy Nguyễn Đình Huy">Thầy Nguyễn Đình Huy (KTV Chính)</option>
                    <option value="Thầy Trương Công Hiển">Thầy Trương Công Hiển (Tổ trưởng)</option>
                    <option value="Thầy Nguyễn Văn Minh">Thầy Nguyễn Văn Minh (KTV Hỗ trợ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Thời hạn hoàn thành *</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Vị trí thực hiện *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phòng Lab Y sinh 204, Nhà C..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Mô tả chi tiết & Yêu cầu kỹ thuật</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Yêu cầu mang theo đồng hồ đo, kiểm tra bảo hộ lao động..."
                  className="w-full p-2 border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Giao Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
