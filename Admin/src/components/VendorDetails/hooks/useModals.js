import { useState } from 'react'

export const useModals = (
  id,
  dispatch,
  fetchVendorDetails,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor
) => {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [showReactivateModal, setShowReactivateModal] = useState(false)

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this vendor?')) return

    try {
      await dispatch(approveVendor(id)).unwrap()
      alert('Vendor approved successfully!')
      dispatch(fetchVendorDetails(id))
    } catch (error) {
      alert(error?.message || 'Failed to approve vendor')
    }
  }

  const handleReject = async () => {
    if (rejectionReason.trim().length < 10) {
      alert('Please provide a detailed rejection reason (minimum 10 characters)')
      return
    }

    try {
      await dispatch(
        rejectVendor({ vendorId: id, rejectionReason })
      ).unwrap()

      alert('Vendor rejected successfully!')
      setShowRejectModal(false)
      setRejectionReason('')
      dispatch(fetchVendorDetails(id))
    } catch (error) {
      alert(error?.message || 'Failed to reject vendor')
    }
  }

  const handleSuspend = async () => {
    if (suspensionReason.trim().length < 5) {
      alert('Please provide a suspension reason (minimum 5 characters)')
      return
    }

    try {
      await dispatch(
        suspendVendor({ vendorId: id, reason: suspensionReason })
      ).unwrap()

      alert('Vendor suspended successfully!')
      setShowSuspendModal(false)
      setSuspensionReason('')
      dispatch(fetchVendorDetails(id))
    } catch (error) {
      alert(error?.message || 'Failed to suspend vendor')
    }
  }

  const handleReactivate = async () => {
    if (!window.confirm('Are you sure you want to reactivate this vendor?')) return

    try {
      await dispatch(reactivateVendor(id)).unwrap()
      alert('Vendor reactivated successfully!')
      setShowReactivateModal(false)
      dispatch(fetchVendorDetails(id))
    } catch (error) {
      alert(error?.message || 'Failed to reactivate vendor')
    }
  }

  return {
    showRejectModal,
    setShowRejectModal,
    rejectionReason,
    setRejectionReason,
    showSuspendModal,
    setShowSuspendModal,
    suspensionReason,
    setSuspensionReason,
    showReactivateModal,
    setShowReactivateModal,
    handleApprove,
    handleReject,
    handleSuspend,
    handleReactivate
  }
}
