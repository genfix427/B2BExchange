// src/pages/AdminSettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'
import {
  Save,
  User,
  Shield,
  Users,
  Key,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown
} from 'lucide-react'

// ─── Notification Component ───
const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in ${
      notification.type === 'success'
        ? 'bg-green-50 border border-green-200'
        : 'bg-red-50 border border-red-200'
    }`}>
      {notification.type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${
          notification.type === 'success' ? 'text-green-800' : 'text-red-800'
        }`}>
          {notification.message}
        </p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Admin Form Modal ───
const AdminFormModal = ({ admin, currentAdmin, onSave, onClose, saving }) => {
  const isEditing = !!admin

  const [formData, setFormData] = useState({
    firstName: admin?.firstName || '',
    lastName: admin?.lastName || '',
    email: admin?.email || '',
    password: '',
    phone: admin?.phone || '',
    role: admin?.role || 'admin',
    notes: admin?.notes || '',
    isActive: admin?.isActive ?? true,
    permissions: {
      canApproveVendors: admin?.permissions?.canApproveVendors ?? true,
      canManageVendors: admin?.permissions?.canManageVendors ?? true,
      canViewAnalytics: admin?.permissions?.canViewAnalytics ?? true,
      canManageSettings: admin?.permissions?.canManageSettings ?? false,
      canSuspendVendors: admin?.permissions?.canSuspendVendors ?? true,
      canManageAdmins: admin?.permissions?.canManageAdmins ?? false
    }
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const isSuperAdmin = currentAdmin?.role === 'super_admin'

  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!isEditing && !formData.password) newErrors.password = 'Password is required'
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = { ...formData }
    // Don't send empty password on edit
    if (isEditing && !payload.password) {
      delete payload.password
    }
    onSave(payload)
  }

  const permissionLabels = {
    canApproveVendors: 'Approve/Reject Vendors',
    canManageVendors: 'Manage Vendors',
    canViewAnalytics: 'View Analytics',
    canSuspendVendors: 'Suspend Vendors',
    canManageSettings: 'Manage Settings',
    canManageAdmins: 'Manage Admins'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Admin' : 'Add New Admin'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={isEditing ? '••••••••' : 'Min 8 characters'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.role === 'super_admin' && 'Full access to everything'}
                {formData.role === 'admin' && 'Can manage vendors and view analytics'}
                {formData.role === 'moderator' && 'Limited access — view and manage vendors only'}
              </p>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissions
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(permissionLabels).map(([key, label]) => {
                  // Only super_admin can toggle sensitive permissions
                  const isRestricted = (key === 'canManageAdmins' || key === 'canManageSettings') && !isSuperAdmin
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                        formData.permissions[key]
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      } ${isRestricted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions[key]}
                        onChange={(e) => {
                          if (isRestricted) return
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [key]: e.target.checked
                            }
                          })
                        }}
                        disabled={isRestricted}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                      {isRestricted && (
                        <span className="text-xs text-gray-400 ml-auto">Super admin only</span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional internal notes..."
              />
            </div>

            {/* Active Status (only for editing) */}
            {isEditing && (
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md">
                <label className="flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Account Active</span>
                </label>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Admin' : 'Create Admin'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirmation Modal ───
const DeleteModal = ({ admin, onConfirm, onClose, deleting }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Admin</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold">{admin.firstName} {admin.lastName}</span>{' '}
          ({admin.email})? All their data will be removed.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Admin'
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)

// ─── Role Badge ───
const RoleBadge = ({ role }) => {
  const styles = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    moderator: 'bg-gray-100 text-gray-800'
  }
  const labels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    moderator: 'Moderator'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role] || styles.admin}`}>
      {labels[role] || role}
    </span>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const AdminSettingsPage = () => {
  // ─── Active tab ───
  const [activeTab, setActiveTab] = useState('profile')

  // ─── Notification ───
  const [notification, setNotification] = useState(null)
  const notify = (type, message) => setNotification({ type, message })

  // ─── Current admin (fetched from API) ───
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // ─── Profile tab state ───
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // ─── Security tab state ───
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ─── Admin Management tab state ───
  const [admins, setAdmins] = useState([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [adminSearch, setAdminSearch] = useState('')
  const [adminRoleFilter, setAdminRoleFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [savingAdmin, setSavingAdmin] = useState(false)
  const [deletingAdmin, setDeletingAdmin] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(null)

  // ─── Check if current admin can manage admins ───
  const canManageAdmins =
    currentAdmin?.role === 'super_admin' || currentAdmin?.permissions?.canManageAdmins

  // ─── Fetch current admin profile ───
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true)
        const response = await api.get('/admin/profile')
        const data = response.data
        setCurrentAdmin(data)
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || ''
        })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        notify('error', 'Failed to load profile')
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [])

  // ─── Fetch admins when Admin Management tab is active ───
  const fetchAdmins = useCallback(async () => {
    try {
      setLoadingAdmins(true)
      const params = new URLSearchParams()
      if (adminSearch) params.append('search', adminSearch)
      if (adminRoleFilter) params.append('role', adminRoleFilter)
      params.append('limit', '50')

      const response = await api.get(`/admin/admins?${params.toString()}`)
      setAdmins(response.data || [])
    } catch (error) {
      console.error('Failed to fetch admins:', error)
      notify('error', 'Failed to load admins')
    } finally {
      setLoadingAdmins(false)
    }
  }, [adminSearch, adminRoleFilter])

  useEffect(() => {
    if (activeTab === 'admins' && canManageAdmins) {
      fetchAdmins()
    }
  }, [activeTab, fetchAdmins, canManageAdmins])

  // ─── Profile handlers ───
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      setSavingProfile(true)
      await api.put('/admin/profile', profileData)
      notify('success', 'Profile updated successfully')
      // Update local currentAdmin
      setCurrentAdmin(prev => ({ ...prev, ...profileData }))
    } catch (error) {
      notify('error', error.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  // ─── Password handlers ───
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify('error', 'New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      notify('error', 'Password must be at least 8 characters')
      return
    }
    try {
      setSavingPassword(true)
      await api.put('/admin/profile', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      notify('success', 'Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      notify('error', error.message || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  // ─── Admin CRUD handlers ───
  const handleCreateAdmin = async (formData) => {
    try {
      setSavingAdmin(true)
      await api.post('/admin/admins', formData)
      notify('success', `Admin "${formData.firstName} ${formData.lastName}" created successfully`)
      setShowAddModal(false)
      fetchAdmins()
    } catch (error) {
      notify('error', error.message || 'Failed to create admin')
    } finally {
      setSavingAdmin(false)
    }
  }

  const handleUpdateAdmin = async (formData) => {
    if (!selectedAdmin) return
    try {
      setSavingAdmin(true)
      await api.put(`/admin/admins/${selectedAdmin._id}`, formData)
      notify('success', `Admin "${formData.firstName} ${formData.lastName}" updated successfully`)
      setShowEditModal(false)
      setSelectedAdmin(null)
      fetchAdmins()
    } catch (error) {
      notify('error', error.message || 'Failed to update admin')
    } finally {
      setSavingAdmin(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return
    try {
      setDeletingAdmin(true)
      await api.delete(`/admin/admins/${selectedAdmin._id}`)
      notify('success', `Admin deleted successfully`)
      setShowDeleteModal(false)
      setSelectedAdmin(null)
      fetchAdmins()
    } catch (error) {
      notify('error', error.message || 'Failed to delete admin')
    } finally {
      setDeletingAdmin(false)
    }
  }

  const handleToggleStatus = async (admin) => {
    try {
      setTogglingStatus(admin._id)
      await api.put(`/admin/admins/${admin._id}/toggle-status`)
      notify('success', `Admin ${admin.isActive ? 'deactivated' : 'activated'} successfully`)
      fetchAdmins()
    } catch (error) {
      notify('error', error.message || 'Failed to toggle status')
    } finally {
      setTogglingStatus(null)
    }
  }

  // ─── Tab definitions ───
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    ...(canManageAdmins
      ? [{ id: 'admins', label: 'Admin Management', icon: Users }]
      : [])
  ]

  // ─── Loading state ───
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Card */}
      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* ══════════════════════════════════════════ */}
          {/* PROFILE TAB                               */}
          {/* ══════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Update your account profile information and email address.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Read-only info */}
                <div className="bg-gray-50 rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Role:</span>{' '}
                      <RoleBadge role={currentAdmin?.role} />
                    </div>
                    <div>
                      <span className="text-gray-500">Last Login:</span>{' '}
                      <span className="text-gray-900">
                        {currentAdmin?.lastLoginAt
                          ? new Date(currentAdmin.lastLoginAt).toLocaleString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════ */}
          {/* SECURITY TAB                              */}
          {/* ══════════════════════════════════════════ */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Update your password to keep your account secure.
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordData.confirmPassword &&
                      passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                      )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>

                {/* 2FA Section */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Two-Factor Authentication
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-900">Enhanced Security</p>
                          <p className="text-sm text-blue-700">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════ */}
          {/* ADMIN MANAGEMENT TAB                      */}
          {/* ══════════════════════════════════════════ */}
          {activeTab === 'admins' && canManageAdmins && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Admin Management</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Create and manage administrator accounts
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <select
                    value={adminRoleFilter}
                    onChange={(e) => setAdminRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-8"
                  >
                    <option value="">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Admin Table */}
              {loadingAdmins ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-500">Loading admins...</span>
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No admins found</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {admins.map((admin) => {
                        const isSelf = currentAdmin?._id === admin._id
                        const isTargetSuperAdmin =
                          admin.role === 'super_admin' && currentAdmin?.role !== 'super_admin'

                        return (
                          <tr
                            key={admin._id}
                            className={`hover:bg-gray-50 ${isSelf ? 'bg-blue-50/30' : ''}`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                  {admin.firstName?.[0]}
                                  {admin.lastName?.[0]}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {admin.firstName} {admin.lastName}
                                    {isSelf && (
                                      <span className="ml-1 text-xs text-blue-600">(You)</span>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-500">{admin.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <RoleBadge role={admin.role} />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  admin.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {admin.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {admin.lastLoginAt
                                ? new Date(admin.lastLoginAt).toLocaleDateString()
                                : 'Never'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* Edit */}
                                <button
                                  onClick={() => {
                                    setSelectedAdmin(admin)
                                    setShowEditModal(true)
                                  }}
                                  disabled={isTargetSuperAdmin}
                                  title="Edit"
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* Toggle Status */}
                                <button
                                  onClick={() => handleToggleStatus(admin)}
                                  disabled={isSelf || isTargetSuperAdmin || togglingStatus === admin._id}
                                  title={admin.isActive ? 'Deactivate' : 'Activate'}
                                  className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  {togglingStatus === admin._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : admin.isActive ? (
                                    <ToggleRight className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => {
                                    setSelectedAdmin(admin)
                                    setShowDeleteModal(true)
                                  }}
                                  disabled={isSelf || isTargetSuperAdmin}
                                  title="Delete"
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary */}
              {admins.length > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                  <span>
                    {admins.length} admin{admins.length !== 1 ? 's' : ''} total
                  </span>
                  <div className="flex gap-4">
                    <span>
                      {admins.filter((a) => a.isActive).length} active
                    </span>
                    <span>
                      {admins.filter((a) => !a.isActive).length} inactive
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Modals ─── */}
      {showAddModal && (
        <AdminFormModal
          admin={null}
          currentAdmin={currentAdmin}
          onSave={handleCreateAdmin}
          onClose={() => setShowAddModal(false)}
          saving={savingAdmin}
        />
      )}

      {showEditModal && selectedAdmin && (
        <AdminFormModal
          admin={selectedAdmin}
          currentAdmin={currentAdmin}
          onSave={handleUpdateAdmin}
          onClose={() => {
            setShowEditModal(false)
            setSelectedAdmin(null)
          }}
          saving={savingAdmin}
        />
      )}

      {showDeleteModal && selectedAdmin && (
        <DeleteModal
          admin={selectedAdmin}
          onConfirm={handleDeleteAdmin}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedAdmin(null)
          }}
          deleting={deletingAdmin}
        />
      )}
    </div>
  )
}

export default AdminSettingsPage