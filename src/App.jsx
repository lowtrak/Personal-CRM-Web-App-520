import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { useSidebar } from './hooks/useSidebar'
import { useActivityLog } from './hooks/useActivityLog'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Interactions from './pages/Interactions'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import ContactModal from './components/ContactModal'
import InteractionModal from './components/InteractionModal'
import AuthModal from './components/AuthModal'
import { CRMProvider } from './context/CRMContext'
import { initializeTables } from './lib/supabase'
import './App.css'

function AppContent() {
  const [authModalOpen, setAuthModalOpen] = React.useState(false)
  const { user, loading } = useAuth()
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar()
  const { logActivity } = useActivityLog()

  // Initialize database tables when app starts
  React.useEffect(() => {
    initializeTables()
  }, [])

  // Log app initialization
  React.useEffect(() => {
    if (user) {
      logActivity('system', 'app', 'Application initialized and user authenticated')
    }
  }, [user, logActivity])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Solo CRM</h1>
            <p className="text-gray-600">Manage your relationships with ease</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    )
  }

  // Main authenticated app
  return (
    <CRMProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Dashboard sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />} />
                  <Route path="/contacts" element={<Contacts sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />} />
                  <Route path="/interactions" element={<Interactions sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />} />
                  <Route path="/analytics" element={<Analytics sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />} />
                  <Route path="/settings" element={<Settings sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />} />
                </Routes>
              </AnimatePresence>
            </div>
          </main>
          <ContactModal />
          <InteractionModal />
        </div>
      </Router>
    </CRMProvider>
  )
}

function App() {
  return <AppContent />
}

export default App