import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorOrderStats } from '../../store/slices/orderSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const AnalyticsTab = ({ vendor }) => {
  const dispatch = useDispatch();
  const { vendorStats } = useSelector((state) => state.orders);

  const [period, setPeriod] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const periodOptions = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    if (vendor?._id) {
      loadAnalyticsData();
    }
  }, [dispatch, vendor?._id, period]);

  const loadAnalyticsData = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchVendorOrderStats({ vendorId: vendor._id, period }));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Get analytics data with fallbacks
  const getAnalyticsData = () => {
    if (!vendorStats.data) {
      return {
        sell: {
          summary: { totalOrders: 0, totalRevenue: 0, totalItemsSold: 0, avgOrderValue: 0 },
          statusBreakdown: [],
          monthlyTrend: [],
          topProducts: [],
          topCustomers: []
        },
        purchase: {
          summary: { totalOrders: 0, totalSpent: 0, avgOrderValue: 0, maxOrderValue: 0, minOrderValue: 0 },
          statusBreakdown: []
        }
      };
    }
    return vendorStats.data;
  };

  const analyticsData = getAnalyticsData();
  const { sell, purchase } = analyticsData;

  // Prepare data for charts
  const prepareChartData = () => {
    // Sell status data
    const sellStatusData = sell.statusBreakdown?.map(item => ({
      name: item._id || 'unknown',
      value: item.count || 0,
      revenue: item.revenue || 0
    })) || [];

    // Purchase status data
    const purchaseStatusData = purchase.statusBreakdown?.map(item => ({
      name: item._id || 'unknown',
      value: item.count || 0,
      amount: item.amount || 0
    })) || [];

    // Monthly trend data
    const monthlyTrendData = sell.monthlyTrend?.map(item => ({
      month: `${item._id?.year || '2024'}-${(item._id?.month || 1).toString().padStart(2, '0')}`,
      revenue: item.revenue || 0,
      orders: item.orders || 0,
      items: item.items || 0
    })) || [];

    // Top products data
    const topProductsData = sell.topProducts?.slice(0, 5).map(product => ({
      name: product.productName?.length > 20
        ? product.productName.substring(0, 20) + '...'
        : product.productName || 'Unknown Product',
      sold: product.totalSold || 0,
      revenue: product.totalRevenue || 0
    })) || [];

    // Top customers data
    const topCustomersData = sell.topCustomers?.slice(0, 5).map(customer => ({
      name: customer.customerName?.length > 15
        ? customer.customerName.substring(0, 15) + '...'
        : customer.customerName || 'Unknown Customer',
      purchases: customer.totalPurchases || 0,
      orders: customer.orderCount || 0
    })) || [];

    return {
      sellStatusData,
      purchaseStatusData,
      monthlyTrendData,
      topProductsData,
      topCustomersData
    };
  };

  const chartData = prepareChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const isLoading = vendorStats.loading || isRefreshing;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500">
            Performance analytics for {vendor.pharmacyInfo?.legalBusinessName || vendor.pharmacyInfo?.dba || 'this vendor'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadAnalyticsData}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading analytics...</span>
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sell Stats */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sell Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(sell.summary?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {sell.summary?.totalOrders || 0} orders • {sell.summary?.totalItemsSold || 0} items
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Purchase Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(purchase.summary?.totalSpent || 0)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {purchase.summary?.totalOrders || 0} orders
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(sell.summary?.avgOrderValue || 0)}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Sell orders
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sell.topCustomers?.length || 0}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Unique buyers
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Trend */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
              <div className="h-64">
                {chartData.monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-');
                          return `${month}/${year.slice(2)}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                          if (name === 'orders') return [value, 'Orders'];
                          return [value, 'Items'];
                        }}
                        labelFormatter={(label) => `Period: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Revenue"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Orders"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
                    <p>No trend data available</p>
                    <p className="text-sm">Revenue and order data will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sell Orders Status Distribution */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Sell Orders Status</h3>
              <div className="h-64">
                {chartData.sellStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.sellStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          if (percent < 0.05) return '';
                          return `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {chartData.sellStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                          return [value, 'Orders'];
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <Pie className="w-12 h-12 mb-2 opacity-50" />
                    <p>No status data available</p>
                    <p className="text-sm">Order status distribution will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Selling Products</h3>
              <div className="h-64">
                {chartData.topProductsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.topProductsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                          return [value, 'Units Sold'];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="sold" fill="#8884d8" name="Units Sold" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <Package className="w-12 h-12 mb-2 opacity-50" />
                    <p>No product data available</p>
                    <p className="text-sm">Top products will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Orders Status */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Purchase Orders Status</h3>
              <div className="h-64">
                {chartData.purchaseStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.purchaseStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'amount') return [formatCurrency(value), 'Amount'];
                          return [value, 'Orders'];
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#ffc658"
                        name="Orders"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                    <p>No purchase data available</p>
                    <p className="text-sm">Purchase order status will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <div className="bg-white rounded-lg border">
              <div className="px-4 py-3 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Top Customers</h3>
                <span className="text-xs text-gray-500">
                  {sell.topCustomers?.length || 0} active customers
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sell.topCustomers && sell.topCustomers.length > 0 ? (
                      sell.topCustomers.slice(0, 5).map((customer, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.customerName || 'Unknown Customer'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {customer.customerEmail || 'No email'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.orderCount || 0}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(customer.totalPurchases || 0)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {customer.lastOrder ?
                                format(new Date(customer.lastOrder), 'MMM d, yyyy') :
                                'Never'
                              }
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No customer data available</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg border">
              <div className="px-4 py-3 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Top Products</h3>
                <span className="text-xs text-gray-500">
                  {sell.topProducts?.length || 0} products tracked
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sold
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sell.topProducts && sell.topProducts.length > 0 ? (
                      sell.topProducts.slice(0, 5).map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName || 'Unknown Product'}
                            </div>
                            <div className="text-xs text-gray-500">
                              SKU: {product.productSku || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatNumber(product.totalSold || 0)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(product.totalRevenue || 0)}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(product.avgPrice || 0)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No product data available</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">Best Selling Category</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-blue-900">
                  {sell.topProducts?.[0]?.productCategory || 'N/A'}
                </p>
                <p className="text-xs text-blue-700">
                  Top product: {sell.topProducts?.[0]?.productName?.substring(0, 30) || 'None'}
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">Average Order Value</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-green-900">
                  {formatCurrency(sell.summary?.avgOrderValue || 0)}
                </p>
                <p className="text-xs text-green-700">
                  Based on {sell.summary?.totalOrders || 0} sell orders
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-900">Order Frequency</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-purple-900">
                  {sell.summary?.totalOrders > 0 ?
                    `${Math.round((sell.summary?.totalOrders || 0) / 30)} per day` :
                    'No orders'
                  }
                </p>
                <p className="text-xs text-purple-700">
                  {period}ly average
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Error State */}
      {vendorStats.error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading analytics
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{vendorStats.error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadAnalyticsData}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;