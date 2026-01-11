import React, { useEffect } from 'react';
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
  BarChart
} from 'lucide-react';
import { fetchAdminProductStats, fetchAllProducts, refreshAdminStats } from '../../store/slices/adminProductSlice';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, products, loading } = useSelector((state) => state.adminProducts);

  useEffect(() => {
    // Fetch product stats
    dispatch(fetchAdminProductStats());

    // Fetch recent products (first page, sorted by creation date)
    dispatch(fetchAllProducts({
      page: 1,
      limit: 10,
      sort: 'createdAt',
      order: 'desc'
    }));
  }, [dispatch]);

  // Get recent products (last 5 from the fetched products)
  const recentProducts = products.slice(0, 5);

  const handleRefreshStats = () => {
    dispatch(refreshAdminStats());
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      out_of_stock: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.inactive;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading && !stats.totalProducts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Package className="w-6 h-6 text-blue-600" />
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-600">Total Products</p>
      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
    </div>
  </div>
  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
    <div className="flex items-center">
      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
      <span>Active: {stats.activeProducts || 0}</span>
    </div>
    <button
      onClick={handleRefreshStats}
      className="text-blue-600 hover:text-blue-800"
    >
      Refresh
    </button>
  </div>
</div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVendors || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Building2 className="w-4 h-4 text-blue-500 mr-1" />
            <span>Active suppliers</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalValue || 0)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <DollarSign className="w-4 h-4 text-yellow-500 mr-1" />
            <span>Average price: {formatPrice(stats.avgPrice || 0)}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{stats.outOfStockProducts || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
            <span>Requires attention</span>
          </div>
        </div>
      </div>

      {/* Recent Products Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 text-gray-500 mr-2" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !recentProducts.length ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : recentProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
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
                          <div className="text-xs text-gray-400 mt-1">
                            {product.manufacturer} • {product.dosageForm}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.vendorName || product.vendor?.pharmacyInfo?.legalBusinessName || 'Unknown Vendor'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.vendor?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">{product.quantityInStock || 0}</span>
                          <span className="text-gray-500 ml-1">units in stock</span>
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

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {product.createdAt ? formatDate(product.createdAt) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.expirationDate && (
                          <span className={new Date(product.expirationDate) < new Date() ? 'text-red-600' : 'text-gray-500'}>
                            Expires: {formatDate(product.expirationDate)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/admin/products"
              className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Manage Products
            </Link>
            <Link
              to="/admin/vendors"
              className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Manage Vendors
            </Link>
            <Link
              to="/admin/orders"
              className="block w-full text-left px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              View Orders
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Insights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProducts || 0}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">Total Stock Units</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStock || 0}</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600">Average Product Price</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.avgPrice || 0)}</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-sm text-gray-600">Expired Products</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;