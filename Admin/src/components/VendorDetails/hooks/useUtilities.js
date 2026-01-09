export const useUtilities = () => {
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

  const getDocumentCount = (vendor) => {
    if (!vendor?.documents) return 0
    return Array.isArray(vendor.documents) ? vendor.documents.length : 0
  }

  return {
    formatAddress,
    getDocumentCount
  }
}