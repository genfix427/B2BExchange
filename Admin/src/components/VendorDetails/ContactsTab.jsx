import React from 'react'
import { User, Mail, Phone, Users as UsersIcon } from 'lucide-react'

const ContactsTab = ({ vendor }) => {
  if (!vendor) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
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
                  {vendor.pharmacyOwner?.firstName || ''} {vendor.pharmacyOwner?.lastName || ''}
                </p>
                <p className="text-sm text-gray-500">{vendor.pharmacyOwner?.title || 'Owner'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-900">{vendor.pharmacyOwner?.email || vendor.email}</p>
                <p className="text-xs text-gray-500">Email</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-900">
                  {vendor.pharmacyOwner?.phone || vendor.pharmacyOwner?.mobile || 'N/A'}
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
            {vendor.additionalContacts && vendor.additionalContacts.length > 0 ? (
              vendor.additionalContacts.map((contact, index) => (
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
  )
}

export default ContactsTab