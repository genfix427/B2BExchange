import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { productService } from '../../services/product.service';
import ProductQuickView from '../../components/vendor/ProductQuickView';

const VendorProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  
  // Quick view modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  
  // Delete confirmation
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await productService.getVendorProducts({
        page,
        limit: 10,
        search,
        status: statusFilter
      });
      
      setProducts(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
      
      // Fetch stats
      const statsResponse = await productService.getProductStats();
      setStats(statsResponse.data);
      
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts(currentPage);
  }, [search, statusFilter, currentPage]);
  
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setDeleting(true);
    try {
      await productService.deleteProduct(productToDelete._id);
      fetchProducts(currentPage);
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      setError('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };
  
  const getStatusBadge = (status, stock) => {
  // Use stock to determine actual status
  if (stock <= 0) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800`}>
        <AlertCircle className="w-4 h-4" />
        <span className="ml-1">Out of Stock</span>
      </span>
    );
  } else if (stock < 5) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800`}>
        <AlertCircle className="w-4 h-4" />
        <span className="ml-1">Low Stock ({stock})</span>
      </span>
    );
  }

   // Use original status for other cases
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
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (loading && !products.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Product Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your product listings and inventory
              </p>
            </div>
            <button
              onClick={() => navigate('/vendor/products/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </button>
          </div>
        </div>
        
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeProducts}</p>
                </div>
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
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalStock}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">$</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${stats.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by NDC, name, or manufacturer..."
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
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NDC Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
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
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by creating your first product.
                      </p>
                      <button
                        onClick={() => navigate('/vendor/products/create')}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Product
                      </button>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
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
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.manufacturer}
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
                        <div className="text-sm text-gray-900">
                          {product.quantityInStock} units
                        </div>
                        <div className="text-xs text-gray-500">
                          Pack: {product.packQuantity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${product.price.toFixed(2)}
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
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowQuickView(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-900"
                            title="Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/vendor/products/edit/${product._id}`)}
                            className="p-1 text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
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
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          onClose={() => {
            setShowQuickView(false);
            setSelectedProduct(null);
          }}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{productToDelete.productName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProductsPage;