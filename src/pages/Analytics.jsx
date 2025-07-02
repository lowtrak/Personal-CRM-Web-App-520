import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCRM } from '../context/CRMContext';
import SafeIcon from '../common/SafeIcon';
import HamburgerButton from '../components/HamburgerButton';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiUsers, FiMessageSquare, FiCalendar } = FiIcons;

export default function Analytics({ sidebarOpen, onToggleSidebar }) {
  const { state } = useCRM();
  const { contacts, interactions } = state;

  const analytics = useMemo(() => {
    // Interaction types distribution
    const interactionTypes = {};
    interactions.forEach(interaction => {
      interactionTypes[interaction.type] = (interactionTypes[interaction.type] || 0) + 1;
    });

    // Monthly interactions
    const monthlyData = {};
    interactions.forEach(interaction => {
      const month = new Date(interaction.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    // Contact companies
    const companies = {};
    contacts.forEach(contact => {
      if (contact.company) {
        companies[contact.company] = (companies[contact.company] || 0) + 1;
      }
    });

    // Top contacts by interaction count
    const contactInteractions = {};
    interactions.forEach(interaction => {
      contactInteractions[interaction.contactId] = (contactInteractions[interaction.contactId] || 0) + 1;
    });

    const topContacts = Object.entries(contactInteractions)
      .map(([contactId, count]) => {
        const contact = contacts.find(c => c.id === contactId);
        return {
          contact,
          count,
          name: contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown'
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      interactionTypes,
      monthlyData,
      companies,
      topContacts
    };
  }, [contacts, interactions]);

  // Chart options
  const interactionTypeOptions = {
    title: {
      text: 'Interaction Types',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: 'Interactions',
      type: 'pie',
      radius: '70%',
      data: Object.entries(analytics.interactionTypes).map(([type, count]) => ({
        value: count,
        name: type
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }]
  };

  const monthlyInteractionsOptions = {
    title: {
      text: 'Monthly Interactions',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: Object.keys(analytics.monthlyData)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: Object.values(analytics.monthlyData),
      type: 'line',
      smooth: true,
      areaStyle: {}
    }]
  };

  const companiesOptions = {
    title: {
      text: 'Contacts by Company',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: Object.keys(analytics.companies).slice(0, 10)
    },
    series: [{
      data: Object.values(analytics.companies).slice(0, 10),
      type: 'bar'
    }]
  };

  const stats = [
    { name: 'Total Contacts', value: contacts.length, icon: FiUsers, color: 'blue' },
    { name: 'Total Interactions', value: interactions.length, icon: FiMessageSquare, color: 'green' },
    {
      name: 'This Month',
      value: interactions.filter(i => {
        const date = new Date(i.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      icon: FiCalendar,
      color: 'purple'
    },
    {
      name: 'Avg. per Contact',
      value: contacts.length > 0 ? (interactions.length / contacts.length).toFixed(1) : '0',
      icon: FiTrendingUp,
      color: 'orange'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="mb-8 flex items-center">
        {!sidebarOpen && (
          <HamburgerButton onToggle={onToggleSidebar} />
        )}
        <div className={sidebarOpen ? "" : "ml-4"}>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Insights into your networking activities</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                <SafeIcon icon={stat.icon} className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          {Object.keys(analytics.interactionTypes).length > 0 ? (
            <ReactECharts option={interactionTypeOptions} style={{ height: '300px' }} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No interaction data available
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          {Object.keys(analytics.monthlyData).length > 0 ? (
            <ReactECharts option={monthlyInteractionsOptions} style={{ height: '300px' }} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No monthly data available
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Active Contacts</h2>
          <div className="space-y-3">
            {analytics.topContacts.length > 0 ? (
              analytics.topContacts.map((item, index) => (
                <div key={item.contact?.id || index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {item.contact ? `${item.contact.firstName[0]}${item.contact.lastName[0]}` : '?'}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.count} interactions</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No interaction data available</p>
            )}
          </div>
        </motion.div>

        {/* Companies Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          {Object.keys(analytics.companies).length > 0 ? (
            <ReactECharts option={companiesOptions} style={{ height: '300px' }} />
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Companies</h2>
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No company data available
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}