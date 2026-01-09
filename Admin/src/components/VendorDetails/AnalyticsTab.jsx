import React from 'react'
import { BarChart } from 'lucide-react'

const AnalyticsTab = ({ vendor }) => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <BarChart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Vendor Analytics</h3>
        <p className="mt-1 text-sm text-gray-500">
          Analytics dashboard will be available soon.
        </p>
      </div>
    </div>
  )
}

export default AnalyticsTab