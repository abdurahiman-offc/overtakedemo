import { useState, useEffect } from 'react'
import { LeadsProvider } from './context/LeadsContext'
import { AppLayout } from './layouts/AppLayout'
import { Dashboard } from './features/dashboard/Dashboard'
import { LeadList } from './features/leads/LeadList'
import { PipelineView } from './features/pipeline/PipelineView'
import { FollowupsView } from './features/followups/FollowupsView'
import { WorkingReport } from './features/reports/WorkingReport'
import { UsersView } from './features/users/UsersView'
import { LeadFormModal } from './features/leads/LeadFormModal'

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const handleSwitchTab = (e: CustomEvent<string>) => {
      setActiveTab(e.detail);
    };

    window.addEventListener('switchTab', handleSwitchTab as EventListener);
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab as EventListener);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      onAddLead={() => setIsModalOpen(true)}
    >
      <div className="animate-fadeIn" key={activeTab}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'contacts' && <LeadList />}
        {activeTab === 'pipeline' && <PipelineView />}
        {activeTab === 'followups' && <FollowupsView />}
        {activeTab === 'report' && <WorkingReport />}
        {activeTab === 'users' && <UsersView />}
      </div>

      {isModalOpen && <LeadFormModal onClose={() => setIsModalOpen(false)} />}
    </AppLayout>
  )
}

function App() {
  return (
    <LeadsProvider>
      <AppContent />
    </LeadsProvider>
  )
}

export default App
