import { useState } from 'react'

export const useLicenses = (selectedVendor) => {
  const [selectedLicense, setSelectedLicense] = useState(null)

  const getAllLicenses = () => {
    const licenses = []

    // DEA License
    if (selectedVendor?.pharmacyLicense?.deaNumber) {
      licenses.push({
        type: 'DEA License',
        number: selectedVendor.pharmacyLicense.deaNumber,
        expiration: selectedVendor.pharmacyLicense.deaExpirationDate,
        state: selectedVendor.pharmacyLicense.deaState,
        status: selectedVendor.pharmacyLicense.deaExpirationDate && 
               new Date(selectedVendor.pharmacyLicense.deaExpirationDate) > new Date() ? 
               'Active' : 'Expired',
        category: 'Federal'
      })
    }

    // State Pharmacy License
    if (selectedVendor?.pharmacyLicense?.stateLicenseNumber) {
      licenses.push({
        type: 'State Pharmacy License',
        number: selectedVendor.pharmacyLicense.stateLicenseNumber,
        expiration: selectedVendor.pharmacyLicense.stateLicenseExpirationDate,
        state: selectedVendor.pharmacyLicense.stateLicenseState,
        status: selectedVendor.pharmacyLicense.stateLicenseExpirationDate && 
               new Date(selectedVendor.pharmacyLicense.stateLicenseExpirationDate) > new Date() ? 
               'Active' : 'Expired',
        category: 'State'
      })
    }

    // NPI Number
    if (selectedVendor?.pharmacyInfo?.npiNumber) {
      licenses.push({
        type: 'NPI Number',
        number: selectedVendor.pharmacyInfo.npiNumber,
        expiration: null,
        state: 'National',
        status: 'Active',
        category: 'Federal'
      })
    }

    // Federal EIN
    if (selectedVendor?.pharmacyInfo?.federalEIN) {
      licenses.push({
        type: 'Federal EIN',
        number: selectedVendor.pharmacyInfo.federalEIN,
        expiration: null,
        state: 'Federal',
        status: 'Active',
        category: 'Federal'
      })
    }

    // State Business License
    if (selectedVendor?.pharmacyLicense?.businessLicenseNumber) {
      licenses.push({
        type: 'Business License',
        number: selectedVendor.pharmacyLicense.businessLicenseNumber,
        expiration: selectedVendor.pharmacyLicense.businessLicenseExpirationDate,
        state: selectedVendor.pharmacyLicense.businessLicenseState,
        status: selectedVendor.pharmacyLicense.businessLicenseExpirationDate && 
               new Date(selectedVendor.pharmacyLicense.businessLicenseExpirationDate) > new Date() ? 
               'Active' : 'Expired',
        category: 'Business'
      })
    }

    // Controlled Substance License
    if (selectedVendor?.pharmacyLicense?.controlledSubstanceLicenseNumber) {
      licenses.push({
        type: 'Controlled Substance License',
        number: selectedVendor.pharmacyLicense.controlledSubstanceLicenseNumber,
        expiration: selectedVendor.pharmacyLicense.controlledSubstanceLicenseExpirationDate,
        state: selectedVendor.pharmacyLicense.controlledSubstanceLicenseState,
        status: selectedVendor.pharmacyLicense.controlledSubstanceLicenseExpirationDate && 
               new Date(selectedVendor.pharmacyLicense.controlledSubstanceLicenseExpirationDate) > new Date() ? 
               'Active' : 'Expired',
        category: 'Federal'
      })
    }

    // Additional licenses from documents
    if (selectedVendor?.documents) {
      selectedVendor.documents.forEach((doc) => {
        if (doc.documentType?.toLowerCase().includes('license')) {
          licenses.push({
            type: doc.documentType || 'License',
            number: doc.licenseNumber || 'Not specified',
            expiration: doc.expirationDate,
            state: doc.state || 'Not specified',
            status: doc.expirationDate && new Date(doc.expirationDate) > new Date() ? 'Active' : 'Expired',
            category: 'Other',
            document: doc
          })
        }
      })
    }

    return licenses
  }

  return {
    licenses: getAllLicenses(),
    selectedLicense,
    setSelectedLicense
  }
}