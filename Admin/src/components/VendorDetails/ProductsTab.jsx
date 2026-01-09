import React from 'react'
import { Package } from 'lucide-react'
import VendorAdminProductsList from '../../components/vendors/VendorAdminProductsList'

const ProductsTab = ({ vendor }) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Products</h3>
        <p className="text-sm text-gray-600 mt-1">
          Products offered by {vendor.pharmacyInfo?.legalBusinessName || 'this vendor'}
        </p>
      </div>
      <VendorAdminProductsList />
    </div>
  )
}

export default ProductsTab