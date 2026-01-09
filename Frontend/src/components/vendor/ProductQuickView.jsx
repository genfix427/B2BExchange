import React from 'react';
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
  MapPin
} from 'lucide-react';

const ProductQuickView = ({ product, onClose }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusInfo = (status) => {
    const statuses = {
      active: { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" />, label: 'Active' },
      inactive: { color: 'text-gray-600', bg: 'bg-gray-100', icon: <XCircle className="w-4 h-4" />, label: 'Inactive' },
      out_of_stock: { color: 'text-red-600', bg: 'bg-red-100', icon: <AlertCircle className="w-4 h-4" />, label: 'Out of Stock' }
    };
    return statuses[status] || statuses.inactive;
  };
  
  const statusInfo = getStatusInfo(product.status);
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Basic Info */}
            <div>
              {/* Product Image */}
              <div className="mb-6">
                {product.image?.url ? (
                  <div className="relative h-64 w-full">
                    <img
                      src={product.image.url}
                      alt={product.productName}
                      className="w-full h-full object-contain rounded-lg border"
                    />
                  </div>
                ) : (
                  <div className="h-64 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">NDC Number</span>
                      <span className="text-sm font-mono font-medium">{product.ndcNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Product Name</span>
                      <span className="text-sm font-medium">{product.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Strength</span>
                      <span className="text-sm font-medium">{product.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dosage Form</span>
                      <span className="text-sm font-medium">{product.dosageForm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Manufacturer</span>
                      <span className="text-sm font-medium">{product.manufacturer}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Detailed Info */}
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.icon}
                  <span className="ml-1">{statusInfo.label}</span>
                </span>
              </div>
              
              {/* Stock Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Box className="w-4 h-4 mr-2" />
                  Stock Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity in Stock</span>
                    <span className="text-sm font-medium">{product.quantityInStock} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pack Quantity</span>
                    <span className="text-sm font-medium capitalize">{product.packQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Original Pack Size</span>
                    <span className="text-sm font-medium">{product.originalPackSize}</span>
                  </div>
                </div>
              </div>
              
              {/* Pricing Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pricing Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lot Number</span>
                    <span className="text-sm font-medium font-mono">{product.lotNumber}</span>
                  </div>
                </div>
              </div>
              
              {/* Packaging Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Packaging Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Package Condition</span>
                    <span className="text-sm font-medium">{product.packageCondition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fridge Product</span>
                    <span className="text-sm font-medium">{product.isFridgeProduct}</span>
                  </div>
                </div>
              </div>
              
              {/* Dates */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Dates
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expiration Date</span>
                    <span className={`text-sm font-medium ${new Date(product.expirationDate) < new Date() ? 'text-red-600' : ''}`}>
                      {formatDate(product.expirationDate)}
                      {new Date(product.expirationDate) < new Date() && ' (Expired)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm">{formatDate(product.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              {/* Vendor Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Vendor Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vendor Name</span>
                    <span className="text-sm font-medium">{product.vendorName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;