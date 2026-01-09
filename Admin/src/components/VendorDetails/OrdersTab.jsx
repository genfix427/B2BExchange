import React from 'react'
import { ShoppingCart } from 'lucide-react'

const OrdersTab = ({ vendor }) => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Order History</h3>
        <p className="mt-1 text-sm text-gray-500">
          Order management system integration in progress.
        </p>
      </div>
    </div>
  )
}

export default OrdersTab