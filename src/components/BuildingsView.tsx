import React, { useState } from 'react';
import { 
  Building2, Layers, DoorOpen, Plus, Search, ChevronRight, 
  ChevronDown, Wrench, Zap, Droplets, Flame, Edit, Trash2,
  Calendar, CheckCircle, Info, ExternalLink, X, ShieldAlert,
  FileCheck, History, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Building, Room, Floor, Device } from '../types';
import { formatNumber } from '../utils/formatters';
import { canEditMasterData, canSubmitProposal } from '../utils/authSecurity';
import { MasterDataEditModal } from './MasterDataEditModal';
import { ProposalModal } from './ProposalModal';
import { MasterDataHistoryModal } from './MasterDataHistoryModal';

interface BuildingsViewProps {
  onOpenQrModal?: (device: Device) => void;
  onOpenTicketModal?: () => void;
}

export const BuildingsView: React.FC<BuildingsViewProps> = () => {
  const { 
    currentUser, buildings, devices, selectedBuildingId, setSelectedBuildingId, 
    addBuilding, updateBuilding, deleteBuilding, addRoomToBuilding,
    updateBuildingMasterData, updateRoomMasterData, proposals,
    setActiveTab, setSelectedDeviceId 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeBuildingId, setActiveBuildingId] = useState<string>(selectedBuildingId || buildings[0]?.id || '');
  const [expandedFloor, setExpandedFloor] = useState<number | null>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Master Data & Proposal Modal states
  const [isEditBuildingModalOpen, setIsEditBuildingModalOpen] = useState(false);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalConfig, setProposalConfig] = useState<{
    targetType: 'building' | 'room';
    targetId: string;
    targetCode: string;
    targetName: string;
    initialField?: any;
    availableFields?: any[];
  } | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<{ id?: string; type?: 'building' | 'room'; title: string }>({
    title: 'Lịch sử thay đổi Dữ liệu gốc'
  });

  const isSuperAdmin = canEditMasterData(currentUser?.role);
  const isProposer = canSubmitProposal(currentUser?.role);

  // Modal states
  const [isAddBuildingModalOpen, setIsAddBuildingModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [targetFloorForNewRoom, setTargetFloorForNewRoom] = useState<number>(1);

  // New building form
  const [newBCode, setNewBCode] = useState('');
  const [newBName, setNewBName] = useState('');
  const [newBFloors, setNewBFloors] = useState(3);
  const [newBArea, setNewBArea] = useState(1500);
  const [newBYear, setNewBYear] = useState(2021);
  const [newBFunc, setNewBFunc] = useState('Giảng đường & Phòng học');
  const [newBDesc, setNewBDesc] = useState('');

  // New room form
  const [newRCode, setNewRCode] = useState('');
  const [newRName, setNewRName] = useState('');
  const [newRType, setNewRType] = useState<Room['type']>('classroom');
  const [newRCapacity, setNewRCapacity] = useState(45);
  const [newRArea, setNewRArea] = useState(65);

  const activeBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];

  const filteredBuildings = (buildings || []).filter(b => {
    if (!b) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return true;
    return (
      (b.name || '').toLowerCase().includes(q) ||
      (b.code || '').toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q)
    );
  });

  // Devices in active building
  const buildingDevices = devices.filter(d => d.buildingId === activeBuilding?.id);

  // Filter devices in selected room
  const roomDevices = selectedRoom 
    ? devices.filter(d => d.buildingId === activeBuilding?.id && d.roomCode === selectedRoom.code)
    : [];

  const handleCreateBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBName || !newBCode) return;

    const newFloorsList: Floor[] = Array.from({ length: Number(newBFloors) }, (_, i) => ({
      floorNumber: i + 1,
      name: `Tầng ${i + 1}`,
      rooms: [
        {
          id: `rm_${Date.now()}_${i + 1}01`,
          code: `${newBCode.replace(/[^A-Za-z0-9]/g, '')}-${i + 1}01`,
          name: `Phòng ${i + 1}01`,
          type: 'classroom',
          areaM2: 60,
          capacity: 40,
          devicesCount: 0,
        }
      ]
    }));

    const newB: Building = {
      id: `b_${Date.now()}`,
      code: newBCode.trim(),
      name: newBName.trim(),
      yearBuilt: Number(newBYear),
      totalAreaM2: Number(newBArea),
      floorsCount: Number(newBFloors),
      structuralStatus: 'good',
      functionType: newBFunc,
      description: newBDesc.trim() || 'Khu nhà phục vụ công tác giảng dạy & vận hành Trường ĐH Phan Châu Trinh',
      hasSubstation: false,
      floors: newFloorsList,
    };

    addBuilding(newB);
    setActiveBuildingId(newB.id);
    setIsAddBuildingModalOpen(false);
    // Reset
    setNewBCode('');
    setNewBName('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRCode || !newRName || !activeBuilding) return;

    const newRoom: Room = {
      id: `rm_${Date.now()}`,
      code: newRCode.trim().toUpperCase(),
      name: newRName.trim(),
      type: newRType,
      areaM2: Number(newRArea),
      capacity: Number(newRCapacity),
      devicesCount: 0,
      responsiblePerson: 'Tổ CSHT',
    };

    addRoomToBuilding(activeBuilding.id, targetFloorForNewRoom, newRoom);
    setIsAddRoomModalOpen(false);
    setNewRCode('');
    setNewRName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Hệ Thống 8 Khu Nhà & Cơ Sở Vật Chất ĐH Phan Châu Trinh
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý sơ đồ kết cấu theo mô hình phân cấp: Khu nhà → Tầng → Phòng → Thiết bị
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khu nhà..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 w-48 sm:w-64 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <button
            onClick={() => setIsAddBuildingModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khu nhà</span>
          </button>
        </div>
      </div>

      {/* Buildings Cards Grid (Selectable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {filteredBuildings.map((b) => {
          const isSelected = b.id === activeBuildingId;
          const totalBldDevices = devices.filter(d => d.buildingId === b.id).length;
          const totalBldRooms = b.floors.reduce((sum, fl) => sum + fl.rooms.length, 0);

          return (
            <div
              key={b.id}
              onClick={() => {
                setActiveBuildingId(b.id);
                setSelectedBuildingId(b.id);
                setSelectedRoom(null);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                isSelected 
                  ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20' 
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs font-black text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  {b.code}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  XD: {b.yearBuilt}
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{b.name}</div>
              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{b.functionType}</div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>{b.floorsCount} tầng • {totalBldRooms} phòng</span>
                <span className="text-blue-700 font-semibold">{totalBldDevices} thiết bị</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Building Drill-Down Workspace */}
      {activeBuilding && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Active Building Header Info */}
          <div className="p-5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-xs font-mono font-bold">
                  {activeBuilding.code}
                </span>
                <h3 className="text-lg font-bold">{activeBuilding.name}</h3>
                <span className="text-xs text-slate-300">({activeBuilding.functionType})</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{activeBuilding.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400">Diện tích sàn:</span>{' '}
                  <strong className="text-white">{formatNumber(activeBuilding.totalAreaM2)} m²</strong>
                </div>
                <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400">Số tầng:</span>{' '}
                  <strong className="text-white">{activeBuilding.floorsCount} tầng</strong>
                </div>
                <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span className="text-slate-400">Kết cấu:</span>{' '}
                  <span className="text-emerald-400 font-semibold">An toàn / Tốt</span>
                </div>
              </div>

              {/* Master Data Controls */}
              <div className="flex items-center gap-1.5">
                {isSuperAdmin && (
                  <button
                    onClick={() => setIsEditBuildingModalOpen(true)}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    title="Chỉnh sửa Dữ liệu gốc (Quyền Cấp 1 - Thầy Hiển)"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Sửa Dữ liệu gốc</span>
                  </button>
                )}

                {isProposer && (
                  <button
                    onClick={() => {
                      setProposalConfig({
                        targetType: 'building',
                        targetId: activeBuilding.id,
                        targetCode: activeBuilding.code,
                        targetName: activeBuilding.name,
                        availableFields: [
                          { key: 'functionType', label: 'Công năng sử dụng', currentValue: activeBuilding.functionType },
                          { key: 'totalAreaM2', label: 'Diện tích sàn (m²)', currentValue: activeBuilding.totalAreaM2 },
                          { key: 'floorsCount', label: 'Số tầng', currentValue: activeBuilding.floorsCount },
                          { key: 'description', label: 'Mô tả kết cấu', currentValue: activeBuilding.description }
                        ]
                      });
                      setIsProposalModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    title="Gửi đề nghị điều chỉnh thông số cho Tổ trưởng phê duyệt"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Đề xuất điều chỉnh</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setHistoryTarget({
                      id: activeBuilding.id,
                      type: 'building',
                      title: `Lịch sử Dữ liệu gốc: ${activeBuilding.name} (${activeBuilding.code})`
                    });
                    setIsHistoryModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                  title="Xem nhật ký kiểm toán thay đổi dữ liệu gốc"
                >
                  <History className="w-3.5 h-3.5 text-blue-400" />
                  <span>Lịch sử</span>
                </button>
              </div>
            </div>
          </div>

          {/* Floors & Rooms Tree Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Left: Floors & Rooms Navigator */}
            <div className="lg:col-span-7 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Sơ đồ phân bố tầng & phòng học ({activeBuilding.name})
                </h4>
                <button
                  onClick={() => {
                    setTargetFloorForNewRoom(1);
                    setIsAddRoomModalOpen(true);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm phòng vào khu
                </button>
              </div>

              {/* Floors Accordion */}
              <div className="space-y-3">
                {activeBuilding.floors.map((fl) => {
                  const isFloorExpanded = expandedFloor === fl.floorNumber;

                  return (
                    <div 
                      key={fl.floorNumber} 
                      className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
                    >
                      {/* Floor Header */}
                      <div 
                        onClick={() => setExpandedFloor(isFloorExpanded ? null : fl.floorNumber)}
                        className="p-3 bg-slate-100 hover:bg-slate-200/70 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isFloorExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          <span className="text-xs font-bold text-slate-800">
                            Tầng {fl.floorNumber} ({fl.name})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            • {fl.rooms.length} phòng / khu vực
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetFloorForNewRoom(fl.floorNumber);
                            setIsAddRoomModalOpen(true);
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-medium px-2 py-0.5 rounded hover:bg-white transition-colors"
                        >
                          + Thêm phòng
                        </button>
                      </div>

                      {/* Rooms Grid inside Floor */}
                      {isFloorExpanded && (
                        <div className="p-3 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {fl.rooms.map((rm) => {
                            const isRoomSelected = selectedRoom?.code === rm.code;
                            const rmDevices = devices.filter(d => d.buildingId === activeBuilding.id && d.roomCode === rm.code);

                            return (
                              <div
                                key={rm.id}
                                onClick={() => setSelectedRoom(rm)}
                                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                                  isRoomSelected 
                                    ? 'bg-blue-50 border-blue-500 shadow-xs' 
                                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <span className="font-mono text-xs font-bold text-slate-900">
                                    {rm.code}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                                    {rm.type === 'classroom' ? 'Phòng học' :
                                     rm.type === 'lab' ? 'Lab Y khoa' :
                                     rm.type === 'office' ? 'Văn phòng' :
                                     rm.type === 'dorm' ? 'Phòng KTX' :
                                     rm.type === 'hall' ? 'Hội trường' : 'WC/Kho'}
                                  </span>
                                </div>
                                <div className="text-xs font-semibold text-slate-800 mt-1">{rm.name}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                                  <span>{rm.areaM2} m² • {rm.capacity} chỗ</span>
                                  <span className="text-blue-600 font-medium">{rmDevices.length} thiết bị</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Room Details & Devices in Room */}
            <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50/40">
              {selectedRoom ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {selectedRoom.code}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{selectedRoom.name}</h4>
                        <div className="text-xs text-slate-500">
                          {activeBuilding.name} • Tầng {selectedRoom.code.slice(1, 2) || '1'}
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Đang sử dụng
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400">Diện tích:</span>{' '}
                        <strong className="text-slate-700">{selectedRoom.areaM2} m²</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Sức chứa:</span>{' '}
                        <strong className="text-slate-700">{selectedRoom.capacity} người</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Phụ trách:</span>{' '}
                        <strong className="text-slate-700">{selectedRoom.responsiblePerson || 'Tổ Kỹ thuật'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Thiết bị:</span>{' '}
                        <strong className="text-blue-700">{roomDevices.length} thiết bị</strong>
                      </div>
                    </div>

                    {/* Room Master Data Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                      <div className="text-[11px] text-slate-400 font-medium">Dữ liệu gốc phòng:</div>
                      <div className="flex items-center gap-1.5">
                        {isSuperAdmin && (
                          <button
                            onClick={() => setIsEditRoomModalOpen(true)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded text-[11px] flex items-center gap-1"
                            title="Sửa Dữ liệu gốc phòng học (Quyền Cấp 1)"
                          >
                            <Shield className="w-3 h-3 text-amber-700" />
                            <span>Sửa gốc</span>
                          </button>
                        )}

                        {isProposer && (
                          <button
                            onClick={() => {
                              setProposalConfig({
                                targetType: 'room',
                                targetId: selectedRoom.id,
                                targetCode: selectedRoom.code,
                                targetName: selectedRoom.name,
                                availableFields: [
                                  { key: 'name', label: 'Tên phòng', currentValue: selectedRoom.name },
                                  { key: 'type', label: 'Loại phòng', currentValue: selectedRoom.type },
                                  { key: 'capacity', label: 'Sức chứa (người)', currentValue: selectedRoom.capacity },
                                  { key: 'areaM2', label: 'Diện tích (m²)', currentValue: selectedRoom.areaM2 },
                                  { key: 'responsiblePerson', label: 'Người/Bộ phận phụ trách', currentValue: selectedRoom.responsiblePerson || '' }
                                ]
                              });
                              setIsProposalModalOpen(true);
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded text-[11px] flex items-center gap-1"
                            title="Gửi đề xuất điều chỉnh thông số phòng"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>Đề xuất sửa</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setHistoryTarget({
                              id: selectedRoom.id,
                              type: 'room',
                              title: `Lịch sử Dữ liệu gốc: Phòng ${selectedRoom.code} - ${selectedRoom.name}`
                            });
                            setIsHistoryModalOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] flex items-center gap-1"
                          title="Xem lịch sử kiểm toán của phòng"
                        >
                          <History className="w-3 h-3 text-slate-500" />
                          <span>Lịch sử</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Devices in this Room */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-blue-600" />
                        Danh mục thiết bị kỹ thuật trong phòng ({roomDevices.length})
                      </h5>
                    </div>

                    {roomDevices.length === 0 ? (
                      <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                        Chưa có thiết bị nào được gán vào phòng này.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {roomDevices.map((dev) => (
                          <div
                            key={dev.id}
                            onClick={() => {
                              setSelectedDeviceId(dev.id);
                              setActiveTab(dev.category === 'hvac' ? 'hvac' : dev.category === 'pccc' ? 'pccc' : 'devices');
                            }}
                            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-2xs cursor-pointer transition-all flex items-center justify-between group"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-blue-700">
                                  {dev.code}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  dev.status === 'operating' ? 'bg-emerald-100 text-emerald-800' :
                                  dev.status === 'needs_maintenance' ? 'bg-amber-100 text-amber-800' :
                                  'bg-rose-100 text-rose-800'
                                }`}>
                                  {dev.status === 'operating' ? 'Tốt' : dev.status === 'needs_maintenance' ? 'Cần bảo trì' : 'Hỏng'}
                                </span>
                              </div>
                              <div className="text-xs font-semibold text-slate-800 mt-0.5">{dev.name}</div>
                              <div className="text-[11px] text-slate-500">
                                {dev.brand} {dev.model} • {dev.capacity || 'Tiêu chuẩn'}
                              </div>
                            </div>

                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-400 h-full flex flex-col items-center justify-center">
                  <DoorOpen className="w-8 h-8 text-slate-300 mb-2" />
                  <div className="text-sm font-semibold text-slate-600">Chọn phòng bên trái</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Nhấp vào bất kỳ phòng nào để xem thông số chi tiết và danh mục thiết bị kỹ thuật
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Khu Nhà Mới */}
      {isAddBuildingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">Thêm Khu Nhà Mới</h3>
              <button onClick={() => setIsAddBuildingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBuilding} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mã khu nhà *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: KHU-D, TT-TN..."
                    value={newBCode}
                    onChange={(e) => setNewBCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tên khu nhà *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Khu Thực Hành Y Khoa..."
                    value={newBName}
                    onChange={(e) => setNewBName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Số tầng</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={newBFloors}
                    onChange={(e) => setNewBFloors(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Diện tích sàn (m²)</label>
                  <input
                    type="number"
                    value={newBArea}
                    onChange={(e) => setNewBArea(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Năm xây dựng</label>
                  <input
                    type="number"
                    value={newBYear}
                    onChange={(e) => setNewBYear(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Công năng sử dụng</label>
                <input
                  type="text"
                  value={newBFunc}
                  onChange={(e) => setNewBFunc(e.target.value)}
                  placeholder="Giảng đường, Phòng thực hành, Lab..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Mô tả thêm</label>
                <textarea
                  rows={2}
                  value={newBDesc}
                  onChange={(e) => setNewBDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddBuildingModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Lưu Khu Nhà
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Phòng Mới */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Thêm Phòng - {activeBuilding?.name} (Tầng {targetFloorForNewRoom})
              </h3>
              <button onClick={() => setIsAddRoomModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mã phòng *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: C305, A201..."
                    value={newRCode}
                    onChange={(e) => setNewRCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tên phòng *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Giảng đường 305..."
                    value={newRName}
                    onChange={(e) => setNewRName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Loại phòng</label>
                  <select
                    value={newRType}
                    onChange={(e) => setNewRType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="classroom">Phòng học</option>
                    <option value="lab">Lab Y khoa</option>
                    <option value="office">Văn phòng</option>
                    <option value="dorm">Ký túc xá</option>
                    <option value="hall">Hội trường</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Sức chứa (người)</label>
                  <input
                    type="number"
                    value={newRCapacity}
                    onChange={(e) => setNewRCapacity(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Diện tích (m²)</label>
                  <input
                    type="number"
                    value={newRArea}
                    onChange={(e) => setNewRArea(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Thêm Phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Dữ Liệu Gốc Khu Nhà (Cấp 1 - Thầy Hiển) */}
      {isEditBuildingModalOpen && activeBuilding && (
        <MasterDataEditModal
          isOpen={isEditBuildingModalOpen}
          onClose={() => setIsEditBuildingModalOpen(false)}
          targetType="building"
          targetId={activeBuilding.id}
          targetCode={activeBuilding.code}
          targetName={activeBuilding.name}
          initialValues={{
            name: activeBuilding.name,
            functionType: activeBuilding.functionType,
            floorsCount: activeBuilding.floorsCount,
            totalAreaM2: activeBuilding.totalAreaM2,
            yearBuilt: activeBuilding.yearBuilt,
            description: activeBuilding.description
          }}
          fieldsConfig={[
            { key: 'name', label: 'Tên khu nhà', type: 'text' },
            { key: 'functionType', label: 'Công năng sử dụng', type: 'text' },
            { key: 'floorsCount', label: 'Số tầng', type: 'number' },
            { key: 'totalAreaM2', label: 'Tổng diện tích sàn (m²)', type: 'number' },
            { key: 'yearBuilt', label: 'Năm xây dựng', type: 'number' },
            { key: 'description', label: 'Mô tả kết cấu', type: 'textarea' }
          ]}
        />
      )}

      {/* Modal Sửa Dữ Liệu Gốc Phòng Học (Cấp 1 - Thầy Hiển) */}
      {isEditRoomModalOpen && selectedRoom && activeBuilding && (
        <MasterDataEditModal
          isOpen={isEditRoomModalOpen}
          onClose={() => setIsEditRoomModalOpen(false)}
          targetType="room"
          targetId={selectedRoom.id}
          targetCode={selectedRoom.code}
          targetName={selectedRoom.name}
          buildingId={activeBuilding.id}
          floorNumber={Number(selectedRoom.code.slice(1, 2)) || 1}
          initialValues={{
            name: selectedRoom.name,
            type: selectedRoom.type,
            capacity: selectedRoom.capacity,
            areaM2: selectedRoom.areaM2,
            responsiblePerson: selectedRoom.responsiblePerson || 'Tổ Kỹ thuật'
          }}
          fieldsConfig={[
            { key: 'name', label: 'Tên phòng', type: 'text' },
            { 
              key: 'type', 
              label: 'Loại phòng', 
              type: 'select', 
              options: ['classroom', 'lab', 'office', 'dorm', 'hall', 'other'] 
            },
            { key: 'capacity', label: 'Sức chứa (người)', type: 'number' },
            { key: 'areaM2', label: 'Diện tích (m²)', type: 'number' },
            { key: 'responsiblePerson', label: 'Cán bộ / Đơn vị quản lý', type: 'text' }
          ]}
        />
      )}

      {/* Modal Đề Xuất Thay Đổi Dữ Liệu Gốc (Cấp 2 - Thầy Huy / Cán bộ) */}
      {isProposalModalOpen && proposalConfig && (
        <ProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => {
            setIsProposalModalOpen(false);
            setProposalConfig(null);
          }}
          targetType={proposalConfig.targetType}
          targetId={proposalConfig.targetId}
          targetCode={proposalConfig.targetCode}
          targetName={proposalConfig.targetName}
          availableFields={proposalConfig.availableFields}
        />
      )}

      {/* Modal Lịch Sử Kiểm Toán Dữ Liệu Gốc */}
      <MasterDataHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        targetId={historyTarget.id}
        targetType={historyTarget.type}
        title={historyTarget.title}
      />
    </div>
  );
};
