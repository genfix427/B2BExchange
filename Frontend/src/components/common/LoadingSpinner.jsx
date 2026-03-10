import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  text = '',
}) => {
  const sizeConfig = {
    sm: { spinner: 'h-5 w-5', border: 'border-2', text: 'text-xs', gap: 'gap-2' },
    md: { spinner: 'h-8 w-8', border: 'border-[3px]', text: 'text-sm', gap: 'gap-3' },
    lg: { spinner: 'h-12 w-12', border: 'border-[3px]', text: 'text-base', gap: 'gap-4' },
    xl: { spinner: 'h-16 w-16', border: 'border-4', text: 'text-lg', gap: 'gap-4' },
  }

  const variantConfig = {
    primary: {
      border: 'border-[#9155a7]/20',
      spinner: 'border-t-[#9155a7] border-r-[#a42574]',
      dot1: 'bg-[#9155a7]',
      dot2: 'bg-[#7b2c78]',
      dot3: 'bg-[#a42574]',
      text: 'text-[#9155a7]',
      glow: 'shadow-[#9155a7]/20',
    },
    secondary: {
      border: 'border-[#7b2c78]/20',
      spinner: 'border-t-[#7b2c78] border-r-[#9155a7]',
      dot1: 'bg-[#7b2c78]',
      dot2: 'bg-[#a42574]',
      dot3: 'bg-[#9155a7]',
      text: 'text-[#7b2c78]',
      glow: 'shadow-[#7b2c78]/20',
    },
    accent: {
      border: 'border-[#a42574]/20',
      spinner: 'border-t-[#a42574] border-r-[#9155a7]',
      dot1: 'bg-[#a42574]',
      dot2: 'bg-[#9155a7]',
      dot3: 'bg-[#7b2c78]',
      text: 'text-[#a42574]',
      glow: 'shadow-[#a42574]/20',
    },
    white: {
      border: 'border-white/20',
      spinner: 'border-t-white border-r-white/60',
      dot1: 'bg-white',
      dot2: 'bg-white/80',
      dot3: 'bg-white/60',
      text: 'text-white',
      glow: 'shadow-white/10',
    },
  }

  const s = sizeConfig[size]
  const v = variantConfig[variant]

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${s.gap}`}>
      {/* Main spinner */}
      <div className="relative">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 ${s.spinner} rounded-full blur-md opacity-40 ${v.dot1}`}
        />

        {/* Spinner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`${s.spinner} rounded-full ${s.border} ${v.border} ${v.spinner}`}
        />

        {/* Center dot */}
        {(size === 'lg' || size === 'xl') && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute inset-0 m-auto w-2 h-2 rounded-full ${v.dot1}`}
          />
        )}
      </div>

      {/* Loading text */}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`${s.text} font-medium ${v.text}`}
        >
          {text}
        </motion.p>
      )}

      {/* Bouncing dots for larger sizes */}
      {(size === 'lg' || size === 'xl') && (
        <div className="flex gap-1.5">
          {[v.dot1, v.dot2, v.dot3].map((color, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
              className={`w-1.5 h-1.5 rounded-full ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5eef7] via-white to-[#fce8f3]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Logo placeholder */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9155a7] to-[#a42574] flex items-center justify-center shadow-xl shadow-[#9155a7]/20 mb-2"
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </motion.div>

          {spinner}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500 font-medium"
          >
            {text || 'Loading MedMarket...'}
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner