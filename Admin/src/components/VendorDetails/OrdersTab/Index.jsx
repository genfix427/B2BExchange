import React, { useState } from 'react';
import { ShoppingBag, ShoppingCart, BarChart } from 'lucide-react';
import SellOrdersTab from './SellOrdersTab';
import PurchaseOrdersTab from './PurchaseOrdersTab';
import AnalyticsTab from '../AnalyticsTab';

const OrdersTab = ({ vendor }) => {
  const [activeSubTab, setActiveSubTab] = useState('sell');

  const tabs = [
    {
      id: 'sell',
      label: 'Sell Orders',
      icon: ShoppingBag,
      description: 'Orders where vendor is the seller'
    },
    {
      id: 'purchase',
      label: 'Purchase Orders',
      icon: ShoppingCart,
      description: 'Orders where vendor is the buyer'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart,
      description: 'Sales and purchase analytics'
    }
  ];

  return (
    <div>
      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveSubTab(id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                activeSubTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title={description}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-tab Content */}
      <div className="py-4">
        {activeSubTab === 'sell' && <SellOrdersTab vendor={vendor} />}
        {activeSubTab === 'purchase' && <PurchaseOrdersTab vendor={vendor} />}
        {activeSubTab === 'analytics' && <AnalyticsTab vendor={vendor} />}
      </div>
    </div>
  );
};

export default OrdersTab;