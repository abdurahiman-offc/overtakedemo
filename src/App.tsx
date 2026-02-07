import { useState } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { LeadList } from './features/leads/LeadList';
import { LeadFormModal } from './features/leads/LeadFormModal';
import { LeadsProvider } from './context/LeadsContext';
import { SmartList } from './types';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSmartList, setActiveSmartList] = useState<SmartList | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSmartListSelect = (list: SmartList) => {
    setActiveSmartList(list);
    setActiveTab('smartlist');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'smartlist') setActiveSmartList(null);
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      onAddLead={() => setIsModalOpen(true)}
      onSmartListSelect={handleSmartListSelect}
      activeSmartListId={activeSmartList?.id}
    >
      <div className="animate-fadeIn" key={activeTab + (activeSmartList?.id || '')}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'followups' && <LeadList filterType="followup" />}
        {activeTab === 'smartlist' && activeSmartList && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Smart List: <span className="text-indigo-600">{activeSmartList.name}</span>
              </h2>
            </div>
            <LeadList filterType="smartlist" smartListFilter={activeSmartList.filters} />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="p-16 text-center text-gray-500">
            <h2 className="text-xl font-bold mb-2">Settings</h2>
            <p>Configure your CRM preferences here.</p>
          </div>
        )}
      </div>

      {isModalOpen && <LeadFormModal onClose={() => setIsModalOpen(false)} />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <LeadsProvider>
      <AppContent />
    </LeadsProvider>
  );
}
