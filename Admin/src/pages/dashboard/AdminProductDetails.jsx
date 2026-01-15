import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  Hash,
  Box,
  Thermometer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Save,
  Loader2,
  AlertTriangle,
  Info,
  Tag,
  Layers,
  Database,
  Clock,
  Eye,
  ShoppingBag,
  RefreshCw,
  Image as ImageIcon,
  ShieldCheck,
  PackageCheck,
  Copy,
  Zap,
  Building,
  ShieldIcon,
  TruckIcon,
  Heart,

} from 'lucide-react';
import { fetchAdminProduct, updateProductAdmin } from '../../store/slices/adminProductSlice';

const AdminProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProduct, loading, error } = useSelector((state) => state.adminProducts);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchAdminProduct(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentProduct) {
      setEditedProduct({ ...currentProduct });
    }
  }, [currentProduct]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusInfo = (status, stock) => {
    const actualStatus = stock <= 0 ? 'out_of_stock' : status;
    
    const statuses = {
      active: {
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'Active',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        description: stock < 10 ? `Low stock (${stock} left)` : 'Available for sale'
      },
      inactive: {
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: <XCircle className="w-5 h-5" />,
        label: 'Inactive',
        badgeColor: 'bg-gray-100 text-gray-800',
        description: 'Not available for sale'
      },
      out_of_stock: {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: <AlertCircle className="w-5 h-5" />,
        label: 'Out of Stock',
        badgeColor: 'bg-red-100 text-red-800',
        description: 'No inventory available'
      }
    };
    return statuses[actualStatus] || statuses.inactive;
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Out of Stock' };
    if (stock < 10) return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Low Stock' };
    if (stock < 50) return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Good Stock' };
    return { color: 'text-teal-600', bg: 'bg-teal-50', label: 'High Stock' };
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    
    if (type === 'number') {
      newValue = value === '' ? '' : parseFloat(value);
    }
    
    setEditedProduct(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError('');
    
    try {
      const updateData = {
        ...editedProduct,
        price: parseFloat(editedProduct.price) || 0,
        quantityInStock: parseInt(editedProduct.quantityInStock) || 0,
        originalPackSize: parseInt(editedProduct.originalPackSize) || 1
      };

      await dispatch(updateProductAdmin({ id, data: updateData })).unwrap();
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to update product:', error);
      setSaveError(error.message || 'Failed to update product');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProduct({ ...currentProduct });
    setSaveError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Product</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/admin/products')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h3>
          <p className="text-gray-600 mb-6">The requested product could not be found.</p>
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentProduct.status, currentProduct.quantityInStock);
  const stockStatus = getStockStatus(currentProduct.quantityInStock);
  const isExpired = new Date(currentProduct.expirationDate) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <button
                  onClick={() => navigate('/admin/products')}
                  className="mr-4 p-2 rounded-full hover:bg-emerald-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold">Product Details</h1>
                  <p className="text-emerald-200 text-sm mt-1">
                    Manage product information and inventory
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {isEditing ? (
                  <>
                    {saveSuccess && (
                      <div className="flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Changes saved!</span>
                      </div>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 rounded-lg font-medium flex items-center transition-all duration-200 disabled:opacity-50"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saveLoading}
                      className="bg-transparent border border-white/30 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 rounded-lg font-medium flex items-center transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Product
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <p className="text-red-700 font-medium">Update failed</p>
                <p className="text-red-600 text-sm">{saveError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Image Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Product Image</h2>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Featured</span>
                </div>
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center p-4">
                  {currentProduct.image?.url ? (
                    <img
                      src={currentProduct.image.url}
                      alt={currentProduct.productName}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 text-gray-400 mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">No image available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Stock Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Status & Inventory</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badgeColor}`}>
                  {statusInfo.label}
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Stock Level */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Stock Level</span>
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${stockStatus.bg.replace('bg-', 'bg-gradient-to-r from-').replace('50', '500 to-emerald-500')}`}
                      style={{ 
                        width: `${Math.min(currentProduct.quantityInStock / 100 * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>{currentProduct.quantityInStock} units</span>
                    <span>100+</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-700">
                      {currentProduct.quantityInStock}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">In Stock</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-teal-700">
                      {formatPrice(currentProduct.price)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Price</div>
                  </div>
                </div>

                {/* Expiration Warning */}
                {isExpired && (
                  <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                      <div>
                        <p className="text-red-700 font-medium">Product Expired</p>
                        <p className="text-red-600 text-sm">
                          Expired on {formatDate(currentProduct.expirationDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Low Stock Warning */}
                {currentProduct.quantityInStock > 0 && currentProduct.quantityInStock < 10 && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-3" />
                      <div>
                        <p className="text-amber-700 font-medium">Low Stock Alert</p>
                        <p className="text-amber-600 text-sm">
                          Only {currentProduct.quantityInStock} units remaining
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product ID Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">PRODUCT IDENTIFIERS</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">NDC Number</div>
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 text-gray-400 mr-2" />
                    <code className="font-mono bg-gray-100 px-3 py-1.5 rounded-lg text-gray-800">
                      {currentProduct.ndcNumber}
                    </code>
                    <button className="ml-2 p-1 hover:bg-gray-100 rounded">
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Database ID</div>
                  <div className="flex items-center">
                    <Database className="w-4 h-4 text-gray-400 mr-2" />
                    <code className="font-mono bg-gray-100 px-3 py-1.5 rounded-lg text-gray-800 text-sm">
                      {currentProduct._id.substring(0, 12)}...
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mr-4">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Product Information</h2>
                    <p className="text-gray-600 text-sm mt-1">Complete product details and specifications</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column Fields */}
                  <div className="space-y-6">
                    {/* Product Name */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-2 text-gray-500" />
                          Product Name
                        </div>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="productName"
                          value={editedProduct?.productName || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                          placeholder="Enter product name"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{currentProduct.productName}</span>
                        </div>
                      )}
                    </div>

                    {/* Strength */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-gray-500" />
                          Strength
                        </div>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="strength"
                          value={editedProduct?.strength || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                          placeholder="e.g., 500mg"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{currentProduct.strength}</span>
                        </div>
                      )}
                    </div>

                    {/* Manufacturer */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-500" />
                          Manufacturer
                        </div>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="manufacturer"
                          value={editedProduct?.manufacturer || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                          placeholder="Enter manufacturer name"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{currentProduct.manufacturer}</span>
                        </div>
                      )}
                    </div>

                    {/* Dosage Form */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Layers className="w-4 h-4 mr-2 text-gray-500" />
                          Dosage Form
                        </div>
                      </label>
                      {isEditing ? (
                        <select
                          name="dosageForm"
                          value={editedProduct?.dosageForm || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        >
                          <option value="Tablet">Tablet</option>
                          <option value="Capsule">Capsule</option>
                          <option value="Injection">Injection</option>
                          <option value="Solution">Solution</option>
                          <option value="Suspension">Suspension</option>
                          <option value="Cream">Cream</option>
                          <option value="Ointment">Ointment</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{currentProduct.dosageForm}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column Fields */}
                  <div className="space-y-6">
                    {/* Price */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                          Price (USD)
                        </div>
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            type="number"
                            name="price"
                            value={editedProduct?.price || ''}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0.01"
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                            placeholder="0.00"
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{formatPrice(currentProduct.price)}</span>
                        </div>
                      )}
                    </div>

                    {/* Lot Number */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-gray-500" />
                          Lot Number
                        </div>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lotNumber"
                          value={editedProduct?.lotNumber || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                          placeholder="Enter lot number"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{currentProduct.lotNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Expiration Date */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          Expiration Date
                        </div>
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="expirationDate"
                          value={editedProduct?.expirationDate ? new Date(editedProduct.expirationDate).toISOString().split('T')[0] : ''}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                            isExpired ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <div className={`px-4 py-3 rounded-xl border ${
                          isExpired ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <span className={`font-medium ${isExpired ? 'text-red-700' : 'text-gray-900'}`}>
                            {formatDate(currentProduct.expirationDate)}
                            {isExpired && ' (Expired)'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <ShieldIcon className="w-4 h-4 mr-2 text-gray-500" />
                          Status
                        </div>
                      </label>
                      {isEditing ? (
                        <select
                          name="status"
                          value={editedProduct?.status || 'active'}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      ) : (
                        <div className={`px-4 py-3 rounded-xl border ${statusInfo.border} ${statusInfo.bg}`}>
                          <div className="flex items-center">
                            {statusInfo.icon}
                            <span className={`ml-2 font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock & Packaging Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl mr-4">
                    <Box className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Stock & Packaging</h2>
                    <p className="text-gray-600 text-sm mt-1">Inventory and packaging details</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stock Information */}
                  <div className="space-y-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2 text-gray-500" />
                          Stock Quantity
                        </div>
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="quantityInStock"
                          value={editedProduct?.quantityInStock || ''}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                          placeholder="Enter quantity"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">
                            {currentProduct.quantityInStock} units
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <PackageCheck className="w-4 h-4 mr-2 text-gray-500" />
                          Pack Quantity
                        </div>
                      </label>
                      {isEditing ? (
                        <select
                          name="packQuantity"
                          value={editedProduct?.packQuantity || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        >
                          <option value="Partial">Partial</option>
                          <option value="Full">Full</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{currentProduct.packQuantity}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Layers className="w-4 h-4 mr-2 text-gray-500" />
                          Original Pack Size
                        </div>
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="originalPackSize"
                          value={editedProduct?.originalPackSize || ''}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                          placeholder="Enter pack size"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">
                            {currentProduct.originalPackSize} units
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Packaging Information */}
                  <div className="space-y-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <ShieldCheck className="w-4 h-4 mr-2 text-gray-500" />
                          Package Condition
                        </div>
                      </label>
                      {isEditing ? (
                        <select
                          name="packageCondition"
                          value={editedProduct?.packageCondition || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        >
                          <option value="Open Original Container">Open Original Container</option>
                          <option value="Sealed Original bottle/Torn or label residue">Sealed Original Bottle</option>
                          <option value="Open Original bottle/Torn or label residue">Open Original Bottle</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{currentProduct.packageCondition}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <Thermometer className="w-4 h-4 mr-2 text-gray-500" />
                          Fridge Product
                        </div>
                      </label>
                      {isEditing ? (
                        <select
                          name="isFridgeProduct"
                          value={editedProduct?.isFridgeProduct || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{currentProduct.isFridgeProduct}</span>
                        </div>
                      )}
                    </div>

                    {/* Vendor Information */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <TruckIcon className="w-4 h-4 mr-2 text-gray-500" />
                          Vendor Name
                        </div>
                      </label>
                      <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 font-medium">{currentProduct.vendorName}</span>
                          <button
                            onClick={() => window.open(`/admin/vendors/${currentProduct.vendor}`, '_blank')}
                            className="text-emerald-600 hover:text-emerald-800 flex items-center text-sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-gray-800 to-black rounded-xl mr-4">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
                    <p className="text-gray-600 text-sm mt-1">Product metadata and timestamps</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Timestamps */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Created Date</div>
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(currentProduct.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                      <div className="flex items-center text-gray-700">
                        <RefreshCw className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(currentProduct.updatedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Product Metrics */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Wishlist Count</div>
                      <div className="flex items-center text-gray-700">
                        <Heart className="w-4 h-4 mr-2 text-gray-400" />
                        {currentProduct.wishlistCount || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Sales Count</div>
                      <div className="flex items-center text-gray-700">
                        <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                        {currentProduct.salesCount || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">View Count</div>
                      <div className="flex items-center text-gray-700">
                        <Eye className="w-4 h-4 mr-2 text-gray-400" />
                        {currentProduct.viewCount || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetails;