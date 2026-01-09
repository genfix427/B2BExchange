import React from 'react'

const ReactivateModal = ({
  showReactivateModal,
  setShowReactivateModal,
  handleReactivate
}) => {
  if (!showReactivateModal) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reactivate Vendor</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to reactivate this vendor? This will restore their account access immediately.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowReactivateModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReactivate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Confirm Reactivation
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReactivateModal