// src/components/VendorDetails/DocumentsTab.jsx
import React from 'react'

const DocumentsTab = ({
  documents,
  getDocumentIcon,
  viewDocument,
  downloadDocument,
  handleDownloadAllDocuments
}) => {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Documents</h2>
        <button
          onClick={handleDownloadAllDocuments}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Download All
        </button>
      </div>

      {documents.length === 0 ? (
        <p className="text-gray-500">No documents available</p>
      ) : (
        <ul className="divide-y">
          {documents.map((doc, index) => {
            const Icon = getDocumentIcon(doc)
            return (
              <li key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Icon />
                  <span className="text-sm font-medium">
                    {doc.name || doc.documentType || 'Document'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewDocument(doc)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => downloadDocument(doc)}
                    className="text-gray-600 text-sm hover:underline"
                  >
                    Download
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default DocumentsTab
