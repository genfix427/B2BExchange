import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  ShoppingCart,
  Package,
  BarChart,
  Activity,
  Target,
  Percent,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck
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
  Area,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import {
  fetchDashboardStats,
  fetchOrderAnalytics,
  fetchTopVendors,
  exportOrders
} from '../../store/slices/orderSlice';
import { fetchVendorStats } from '../../store/slices/vendorSlice';

const AdminAnalyticsPage = () => {
  const dispatch = useDispatch();
  const { 
    dashboardStats, 
    analytics, 
    topVendors,
    exportLoading 
  } = useSelector((state) => state.orders);
  const { vendorStats } = useSelector((state) => state.vendors);

  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [period, dateRange]);

  const loadAnalyticsData = async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchOrderAnalytics({ 
          groupBy: period === 'year' ? 'month' : 'day',
          dateFrom: dateRange.start,
          dateTo: dateRange.end
        })),
        dispatch(fetchTopVendors(10)),
        dispatch(fetchVendorStats())
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshStats = () => {
    loadAnalyticsData();
  };

  const handleExportAnalytics = () => {
    dispatch(exportOrders({ 
      type: 'analytics', 
      filters: {
        dateFrom: dateRange.start,
        dateTo: dateRange.end,
        period
      }
    }));
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Calculate analytics statistics
  const calculateAnalyticsStats = () => {
    if (!dashboardStats.data) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalVendors: 0,
        activeVendors: 0,
        vendorGrowth: 0,
        revenueGrowth: 0,
        orderGrowth: 0
      };
    }
    
    const { summary, rankings } = dashboardStats.data;
    const lifetime = summary?.lifetime || {};
    const monthly = summary?.monthly || {};
    
    // Calculate growth (mock data - in real app, fetch comparison data)
    const vendorGrowth = 12.5; // percentage
    const revenueGrowth = 8.3; // percentage
    const orderGrowth = 15.2; // percentage
    
    return {
      totalRevenue: lifetime.totalRevenue || 0,
      totalOrders: lifetime.totalOrders || 0,
      avgOrderValue: lifetime.avgOrderValue || 0,
      totalVendors: summary?.totalVendors || 0,
      activeVendors: summary?.activeVendors || 0,
      monthlyRevenue: monthly.revenue || 0,
      monthlyOrders: monthly.orders || 0,
      vendorGrowth,
      revenueGrowth,
      orderGrowth
    };
  };

  const analyticsStats = calculateAnalyticsStats();

  // Prepare data for charts
  const prepareChartData = () => {
    if (!dashboardStats.data || !analytics.data) {
      return { 
        revenueTrend: [], 
        vendorPerformance: [], 
        orderDistribution: [],
        topVendorsData: [],
        analyticsData: []
      };
    }
    
    // Revenue trend data
    const revenueTrend = analytics.data?.analytics?.map(item => ({
      date: item.date,
      revenue: item.revenue || 0,
      orders: item.orders || 0
    })) || [];
    
    // Top vendors data
    const topVendorsData = dashboardStats.data.rankings?.topSellingVendors?.slice(0, 8).map(vendor => ({
      name: vendor.vendorName?.length > 15 
        ? vendor.vendorName.substring(0, 15) + '...' 
        : vendor.vendorName || 'Unknown',
      sales: vendor.totalSales || 0,
      orders: vendor.orderCount || 0,
      items: vendor.itemCount || 0,
      avgSale: vendor.avgSaleValue || 0
    })) || [];
    
    // Order status distribution
    const orderDistribution = dashboardStats.data.analytics?.statusDistribution?.map(item => ({
      name: item.status?.replace('_', ' ') || 'Unknown',
      value: item.count || 0,
      revenue: item.revenue || 0
    })) || [];
    
    // Vendor performance scatter data
    const vendorPerformance = dashboardStats.data.rankings?.topSellingVendors?.slice(0, 15).map(vendor => ({
      x: vendor.orderCount || 0,
      y: vendor.totalSales || 0,
      z: vendor.itemCount || 0,
      name: vendor.vendorName
    })) || [];
    
    return { revenueTrend, topVendorsData, orderDistribution, vendorPerformance };
  };

  const chartData = prepareChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#FF6B6B', '#4ECDC4'];

  // Period options
  const periodOptions = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 90 Days' },
    { value: 'year', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const isLoading = dashboardStats.loading || analytics.loading || isRefreshing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive analytics and vendor performance reports</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="text-sm text-gray-500">
              Period: {periodOptions.find(p => p.value === period)?.label}
            </div>
            <button
              onClick={handleRefreshStats}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportAnalytics}
              disabled={exportLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                if (e.target.value !== 'custom') {
                  const now = new Date();
                  let start, end;
                  
                  switch (e.target.value) {
                    case 'week':
                      start = format(subDays(now, 7), 'yyyy-MM-dd');
                      end = format(now, 'yyyy-MM-dd');
                      break;
                    case 'month':
                      start = format(startOfMonth(now), 'yyyy-MM-dd');
                      end = format(endOfMonth(now), 'yyyy-MM-dd');
                      break;
                    case 'quarter':
                      start = format(subDays(now, 90), 'yyyy-MM-dd');
                      end = format(now, 'yyyy-MM-dd');
                      break;
                    case 'year':
                      start = format(startOfYear(now), 'yyyy-MM-dd');
                      end = format(endOfYear(now), 'yyyy-MM-dd');
                      break;
                    default:
                      start = format(startOfMonth(now), 'yyyy-MM-dd');
                      end = format(endOfMonth(now), 'yyyy-MM-dd');
                  }
                  
                  setDateRange({ start, end });
                }
              }}
              className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !dashboardStats.data && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading analytics data...</span>
        </div>
      )}

      {/* Analytics Overview */}
      {!isLoading && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsStats.totalRevenue)}
                  </p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className={`inline-flex items-center ${analyticsStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analyticsStats.revenueGrowth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(analyticsStats.revenueGrowth)}%
                    </span>
                    <span className="text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analyticsStats.totalOrders)}
                  </p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className={`inline-flex items-center ${analyticsStats.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analyticsStats.orderGrowth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(analyticsStats.orderGrowth)}%
                    </span>
                    <span className="text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Vendors */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analyticsStats.totalVendors)}
                  </p>
                  <div className="mt-2 flex items-center text-sm">
                    <span className={`inline-flex items-center ${analyticsStats.vendorGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analyticsStats.vendorGrowth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(analyticsStats.vendorGrowth)}%
                    </span>
                    <span className="text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Avg Order Value */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsStats.avgOrderValue)}
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    {formatNumber(analyticsStats.monthlyOrders)} orders this month
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CreditCard className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Revenue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Orders</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                {chartData.revenueTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          if (period === 'year') return value.split('-')[1];
                          return format(new Date(value), 'MMM d');
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                          return [value, 'Orders'];
                        }}
                        labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ strokeWidth: 2 }}
                        name="Revenue"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ strokeWidth: 2 }}
                        name="Orders"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No revenue data available for selected period</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Vendors by Sales */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Vendors by Sales</h3>
                <span className="text-sm text-gray-500">Top 8 performers</span>
              </div>
              <div className="h-80">
                {chartData.topVendorsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={chartData.topVendorsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'sales') return [formatCurrency(value), 'Sales'];
                          if (name === 'avgSale') return [formatCurrency(value), 'Avg Sale'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="sales" fill="#8884d8" name="Total Sales" />
                      <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
                    </ReBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No vendor sales data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Order Status Distribution</h3>
                <span className="text-sm text-gray-500">
                  Total: {formatNumber(chartData.orderDistribution.reduce((sum, item) => sum + item.value, 0))}
                </span>
              </div>
              <div className="h-80">
                {chartData.orderDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.orderDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.orderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => {
                          if (name === 'value') return [value, 'Orders'];
                          return [formatCurrency(value), 'Revenue'];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No order status data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Performance Scatter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vendor Performance Matrix</h3>
                <div className="text-sm text-gray-500">
                  Orders vs Sales
                </div>
              </div>
              <div className="h-80">
                {chartData.vendorPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="Orders" 
                        label={{ value: 'Number of Orders', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name="Sales" 
                        label={{ value: 'Sales ($)', angle: -90, position: 'insideLeft' }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <ZAxis type="number" dataKey="z" range={[50, 400]} name="Items" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'y') return [formatCurrency(value), 'Sales'];
                          if (name === 'z') return [value, 'Items Sold'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Scatter name="Vendors" data={chartData.vendorPerformance} fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No vendor performance data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Vendor Performance Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vendor Performance Details</h3>
                  <p className="text-sm text-gray-600 mt-1">Detailed performance metrics for all vendors</p>
                </div>
                <span className="text-sm text-gray-500">
                  Showing top {chartData.topVendorsData.length} vendors
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Metrics
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Sale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData.topVendorsData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center">
                        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No vendor data available</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Vendor performance data will appear here
                        </p>
                      </td>
                    </tr>
                  ) : (
                    chartData.topVendorsData.map((vendor, index) => {
                      const performanceScore = ((vendor.sales / analyticsStats.totalRevenue) * 100).toFixed(1);
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {vendor.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Rank: #{index + 1}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(vendor.sales)}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${Math.min((vendor.sales / analyticsStats.totalRevenue) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {((vendor.sales / analyticsStats.totalRevenue) * 100).toFixed(1)}% of total
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatNumber(vendor.orders)} orders
                            </div>
                            <div className="text-xs text-gray-500">
                              {vendor.orders > 0 ? (vendor.sales / vendor.orders).toFixed(2) : 0} orders/day
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(vendor.avgSale)}
                            </div>
                            <div className="text-xs text-gray-500">
                              per order
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatNumber(vendor.items)}
                            </div>
                            <div className="text-xs text-gray-500">
                              units sold
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                parseFloat(performanceScore) > 15 
                                  ? 'bg-green-100 text-green-800'
                                  : parseFloat(performanceScore) > 5
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {performanceScore}%
                              </div>
                              <div className="ml-2 text-xs text-gray-500">
                                {parseFloat(performanceScore) > 15 ? 'Excellent' : 
                                 parseFloat(performanceScore) > 5 ? 'Good' : 'Needs Improvement'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Percent className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Market Share Distribution</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {chartData.topVendorsData.length > 0 
                      ? `${((chartData.topVendorsData[0]?.sales || 0) / analyticsStats.totalRevenue * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    Top vendor market share
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsStats.revenueGrowth}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Revenue growth this period
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vendor Retention</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsStats.activeVendors > 0
                      ? `${Math.round((analyticsStats.activeVendors / analyticsStats.totalVendors) * 100)}%`
                      : '0%'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    Active vendor rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;