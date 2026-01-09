import React from 'react'

const SuspendModal = ({
  showSuspendModal,
  setShowSuspendModal,
  suspensionReason,
  setSuspensionReason,
  handleSuspend
}) => {
  if (!showSuspendModal) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Suspend Vendor</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please provide a reason for suspension:
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            value={suspensionReason}
            onChange={(e) => setSuspensionReason(e.target.value)}
            placeholder="Enter suspension reason (minimum 5 characters)..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {suspensionReason.length}/5 characters minimum
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowSuspendModal(false)
              setSuspensionReason('')
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSuspend}
            disabled={suspensionReason.trim().length < 5}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Suspension
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuspendModal