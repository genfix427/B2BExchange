import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchVendorDetails,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor,
  downloadAllDocuments 
} from '../../store/slices/vendorSlice'
import { 
  Upload, 
  Eye, 
  Download,
  FileDown,
  FileText,
  ExternalLink,
  FileImage,
  File,
  X
} from 'lucide-react';
import {
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  MoreVertical,
  Lock,
  Unlock,
  Clock,
  FileCheck,
  Store,
  BarChart,
  History,
  MapPin as MapPinIcon,
  Users as UsersIcon,
  Briefcase,
  PauseCircle,
  Edit,
  Globe,
  Tag,
  Award,
  Star,
  TrendingUp,
  Copy,
  Share2,
  Printer,
  MessageSquare,
  Bell
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import VendorAdminProductsList from '../../components/vendors/VendorAdminProductsList';

const VendorDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedVendor, isLoading, error } = useSelector((state) => state.vendors)
  
  const [activeTab, setActiveTab] = useState('info')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [viewingDocument, setViewingDocument] = useState(null)
  const [selectedLicense, setSelectedLicense] = useState(null)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchVendorDetails(id))
    }
  }, [dispatch, id])

  const handleApprove = () => {
    if (window.confirm('Are you sure you want to approve this vendor?')) {
      dispatch(approveVendor(id))
        .then(() => {
          alert('Vendor approved successfully!')
          dispatch(fetchVendorDetails(id))
        })
        .catch(error => {
          alert(`Error: ${error.message}`)
        })
    }
  }

  const handleReject = () => {
    if (rejectionReason.trim().length < 10) {
      alert('Please provide a detailed rejection reason (minimum 10 characters)')
      return
    }
    dispatch(rejectVendor({ vendorId: id, rejectionReason }))
      .then(() => {
        alert('Vendor rejected successfully!')
        setShowRejectModal(false)
        setRejectionReason('')
        dispatch(fetchVendorDetails(id))
      })
      .catch(error => {
        alert(`Error: ${error.message}`)
      })
  }

  const handleSuspend = () => {
    if (suspensionReason.trim().length < 5) {
      alert('Please provide a suspension reason (minimum 5 characters)')
      return
    }
    dispatch(suspendVendor({ vendorId: id, reason: suspensionReason }))
      .then(() => {
        alert('Vendor suspended successfully!')
        setShowSuspendModal(false)
        setSuspensionReason('')
        dispatch(fetchVendorDetails(id))
      })
      .catch(error => {
        alert(`Error: ${error.message}`)
      })
  }

  const handleReactivate = () => {
    if (window.confirm('Are you sure you want to reactivate this vendor?')) {
      dispatch(reactivateVendor(id))
        .then(() => {
          alert('Vendor reactivated successfully!')
          setShowReactivateModal(false)
          dispatch(fetchVendorDetails(id))
        })
        .catch(error => {
          alert(`Error: ${error.message}`)
        })
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
      suspended: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <PauseCircle className="w-4 h-4" /> }
    }
    return colors[status] || colors.pending
  }

  const formatAddress = (address) => {
    if (!address) return 'N/A'
    const parts = [
      address.line1 || address.address1,
      address.line2 || address.address2,
      address.city,
      address.state,
      address.zipCode || address.zip,
      address.country
    ].filter(Boolean)
    return parts.join(', ')
  }

  // Get document count
  const getDocumentCount = () => {
    if (!selectedVendor?.documents) return 0
    return Array.isArray(selectedVendor.documents) ? selectedVendor.documents.length : 0
  }

  // Get document list
  const getDocumentList = () => {
    if (!selectedVendor?.documents) return []
    return Array.isArray(selectedVendor.documents) ? selectedVendor.documents : []
  }

  // Get all licenses and regulatory information
  const getAllLicenses = () => {
    const licenses = []
    
    // DEA License
    if (selectedVendor.pharmacyLicense?.deaNumber) {
      licenses.push({
        type: 'DEA License',
        number: selectedVendor.pharmacyLicense.deaNumber,
        expiration: selectedVendor.pharmacyLicense.deaExpirationDate,
        state: selectedVendor.pharmacyLicense.deaState,
        status: selectedVendor.pharmacyLicense.deaExpirationDate && 
               new Date(selectedVendor.pharmacyLicense.deaExpirationDate) > new Date() ? 
               'Active' : 'Expired',
        category: 'Federal'
      })
    }
    
    // State Pharmacy License
    if (selectedVendor.pharmacyLicense?.stateLicenseNumber) {
      licenses.push({
        type: 'State Pharmacy License',
        number: selectedVendor.pharmacyLicense.stateLicenseNumber,
        expiration: selectedVendor.pharmacyLicense.stateLicenseExpirationDate,
        state: selectedVendor.pharmacyLicense.stateLicenseState,
        status: selectedVendor.pharmacyLicense.stateLicenseExpirationDate && 
               new Date(selectedVendor.pharmacyLicense.stateLicenseExpirationDate) > new Date() ? 
               'Active' : 'Expired',
        category: 'State'
      })
    }
    
    // NPI Number
    if (selectedVendor.pharmacyInfo?.npiNumber) {
      licenses.push({
        type: 'NPI Number',
        number: selectedVendor.pharmacyInfo.npiNumber,
        expiration: null,
        state: 'National',
        status: 'Active',
        category: 'Federal'
      })
    }
    
    // Federal EIN
    if (selectedVendor.pharmacyInfo?.federalEIN) {
      licenses.push({
        type: 'Federal EIN',
        number: selectedVendor.pharmacyInfo.federalEIN,
        expiration: null,
        state: 'Federal',
        status: 'Active',
        category: 'Federal'
      })
    }
    
    // State Business License
    if (selectedVendor.pharmacyLicense?.businessLicenseNumber) {
      licenses.push({
        type: 'Business License',
        number: selectedVendor.pharmacyLicense.businessLicenseNumber,
        expiration: selectedVendor.pharmacyLicense.businessLicenseExpirationDate,
        state: selectedVendor.pharmacyLicense.businessLicenseState,
        status: selectedVendor.pharmacyLicense.businessLicenseExpirationDate && 
               new Date(selectedVendor.pharmacyLicense.businessLicenseExpirationDate) > new Date() ? 
               'Active' : 'Expired',
        category: 'Business'
      })
    }
    
    // Controlled Substance License
    if (selectedVendor.pharmacyLicense?.controlledSubstanceLicenseNumber) {
      licenses.push({
        type: 'Controlled Substance License',
        number: selectedVendor.pharmacyLicense.controlledSubstanceLicenseNumber,
        expiration: selectedVendor.pharmacyLicense.controlledSubstanceLicenseExpirationDate,
        state: selectedVendor.pharmacyLicense.controlledSubstanceLicenseState,
        status: selectedVendor.pharmacyLicense.controlledSubstanceLicenseExpirationDate && 
               new Date(selectedVendor.pharmacyLicense.controlledSubstanceLicenseExpirationDate) > new Date() ? 
               'Active' : 'Expired',
        category: 'Federal'
      })
    }
    
    // Additional licenses from documents
    if (selectedVendor.documents) {
      selectedVendor.documents.forEach((doc) => {
        if (doc.documentType?.toLowerCase().includes('license')) {
          licenses.push({
            type: doc.documentType || 'License',
            number: doc.licenseNumber || 'Not specified',
            expiration: doc.expirationDate,
            state: doc.state || 'Not specified',
            status: doc.expirationDate && new Date(doc.expirationDate) > new Date() ? 'Active' : 'Expired',
            category: 'Other',
            document: doc
          })
        }
      })
    }
    
    return licenses
  }

  // Get document icon based on file type
  const getDocumentIcon = (document) => {
    const fileName = document.name || document.documentType || ''
    const fileType = fileName.toLowerCase()
    const fileUrl = document.url || document.fileUrl || ''
    
    if (fileType.includes('.pdf') || fileUrl.includes('.pdf')) {
      return <FileText className="w-6 h-6 text-red-500" />
    } else if (fileType.includes('.jpg') || fileType.includes('.jpeg') || 
               fileType.includes('.png') || fileUrl.includes('.jpg') || 
               fileUrl.includes('.jpeg') || fileUrl.includes('.png')) {
      return <FileImage className="w-6 h-6 text-blue-500" />
    } else if (fileType.includes('.doc') || fileType.includes('.docx') ||
               fileUrl.includes('.doc') || fileUrl.includes('.docx')) {
      return <FileText className="w-6 h-6 text-blue-600" />
    } else {
      return <File className="w-6 h-6 text-gray-500" />
    }
  }

  // View single document
  const viewDocument = (document) => {
    const fileUrl = document.url || document.fileUrl
    if (fileUrl) {
      setViewingDocument(document)
      setShowDocumentViewer(true)
    } else {
      alert('Document URL not available')
    }
  }

  // Download single document
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


  // Download all documents
  const handleDownloadAllDocuments = () => {
    if (id) {
      dispatch(downloadAllDocuments(id))
        .then((response) => {
          if (response.payload?.url) {
            // Create a temporary anchor element for download
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

  // Render document viewer
  const renderDocumentViewer = () => {
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

  // Render license details modal
  const renderLicenseDetails = () => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading vendor details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading vendor</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => navigate('/admin/vendors')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vendors
        </button>
      </div>
    )
  }

  if (!selectedVendor) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Vendor not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested vendor could not be found.</p>
        <button
          onClick={() => navigate('/admin/vendors')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vendors
        </button>
      </div>
    )
  }

  const { bg: statusBg, text: statusText, icon: StatusIcon } = getStatusColor(selectedVendor.status)
  const documents = getDocumentList()
  const licenses = getAllLicenses()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/vendors')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedVendor.pharmacyInfo?.legalBusinessName || 'Unnamed Vendor'}
            </h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBg} ${statusText}`}>
                {StatusIcon}
                <span className="ml-1">{selectedVendor.status?.charAt(0).toUpperCase() + selectedVendor.status?.slice(1)}</span>
              </span>
              <span className="text-sm text-gray-500">
                ID: {selectedVendor._id?.slice(-8)}
              </span>
              {selectedVendor.email && (
                <span className="text-sm text-gray-500">
                  • {selectedVendor.email}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {selectedVendor.status === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
            </>
          )}
          {selectedVendor.status === 'approved' && (
            <button
              onClick={() => setShowSuspendModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Suspend
            </button>
          )}
          {selectedVendor.status === 'suspended' && (
            <button
              onClick={() => setShowReactivateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Reactivate
            </button>
          )}
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Licenses</p>
              <p className="text-xl font-bold text-gray-900">{licenses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Registered</p>
              <p className="text-sm font-bold text-gray-900">
                {selectedVendor.registeredAt ? 
                  format(new Date(selectedVendor.registeredAt), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{selectedVendor.status}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Building className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Locations</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedVendor.pharmacyQuestions?.numberOfLocations || 1}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Star className="w-6 h-6 text-pink-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rating</p>
              <p className="text-xl font-bold text-gray-900">4.8/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'info', label: 'Information', icon: Briefcase },
            { id: 'documents', label: 'Documents', icon: FileText, badge: documents.length },
            { id: 'licenses', label: 'Licenses', icon: Shield, badge: licenses.length },
            { id: 'contacts', label: 'Contacts', icon: UsersIcon },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'analytics', label: 'Analytics', icon: BarChart },
            { id: 'history', label: 'History', icon: History }
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
              {badge && (
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Information Tab */}
        {activeTab === 'info' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Business Information */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-gray-500" />
                    Business Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Legal Business Name</label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                          {selectedVendor.pharmacyInfo?.legalBusinessName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">DBA Name</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyInfo?.dba || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">NPI Number</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyInfo?.npiNumber || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Federal EIN</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyInfo?.federalEIN || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        Business Address
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatAddress(selectedVendor.pharmacyInfo?.businessAddress || selectedVendor.pharmacyInfo?.shippingAddress)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-500" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Owner Name</label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                          {selectedVendor.pharmacyOwner?.firstName || ''} {selectedVendor.pharmacyOwner?.lastName || ''}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Title</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.title || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.email || selectedVendor.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          Phone
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVendor.pharmacyOwner?.phone || selectedVendor.pharmacyOwner?.mobile || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Account Status */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-gray-500" />
                    Account Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBg} ${statusText}`}>
                        {StatusIcon}
                        <span className="ml-1">{selectedVendor.status?.charAt(0).toUpperCase() + selectedVendor.status?.slice(1)}</span>
                      </span>
                    </div>
                    
                    {selectedVendor.registeredAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Registered
                        </span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.registeredAt), 'MMM d, yyyy')}
                          <span className="ml-2 text-xs text-gray-400">
                            ({formatDistanceToNow(new Date(selectedVendor.registeredAt), { addSuffix: true })})
                          </span>
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.approvedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Approved Date</span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.approvedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.approvedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Approved By</span>
                        <span className="text-sm text-gray-900">
                          {selectedVendor.approvedBy?.firstName} {selectedVendor.approvedBy?.lastName}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.suspendedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Suspended Date</span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.suspendedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.suspensionReason && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Suspension Reason</span>
                        <span className="text-sm text-gray-900">
                          {selectedVendor.suspensionReason}
                        </span>
                      </div>
                    )}
                    
                    {selectedVendor.lastLoginAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Login</span>
                        <span className="text-sm text-gray-900">
                          {format(new Date(selectedVendor.lastLoginAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* License Summary */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileCheck className="w-5 h-5 mr-2 text-gray-500" />
                    License Summary
                  </h3>
                  <div className="space-y-3">
                    {licenses.length > 0 ? (
                      licenses.slice(0, 3).map((license, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => setSelectedLicense(license)}
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{license.type}</p>
                            <p className="text-sm text-gray-500">{license.number}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              license.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {license.status}
                            </span>
                            {license.expiration && (
                              <p className="text-xs text-gray-500 mt-1">
                                Expires: {format(new Date(license.expiration), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No license information available</p>
                    )}
                    {licenses.length > 3 && (
                      <button
                        onClick={() => setActiveTab('licenses')}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-500 py-2"
                      >
                        View all {licenses.length} licenses →
                      </button>
                    )}
                  </div>
                </div>

                {/* Business Details */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Store className="w-5 h-5 mr-2 text-gray-500" />
                    Business Details
                  </h3>
                  <div className="space-y-2">
                    {selectedVendor.pharmacyQuestions?.enterpriseType && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Enterprise Type</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.enterpriseType}</span>
                      </div>
                    )}
                    {selectedVendor.pharmacyQuestions?.pharmacyType && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pharmacy Type</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.pharmacyType}</span>
                      </div>
                    )}
                    {selectedVendor.pharmacyQuestions?.numberOfLocations && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Number of Locations</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.numberOfLocations}</span>
                      </div>
                    )}
                    {selectedVendor.pharmacyQuestions?.pharmacySoftware && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pharmacy Software</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.pharmacySoftware}</span>
                      </div>
                    )}
                    {selectedVendor.pharmacyQuestions?.primaryWholesaler && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Primary Wholesaler</span>
                        <span className="text-sm text-gray-900">{selectedVendor.pharmacyQuestions.primaryWholesaler}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Documents & Files</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => alert('Upload functionality coming soon')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New
                </button>
                <button 
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleDownloadAllDocuments}
                  disabled={documents.length === 0}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download All
                </button>
              </div>
            </div>
            
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getDocumentIcon(doc)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.name || doc.documentType || `Document ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {doc.documentType && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mr-2">
                              {doc.documentType}
                            </span>
                          )}
                          {doc.uploadedAt ? format(new Date(doc.uploadedAt), 'MMM d, yyyy') : 'Recently'}
                        </p>
                        {doc.size && (
                          <p className="text-xs text-gray-400 mt-1">
                            Size: {doc.size}
                          </p>
                        )}
                        <div className="mt-3 flex items-center space-x-3">
                          <button
                            onClick={() => viewDocument(doc)}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => downloadDocument(doc)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The vendor has not uploaded any documents.
                </p>
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Request Documents
                </button>
              </div>
            )}
          </div>
        )}

        {/* Licenses Tab */}
        {activeTab === 'licenses' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Licenses & Regulatory Information</h3>
              <p className="text-sm text-gray-600 mt-1">
                {licenses.length} license{licenses.length !== 1 ? 's' : ''} and regulatory documents
              </p>
            </div>
            
            {licenses.length > 0 ? (
              <div className="space-y-4">
                {/* Group licenses by category */}
                {['Federal', 'State', 'Business', 'Other'].map((category) => {
                  const categoryLicenses = licenses.filter(license => license.category === category)
                  if (categoryLicenses.length === 0) return null
                  
                  return (
                    <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3">
                        <h4 className="text-sm font-medium text-gray-900">{category} Licenses</h4>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {categoryLicenses.map((license, index) => (
                          <div 
                            key={index} 
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedLicense(license)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{license.type}</p>
                                <p className="text-sm text-gray-500">{license.number}</p>
                                {license.state && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    <MapPinIcon className="w-3 h-3 inline mr-1" />
                                    {license.state}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  license.status === 'Active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {license.status}
                                </span>
                                {license.expiration && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Expires: {format(new Date(license.expiration), 'MMM d, yyyy')}
                                  </p>
                                )}
                              </div>
                            </div>
                            {license.document && (
                              <div className="mt-3 flex items-center text-sm text-gray-500">
                                {getDocumentIcon(license.document)}
                                <span className="ml-2 truncate">
                                  {license.document.name || license.document.documentType}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No licenses found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No license information has been provided by this vendor.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Contact */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedVendor.pharmacyOwner?.firstName || ''} {selectedVendor.pharmacyOwner?.lastName || ''}
                      </p>
                      <p className="text-sm text-gray-500">{selectedVendor.pharmacyOwner?.title || 'Owner'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-900">{selectedVendor.pharmacyOwner?.email || selectedVendor.email}</p>
                      <p className="text-xs text-gray-500">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {selectedVendor.pharmacyOwner?.phone || selectedVendor.pharmacyOwner?.mobile || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Phone</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Contacts */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Contacts</h3>
                <div className="space-y-4">
                  {selectedVendor.additionalContacts && selectedVendor.additionalContacts.length > 0 ? (
                    selectedVendor.additionalContacts.map((contact, index) => (
                      <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0">
                        <div className="flex items-center">
                          <UsersIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{contact.title || 'Contact'}</p>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          {contact.email && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <Mail className="w-3 h-3 mr-2" />
                              {contact.email}
                            </p>
                          )}
                          {contact.phone && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <Phone className="w-3 h-3 mr-2" />
                              {contact.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No additional contacts</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Tab */}
        {activeTab === 'products' && (
          <div className="p-6">
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <VendorAdminProductsList />
            </div>
          </div>
        )}
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-6">
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Order History</h3>
              <p className="mt-1 text-sm text-gray-500">
                Order management system integration in progress.
              </p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="text-center py-12">
              <BarChart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Vendor Analytics</h3>
              <p className="mt-1 text-sm text-gray-500">
                Analytics dashboard will be available soon.
              </p>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="p-6">
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Activity History</h3>
              <p className="mt-1 text-sm text-gray-500">
                Activity tracking system under development.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Reject Modal */}
      {showRejectModal && (
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
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
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
      )}

      {/* Reactivate Modal */}
      {showReactivateModal && (
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
      )}

      {/* Document Viewer Modal */}
      {renderDocumentViewer()}

      {/* License Details Modal */}
      {renderLicenseDetails()}
    </div>
  )
}

export default VendorDetailPage