import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Clock,
  Calendar,
  User,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Globe,
  FileText,
  Shield,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';

const HistoryTab = ({ vendor }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock history data - in real app, fetch from API
  const historyItems = [
    {
      id: 1,
      type: 'status_change',
      action: 'Vendor Approved',
      description: 'Vendor account was approved by Admin',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 2,
      type: 'profile_update',
      action: 'Profile Updated',
      description: 'Business information was updated',
      user: 'Vendor User',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      icon: Edit,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 3,
      type: 'document_upload',
      action: 'License Uploaded',
      description: 'DEA License uploaded and verified',
      user: 'Vendor User',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 4,
      type: 'order_placed',
      action: 'Order Placed',
      description: 'New purchase order #ORD-12345 placed',
      user: 'Vendor User',
      timestamp: new Date(Date.now() - 345600000), // 4 days ago
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 5,
      type: 'product_added',
      action: 'Product Added',
      description: 'New product "Medication XYZ 500mg" added to catalog',
      user: 'Vendor User',
      timestamp: new Date(Date.now() - 432000000), // 5 days ago
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      id: 6,
      type: 'communication',
      action: 'Support Ticket',
      description: 'Support ticket opened regarding payment',
      user: 'Vendor User',
      timestamp: new Date(Date.now() - 518400000), // 6 days ago
      icon: Mail,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      id: 7,
      type: 'status_change',
      action: 'Account Verified',
      description: 'Account verification completed',
      user: 'System',
      timestamp: new Date(Date.now() - 604800000), // 7 days ago
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 8,
      type: 'document_upload',
      action: 'Insurance Uploaded',
      description: 'Professional liability insurance uploaded',
      user: 'Vendor User',
      timestamp: new Date(Date.now() - 691200000), // 8 days ago
      icon: FileText,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    }
  ];

  const filters = [
    { id: 'all', label: 'All Activities' },
    { id: 'status_change', label: 'Status Changes' },
    { id: 'profile_update', label: 'Profile Updates' },
    { id: 'document_upload', label: 'Documents' },
    { id: 'order_placed', label: 'Orders' },
    { id: 'product_added', label: 'Products' },
    { id: 'communication', label: 'Communications' }
  ];

  const filteredItems = historyItems.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.action.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.user.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} months ago`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'status_change': return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' };
      case 'profile_update': return { icon: Edit, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'document_upload': return { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'order_placed': return { icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'product_added': return { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' };
      case 'communication': return { icon: Mail, color: 'text-pink-600', bg: 'bg-pink-100' };
      default: return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Activity History</h2>
        <p className="text-sm text-gray-500">Track all activities and changes for this vendor</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                filter === filterItem.id
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {filterItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-xl font-bold text-gray-900">{historyItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Status Changes</p>
              <p className="text-xl font-bold text-gray-900">
                {historyItems.filter(i => i.type === 'status_change').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-xl font-bold text-gray-900">
                {historyItems.filter(i => i.type === 'document_upload').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Orders</p>
              <p className="text-xl font-bold text-gray-900">
                {historyItems.filter(i => i.type === 'order_placed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No activities found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item, index) => {
              const { icon: Icon, color, bg } = getTypeIcon(item.type);
              
              return (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.action}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {item.description}
                          </p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <User className="w-3 h-3 mr-1" />
                            <span className="mr-3">By: {item.user}</span>
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{format(item.timestamp, 'MMM d, yyyy h:mm a')}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTimeAgo(item.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show More Button */}
        {filteredItems.length > 0 && (
          <div className="px-6 py-4 border-t">
            <button className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Load More Activities
            </button>
          </div>
        )}
      </div>

      {/* Timeline Legend */}
      <div className="mt-6 bg-white rounded-lg border p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Activity Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center">
            <div className="p-1 bg-green-100 rounded mr-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-gray-600">Status Changes</span>
          </div>
          <div className="flex items-center">
            <div className="p-1 bg-blue-100 rounded mr-2">
              <Edit className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-600">Profile Updates</span>
          </div>
          <div className="flex items-center">
            <div className="p-1 bg-purple-100 rounded mr-2">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs text-gray-600">Documents</span>
          </div>
          <div className="flex items-center">
            <div className="p-1 bg-orange-100 rounded mr-2">
              <ShoppingCart className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs text-gray-600">Orders</span>
          </div>
          <div className="flex items-center">
            <div className="p-1 bg-indigo-100 rounded mr-2">
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-xs text-gray-600">Products</span>
          </div>
          <div className="flex items-center">
            <div className="p-1 bg-pink-100 rounded mr-2">
              <Mail className="w-4 h-4 text-pink-600" />
            </div>
            <span className="text-xs text-gray-600">Communications</span>
          </div>
          <div className="flex items-center">
            <div className="p-1 bg-teal-100 rounded mr-2">
              <Shield className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-xs text-gray-600">Verifications</span>
          </div>
          <div className="flex items-center">
            <div className="p-1 bg-gray-100 rounded mr-2">
              <Clock className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600">Other Activities</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;