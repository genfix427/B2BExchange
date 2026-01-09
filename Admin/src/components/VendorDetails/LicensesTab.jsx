import React from 'react'
import { format } from 'date-fns'
import { Shield, MapPin as MapPinIcon } from 'lucide-react'

const LicensesTab = ({ licenses, setSelectedLicense, getDocumentIcon }) => {
  return (
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
  )
}

export default LicensesTab