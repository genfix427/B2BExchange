import React from 'react';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';

const ProductItem = ({ product }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  };

  const isExpired = (expirationDate) => {
    return new Date(expirationDate) < new Date()
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
      <div className="flex items-center">
        {product.image?.url ? (
          <img
            src={product.image.url}
            alt={product.productName}
            className="h-10 w-10 rounded object-cover mr-3"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-3">
            <Package className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {product.productName}
          </p>
          <div className="flex items-center mt-1 space-x-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
              {product.status === 'active' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {product.status.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500">
              Stock: {product.quantityInStock}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {formatPrice(product.price)}
        </p>
        <p className={`text-xs ${isExpired(product.expirationDate) ? 'text-red-600' : 'text-gray-500'}`}>
          {isExpired(product.expirationDate) ? 'Expired' : 'Valid'}
        </p>
      </div>
    </div>
  );
};

export default ProductItem;