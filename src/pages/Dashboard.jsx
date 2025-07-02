import React from 'react';
import { motion } from 'framer-motion';
import { useCRM } from '../context/CRMContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiMessageSquare, FiTrendingUp, FiCalendar, FiPlus } = FiIcons;

export default function Dashboard() {
  const { state, dispatch } = useCRM();
  const { contacts, interactions } = state;

  const recentContacts = contacts.slice(-5).reverse();
  const recentInteractions = interactions.slice(-5).reverse();

  const stats = [
    {
      name: 'Total Contacts',
      value: contacts.length,
      icon: FiUsers,
      color: 'blue',
      change: '+12%'
    },
    {
      name: 'Interactions',
      value: interactions.length,
      icon: FiMessageSquare,
      color: 'green',
      change: '+8%'
    },
    {
      name: 'This Month',
      value: interactions.filter(i => {
        const date = new Date(i.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      icon: FiTrendingUp,
      color: 'purple',
      change: '+15%'
    },
    {
      name: 'Follow-ups Due',
      value: contacts.filter(c => c.followUpDate && new Date(c.followUpDate) <= new Date()).length,
      icon: FiCalendar,
      color: 'orange',
      change: '3 pending'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your network.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 text-${stat.color}-600`}>{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                <SafeIcon icon={stat.icon} className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => dispatch({ type: 'OPEN_CONTACT_MODAL' })}
              className="w-full flex items-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-700 font-medium">Add New Contact</span>
            </button>
            <button
              onClick={() => dispatch({ type: 'OPEN_INTERACTION_MODAL' })}
              className="w-full flex items-center px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-700 font-medium">Log Interaction</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Contacts</h2>
          <div className="space-y-3">
            {recentContacts.length > 0 ? (
              recentContacts.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{contact.company}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No contacts yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Interactions</h2>
        <div className="space-y-4">
          {recentInteractions.length > 0 ? (
            recentInteractions.map((interaction) => {
              const contact = contacts.find(c => c.id === interaction.contactId);
              return (
                <div key={interaction.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiMessageSquare} className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {interaction.type} with {contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{interaction.notes}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(interaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-sm">No interactions yet</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}