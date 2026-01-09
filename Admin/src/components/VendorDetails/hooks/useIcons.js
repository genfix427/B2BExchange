import {
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  FileText,
  FileImage,
  File
} from 'lucide-react'

export const useIcons = () => {
  /**
   * =========================
   * STATUS ICON (COMPONENT)
   * =========================
   */
  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      suspended: PauseCircle
    }

    return statusIcons[status] || Clock
  }

  /**
   * =========================
   * DOCUMENT ICON (COMPONENT)
   * =========================
   */
  const getDocumentIcon = (document) => {
    if (!document) return File

    const fileName = document.name || document.documentType || ''
    const fileUrl = document.url || document.fileUrl || ''
    const value = `${fileName}${fileUrl}`.toLowerCase()

    if (value.includes('.pdf')) return FileText
    if (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png')) return FileImage
    if (value.includes('.doc') || value.includes('.docx')) return FileText

    return File
  }

  return {
    getStatusIcon,
    getDocumentIcon
  }
}
