import React, { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Calendar,
  Download,
  Filter,
  ChevronDown
} from 'lucide-react'

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('month')

  const stats = {
    vendorGrowth: 24.5,
    revenueGrowth: 32.1,
    orderGrowth: 18.7,
    productGrowth: 12.3
  }

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    vendors: [45, 52, 68, 72, 85, 94, 112],
    revenue: [12000, 18000, 15000, 22000, 19000, 25000, 32000],
    orders: [125, 145, 165, 198, 210, 245, 278]
  }

  const topVendors = [
    { name: 'MediCare Pharmacy', sales: 124500, growth: 24.5, orders: 156 },
    { name: 'Wellness Drugstore', sales: 98750, growth: 18.2, orders: 124 },
    { name: 'Health Plus Pharmacy', sales: 87650, growth: 32.1, orders: 98 },
    { name: 'Quick Meds', sales: 65400, growth: 12.7, orders: 87 },
    { name: 'Pharma Direct', sales: 54300, growth: -2.4, orders: 65 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track platform performance and vendor metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last year</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vendor Growth</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.vendorGrowth}%</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>+24.5% this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Revenue Growth</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.revenueGrowth}%</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>+32.1% this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Order Growth</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.orderGrowth}%</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>+18.7% this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Product Growth</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.productGrowth}%</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>+12.3% this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Vendor Growth Trend</h3>
            <div className="flex items-center space-x-2">
              <button className="text-sm px-3 py-1 rounded-md bg-blue-100 text-blue-700">
                Vendors
              </button>
              <button className="text-sm px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100">
                Revenue
              </button>
              <button className="text-sm px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100">
                Orders
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end space-x-2">
            {chartData.vendors.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(value / 120) * 100}%` }}
                ></div>
                <div className="text-xs text-gray-500 mt-2">{chartData.labels[index]}</div>
                <div className="text-xs font-medium mt-1">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Vendors</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {topVendors.map((vendor, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                    <div className="text-sm text-gray-500">{vendor.orders} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${(vendor.sales / 1000).toFixed(1)}K
                  </div>
                  <div className={`text-sm ${vendor.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {vendor.growth > 0 ? '+' : ''}{vendor.growth}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Statistics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Approval Rate</span>
                <span className="text-sm font-medium text-gray-900">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Average Review Time</span>
                <span className="text-sm font-medium text-gray-900">2.4 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {[
              { state: 'California', vendors: 45, percentage: 28 },
              { state: 'Texas', vendors: 32, percentage: 20 },
              { state: 'New York', vendors: 28, percentage: 18 },
              { state: 'Florida', vendors: 24, percentage: 15 },
              { state: 'Others', vendors: 27, percentage: 19 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.state}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.vendors}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">New Registrations</p>
                  <p className="text-sm text-gray-500">Last 24 hours</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-green-600">+8</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">New Products</p>
                  <p className="text-sm text-gray-500">Last 24 hours</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-blue-600">+42</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Transactions</p>
                  <p className="text-sm text-gray-500">Last 24 hours</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-purple-600">156</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage