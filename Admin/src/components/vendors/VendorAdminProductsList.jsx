import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  BarChart,
  ShoppingBag
} from 'lucide-react';
import { fetchAllProducts, deleteProductAdmin } from '../../store/slices/adminProductSlice';

const VendorAdminProductsList = ({ vendorId, vendorName }) => {
  const dispatch = useDispatch();
  const { products, loading, pagination } = useSelector((state) => state.adminProducts);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalStock: 0,
    totalValue: 0,
    avgPrice: 0
  });

  // Fetch products for this vendor
  useEffect(() => {
    if (vendorId) {
      dispatch(fetchAllProducts({
        page: currentPage,
        limit: 10,
        search,
        vendor: vendorId,
        status: statusFilter
      }));
    }
  }, [dispatch, vendorId, search, statusFilter, currentPage]);

  // Calculate vendor-specific stats
  useEffect(() => {
  const totalProducts = vendorProducts.length;
  const activeProducts = vendorProducts.filter(p => p.status === 'active').length;
  const outOfStockProducts = vendorProducts.filter(p => p.status === 'out_of_stock').length;
  const totalStock = vendorProducts.reduce((sum, p) => sum + (p.quantityInStock || 0), 0);
  const totalValue = vendorProducts.reduce(
    (sum, p) => sum + ((p.quantityInStock || 0) * (p.price || 0)),
    0
  );

  setStats({
    totalProducts,
    activeProducts,
    outOfStockProducts,
    totalStock,
    totalValue,
    avgPrice: totalStock ? totalValue / totalStock : 0
  });
}, [vendorProducts]);


  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProductAdmin(productId)).unwrap();
        // Refresh the products list
        dispatch(fetchAllProducts({
          page: currentPage,
          limit: 10,
          vendor: vendorId
        }));
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      },
      inactive: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: <XCircle className="w-4 h-4" />
      },
      out_of_stock: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <AlertCircle className="w-4 h-4" />
      }
    };
    
    const badge = badges[status] || badges.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards for this Vendor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span>Active: {stats.activeProducts}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalStock}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Units available
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Stock Value</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(stats.totalValue)}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Avg: {formatPrice(stats.avgPrice)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-xl font-bold text-gray-900">{stats.outOfStockProducts}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Requires attention
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vendor products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Products by {vendorName || 'Vendor'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {stats.totalProducts} product{stats.totalProducts !== 1 ? 's' : ''} found
          </p>
        </div>

        {vendorProducts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              This vendor hasn't added any products yet.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NDC Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock & Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.image?.url ? (
                            <img
                              src={product.image.url}
                              alt={product.productName}
                              className="h-12 w-12 rounded object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.manufacturer} • {product.dosageForm}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Strength: {product.strength}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900">
                          {product.ndcNumber}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{product.quantityInStock}</span>
                            <span className="text-gray-500 ml-1">units</span>
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Lot: {product.lotNumber}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {getStatusBadge(product.status)}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(product.expirationDate)}
                        </div>
                        <div className={`text-xs ${new Date(product.expirationDate) < new Date() ? 'text-red-600' : 'text-gray-500'}`}>
                          {new Date(product.expirationDate) < new Date() ? 'Expired' : 'Valid'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/admin/products/${product._id}`, '_blank')}
                            className="p-1 text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(`/admin/products/edit/${product._id}`, '_blank')}
                            className="p-1 text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-1 text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-3 py-2 text-sm">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={currentPage === pagination.pages}
                      className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VendorAdminProductsList;