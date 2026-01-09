import React from 'react'
import { X, Download, ExternalLink, FileText } from 'lucide-react'

const DocumentViewer = ({
  viewingDocument,
  showDocumentViewer,
  setShowDocumentViewer,
  getDocumentIcon,
  downloadDocument
}) => {
  if (!viewingDocument || !showDocumentViewer) return null

  const fileUrl = viewingDocument.url || viewingDocument.fileUrl
  const fileName = viewingDocument.name || viewingDocument.documentType || 'Document'
  const fileType = fileName.toLowerCase()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            {getDocumentIcon(viewingDocument)}
            <h3 className="ml-3 text-lg font-medium text-gray-900">{fileName}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => downloadDocument(viewingDocument)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={() => {
                setShowDocumentViewer(false)
                setViewingDocument(null)
              }}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 h-[calc(90vh-120px)] overflow-auto">
          {fileUrl.includes('.pdf') ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={fileName}
            />
          ) : fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-16 h-16 mb-4" />
              <p className="text-lg mb-2">Document Preview Not Available</p>
              <p className="text-sm mb-4">This file type cannot be previewed in the browser</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentViewer