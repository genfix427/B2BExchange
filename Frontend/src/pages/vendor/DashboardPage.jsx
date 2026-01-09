import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
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
  Edit2,
  Trash2,
  Plus,
  TrendingDown,
  Box,
  Thermometer,
  Hash
} from 'lucide-react'
import { setStats } from '../../store/slices/vendorSlice'
import { fetchVendorProducts, fetchProductStats } from '../../store/slices/vendorProductSlice'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { stats: vendorStats } = useSelector((state) => state.vendor)
  const { products, stats: productStats, loading } = useSelector((state) => state.vendorProducts)

  useEffect(() => {
    // Fetch vendor products and stats
    dispatch(fetchVendorProducts({ limit: 5 }))
    dispatch(fetchProductStats())
    
    // Mock data for other stats
    const mockStats = {
      totalOrders: 156,
      pendingOrders: 12,
      completedOrders: 144,
      totalRevenue: '$45,820',
      activeListings: 89,
      conversionRate: '12.5%',
      monthlyGrowth: '+8.2%',
      customerRating: '4.8/5.0'
    }
    dispatch(setStats(mockStats))
  }, [dispatch])

  // Get recent products (last 5)
  const recentProducts = products.slice(0, 5)

  const StatCard = ({ title, value, icon: Icon, change, trend = 'up', loading }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-md bg-blue-100">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-semibold text-gray-900">
                {loading ? '...' : value}
              </dd>
              {change && (
                <dd className="text-sm">
                  <span className={`inline-flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {change}
                  </span>
                  <span className="text-gray-500 ml-2">from last month</span>
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )

  const QuickAction = ({ title, description, icon: Icon, color, to }) => (
    <Link
      to={to}
      className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-2 rounded-md ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  )

  const ProductItem = ({ product }) => {
    const getStatusColor = (status) => {
      switch(status) {
        case 'active':
          return 'bg-green-100 text-green-800'
        case 'out_of_stock':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price)
    }

    const isExpired = (expirationDate) => {
      return new Date(expirationDate) < new Date()
    }

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
        <div className="flex items-center">
          {product.image?.url ? (
            <img
              src={product.image.url}
              alt={product.productName}
              className="h-10 w-10 rounded object-cover mr-3"
            />
          ) : (
            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-3">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {product.productName}
            </p>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                {product.status === 'active' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {product.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                Stock: {product.quantityInStock}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatPrice(product.price)}
          </p>
          <p className={`text-xs ${isExpired(product.expirationDate) ? 'text-red-600' : 'text-gray-500'}`}>
            {isExpired(product.expirationDate) ? 'Expired' : 'Valid'}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.pharmacyOwner?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your pharmacy today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Products"
          value={productStats.totalProducts || 0}
          icon={Package}
          change={productStats.totalProducts > 0 ? '+8.2%' : ''}
          trend="up"
          loading={loading}
        />
        <StatCard
          title="Active Products"
          value={productStats.activeProducts || 0}
          icon={CheckCircle}
          change={productStats.activeProducts > 0 ? '+5.1%' : ''}
          trend="up"
          loading={loading}
        />
        <StatCard
          title="Total Stock Value"
          value={`$${productStats.totalValue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          change="+12.5%"
          trend="up"
          loading={loading}
        />
        <StatCard
          title="Out of Stock"
          value={productStats.outOfStockProducts || 0}
          icon={AlertCircle}
          change={productStats.outOfStockProducts > 0 ? '-2.1%' : ''}
          trend="down"
          loading={loading}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Products & Quick Actions */}
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

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/vendor/products">
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Manage Products</p>
                      <p className="text-xl font-bold text-gray-900">{productStats.totalProducts || 0}</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/vendor/products/create">
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="p-2 bg-blue-100 rounded-lg mb-2">
                      <Plus className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Add New Product</p>
                    <p className="text-xs text-gray-500 mt-1">Create new listing</p>
                  </div>
                </div>
              </Link>

              <Link to="/vendor/orders">
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Manage Orders</p>
                      <p className="text-sm text-gray-500">Process pending orders</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/vendor/profile">
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Users className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Update Profile</p>
                      <p className="text-sm text-gray-500">Edit pharmacy information</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Summary</h2>
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
          </div>
        </div>

        {/* Right Column - Recent Activity & Calendar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentProducts.length > 0 && recentProducts.slice(0, 3).map((product, index) => (
                <div key={product._id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="p-1 rounded-full bg-blue-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">
                      New product added: {product.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(product.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentProducts.length === 0 && (
                <>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="p-1 rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">Account approved</p>
                      <p className="text-xs text-gray-500">Welcome to the platform</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="p-1 rounded-full bg-yellow-100">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">Profile setup completed</p>
                      <p className="text-xs text-gray-500">Your pharmacy is ready</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Upcoming</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {/* Check for expiring products */}
              {recentProducts.filter(p => {
                const expDate = new Date(p.expirationDate)
                const daysToExpire = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24))
                return daysToExpire <= 60 && daysToExpire > 0
              }).slice(0, 3).map(product => (
                <div key={product._id} className="flex items-center">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900 truncate">{product.productName}</p>
                    <p className="text-xs text-red-500">
                      Expires in {Math.ceil((new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Default reminders if no expiring products */}
              {recentProducts.length === 0 && (
                <>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">Add your first product</p>
                      <p className="text-xs text-gray-500">Get started with inventory</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">Setup payment method</p>
                      <p className="text-xs text-gray-500">Required for transactions</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Performance Summary */}
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
                <span className="text-sm text-gray-600">Average Price</span>
                <span className="text-sm font-medium text-gray-900">
                  ${productStats.totalValue && productStats.totalProducts 
                    ? (productStats.totalValue / productStats.totalProducts).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stock Ratio</span>
                <span className="text-sm font-medium text-green-600">
                  {productStats.totalProducts 
                    ? ((productStats.activeProducts / productStats.totalProducts) * 100).toFixed(1) + '%'
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Low Stock Alert</span>
                <span className="text-sm font-medium text-red-600">
                  {recentProducts.filter(p => p.quantityInStock <= 10).length}
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
                  Total Units in Stock
                </span>
                <span className="font-medium">{productStats.totalStock || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Thermometer className="w-4 h-4 mr-2 text-gray-400" />
                  Fridge Products
                </span>
                <span className="font-medium">
                  {recentProducts.filter(p => p.isFridgeProduct === 'Yes').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <Hash className="w-4 h-4 mr-2 text-gray-400" />
                  Unique Manufacturers
                </span>
                <span className="font-medium">
                  {[...new Set(recentProducts.map(p => p.manufacturer))].length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage