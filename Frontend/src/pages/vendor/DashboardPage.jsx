import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { setStats } from '../../store/slices/vendorSlice'
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
  ArrowDownRight
} from 'lucide-react'

const VendorDashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { stats } = useSelector((state) => state.vendor)

  useEffect(() => {
    // Mock data - in production, fetch from API
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

  const StatCard = ({ title, value, icon: Icon, change, trend = 'up' }) => (
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
              <dd className="text-lg font-semibold text-gray-900">{value}</dd>
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

  const OrderItem = ({ id, customer, amount, status, date }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
        <div>
          <p className="text-sm font-medium text-gray-900">Order #{id}</p>
          <p className="text-sm text-gray-500">{customer}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{amount}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <config.icon className="h-3 w-3 mr-1" />
            {status}
          </span>
        </div>
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
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          change={stats.monthlyGrowth}
          trend="up"
        />
        <StatCard
          title="Active Listings"
          value={stats.activeListings}
          icon={Package}
          change="-2.1%"
          trend="down"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          change="+12.5%"
          trend="up"
        />
        <StatCard
          title="Conversion Rate"
          value={stats.conversionRate}
          icon={TrendingUp}
          change="+3.2%"
          trend="up"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/vendor/products">
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Products</p>
                      <p className="text-xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link to="/vendor/products">
                <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-center">
                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Manage Products</p>
                  <p className="text-xs text-gray-500 mt-1">Add, edit, delete products</p>
                </div>
              </Link>
              <QuickAction
                title="View Analytics"
                description="Check sales performance"
                icon={BarChart3}
                color="bg-green-500"
                to="/analytics"
              />
              <QuickAction
                title="Manage Orders"
                description="Process pending orders"
                icon={ShoppingBag}
                color="bg-purple-500"
                to="/orders"
              />
              <QuickAction
                title="Update Profile"
                description="Edit pharmacy information"
                icon={Users}
                color="bg-yellow-500"
                to="/profile"
              />
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              <Link to="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              <OrderItem
                id="ORD-7890"
                customer="City Hospital Pharmacy"
                amount="$1,250.00"
                status="pending"
                date="Today"
              />
              <OrderItem
                id="ORD-7889"
                customer="Wellness Clinic"
                amount="$890.50"
                status="completed"
                date="Yesterday"
              />
              <OrderItem
                id="ORD-7888"
                customer="MediCare Pharmacy"
                amount="$2,150.75"
                status="completed"
                date="Dec 12"
              />
              <OrderItem
                id="ORD-7887"
                customer="Family Health"
                amount="$540.20"
                status="completed"
                date="Dec 11"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity & Calendar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-1 rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Order #7890 shipped</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-1 rounded-full bg-blue-100">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">New product listed</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-1 rounded-full bg-yellow-100">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Upcoming</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">License Renewal</p>
                  <p className="text-xs text-gray-500">Due in 45 days</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Monthly Report</p>
                  <p className="text-xs text-gray-500">Due in 5 days</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Inventory Check</p>
                  <p className="text-xs text-gray-500">Scheduled for next week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Rating</span>
                <span className="text-sm font-medium text-gray-900">{stats.customerRating}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">On-time Delivery</span>
                <span className="text-sm font-medium text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order Accuracy</span>
                <span className="text-sm font-medium text-green-600">99.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboardPage