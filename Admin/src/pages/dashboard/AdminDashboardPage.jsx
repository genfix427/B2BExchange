import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  BarChart,
  ShoppingCart,
  Truck,
  CheckSquare,
  Calendar,
  Download,
  Eye,
  MoreVertical,
  TrendingDown,
  Activity,
  Percent,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart as ReBarChart,
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
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fetchAdminProductStats, fetchAllProducts, refreshAdminStats } from '../../store/slices/adminProductSlice';
import {
  fetchDashboardStats,
  fetchRecentOrders,
  fetchOrderAnalytics,
  fetchTopVendors,
  exportOrders
} from '../../store/slices/orderSlice';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { stats: productStats, products, loading: productsLoading } = useSelector((state) => state.adminProducts);
  const { 
    dashboardStats, 
    recentOrders, 
    analytics, 
    topVendors,
    exportLoading 
  } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    // Fetch product stats
    dispatch(fetchAdminProductStats());
    dispatch(fetchAllProducts({
      page: 1,
      limit: 10,
      sort: 'createdAt',
      order: 'desc'
    }));

    // Fetch order stats
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentOrders(10));
    dispatch(fetchOrderAnalytics({ groupBy: 'day', dateFrom: format(subDays(new Date(), 30), 'yyyy-MM-dd') }));
    dispatch(fetchTopVendors(5));
  }, [dispatch]);

  const handleRefreshStats = () => {
    dispatch(refreshAdminStats());
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentOrders(10));
  };

  const handleExportOrders = () => {
    dispatch(exportOrders({ type: 'all', filters: {} }));
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      out_of_stock: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.inactive;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Get recent products (last 5 from the fetched products)
  const recentProducts = products.slice(0, 5);

  // Calculate order statistics
  const calculateOrderStats = () => {
    if (!dashboardStats.data) return null;
    
    const { summary, analytics } = dashboardStats.data;
    const lifetime = summary?.lifetime || {};
    const monthly = summary?.monthly || {};
    const daily = summary?.daily || {};
    
    return {
      totalOrders: lifetime.totalOrders || 0,
      totalRevenue: lifetime.totalRevenue || 0,
      avgOrderValue: lifetime.avgOrderValue || 0,
      monthlyOrders: monthly.orders || 0,
      monthlyRevenue: monthly.revenue || 0,
      dailyOrders: daily.orders || 0,
      dailyRevenue: daily.revenue || 0,
      totalVendors: summary?.totalVendors || 0
    };
  };

  const orderStats = calculateOrderStats();

  // Prepare data for charts
  const prepareChartData = () => {
    if (!analytics.data) return { monthlyTrend: [], statusDistribution: [], topVendorsData: [] };
    
    const monthlyTrend = analytics.data.analytics?.monthlyTrend?.map(item => ({
      month: item.month,
      revenue: item.revenue,
      orders: item.orders
    })) || [];
    
    const statusDistribution = dashboardStats.data?.analytics?.statusDistribution?.map(item => ({
      name: item.status,
      value: item.count
    })) || [];
    
    const topVendorsData = dashboardStats.data?.rankings?.topSellingVendors?.slice(0, 5).map(vendor => ({
      name: vendor.vendorName?.length > 15 ? vendor.vendorName.substring(0, 15) + '...' : vendor.vendorName,
      sales: vendor.totalSales,
      orders: vendor.orderCount
    })) || [];
    
    return { monthlyTrend, statusDistribution, topVendorsData };
  };

  const chartData = prepareChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckSquare,
      cancelled: AlertCircle
    };
    return icons[status] || Clock;
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (productsLoading && !productStats.totalProducts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Complete overview of your platform performance</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
            <button
              onClick={handleRefreshStats}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={handleExportOrders}
              disabled={exportLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Products
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(orderStats?.totalOrders || 0)}
                  </p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className={`inline-flex items-center ${orderStats?.monthlyOrders > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {orderStats?.monthlyOrders > 0 ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {orderStats?.monthlyOrders || 0} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(orderStats?.totalRevenue || 0)}
                  </p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className={`inline-flex items-center ${orderStats?.monthlyRevenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {orderStats?.monthlyRevenue > 0 ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {formatPrice(orderStats?.monthlyRevenue || 0)} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{productStats.totalProducts || 0}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span>Active: {productStats.activeProducts || 0}</span>
                </div>
                <div className="text-red-500">
                  Out of stock: {productStats.outOfStockProducts || 0}
                </div>
              </div>
            </div>

            {/* Total Vendors */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{orderStats?.totalVendors || 0}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <Building2 className="w-4 h-4 inline text-blue-500 mr-1" />
                <span>Active suppliers</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="block pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatPrice(value), 'Revenue']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Orders']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Orders & Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Clock className="w-5 h-5 text-gray-500 mr-2" />
                      Recent Orders
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Latest platform orders</p>
                  </div>
                  <Link
                    to="/admin/orders"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                  >
                    View All Orders
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        </td>
                      </tr>
                    ) : recentOrders.data.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center">
                          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Orders will appear here when placed
                          </p>
                        </td>
                      </tr>
                    ) : (
                      recentOrders.data.slice(0, 5).map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        return (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDateTime(order.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {order.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customerEmail}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatPrice(order.total)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {order.status?.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Package className="w-5 h-5 text-gray-500 mr-2" />
                      Recently Added Products
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Latest products from all vendors</p>
                  </div>
                  <Link
                    to="/admin/products"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                  >
                    View All Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock & Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productsLoading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        </td>
                      </tr>
                    ) : recentProducts.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center">
                          <Package className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Products will appear here when vendors add them
                          </p>
                        </td>
                      </tr>
                    ) : (
                      recentProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {product.image?.url ? (
                                <img
                                  src={product.image.url}
                                  alt={product.productName}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.productName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.ndcNumber}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {product.vendorName || 'Unknown'}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium">{product.quantityInStock || 0}</span>
                                <span className="text-gray-500 ml-1">units</span>
                              </div>
                              <div className="text-sm font-medium text-green-600">
                                {formatPrice(product.price || 0)}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                              {product.status === 'active' && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {product.status === 'out_of_stock' && (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {product.status?.replace('_', ' ') || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStats?.dailyOrders || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatPrice(orderStats?.dailyRevenue || 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(orderStats?.avgOrderValue || 0)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +12% from last month
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.data?.analytics?.statusBreakdown?.find(s => s._id === 'pending')?.count || 0}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Requires attention
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStats.totalOrders > 0 ? 
                      ((dashboardStats.data?.analytics?.statusBreakdown?.find(s => s._id === 'delivered')?.count || 0) / orderStats.totalOrders * 100).toFixed(1) + '%' : 
                      '0%'
                    }
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Delivered orders
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Percent className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Order Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Value Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Value Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatPrice(value), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Vendors by Sales */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors by Sales</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={chartData.topVendorsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'sales') return [formatPrice(value), 'Sales'];
                        return [value, 'Orders'];
                      }}
                    />
                    <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Order Status */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Status Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dashboardStats.data?.analytics?.statusBreakdown?.map((status) => (
                  <div key={status._id} className="border rounded-lg p-4">
                    <div className="flex items-center">
                      {status._id === 'delivered' && <CheckSquare className="w-5 h-5 text-green-600 mr-2" />}
                      {status._id === 'shipped' && <Truck className="w-5 h-5 text-orange-600 mr-2" />}
                      {status._id === 'processing' && <Package className="w-5 h-5 text-blue-600 mr-2" />}
                      {status._id === 'pending' && <Clock className="w-5 h-5 text-yellow-600 mr-2" />}
                      {status._id === 'cancelled' && <AlertCircle className="w-5 h-5 text-red-600 mr-2" />}
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">{status._id}</p>
                        <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                        <p className="text-sm text-gray-500">{formatPrice(status.revenue || 0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Growth</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStats.totalOrders > 0 ? 
                      Math.round(orderStats.totalOrders / 30) : 0
                    }/day
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Average daily orders
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendor Performance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStats.totalVendors > 0 ? 
                      Math.round(orderStats.totalOrders / orderStats.totalVendors) : 0
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Avg orders per vendor
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue per Order</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(orderStats.avgOrderValue || 0)}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    +8% from last quarter
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'revenue') return [formatPrice(value), 'Revenue'];
                      return [value, 'Orders'];
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Orders"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Product Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(productStats.totalValue || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total inventory value
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(productStats.avgPrice || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Per product
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.lowStockProducts || 0}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Below threshold
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(productStats.totalStock || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Units available
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Product Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={[
                  { name: 'Active', value: productStats.activeProducts || 0, color: '#10B981' },
                  { name: 'Inactive', value: productStats.inactiveProducts || 0, color: '#6B7280' },
                  { name: 'Out of Stock', value: productStats.outOfStockProducts || 0, color: '#EF4444' },
                  { name: 'Low Stock', value: productStats.lowStockProducts || 0, color: '#F59E0B' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Products']} />
                  <Bar dataKey="value" fill="#8884d8">
                    {[
                      { name: 'Active', value: productStats.activeProducts || 0, color: '#10B981' },
                      { name: 'Inactive', value: productStats.inactiveProducts || 0, color: '#6B7280' },
                      { name: 'Out of Stock', value: productStats.outOfStockProducts || 0, color: '#EF4444' },
                      { name: 'Low Stock', value: productStats.lowStockProducts || 0, color: '#F59E0B' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/admin/orders"
              className="flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Manage Orders</span>
              <ShoppingCart className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Manage Products</span>
              <Package className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/admin/vendors"
              className="flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Manage Vendors</span>
              <Users className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/admin/reports"
              className="flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">View Reports</span>
              <BarChart className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Insights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              {/* <p className="text-sm text-gray-600">Monthly Growth</p>
              <p className="text-2xl font-bold text-gray-900">
                {orderStats.monthlyOrders > 0 ? 
                  Math.round((orderStats.monthlyOrders / 30) * 100) / 100 + '/day' : 
                  '0/day'
                }
              </p> */}
              <p className="text-xs text-gray-500">Average daily orders this month</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              {/* <p className="text-sm text-gray-600">Vendor Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {orderStats.totalVendors > 0 ? 
                  Math.round((dashboardStats.data?.rankings?.topSellingVendors?.length || 0) / orderStats.totalVendors * 100) + '%' : 
                  '0%'
                }
              </p> */}
              <p className="text-xs text-gray-500">Active selling vendors</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              {/* <p className="text-sm text-gray-600">Order Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {orderStats.totalOrders > 0 ? 
                  Math.round((dashboardStats.data?.analytics?.statusBreakdown?.find(s => s._id === 'delivered')?.count || 0) / orderStats.totalOrders * 100) + '%' : 
                  '0%'
                }
              </p> */}
              <p className="text-xs text-gray-500">Successful deliveries</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">4.2h</p>
              <p className="text-xs text-gray-500">Order processing time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;