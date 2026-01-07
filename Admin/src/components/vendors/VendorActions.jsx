import React, { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  MessageSquare,
  Ban,
  AlertCircle
} from 'lucide-react'

const VendorActions = ({ vendor, onApprove, onReject, onViewDetails, onSuspend, onContact }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  
  const handleAction = (action) => {
    setShowDropdown(false)
    switch(action) {
      case 'approve':
        onApprove(vendor._id)
        break
      case 'reject':
        const reason = prompt('Enter rejection reason (min 10 characters):')
        if (reason && reason.trim().length >= 10) {
          onReject(vendor._id, reason.trim())
        }
        break
      case 'suspend':
        const suspendReason = prompt('Enter suspension reason:')
        if (suspendReason) {
          onSuspend(vendor._id, suspendReason)
        }
        break
      case 'contact':
        onContact(vendor._id)
        break
      default:
        break
    }
  }
  
  const getStatusActions = () => {
    const baseActions = [
      {
        id: 'view',
        label: 'View Details',
        icon: Eye,
        color: 'text-gray-700',
        onClick: () => onViewDetails(vendor)
      },
      {
        id: 'contact',
        label: 'Contact Vendor',
        icon: Mail,
        color: 'text-blue-600',
        onClick: () => handleAction('contact')
      }
    ]
    
    if (vendor.status === 'pending') {
      return [
        ...baseActions,
        {
          id: 'approve',
          label: 'Approve Vendor',
          icon: CheckCircle,
          color: 'text-green-600',
          onClick: () => handleAction('approve')
        },
        {
          id: 'reject',
          label: 'Reject Application',
          icon: XCircle,
          color: 'text-red-600',
          onClick: () => handleAction('reject')
        }
      ]
    }
    
    if (vendor.status === 'approved') {
      return [
        ...baseActions,
        {
          id: 'suspend',
          label: 'Suspend Vendor',
          icon: Ban,
          color: 'text-yellow-600',
          onClick: () => handleAction('suspend')
        }
      ]
    }
    
    if (vendor.status === 'suspended') {
      return [
        ...baseActions,
        {
          id: 'approve',
          label: 'Re-activate Vendor',
          icon: UserCheck,
          color: 'text-green-600',
          onClick: () => handleAction('approve')
        }
      ]
    }
    
    return baseActions
  }
  
  const actions = getStatusActions()
  
  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Primary action based on status */}
        {vendor.status === 'pending' && (
          <>
            <button
              onClick={() => handleAction('approve')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              title="Approve"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAction('reject')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              title="Reject"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </>
        )}
        
        {/* View details button */}
        <button
          onClick={() => onViewDetails(vendor)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
        
        {/* More actions dropdown */}
        {actions.length > 3 && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {actions.slice(3).map((action) => (
                      <button
                        key={action.id}
                        onClick={action.onClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorActions