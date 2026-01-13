import React from 'react';

const StatusBadge = ({ status, small = false }) => {
  const getStatusConfig = (status) => {
    const config = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: '⏳'
      },
      confirmed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: '✅'
      },
      processing: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: '⚙️'
      },
      packed: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        icon: '📦'
      },
      shipped: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: '🚚'
      },
      delivered: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '📫'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: '❌'
      },
      partially_shipped: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: '🚚'
      },
      partially_delivered: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '📫'
      }
    };

    return config[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: '❓'
    };
  };

  const config = getStatusConfig(status);

  if (small) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        <span className="capitalize">{status.replace('_', ' ')}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <span className="mr-2">{config.icon}</span>
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </span>
  );
};

export default StatusBadge;