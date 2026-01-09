import React from 'react'

const RejectModal = ({
  showRejectModal,
  setShowRejectModal,
  rejectionReason,
  setRejectionReason,
  handleReject
}) => {
  if (!showRejectModal) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Vendor</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please provide a detailed reason for rejection:
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter detailed rejection reason (minimum 10 characters)..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {rejectionReason.length}/10 characters minimum
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowRejectModal(false)
              setRejectionReason('')
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={rejectionReason.trim().length < 10}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  )
}

export default RejectModal