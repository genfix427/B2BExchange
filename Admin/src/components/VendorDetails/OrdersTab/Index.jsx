// components/VendorDetails/OrdersTab/Index.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchVendorSellOrders, 
  fetchVendorPurchaseOrders,
  fetchVendorOrderStats 
} from '../../../store/slices/orderSlice';
import SellOrdersTab from './SellOrdersTab';
import PurchaseOrdersTab from './PurchaseOrdersTab';
import AnalyticsTab from '../AnalyticsTab';
import {
  ShoppingBag,
  ShoppingCart,
  BarChart
} from 'lucide-react';

const Index = ({ vendor }) => {
  const dispatch = useDispatch();
  const { 
    vendorSellOrders, 
    vendorPurchaseOrders,
    vendorStats 
  } = useSelector((state) => state.orders);
  
  const [activeSubTab, setActiveSubTab] = useState('sell');

  useEffect(() => {
    if (vendor?._id) {
      // Load initial data
      dispatch(fetchVendorOrderStats({ vendorId: vendor._id, period: 'month' }));
      dispatch(fetchVendorSellOrders({ 
        vendorId: vendor._id, 
        params: { page: 1, limit: 10 } 
      }));
      dispatch(fetchVendorPurchaseOrders({ 
        vendorId: vendor._id, 
        params: { page: 1, limit: 10 } 
      }));
    }
  }, [dispatch, vendor?._id]);

  // Calculate totals for badges
  const sellCount = vendorSellOrders?.total || 0;
  const purchaseCount = vendorPurchaseOrders?.total || 0;
  const totalCount = sellCount + purchaseCount;

  const tabs = [
    {
      id: 'sell',
      label: 'Sell Orders',
      icon: ShoppingBag,
      description: 'Orders where vendor is the seller',
      badge: sellCount
    },
    {
      id: 'purchase',
      label: 'Purchase Orders',
      icon: ShoppingCart,
      description: 'Orders where vendor is the buyer',
      badge: purchaseCount
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart,
      description: 'Sales and purchase analytics',
      badge: totalCount > 0 ? totalCount : null
    }
  ];

  return (
    <div>
      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ id, label, icon: Icon, description, badge }) => (
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
              {badge && badge > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
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

export default Index;