import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Package,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
  TrendingDown,
  Box,
  Thermometer,
  Hash,
  Truck,
  User,
  MessageSquare,
  FileText
} from 'lucide-react';
import { setStats } from '../../store/slices/vendorSlice';
import { 
  fetchVendorProducts, 
  fetchProductStats 
} from '../../store/slices/vendorProductSlice';
import { 
  fetchVendorOrders 
} from '../../store/slices/storeSlice';
import StatCard from '../../components/dashboard/StatCard';
import ProductItem from '../../components/dashboard/ProductItem';
import OrderItem from '../../components/dashboard/OrderItem';
import RecentActivityItem from '../../components/dashboard/RecentActivityItem';
import QuickActionCard from '../../components/dashboard/QuickActionCard';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats: vendorStats } = useSelector((state) => state.vendor);
  const { products, stats: productStats, loading: productsLoading } = useSelector((state) => state.vendorProducts);
  const { vendorOrders, loading: ordersLoading } = useSelector((state) => state.store);
  
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch all dashboard data
        await Promise.all([
          dispatch(fetchVendorProducts({ limit: 5 })),
          dispatch(fetchProductStats()),
          dispatch(fetchVendorOrders({ limit: 5 }))
        ]);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [dispatch]);

  // Calculate order stats whenever vendorOrders changes
  useEffect(() => {
    if (vendorOrders && vendorOrders.length > 0) {
      const total = vendorOrders.length;
      const pending = vendorOrders.filter(o => o.status === 'pending').length;
      const completed = vendorOrders.filter(o => ['delivered', 'shipped'].includes(o.status)).length;
      const processing = vendorOrders.filter(o => o.status === 'processing').length;
      const shipped = vendorOrders.filter(o => o.status === 'shipped').length;
      const revenue = vendorOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const avgValue = total > 0 ? revenue / total : 0;
      
      setOrderStats({
        totalOrders: total,
        pendingOrders: pending,
        completedOrders: completed,
        processingOrders: processing,
        shippedOrders: shipped,
        totalRevenue: revenue,
        avgOrderValue: avgValue
      });
      
      // Set vendor stats
      dispatch(setStats({
        totalOrders: total,
        pendingOrders: pending,
        completedOrders: completed,
        totalRevenue: `$${revenue?.toLocaleString() || '0'}`,
        activeListings: productStats?.activeProducts || 0,
        conversionRate: '12.5%',
        monthlyGrowth: '+8.2%',
        customerRating: '4.8/5.0'
      }));
    }
  }, [vendorOrders, productStats, dispatch]);

  // Generate recent activities whenever data changes
  useEffect(() => {
    generateRecentActivities();
  }, [products, vendorOrders]);

  const generateRecentActivities = () => {
    const activities = [];
    
    // Add recent products as activities
    if (products && products.length > 0) {
      products.slice(0, 3).forEach(product => {
        activities.push({
          type: 'product_added',
          message: `New product added: ${product.productName}`,
          createdAt: product.createdAt
        });
      });
    }
    
    // Add recent orders as activities
    if (vendorOrders && vendorOrders.length > 0) {
      vendorOrders.slice(0, 3).forEach(order => {
        activities.push({
          type: 'order_received',
          message: `New order received: #${order.orderNumber || order._id?.substring(0, 8)}`,
          createdAt: order.createdAt
        });
      });
    }
    
    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Take only latest 5 activities
    setRecentActivities(activities.slice(0, 5));
  };

  // Get recent products (last 5)
  const recentProducts = products.slice(0, 5);
  
  // Get recent orders (last 5)
  const recentOrders = vendorOrders?.slice(0, 5) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.pharmacyOwner?.firstName}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here's what's happening with your pharmacy today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Account Active
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Products"
          value={productStats.totalProducts || 0}
          icon={Package}
          change={productStats.totalProducts > 0 ? '+8.2%' : ''}
          trend="up"
          loading={productsLoading}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={orderStats.totalOrders || 0}
          icon={ShoppingBag}
          change={orderStats.totalOrders > 0 ? '+12.5%' : ''}
          trend="up"
          loading={ordersLoading}
          color="green"
        />
        <StatCard
          title="Pending Orders"
          value={orderStats.pendingOrders || 0}
          icon={Clock}
          change={orderStats.pendingOrders > 0 ? '+3.1%' : ''}
          trend="up"
          loading={ordersLoading}
          color="yellow"
        />
        <StatCard
          title="Total Revenue"
          value={`$${orderStats.totalRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          change="+15.8%"
          trend="up"
          loading={ordersLoading}
          color="purple"
        />
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Products"
          value={productStats.activeProducts || 0}
          icon={CheckCircle}
          change={productStats.activeProducts > 0 ? '+5.1%' : ''}
          trend="up"
          loading={productsLoading}
          color="green"
        />
        <StatCard
          title="Completed Orders"
          value={orderStats.completedOrders || 0}
          icon={Truck}
          change={orderStats.completedOrders > 0 ? '+18.2%' : ''}
          trend="up"
          loading={ordersLoading}
          color="indigo"
        />
        <StatCard
          title="Avg Order Value"
          value={`$${orderStats.avgOrderValue?.toFixed(2) || '0.00'}`}
          icon={BarChart3}
          change="+7.3%"
          trend="up"
          loading={ordersLoading}
          color="blue"
        />
        <StatCard
          title="Out of Stock"
          value={productStats.outOfStockProducts || 0}
          icon={AlertCircle}
          change={productStats.outOfStockProducts > 0 ? '-2.1%' : ''}
          trend="down"
          loading={productsLoading}
          color="red"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Products & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Products */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Products</h2>
              <div className="flex items-center space-x-3">
                <Link 
                  to="/vendor/products" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
                <Link 
                  to="/vendor/products/create"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Link>
              </div>
            </div>
            
            {recentProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first product.
                </p>
                <Link
                  to="/vendor/products/create"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentProducts.map((product) => (
                  <ProductItem key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              <div className="flex items-center space-x-3">
                <Link 
                  to="/vendor/orders" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
                <Link 
                  to="/vendor/orders"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Manage Orders
                </Link>
              </div>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  When customers purchase your products, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <OrderItem key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                title="Add Product"
                description="Create new listing"
                icon={Plus}
                color="blue"
                to="/vendor/products/create"
              />
              <QuickActionCard
                title="Manage Orders"
                description="Process pending orders"
                icon={ShoppingBag}
                color="green"
                to="/vendor/orders"
              />
              <QuickActionCard
                title="View Reports"
                description="Sales analytics"
                icon={BarChart3}
                color="purple"
                to="/vendor/reports"
              />
              <QuickActionCard
                title="Update Profile"
                description="Edit pharmacy info"
                icon={User}
                color="indigo"
                to="/vendor/profile"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity & Stats */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              <Link 
                to="/vendor/activity" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <RecentActivityItem key={index} activity={activity} />
                ))
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="text-sm font-medium text-gray-900">
                  {vendorOrders?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">
                  {vendorOrders?.filter(o => o.status === 'pending').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Processing</span>
                <span className="text-sm font-medium text-blue-600">
                  {vendorOrders?.filter(o => o.status === 'processing').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Shipped</span>
                <span className="text-sm font-medium text-green-600">
                  {vendorOrders?.filter(o => o.status === 'shipped').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Delivered</span>
                <span className="text-sm font-medium text-emerald-600">
                  {vendorOrders?.filter(o => o.status === 'delivered').length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Health */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Health</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stock Value</span>
                <span className="text-sm font-medium text-gray-900">
                  ${productStats.totalValue?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Rate</span>
                <span className="text-sm font-medium text-green-600">
                  {productStats.totalProducts 
                    ? ((productStats.activeProducts / productStats.totalProducts) * 100).toFixed(1) + '%'
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Stock</span>
                <span className="text-sm font-medium text-red-600">
                  {products.filter(p => p.quantityInStock <= 10 && p.quantityInStock > 0).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Out of Stock</span>
                <span className="text-sm font-medium text-red-600">
                  {productStats.outOfStockProducts || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Box className="w-4 h-4 mr-2 text-gray-400" />
                  Total Units
                </span>
                <span className="font-medium">{productStats.totalStock || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Thermometer className="w-4 h-4 mr-2 text-gray-400" />
                  Fridge Items
                </span>
                <span className="font-medium">
                  {products.filter(p => p.isFridgeProduct === 'Yes').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Hash className="w-4 h-4 mr-2 text-gray-400" />
                  Manufacturers
                </span>
                <span className="font-medium">
                  {[...new Set(products.map(p => p.manufacturer))].length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                  Customer Messages
                </span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Inventory Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Inventory Summary</h2>
          <Link 
            to="/vendor/products" 
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FileText className="h-4 w-4 mr-1" />
            Export Report
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{productStats.totalProducts || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Total Products</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{productStats.activeProducts || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Active</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{productStats.outOfStockProducts || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Out of Stock</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{productStats.totalStock || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Total Units</div>
          </div>
        </div>
        
        {/* Product Categories */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Product Categories</h3>
          <div className="flex flex-wrap gap-2">
            {[...new Set(products.map(p => p.dosageForm))].slice(0, 6).map((category, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {category || 'Uncategorized'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;