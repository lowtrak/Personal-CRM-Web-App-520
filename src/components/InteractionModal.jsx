import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCRM } from '../context/CRMContext'
import SafeIcon from '../common/SafeIcon'
import { formatDateForInput } from '../utils/dateUtils'
import * as FiIcons from 'react-icons/fi'

const { FiX, FiUser, FiCalendar, FiMessageSquare } = FiIcons

const interactionTypes = ['Email', 'Phone', 'Meeting', 'Event', 'Follow-up', 'Other']

export default function InteractionModal() {
  const { state, dispatch, addInteraction, updateInteraction } = useCRM()
  const { isInteractionModalOpen, selectedInteraction, contacts } = state
  
  const [formData, setFormData] = useState({
    contactId: '',
    type: 'Email',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    followUpDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedInteraction) {
      console.log('Loading selected interaction:', selectedInteraction)
      
      // Use formatDateForInput for both date fields
      const interactionDate = selectedInteraction.date ? formatDateForInput(selectedInteraction.date) : new Date().toISOString().split('T')[0]
      const followUpDate = selectedInteraction.followUpDate ? formatDateForInput(selectedInteraction.followUpDate) : ''
      
      console.log('Formatted interaction date:', interactionDate)
      console.log('Formatted follow-up date:', followUpDate)
      
      setFormData({
        contactId: selectedInteraction.contactId || '',
        type: selectedInteraction.type || 'Email',
        date: interactionDate,
        notes: selectedInteraction.notes || '',
        followUpDate: followUpDate
      })
    } else {
      setFormData({
        contactId: '',
        type: 'Email',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        followUpDate: ''
      })
    }
    setError('')
  }, [selectedInteraction, isInteractionModalOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.contactId) {
      setError('Please select a contact')
      setLoading(false)
      return
    }

    if (!formData.notes.trim()) {
      setError('Please add some notes about this interaction')
      setLoading(false)
      return
    }

    // Use the form data directly - dates are already in YYYY-MM-DD format
    const interactionData = {
      contactId: formData.contactId,
      type: formData.type,
      date: formData.date, // Keep as YYYY-MM-DD format
      notes: formData.notes,
      followUpDate: formData.followUpDate || null // Keep as YYYY-MM-DD format or null
    }

    console.log('Submitting interaction data:', interactionData)

    try {
      if (selectedInteraction) {
        console.log('Updating existing interaction')
        await updateInteraction({ 
          ...selectedInteraction, 
          ...interactionData 
        })
      } else {
        console.log('Adding new interaction')
        await addInteraction(interactionData)
      }
      
      dispatch({ type: 'CLOSE_INTERACTION_MODAL' })
    } catch (error) {
      console.error('Error saving interaction:', error)
      setError('Failed to save interaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    dispatch({ type: 'CLOSE_INTERACTION_MODAL' })
    setError('')
  }

  if (!isInteractionModalOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedInteraction ? 'Edit Interaction' : 'Log New Interaction'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-1" />
                Contact *
              </label>
              <select
                required
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                    {contact.company && ` (${contact.company})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiMessageSquare} className="w-4 h-4 inline mr-1" />
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {interactionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => {
                    console.log('Date input changed:', e.target.value)
                    setFormData({ ...formData, date: e.target.value })
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes *
              </label>
              <textarea
                required
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What did you discuss? What were the key outcomes?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiCalendar} className="w-4 h-4 inline mr-1" />
                Follow-up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => {
                  console.log('Follow-up date input changed:', e.target.value)
                  setFormData({ ...formData, followUpDate: e.target.value })
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  selectedInteraction ? 'Update Interaction' : 'Log Interaction'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}