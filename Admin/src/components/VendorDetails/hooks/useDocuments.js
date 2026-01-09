import { useState } from 'react'
import { downloadAllDocuments } from '../../../store/slices/vendorSlice'

export const useDocuments = (selectedVendor, dispatch, id) => {
  const [viewingDocument, setViewingDocument] = useState(null)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)

  const getDocumentList = () => {
    if (!selectedVendor?.documents) return []
    return Array.isArray(selectedVendor.documents) ? selectedVendor.documents : []
  }

  const getDocumentType = (document) => {
    const fileName = document.name || document.documentType || ''
    const fileType = fileName.toLowerCase()
    const fileUrl = document.url || document.fileUrl || ''

    if (fileType.includes('.pdf') || fileUrl.includes('.pdf')) {
      return { type: 'pdf', color: 'red' }
    } else if (fileType.includes('.jpg') || fileType.includes('.jpeg') || 
               fileType.includes('.png') || fileUrl.includes('.jpg') || 
               fileUrl.includes('.jpeg') || fileUrl.includes('.png')) {
      return { type: 'image', color: 'blue' }
    } else if (fileType.includes('.doc') || fileType.includes('.docx') ||
               fileUrl.includes('.doc') || fileUrl.includes('.docx')) {
      return { type: 'doc', color: 'blue' }
    } else {
      return { type: 'file', color: 'gray' }
    }
  }

  const viewDocument = (document) => {
    const fileUrl = document.url || document.fileUrl
    if (fileUrl) {
      setViewingDocument(document)
      setShowDocumentViewer(true)
    } else {
      alert('Document URL not available')
    }
  }

  const downloadDocument = (doc) => {
    const fileUrl = doc.url || doc.fileUrl
    if (!fileUrl) {
      alert('Document URL not available')
      return
    }

    const link = window.document.createElement('a')
    link.href = fileUrl
    link.download = doc.name || doc.documentType || 'document'
    link.target = '_blank'
    link.rel = 'noopener noreferrer'

    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const handleDownloadAllDocuments = () => {
    if (id) {
      dispatch(downloadAllDocuments(id))
        .then((response) => {
          if (response.payload?.url) {
            const link = document.createElement('a')
            link.href = response.payload.url
            link.download = `vendor_${id}_documents.zip`
            link.target = '_blank'
            link.rel = 'noopener noreferrer'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        })
        .catch(error => {
          console.error('Error downloading documents:', error)
          alert('Error downloading documents. Please try again.')
        })
    }
  }

  return {
    documents: getDocumentList(),
    getDocumentType,
    viewDocument,
    downloadDocument,
    viewingDocument,
    setViewingDocument,
    showDocumentViewer,
    setShowDocumentViewer,
    handleDownloadAllDocuments
  }
}