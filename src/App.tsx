import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BuildingsView } from './components/BuildingsView';
import { ElectricityView } from './components/ElectricityView';
import { WaterView } from './components/WaterView';
import { HvacView } from './components/HvacView';
import { PcccView } from './components/PcccView';
import { InfrastructureView } from './components/InfrastructureView';
import { DevicesView } from './components/DevicesView';
import { RepairRequestsView } from './components/RepairRequestsView';
import { TasksView } from './components/TasksView';
import { InventoryView } from './components/InventoryView';
import { BudgetView } from './components/BudgetView';
import { ReportsView } from './components/ReportsView';
import { AuditLogsView } from './components/AuditLogsView';
import { AccountsAndRbacView } from './components/AccountsAndRbacView';
import { LoginView } from './components/LoginView';
import { canAccessModule } from './utils/authSecurity';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

import { QuickSearchModal } from './components/QuickSearchModal';
import { QuickTicketModal } from './components/QuickTicketModal';
import { QRCodeModal } from './components/QRCodeModal';
import { AlertDetailModal } from './components/AlertDetailModal';
import { Device } from './types';

const MainAppContent: React.FC = () => {
  const { 
    currentUser, currentTab, setCurrentTab, devices, setSelectedDeviceId,
    selectedAlertForDetail, closeAlertDetail, navigateToAlertTarget, markAlertRead
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [qrModalDevice, setQrModalDevice] = useState<Device | null>(null);

  if (!currentUser) {
    return <LoginView />;
  }

  const isTabAccessible = canAccessModule(currentUser, currentTab);

  const handleOpenQrModal = (device: Device) => {
    setQrModalDevice(device);
  };

  const handleSelectDeviceFromSearch = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setCurrentTab('devices');
  };

  const handleSelectBuildingFromSearch = (buildingId: string) => {
    setCurrentTab('buildings');
  };

  const handleSelectTicketFromSearch = (ticketId: string) => {
    setCurrentTab('repairs');
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-slate-900 font-sans overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenNewTicket={() => setIsTicketModalOpen(true)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#f1f5f9]">
          <div className="max-w-7xl mx-auto">
            {!isTabAccessible ? (
              <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">403 - Quyền truy cập bị hạn chế</h2>
                <p className="text-sm text-slate-600 mt-2">
                  Tài khoản <strong className="text-slate-900">@{currentUser.username}</strong> ({currentUser.name} - {currentUser.title}) không được phân quyền truy cập phân hệ này theo chính sách bảo mật RBAC của Trường Đại học Phan Châu Trinh.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Về Dashboard tổng quan
                  </button>
                </div>
              </div>
            ) : (
              <>
                {currentTab === 'dashboard' && (
                  <DashboardView 
                    onNavigateTab={(tab) => setCurrentTab(tab as any)}
                    onOpenNewTicket={() => setIsTicketModalOpen(true)}
                  />
                )}

                {currentTab === 'buildings' && (
                  <BuildingsView 
                    onOpenQrModal={handleOpenQrModal}
                    onOpenTicketModal={() => setIsTicketModalOpen(true)}
                  />
                )}

                {currentTab === 'electric' && (
                  <ElectricityView />
                )}

                {currentTab === 'water' && (
                  <WaterView />
                )}

                {currentTab === 'hvac' && (
                  <HvacView 
                    onOpenQrModal={handleOpenQrModal}
                  />
                )}

                {currentTab === 'pccc' && (
                  <PcccView 
                    onOpenQrModal={handleOpenQrModal}
                  />
                )}

                {currentTab === 'infrastructure' && (
                  <InfrastructureView />
                )}

                {currentTab === 'devices' && (
                  <DevicesView 
                    onOpenQrModal={handleOpenQrModal}
                  />
                )}

                {currentTab === 'repairs' && (
                  <RepairRequestsView 
                    onOpenNewTicketModal={() => setIsTicketModalOpen(true)}
                  />
                )}

                {currentTab === 'tasks' && (
                  <TasksView />
                )}

                {currentTab === 'inventory' && (
                  <InventoryView />
                )}

                {currentTab === 'budget' && (
                  <BudgetView />
                )}

                {currentTab === 'reports' && (
                  <ReportsView />
                )}

                {currentTab === 'audit' && (
                  <AuditLogsView />
                )}

                {currentTab === 'accounts' && (
                  <AccountsAndRbacView />
                )}
              </>
            )}
          </div>
        </main>

        {/* Footer Status Bar */}
        <footer className="h-8 bg-slate-100 border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between text-[10px] text-slate-500 shrink-0 uppercase tracking-widest font-mono select-none">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <span>Hệ thống: <span className="text-green-600 font-bold">Online</span></span>
            <span className="hidden sm:inline">Server: <span className="font-bold text-slate-700">Danang Node-1</span></span>
            <span>Phiên bản: <span className="font-bold text-slate-800">v2.4.0 (2026.09)</span></span>
          </div>
          <div className="font-bold text-slate-400">ĐẠI HỌC PHAN CHÂU TRINH © 2026</div>
        </footer>
      </div>

      {/* Modals */}
      <QuickSearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectDevice={handleSelectDeviceFromSearch}
        onSelectBuilding={handleSelectBuildingFromSearch}
        onSelectTicket={handleSelectTicketFromSearch}
      />

      <QuickTicketModal 
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      <QRCodeModal 
        device={qrModalDevice}
        isOpen={!!qrModalDevice}
        onClose={() => setQrModalDevice(null)}
      />

      <AlertDetailModal 
        alert={selectedAlertForDetail}
        isOpen={!!selectedAlertForDetail}
        onClose={closeAlertDetail}
        onNavigateToWork={navigateToAlertTarget}
        onMarkRead={markAlertRead}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
