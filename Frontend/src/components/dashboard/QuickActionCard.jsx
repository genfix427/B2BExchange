import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ title, description, icon: Icon, color, to }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    indigo: 'bg-indigo-600'
  };

  return (
    <Link
      to={to}
      className="block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4"
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-2 rounded-md ${colorClasses[color]}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default QuickActionCard;