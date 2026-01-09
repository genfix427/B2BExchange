import React from 'react'
import { X, Eye, Download } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

const LicenseDetailsModal = ({
  selectedLicense,
  setSelectedLicense,
  getDocumentIcon
}) => {
  if (!selectedLicense) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{selectedLicense.type} Details</h3>
          <button
            onClick={() => setSelectedLicense(null)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">License Number</label>
            <p className="mt-1 text-sm text-gray-900">{selectedLicense.number}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              selectedLicense.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {selectedLicense.status}
            </span>
          </div>

          {selectedLicense.state && (
            <div>
              <label className="block text-sm font-medium text-gray-500">State/Region</label>
              <p className="mt-1 text-sm text-gray-900">{selectedLicense.state}</p>
            </div>
          )}

          {selectedLicense.expiration && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Expiration Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {format(new Date(selectedLicense.expiration), 'MMMM d, yyyy')}
              </p>
              <p className={`mt-1 text-xs ${
                new Date(selectedLicense.expiration) > new Date()
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {new Date(selectedLicense.expiration) > new Date()
                  ? `Expires in ${formatDistanceToNow(new Date(selectedLicense.expiration))}`
                  : `Expired ${formatDistanceToNow(new Date(selectedLicense.expiration))} ago`
                }
              </p>
            </div>
          )}

          {selectedLicense.category && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Category</label>
              <p className="mt-1 text-sm text-gray-900">{selectedLicense.category}</p>
            </div>
          )}

          {selectedLicense.document && (
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-500">Supporting Document</label>
              <div className="mt-2 flex items-center">
                {getDocumentIcon(selectedLicense.document)}
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">
                    {selectedLicense.document.name || selectedLicense.document.documentType}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewDocument(selectedLicense.document)}
                    className="text-blue-600 hover:text-blue-500 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadDocument(selectedLicense.document)}
                    className="text-gray-600 hover:text-gray-500 text-sm"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setSelectedLicense(null)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LicenseDetailsModal