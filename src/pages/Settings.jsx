import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCRM } from '../context/CRMContext';
import { useUserSettings } from '../hooks/useUserSettings';
import { useActivityLog } from '../hooks/useActivityLog';
import SafeIcon from '../common/SafeIcon';
import HamburgerButton from '../components/HamburgerButton';
import { getTimezoneOptions, formatDisplayDateTime } from '../utils/dateUtils';
import * as FiIcons from 'react-icons/fi';

const { FiDownload, FiUpload, FiTrash2, FiAlertTriangle, FiCheck, FiClock, FiGlobe, FiActivity, FiRefreshCw } = FiIcons;

export default function Settings({ sidebarOpen, onToggleSidebar }) {
  const { state, dispatch } = useCRM();
  const { contacts, interactions } = state;
  const { settings, updateTimezone } = useUserSettings();
  const { activities, loading: activityLoading, loadActivities, clearActivities, logActivity } = useActivityLog();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearActivityConfirm, setShowClearActivityConfirm] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [timezoneSuccess, setTimezoneSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const timezoneOptions = getTimezoneOptions();

  const handleTimezoneChange = async (newTimezone) => {
    try {
      await updateTimezone(newTimezone);
      setTimezoneSuccess(true);
      setTimeout(() => setTimezoneSuccess(false), 3000);
      
      // Refresh the page to update all date displays
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error updating timezone:', error);
    }
  };

  const handleExportData = async () => {
    const data = {
      contacts,
      interactions,
      settings,
      exportDate: new Date().toISOString(),
      timezone: settings.timezone,
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);

    // Log activity
    await logActivity(
      'export',
      'settings',
      `Exported CRM data (${contacts.length} contacts, ${interactions.length} interactions)`,
      { export_count: { contacts: contacts.length, interactions: interactions.length } }
    );
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        let importCount = { contacts: 0, interactions: 0 };

        if (data.contacts && Array.isArray(data.contacts)) {
          dispatch({ type: 'SET_CONTACTS', payload: data.contacts });
          importCount.contacts = data.contacts.length;
        }
        if (data.interactions && Array.isArray(data.interactions)) {
          dispatch({ type: 'SET_INTERACTIONS', payload: data.interactions });
          importCount.interactions = data.interactions.length;
        }

        // Log activity
        await logActivity(
          'import',
          'settings',
          `Imported CRM data (${importCount.contacts} contacts, ${importCount.interactions} interactions)`,
          { import_count: importCount }
        );

        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAllData = async () => {
    const deleteCount = { contacts: contacts.length, interactions: interactions.length };
    
    dispatch({ type: 'SET_CONTACTS', payload: [] });
    dispatch({ type: 'SET_INTERACTIONS', payload: [] });
    setShowDeleteConfirm(false);

    // Log activity
    await logActivity(
      'delete',
      'settings',
      `Deleted all CRM data (${deleteCount.contacts} contacts, ${deleteCount.interactions} interactions)`,
      { delete_count: deleteCount }
    );

    alert('All data has been deleted.');
  };

  const handleClearActivities = async () => {
    await clearActivities();
    setShowClearActivityConfirm(false);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      timeZone: settings.timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const tabs = [
    { id: 'general', name: 'General', icon: FiGlobe },
    { id: 'data', name: 'Data Management', icon: FiDownload },
    { id: 'activity', name: 'Activity Log', icon: FiActivity },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-6xl mx-auto"
    >
      <div className="mb-8 flex items-center">
        {!sidebarOpen && (
          <HamburgerButton onToggle={onToggleSidebar} />
        )}
        <div className={sidebarOpen ? "" : "ml-4"}>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your CRM data and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <SafeIcon icon={FiGlobe} className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Date & Time Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiClock} className="w-4 h-4 inline mr-1" />
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timezoneOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This affects how dates are displayed and stored throughout the application.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Current Time in Your Timezone</h3>
                <p className="text-sm text-blue-800">{getCurrentTime()}</p>
              </div>

              {timezoneSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 text-sm">Timezone updated successfully!</span>
                </motion.div>
              )}

              {/* Statistics */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{contacts.length}</p>
                    <p className="text-sm text-blue-800">Total Contacts</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{interactions.length}</p>
                    <p className="text-sm text-green-800">Total Interactions</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
            <div className="space-y-4">
              {/* Export Data */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Export Data</h3>
                  <p className="text-sm text-gray-600">Download all your contacts and interactions as JSON</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <SafeIcon icon={FiDownload} className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>

              {exportSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 text-sm">Data exported successfully!</span>
                </motion.div>
              )}

              {/* Import Data */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Import Data</h3>
                  <p className="text-sm text-gray-600">Upload a JSON file to restore your data</p>
                </div>
                <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center">
                  <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Delete All Data */}
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-medium text-red-900">Delete All Data</h3>
                  <p className="text-sm text-red-600">Permanently remove all contacts and interactions</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-2" />
                  Delete All
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <SafeIcon icon={FiActivity} className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={loadActivities}
                  disabled={activityLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 mr-2 ${activityLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowClearActivityConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-2" />
                  Clear Log
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Track all changes and activities in your CRM for debugging and history purposes.
            </p>

            <div className="max-h-96 overflow-y-auto">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div
                      key={activity.id || index}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className={`p-2 rounded-full ${
                        activity.action === 'create' ? 'bg-green-100 text-green-600' :
                        activity.action === 'update' ? 'bg-blue-100 text-blue-600' :
                        activity.action === 'delete' ? 'bg-red-100 text-red-600' :
                        activity.action === 'auth' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <SafeIcon icon={FiActivity} className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDisplayDateTime(activity.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            Page: {activity.page}
                          </span>
                          <span className="text-xs text-gray-500">
                            Action: {activity.action}
                          </span>
                          <span className="text-xs text-gray-500">
                            User: {activity.user_email}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <SafeIcon icon={FiActivity} className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No activities logged yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Solo CRM</strong> - Version 1.0</p>
            <p>A simple yet powerful tool to manage your personal and professional relationships.</p>
            <p>All data is stored securely in your Supabase database.</p>
            <p className="pt-2 border-t border-gray-200">
              <strong>Current Timezone:</strong> {settings.timezone}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md mx-4"
          >
            <div className="flex items-center mb-4">
              <SafeIcon icon={FiAlertTriangle} className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all your data? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete All
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Clear Activity Log Confirmation Modal */}
      {showClearActivityConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md mx-4"
          >
            <div className="flex items-center mb-4">
              <SafeIcon icon={FiAlertTriangle} className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Clear Activity Log</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear the activity log? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearActivityConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearActivities}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear Log
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}