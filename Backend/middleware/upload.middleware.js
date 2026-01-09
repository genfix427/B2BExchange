import multer from 'multer'

/* =========================
   STORAGE (Memory for Cloudinary)
========================= */
const storage = multer.memoryStorage()

/* =========================
   FILE FILTER
========================= */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',

    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX'
      ),
      false
    )
  }
}

/* =========================
   GENERIC UPLOAD (REUSABLE)
   👉 upload.single('image')
   👉 upload.array('files', n)
========================= */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
})

/* =========================
   DOCUMENT UPLOAD (FIXED)
   👉 uploadDocuments (DO NOT CHANGE ROUTES)
========================= */
export const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 7
  }
}).array('documents', 7)

/* =========================
   ERROR HANDLER
========================= */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit'
        })

      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Maximum 7 documents allowed'
        })

      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field'
        })

      default:
        return res.status(400).json({
          success: false,
          message: err.message
        })
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }

  next()
}
