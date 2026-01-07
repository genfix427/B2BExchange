import React, { useState, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { 
  registerVendor, 
  prevStep, 
  updateFormData, 
  updateAuthData
} from '../../../store/slices/registrationSlice'
import { DOCUMENT_TYPES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../../utils/constants'

const Step7DocumentUpload = () => {
  const dispatch = useDispatch()
  const { formData, isLoading, error } = useSelector((state) => state.registration)
  
  // Store File objects ONLY in component state
  const [documentFiles, setDocumentFiles] = useState(
    Array(7).fill(null).map((_, i) => ({
      id: i,
      type: DOCUMENT_TYPES[i],
      file: null,
      error: null,
      preview: null
    }))
  )
  
  const [authData, setAuthData] = useState({
    email: formData.email || '',
    password: formData.password || '',
    confirmPassword: ''
  })
  
  const [authErrors, setAuthErrors] = useState({})
  
  const onDrop = useCallback((acceptedFiles, rejectedFiles, index) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      // Validate file
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        updateDocument(index, null, 'Invalid file type. Please upload JPEG, PNG, or PDF.')
        return
      }
      
      if (file.size > MAX_FILE_SIZE) {
        updateDocument(index, null, 'File too large. Maximum size is 5MB.')
        return
      }
      
      // Create preview for images
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      
      updateDocument(index, file, null, preview)
    }
    
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0].message
      updateDocument(index, null, error)
    }
  }, [])
  
  const updateDocument = (index, file, error = null, preview = null) => {
    setDocumentFiles(prev => prev.map((doc, i) => 
      i === index ? { ...doc, file, error, preview } : doc
    ))
  }
  
  const validateAuthData = () => {
    const errors = {}
    
    if (!authData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(authData.email)) {
      errors.email = 'Email is invalid'
    }
    
    if (!authData.password) {
      errors.password = 'Password is required'
    } else if (authData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    
    if (!authData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (authData.password !== authData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setAuthErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const validateDocuments = () => {
    const hasAllDocuments = documentFiles.every(doc => doc.file !== null)
    const hasErrors = documentFiles.some(doc => doc.error !== null)
    
    if (!hasAllDocuments) {
      alert('Please upload all 7 required documents.')
      return false
    }
    
    if (hasErrors) {
      alert('Please fix document errors before submitting.')
      return false
    }
    
    return true
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateAuthData() || !validateDocuments()) {
      return
    }
    
    // Update auth data in store
    dispatch(updateAuthData({
      email: authData.email,
      password: authData.password
    }))
    
    // Update documents metadata in store (NOT File objects)
    dispatch(updateFormData({
      step: 7,
      data: documentFiles.map(doc => ({
        name: doc.file?.name || doc.type,
        size: doc.file?.size || 0,
        type: doc.file?.type || '',
        lastModified: doc.file?.lastModified || Date.now()
      }))
    }))
    
    // Get File objects from component state
    const filesToSubmit = documentFiles.map(doc => doc.file).filter(Boolean)
    
    // Submit registration - pass File objects directly to thunk
    dispatch(registerVendor(filesToSubmit))
  }
  
  const handleBack = () => {
    // Save document metadata to store (NOT File objects)
    dispatch(updateFormData({
      step: 7,
      data: documentFiles.map(doc => ({
        name: doc.file?.name || doc.type,
        size: doc.file?.size || 0,
        type: doc.file?.type || '',
        lastModified: doc.file?.lastModified || Date.now()
      }))
    }))
    dispatch(prevStep())
  }
  
  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      documentFiles.forEach(doc => {
        if (doc.preview) {
          URL.revokeObjectURL(doc.preview)
        }
      })
    }
  }, [documentFiles])
  
  const allDocumentsUploaded = documentFiles.every(doc => doc.file !== null && doc.error === null)
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 7: Document Upload & Account Creation</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-8">
        {/* Documents Grid */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Required Documents</h3>
          <p className="text-sm text-gray-600 mb-6">
            Please upload all 7 documents. Each file must be JPEG, PNG, or PDF format and less than 5MB.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentFiles.map((doc, index) => (
              <DocumentDropzone
                key={doc.id}
                document={doc}
                onDrop={(acceptedFiles, rejectedFiles) => onDrop(acceptedFiles, rejectedFiles, index)}
              />
            ))}
          </div>
          
          {allDocumentsUploaded && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-sm text-green-700">All documents uploaded successfully!</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Account Creation */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Your Account</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login Email *
              </label>
              <input
                type="email"
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
              {authErrors.email && (
                <p className="mt-1 text-sm text-red-600">{authErrors.email}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 8 characters"
                />
                {authErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{authErrors.password}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={authData.confirmPassword}
                  onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {authErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{authErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Terms & Summary */}
        <div className="border-t pt-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Registration Summary</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Pharmacy Information: Completed
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Pharmacy Owner: Completed
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Primary Contact: Completed
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Pharmacy License: Completed
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Pharmacy Questions: Completed
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Referral Information: Completed
              </li>
              <li className={`flex items-center ${allDocumentsUploaded ? 'text-green-600' : 'text-amber-600'}`}>
                {allDocumentsUploaded ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                )}
                Documents: {allDocumentsUploaded ? 'Completed' : 'Pending'}
              </li>
            </ul>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> After submission, your application will be reviewed by our admin team. 
                This process typically takes 24-48 hours. You will receive an email notification once your 
                account is approved.
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !allDocumentsUploaded}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Registration'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const DocumentDropzone = ({ document, onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })
  
  return (
    <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
      isDragActive ? 'border-blue-500 bg-blue-50' : 
      document.error ? 'border-red-300 bg-red-50' :
      document.file ? 'border-green-300 bg-green-50' : 
      'border-gray-300 hover:border-gray-400'
    }`}>
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        
        <div className="text-center">
          {document.file ? (
            <div className="space-y-2">
              <div className="flex justify-center">
                {document.preview ? (
                  <div className="relative">
                    <img 
                      src={document.preview} 
                      alt={document.type}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <FileText className="h-16 w-16 text-green-500" />
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{document.file.name}</p>
              <p className="text-xs text-gray-500">
                {(document.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  // Clear preview URL
                  if (document.preview) {
                    URL.revokeObjectURL(document.preview)
                  }
                  onDrop([], [{ file: document.file, errors: [{ code: 'manual', message: 'Removed' }] }])
                }}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Upload className={`h-8 w-8 ${
                  document.error ? 'text-red-400' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{document.type}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {isDragActive ? 'Drop file here' : 'Click or drag file'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {document.error && (
        <div className="mt-2 flex items-center text-xs text-red-600">
          <XCircle className="h-3 w-3 mr-1" />
          {document.error}
        </div>
      )}
    </div>
  )
}

export default Step7DocumentUpload