import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Download,
    Eye,
    Package,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    BarChart,
    DollarSign,
    TrendingUp,
    Users,
    Building2,
    ShoppingBag,
    Plus,
    MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import {
    fetchAllProducts,
    deleteProductAdmin,
    fetchAdminProductStats
} from '../../store/slices/adminProductSlice';

const AdminProductsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, stats, loading, error, pagination } = useSelector((state) => state.adminProducts);
    
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        category: '',
        vendor: '',
        minPrice: '',
        maxPrice: '',
        minStock: '',
        maxStock: ''
    });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ show: false, productId: null, productName: '' });
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadProducts();
        loadStats();
    }, [dispatch, pagination.page, filters]);

    const loadProducts = async () => {
        try {
            await dispatch(fetchAllProducts({
                page: pagination.page,
                limit: 20,
                ...filters
            }));
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const loadStats = async () => {
        await dispatch(fetchAdminProductStats());
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([loadProducts(), loadStats()]);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDeleteProduct = async () => {
        if (!deleteModal.productId) return;
        
        try {
            await dispatch(deleteProductAdmin(deleteModal.productId));
            setDeleteModal({ show: false, productId: null, productName: '' });
            loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            dispatch({ type: 'adminProducts/setPage', payload: newPage });
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'MMM d, yyyy');
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            out_of_stock: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800'
        };
        return colors[status] || colors.inactive;
    };

    const getStatusIcon = (status) => {
        const icons = {
            active: CheckCircle,
            inactive: XCircle,
            out_of_stock: AlertCircle,
            pending: AlertCircle
        };
        return icons[status] || AlertCircle;
    };

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'out_of_stock', label: 'Out of Stock' },
        { value: 'pending', label: 'Pending' }
    ];

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        { value: 'prescription', label: 'Prescription' },
        { value: 'otc', label: 'Over-the-counter' },
        { value: 'medical_supplies', label: 'Medical Supplies' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'vaccines', label: 'Vaccines' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
                        <p className="text-gray-600 mt-1">Manage all products from all vendors</p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <Link
                            to="/admin/products/add"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.totalProducts || 0}
                            </p>
                            <div className="mt-2 text-sm text-gray-500">
                                <span className="text-green-600">{stats.activeProducts || 0} active</span>
                                <span className="mx-2">•</span>
                                <span className="text-red-600">{stats.outOfStockProducts || 0} out of stock</span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Package className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.totalValue || 0)}
                            </p>
                            <div className="mt-2 text-sm text-gray-500">
                                <span>{stats.totalStock || 0} total units</span>
                            </div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Price</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.avgPrice || 0)}
                            </p>
                            <div className="mt-2 text-sm text-gray-500">
                                <span>Per product</span>
                            </div>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Vendors with Products</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.totalVendors || 0}
                            </p>
                            <div className="mt-2 text-sm text-gray-500">
                                <span>{stats.recentVendorsWithProducts || 0} recently active</span>
                            </div>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Building2 className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex space-x-2">
                        <input
                            type="number"
                            placeholder="Min Price"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-4 text-gray-600">Loading products...</span>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                        <button
                            onClick={loadProducts}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : !products || products.length === 0 ? (
                    <div className="p-6 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">No products found</p>
                        <p className="text-sm text-gray-500">
                            Add your first product or adjust your filters
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vendor
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price & Stock
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => {
                                        const StatusIcon = getStatusIcon(product.status);
                                        return (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        {product.image?.url ? (
                                                            <img
                                                                src={product.image.url}
                                                                alt={product.productName}
                                                                className="h-10 w-10 rounded object-cover mr-3"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {product.productName}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                NDC: {product.ndcNumber || 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Added: {formatDate(product.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {product.vendorName || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {product.vendorEmail || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {formatCurrency(product.price)}
                                                    </div>
                                                    <div className={`text-sm font-medium ${
                                                        product.quantityInStock <= 10 
                                                            ? 'text-red-600' 
                                                            : product.quantityInStock <= 50 
                                                            ? 'text-yellow-600' 
                                                            : 'text-green-600'
                                                    }`}>
                                                        {product.quantityInStock || 0} units
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {product.category?.replace('_', ' ') || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {product.status?.replace('_', ' ') || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/products/${product._id}`)}
                                                            className="text-blue-600 hover:text-blue-900 p-1"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                                                            className="text-green-600 hover:text-green-900 p-1"
                                                            title="Edit Product"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteModal({
                                                                show: true,
                                                                productId: product._id,
                                                                productName: product.productName
                                                            })}
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.length > 0 && (
                            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                                            </span>{' '}
                                            of <span className="font-medium">{pagination.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                                const pageNumber = Math.max(
                                                    1, 
                                                    Math.min(
                                                        pagination.pages - 4, 
                                                        pagination.page - 2
                                                    )
                                                ) + i;
                                                
                                                if (pageNumber > 0 && pageNumber <= pagination.pages) {
                                                    return (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => handlePageChange(pageNumber)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                pagination.page === pageNumber
                                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })}
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.pages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-700">
                                Are you sure you want to delete <span className="font-semibold">{deleteModal.productName}</span>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                This action cannot be undone. All product data will be permanently removed.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, productId: null, productName: '' })}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProduct}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductsPage;