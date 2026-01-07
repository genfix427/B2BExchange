import React from 'react'

const LoadingSpinner = ({ size = 'md', color = 'teal', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }
  
  const colorClasses = {
    teal: 'text-teal-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  }
  
  const spinner = (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 ${colorClasses[color]} ${sizeClasses[size]}`}></div>
    </div>
  )
  
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }
  
  return spinner
}

export default LoadingSpinner