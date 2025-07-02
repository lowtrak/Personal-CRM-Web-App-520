import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Interactions from './pages/Interactions';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ContactModal from './components/ContactModal';
import InteractionModal from './components/InteractionModal';
import { CRMProvider } from './context/CRMContext';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CRMProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/interactions" element={<Interactions />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </AnimatePresence>
            </div>
          </main>
          
          <ContactModal />
          <InteractionModal />
        </div>
      </Router>
    </CRMProvider>
  );
}

export default App;