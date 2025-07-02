import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useCRM } from '../context/CRMContext'
import SafeIcon from '../common/SafeIcon'
import HamburgerButton from '../components/HamburgerButton'
import { formatDisplayDate } from '../utils/dateUtils'
import * as FiIcons from 'react-icons/fi'

const { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiMail, FiPhone, FiBuilding, FiUsers } = FiIcons

export default function Contacts({ sidebarOpen, onToggleSidebar }) {
  const { state, dispatch, deleteContact } = useCRM()
  const { contacts, searchQuery, filterTag, sortBy, loading } = state
  const [showFilters, setShowFilters] = useState(false)

  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const searchMatch = searchQuery === '' || 
        `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.company}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      
      const tagMatch = filterTag === '' || contact.tags?.includes(filterTag)
      
      return searchMatch && tagMatch
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'company':
          return (a.company || '').localeCompare(b.company || '')
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return 0
      }
    })
  }, [contacts, searchQuery, filterTag, sortBy])

  const allTags = useMemo(() => {
    const tags = new Set()
    contacts.forEach(contact => {
      contact.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }, [contacts])

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(contactId)
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
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-2">{contacts.length} contacts in your network</p>
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'OPEN_CONTACT_MODAL' })}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <SafeIcon icon={FiFilter} className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
                <select
                  value={filterTag}
                  onChange={(e) => dispatch({ type: 'SET_FILTER_TAG', payload: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => dispatch({ type: 'SET_SORT_BY', payload: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="company">Company</option>
                  <option value="date">Date Added</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedContacts.map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {contact.firstName[0]}{contact.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  {contact.company && (
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <SafeIcon icon={FiBuilding} className="w-3 h-3 mr-1" />
                      {contact.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => dispatch({ type: 'OPEN_CONTACT_MODAL', payload: contact })}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {contact.email && (
                <p className="text-sm text-gray-600 flex items-center">
                  <SafeIcon icon={FiMail} className="w-4 h-4 mr-2" />
                  {contact.email}
                </p>
              )}
              {contact.phone && (
                <p className="text-sm text-gray-600 flex items-center">
                  <SafeIcon icon={FiPhone} className="w-4 h-4 mr-2" />
                  {contact.phone}
                </p>
              )}
            </div>

            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {contact.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-500">
              Added {formatDisplayDate(contact.createdAt)}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAndSortedContacts.length === 0 && !loading && (
        <div className="text-center py-12">
          <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterTag ? "Try adjusting your search or filters" : "Get started by adding your first contact"}
          </p>
          {!searchQuery && !filterTag && (
            <button
              onClick={() => dispatch({ type: 'OPEN_CONTACT_MODAL' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Your First Contact
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}