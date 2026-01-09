// models/Product.model.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Basic Information
  ndcNumber: {
    type: String,
    required: [true, 'NDC Number is required'],
    trim: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{5}-\d{4}-\d{2}$/.test(v);
      },
      message: 'NDC Number must be in format: 00000-0000-00'
    }
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  strength: {
    type: String,
    required: [true, 'Strength is required'],
    trim: true
  },
  dosageForm: {
    type: String,
    required: [true, 'Dosage form is required'],
    enum: ['Tablet', 'Capsule', 'Injection', 'Solution', 'Suspension', 'Cream', 'Ointment', 'Other']
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  expirationDate: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  
  // Packaging Information
  packageCondition: {
    type: String,
    required: [true, 'Package condition is required'],
    enum: [
      'Open Original Container',
      'Sealed Original bottle/Torn or label residue', 
      'Open Original bottle/Torn or label residue',
      'Other'
    ]
  },
  originalPackSize: {
    type: Number,
    required: [true, 'Original pack size is required'],
    min: [1, 'Pack size must be at least 1']
  },
  isFridgeProduct: {
    type: String,
    required: [true, 'Fridge product status is required'],
    enum: ['Yes', 'No']
  },
  
  // Stock Information
  packQuantity: {
    type: String,
    required: [true, 'Pack quantity is required'],
    enum: ['Partial', 'Full']
  },
  quantityInStock: {
    type: Number,
    required: [true, 'Quantity in stock is required'],
    min: [0, 'Quantity cannot be negative']
  },
  
  // Pricing Information
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be greater than 0']
  },
  lotNumber: {
    type: String,
    required: [true, 'Lot number is required'],
    trim: true
  },
  
  // Image
  image: {
    url: {
      type: String,
      required: [true, 'Product image is required']
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required']
    }
  },
  
  // Vendor Reference
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  vendorName: {
    type: String,
    required: [true, 'Vendor name is required']
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ ndcNumber: 1 }, { unique: true });
productSchema.index({ vendor: 1 });
productSchema.index({ status: 1 });
productSchema.index({ productName: 'text', manufacturer: 'text' });

// Update timestamp on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
//   next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;