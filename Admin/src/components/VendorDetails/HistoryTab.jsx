import React from 'react'
import { History } from 'lucide-react'

const HistoryTab = ({ vendor }) => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <History className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Activity History</h3>
        <p className="mt-1 text-sm text-gray-500">
          Activity tracking system under development.
        </p>
      </div>
    </div>
  )
}

export default HistoryTab