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
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { fetchVendorProducts, deleteProductAdmin, fetchVendorProductStats, updateProductAdmin } from '../../store/slices/adminProductSlice';
import AdminProductQuickView from './AdminProductQuickView';

const VendorAdminProductsList = ({ vendorId, vendorName }) => {
  const dispatch = useDispatch();
  const { vendorProducts, loading, vendorStats, pagination } = useSelector((state) => state.adminProducts);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // Fetch products for this vendor
  useEffect(() => {
    if (vendorId) {
      dispatch(fetchVendorProducts({
        vendorId,
        params: {
          page: currentPage,
          limit: 10,
          search,
          status: statusFilter
        }
      }));

      // Fetch vendor stats
      dispatch(fetchVendorProductStats(vendorId));
    }
  }, [dispatch, vendorId, search, statusFilter, currentPage]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchVendorProducts({
      vendorId,
      params: {
        page: currentPage,
        limit: 10,
        search,
        status: statusFilter
      }
    })).finally(() => {
      setRefreshing(false);
    });

    dispatch(fetchVendorProductStats(vendorId));
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProductAdmin(productId)).unwrap();
        // Refresh the products list
        dispatch(fetchVendorProducts({
          vendorId,
          params: {
            page: currentPage,
            limit: 10,
            search,
            status: statusFilter
          }
        }));
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const handleProductUpdate = (updatedProduct) => {
    // Update the product in the list
    setSelectedProduct(updatedProduct);

    // Refresh the list to show updated data
    handleRefresh();
  };

  const getStatusBadge = (status, stock) => {
    // Use stock to determine actual status if needed
    const actualStatus = stock <= 0 ? 'out_of_stock' : status;

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
      },
      low_stock: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <AlertCircle className="w-4 h-4" />
      }
    };

    const badge = badges[actualStatus] || badges.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        <span className="ml-1 capitalize">
          {actualStatus.replace('_', ' ')}
          {actualStatus === 'active' && stock < 10 && ` (${stock})`}
        </span>
      </span>
    );
  };

  // Update the stats display to show real-time stock status
  const stats = vendorStats || {
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalStock: 0,
    totalValue: 0,
    avgPrice: 0
  };

  // Calculate low stock products
  const lowStockProducts = vendorProducts.filter(p =>
    p.quantityInStock > 0 && p.quantityInStock < 10
  ).length;

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

  return (
    <div className="space-y-6">
      {/* Stats Cards with refresh button */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Refresh stats"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
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
            {lowStockProducts > 0 && (
              <span className="text-yellow-600">
                {lowStockProducts} low stock
              </span>
            )}
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
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
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

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BarChart className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-xl font-bold text-gray-900">{lowStockProducts}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Less than 10 units
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
                        {getStatusBadge(product.status, product.quantityInStock)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(product.expirationDate)}
                        </div>
                        <div className={`text-xs ${new Date(product.expirationDate) < new Date() ? 'text-red-600' : 'text-gray-500'}`}>
                          {new Date(product.expirationDate) < new Date() ? 'Expired' : 'Valid'}
                        </div>
                      </td>

                      {/* <td className="px-6 py-4">
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
                      </td> */}

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuickView(product)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
      {showQuickView && selectedProduct && (
        <AdminProductQuickView
          product={selectedProduct}
          onClose={() => {
            setShowQuickView(false);
            setSelectedProduct(null);
          }}
          onUpdate={handleProductUpdate}
        />
      )}
    </div>
  );
};

export default VendorAdminProductsList;