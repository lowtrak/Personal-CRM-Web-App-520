import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiHome, FiUsers, FiMessageSquare, FiBarChart3, FiSettings, FiMenu, FiX, FiLogOut } = FiIcons

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Contacts', href: '/contacts', icon: FiUsers },
  { name: 'Interactions', href: '/interactions', icon: FiMessageSquare },
  { name: 'Analytics', href: '/analytics', icon: FiBarChart3 },
  { name: 'Settings', href: '/settings', icon: FiSettings },
]

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    onToggle() // Close sidebar on mobile after sign out
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200"
        >
          <SafeIcon icon={isOpen ? FiX : FiMenu} className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
          opacity: isOpen ? 1 : 0
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
        className={`
          fixed lg:relative lg:translate-x-0 lg:opacity-100
          w-64 h-full bg-white border-r border-gray-200 z-40
          flex flex-col shadow-xl lg:shadow-none
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Solo CRM</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your relationships</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => onToggle()}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <SafeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-600">Personal Account</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiLogOut} className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  )
}