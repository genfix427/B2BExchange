export const useVendorStatus = () => {
  const getStatusConfig = (status) => {
    const colors = {
      pending: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800'
      },
      approved: { 
        bg: 'bg-green-100', 
        text: 'text-green-800'
      },
      rejected: { 
        bg: 'bg-red-100', 
        text: 'text-red-800'
      },
      suspended: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800'
      }
    }
    return colors[status] || colors.pending
  }

  return { getStatusConfig }
}