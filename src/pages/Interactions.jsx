import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useCRM } from '../context/CRMContext'
import SafeIcon from '../common/SafeIcon'
import HamburgerButton from '../components/HamburgerButton'
import { formatDisplayDate } from '../utils/dateUtils'
import * as FiIcons from 'react-icons/fi'

const { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiCalendar, FiMessageSquare, FiUsers } = FiIcons

const interactionTypeColors = {
  'Email': 'blue',
  'Phone': 'green',
  'Meeting': 'purple',
  'Event': 'orange',
  'Follow-up': 'red',
  'Other': 'gray'
}

export default function Interactions({ sidebarOpen, onToggleSidebar }) {
  const { state, dispatch, deleteInteraction } = useCRM()
  const { interactions, contacts, searchQuery, loading } = state
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState('date')

  const filteredAndSortedInteractions = useMemo(() => {
    let filtered = interactions.filter(interaction => {
      const contact = contacts.find(c => c.id === interaction.contactId)
      const contactName = contact ? `${contact.firstName} ${contact.lastName}` : ''
      
      const searchMatch = searchQuery === '' || 
        `${contactName} ${interaction.type} ${interaction.notes}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      
      const typeMatch = filterType === '' || interaction.type === filterType
      
      return searchMatch && typeMatch
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'contact':
          const contactA = contacts.find(c => c.id === a.contactId)
          const contactB = contacts.find(c => c.id === b.contactId)
          const nameA = contactA ? `${contactA.firstName} ${contactA.lastName}` : ''
          const nameB = contactB ? `${contactB.firstName} ${contactB.lastName}` : ''
          return nameA.localeCompare(nameB)
        default:
          return 0
      }
    })
  }, [interactions, contacts, searchQuery, filterType, sortBy])

  const interactionTypes = Object.keys(interactionTypeColors)

  const handleDeleteInteraction = async (interactionId) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      await deleteInteraction(interactionId)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          {!sidebarOpen && (
            <HamburgerButton onToggle={onToggleSidebar} />
          )}
          <div className={sidebarOpen ? "" : "ml-4"}>
            <h1 className="text-3xl font-bold text-gray-900">Interactions</h1>
            <p className="text-gray-600 mt-2">{interactions.length} interactions logged</p>
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'OPEN_INTERACTION_MODAL' })}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          Log Interaction
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2 relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search interactions..."
              value={searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {interactionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="type">Sort by Type</option>
              <option value="contact">Sort by Contact</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactions List */}
      <div className="space-y-4">
        {filteredAndSortedInteractions.map((interaction, index) => {
          const contact = contacts.find(c => c.id === interaction.contactId)
          const colorClass = interactionTypeColors[interaction.type] || 'gray'

          return (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg bg-${colorClass}-50`}>
                    <SafeIcon icon={FiMessageSquare} className={`w-5 h-5 text-${colorClass}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 bg-${colorClass}-100 text-${colorClass}-800 text-xs rounded-full font-medium`}>
                        {interaction.type}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                        {formatDisplayDate(interaction.date)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact'}
                    </h3>
                    {interaction.notes && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {interaction.notes}
                      </p>
                    )}
                    {interaction.followUpDate && (
                      <div className="mt-3 flex items-center text-sm text-orange-600">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                        Follow-up: {formatDisplayDate(interaction.followUpDate)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1 ml-4">
                  <button
                    onClick={() => dispatch({ type: 'OPEN_INTERACTION_MODAL', payload: interaction })}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteInteraction(interaction.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredAndSortedInteractions.length === 0 && !loading && (
        <div className="text-center py-12">
          <SafeIcon icon={FiMessageSquare} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterType ? "Try adjusting your search or filters" : "Start logging your interactions to track your relationships"}
          </p>
          {!searchQuery && !filterType && (
            <button
              onClick={() => dispatch({ type: 'OPEN_INTERACTION_MODAL' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Log Your First Interaction
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}