// components/admin/AdminProductQuickView.jsx
import React, { useState } from 'react';
import {
  X,
  Package,
  Calendar,
  DollarSign,
  Hash,
  Box,
  Thermometer,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Edit2,
  Save,
  Loader2,
  AlertTriangle,
  Info,
  Truck,
  Shield,
  FileText,
  Tag,
  Layers,
  Database,
  Clock,
  Eye
} from 'lucide-react';
import { productService } from '../../services/product.service';

const AdminProductQuickView = ({ product, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ ...product });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

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
    // Determine actual status based on stock
    const actualStatus = stock <= 0 ? 'out_of_stock' : status;
    
    const statuses = {
      active: {
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Active',
        description: stock < 10 ? `Low stock (${stock} left)` : 'Available for sale'
      },
      inactive: {
        color: 'text-gray-700',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Inactive',
        description: 'Not available for sale'
      },
      out_of_stock: {
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Out of Stock',
        description: 'No inventory available'
      }
    };
    return statuses[actualStatus] || statuses.inactive;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    
    if (type === 'number') {
      newValue = parseFloat(value) || 0;
    }
    
    setEditedProduct(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveError('');
    
    try {
      // Prepare form data for update
      const formData = new FormData();
      
      // Add all fields except image (for now)
      Object.keys(editedProduct).forEach(key => {
        if (key !== 'image' && key !== '_id' && key !== '__v') {
          formData.append(key, editedProduct[key]);
        }
      });
      
      // Update product via admin API
      const response = await productService.updateProductAdmin(product._id, editedProduct);
      
      setSaveSuccess(true);
      onUpdate(response); // Notify parent of update
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to update product:', error);
      setSaveError(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = getStatusInfo(product.status, product.quantityInStock);
  const isExpired = new Date(product.expirationDate) < new Date();

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
                <p className="text-sm text-gray-500">View and manage product information</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  {saveSuccess && (
                    <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Saved successfully!</span>
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
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
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Product
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {saveError && (
          <div className="px-6 pt-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-red-700 font-medium">Update failed</p>
                  <p className="text-red-600 text-sm">{saveError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Image and Status */}
            <div className="lg:col-span-1 space-y-6">
              {/* Product Image */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="aspect-square relative">
                  {product.image?.url ? (
                    <>
                      <img
                        src={product.image.url}
                        alt={product.productName}
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-gray-900/10 rounded-lg"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <Package className="h-16 w-16 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No image available</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">{product.quantityInStock}</div>
                    <div className="text-xs text-gray-500 mt-1">In Stock</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</div>
                    <div className="text-xs text-gray-500 mt-1">Price</div>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className={`rounded-xl p-5 border ${statusInfo.border} ${statusInfo.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {statusInfo.icon}
                    <span className={`ml-2 font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  {product.quantityInStock < 10 && product.quantityInStock > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Low Stock
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">{statusInfo.description}</p>
                
                {isExpired && (
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700 font-medium">Product has expired</span>
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Hash className="w-4 h-4 mr-2" />
                  <span className="font-medium mr-2">NDC:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{product.ndcNumber}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Database className="w-4 h-4 mr-2" />
                  <span className="font-medium mr-2">ID:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{product._id.substring(0, 8)}...</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium mr-2">Created:</span>
                  <span>{formatDate(product.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Information */}
                <div className="space-y-5">
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Product Information</h3>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                          <input
                            type="text"
                            name="productName"
                            value={editedProduct.productName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
                          <input
                            type="text"
                            name="strength"
                            value={editedProduct.strength}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form</label>
                          <select
                            name="dosageForm"
                            value={editedProduct.dosageForm}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <InfoRow label="Product Name" value={product.productName} />
                        <InfoRow label="Strength" value={product.strength} />
                        <InfoRow label="Dosage Form" value={product.dosageForm} />
                        <InfoRow label="Manufacturer" value={product.manufacturer} />
                      </div>
                    )}
                  </div>

                  {/* Pricing Information */}
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Pricing Information</h3>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                          <input
                            type="number"
                            name="price"
                            value={editedProduct.price}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            name="quantityInStock"
                            value={editedProduct.quantityInStock}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <InfoRow label="Price" value={formatPrice(product.price)} />
                        <InfoRow label="Lot Number" value={product.lotNumber} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock & Packaging */}
                <div className="space-y-5">
                  {/* Stock Information */}
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Box className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Stock Information</h3>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            name="status"
                            value={editedProduct.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="out_of_stock">Out of Stock</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pack Quantity</label>
                          <select
                            name="packQuantity"
                            value={editedProduct.packQuantity}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Partial">Partial</option>
                            <option value="Full">Full</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Original Pack Size</label>
                          <input
                            type="number"
                            name="originalPackSize"
                            value={editedProduct.originalPackSize}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <InfoRow label="Stock Quantity" value={`${product.quantityInStock} units`} />
                        <InfoRow label="Pack Quantity" value={product.packQuantity} />
                        <InfoRow label="Original Pack Size" value={product.originalPackSize} />
                      </div>
                    )}
                  </div>

                  {/* Packaging Information */}
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                        <Layers className="w-4 h-4 text-yellow-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Packaging Information</h3>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Package Condition</label>
                          <select
                            name="packageCondition"
                            value={editedProduct.packageCondition}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Open Original Container">Open Original Container</option>
                            <option value="Sealed Original bottle/Torn or label residue">Sealed Original bottle</option>
                            <option value="Open Original bottle/Torn or label residue">Open Original bottle</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fridge Product</label>
                          <select
                            name="isFridgeProduct"
                            value={editedProduct.isFridgeProduct}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <InfoRow label="Package Condition" value={product.packageCondition} />
                        <InfoRow label="Fridge Product" value={product.isFridgeProduct} />
                        <InfoRow label="Expiration Date" 
                          value={
                            <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                              {formatDate(product.expirationDate)}
                              {isExpired && ' (Expired)'}
                            </span>
                          } 
                        />
                      </div>
                    )}
                  </div>

                  {/* Vendor Information */}
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                        <Truck className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Vendor Information</h3>
                    </div>
                    <InfoRow label="Vendor Name" value={product.vendorName} />
                    <div className="mt-3">
                      <button
                        onClick={() => window.open(`/admin/vendors/${product.vendor}`, '_blank')}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Vendor Profile
                      </button>
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

// Helper component for info rows
const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <div className="flex items-center">
      {icon}
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

export default AdminProductQuickView;