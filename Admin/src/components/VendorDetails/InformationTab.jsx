import React from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
    Building,
    User,
    Mail,
    Phone,
    MapPin as MapPinIcon,
    Shield,
    Calendar,
    FileCheck,
    Store
} from 'lucide-react'

const InformationTab = ({
    vendor,
    getStatusConfig,
    getStatusIcon,
    licenses,
    setSelectedLicense,
    formatAddress
}) => {
    // Add null check for vendor
    if (!vendor) {
        return (
            <div className="p-6 text-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
            </div>
        )
    }

    const statusConfig = getStatusConfig(vendor.status)
    const StatusIcon = getStatusIcon(vendor.status)

    return (
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
                                        {vendor.pharmacyInfo?.legalBusinessName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">DBA Name</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {vendor.pharmacyInfo?.dba || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">NPI Number</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {vendor.pharmacyInfo?.npiNumber || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Federal EIN</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {vendor.pharmacyInfo?.federalEIN || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 flex items-center">
                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                    Business Address
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {formatAddress(vendor.pharmacyInfo?.businessAddress || vendor.pharmacyInfo?.shippingAddress)}
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
                                        {vendor.pharmacyOwner?.firstName || ''} {vendor.pharmacyOwner?.lastName || ''}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Title</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {vendor.pharmacyOwner?.title || 'N/A'}
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
                                        {vendor.pharmacyOwner?.email || vendor.email || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 flex items-center">
                                        <Phone className="w-4 h-4 mr-1" />
                                        Phone
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {vendor.pharmacyOwner?.phone || vendor.pharmacyOwner?.mobile || 'N/A'}
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
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                    <StatusIcon className="w-4 h-4 text-gray-600" />
                                    <span className="capitalize">{vendor.status}</span>
                                    <span className="ml-1">{vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1)}</span>
                                </span>
                            </div>

                            {vendor.registeredAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Registered
                                    </span>
                                    <span className="text-sm text-gray-900">
                                        {format(new Date(vendor.registeredAt), 'MMM d, yyyy')}
                                        <span className="ml-2 text-xs text-gray-400">
                                            ({formatDistanceToNow(new Date(vendor.registeredAt), { addSuffix: true })})
                                        </span>
                                    </span>
                                </div>
                            )}

                            {vendor.approvedAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Approved Date</span>
                                    <span className="text-sm text-gray-900">
                                        {format(new Date(vendor.approvedAt), 'MMM d, yyyy')}
                                    </span>
                                </div>
                            )}

                            {vendor.approvedBy && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Approved By</span>
                                    <span className="text-sm text-gray-900">
                                        {vendor.approvedBy?.firstName} {vendor.approvedBy?.lastName}
                                    </span>
                                </div>
                            )}

                            {vendor.suspendedAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Suspended Date</span>
                                    <span className="text-sm text-gray-900">
                                        {format(new Date(vendor.suspendedAt), 'MMM d, yyyy')}
                                    </span>
                                </div>
                            )}

                            {vendor.suspensionReason && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Suspension Reason</span>
                                    <span className="text-sm text-gray-900">
                                        {vendor.suspensionReason}
                                    </span>
                                </div>
                            )}

                            {vendor.lastLoginAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Login</span>
                                    <span className="text-sm text-gray-900">
                                        {format(new Date(vendor.lastLoginAt), 'MMM d, yyyy h:mm a')}
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
                            {licenses && licenses.length > 0 ? (
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
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${license.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                            {licenses && licenses.length > 3 && (
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
                            {vendor.pharmacyQuestions?.enterpriseType && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Enterprise Type</span>
                                    <span className="text-sm text-gray-900">{vendor.pharmacyQuestions.enterpriseType}</span>
                                </div>
                            )}
                            {vendor.pharmacyQuestions?.pharmacyType && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Pharmacy Type</span>
                                    <span className="text-sm text-gray-900">{vendor.pharmacyQuestions.pharmacyType}</span>
                                </div>
                            )}
                            {vendor.pharmacyQuestions?.numberOfLocations && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Number of Locations</span>
                                    <span className="text-sm text-gray-900">{vendor.pharmacyQuestions.numberOfLocations}</span>
                                </div>
                            )}
                            {vendor.pharmacyQuestions?.pharmacySoftware && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Pharmacy Software</span>
                                    <span className="text-sm text-gray-900">{vendor.pharmacyQuestions.pharmacySoftware}</span>
                                </div>
                            )}
                            {vendor.pharmacyQuestions?.primaryWholesaler && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Primary Wholesaler</span>
                                    <span className="text-sm text-gray-900">{vendor.pharmacyQuestions.primaryWholesaler}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InformationTab