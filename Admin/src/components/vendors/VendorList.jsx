import React from 'react'
import { format } from 'date-fns'
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react'
import VendorActions from './VendorActions'

const VendorList = ({ 
  vendors, 
  isLoading, 
  onApprove, 
  onReject, 
  onViewDetails,
  onSuspend,
  onContact,
  showFilters = true 
}) => {
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' }
      case 'rejected':
        return { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100' }
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-100' }
      case 'suspended':
        return { icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-100' }
      default:
        return { icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100' }
    }
  }
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500">Loading vendors...</p>
      </div>
    )
  }
  
  if (vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    )
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {vendors.map((vendor) => {
          const statusIcon = getStatusIcon(vendor.status)
          const Icon = statusIcon.icon
          
          return (
            <li key={vendor._id} className="hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full ${statusIcon.bgColor} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${statusIcon.color}`} />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {vendor.pharmacyInfo?.legalBusinessName}
                          </h4>
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusIcon.bgColor} ${statusIcon.color}`}>
                            {vendor.status}
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              <span>NPI: {vendor.pharmacyInfo?.npiNumber}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>
                                {vendor.pharmacyOwner?.firstName} {vendor.pharmacyOwner?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              <span>{vendor.pharmacyOwner?.email}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>
                                {vendor.pharmacyInfo?.shippingAddress?.city}, {vendor.pharmacyInfo?.shippingAddress?.state}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Registered:</span>
                        <span className="ml-2 text-gray-900">
                          {format(new Date(vendor.registeredAt), 'PP')}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Phone:</span>
                        <span className="ml-2 text-gray-900">{vendor.pharmacyInfo?.phone}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Documents:</span>
                        <span className="ml-2 text-gray-900">
                          {vendor.documents?.length || 0} uploaded
                        </span>
                      </div>
                    </div>
                    
                    {/* License Info */}
                    {vendor.pharmacyLicense && (
                      <div className="mt-3 bg-gray-50 rounded p-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="font-medium">DEA:</span>
                          <span className="ml-1">{vendor.pharmacyLicense.deaNumber}</span>
                          <span className="mx-2">•</span>
                          <span className="font-medium">Expires:</span>
                          <span className="ml-1">
                            {format(new Date(vendor.pharmacyLicense.deaExpirationDate), 'PP')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="ml-4 flex-shrink-0">
                    <VendorActions
                      vendor={vendor}
                      onApprove={onApprove}
                      onReject={onReject}
                      onViewDetails={onViewDetails}
                      onSuspend={onSuspend}
                      onContact={onContact}
                    />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default VendorList