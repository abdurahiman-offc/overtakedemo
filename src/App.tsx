import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LeadsProvider } from './context/LeadsContext'
import { NotificationProvider } from './context/NotificationContext'
import { AppLayout } from './layouts/AppLayout'
import { Dashboard } from './features/dashboard/Dashboard'
import { LeadList } from './features/leads/LeadList'
import { PipelineView } from './features/pipeline/PipelineView'
import { FollowupsView } from './features/followups/FollowupsView'
import { WorkingReport } from './features/reports/WorkingReport'
import { UsersView } from './features/users/UsersView'
import { LeadFormModal } from './features/leads/LeadFormModal'
import { AdminLogin } from './features/admin/AdminLogin'
import { LeadPage } from './features/leads/LeadPage'

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isAdmin } = useAuth()

  return (
    <Router>
      <AppLayout
        onAddLead={() => setIsModalOpen(true)}
      >
        <div className="animate-fadeIn h-full">
          <Routes>
            <Route path="/" element={<Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />} />

            {/* Admin Routes */}
            {isAdmin && (
              <>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/contacts" element={<LeadList />} />
                <Route path="/admin/contact/:id" element={<LeadPage />} />
                <Route path="/admin/pipeline" element={<PipelineView />} />
                <Route path="/admin/followups" element={<FollowupsView />} />
                <Route path="/admin/report" element={<WorkingReport />} />
                <Route path="/admin/users" element={<UsersView />} />
              </>
            )}

            {/* Public/Standard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<LeadList />} />
            <Route path="/contact/:id" element={<LeadPage />} />
            <Route path="/pipeline" element={<PipelineView />} />
            <Route path="/followups" element={<FollowupsView />} />
            <Route
              path="/report"
              element={isAdmin ? <Navigate to="/admin/report" replace /> : <Navigate to="/admin-login" replace />}
            />
            <Route
              path="/users"
              element={isAdmin ? <Navigate to="/admin/users" replace /> : <Navigate to="/admin-login" replace />}
            />
            <Route path="/admin-login" element={isAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
            <Route path="*" element={<Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />} />
          </Routes>
        </div>

        {isModalOpen && <LeadFormModal onClose={() => setIsModalOpen(false)} />}
      </AppLayout>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LeadsProvider>
          <AppContent />
        </LeadsProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
