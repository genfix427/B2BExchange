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
      validator: function (v) {
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
    min: [0, 'Quantity cannot be negative'],
    set: function (value) {
      const newStock = Math.max(0, value); // Ensure never goes below 0

      // Auto-update status based on stock
      if (newStock <= 0) {
        this.status = 'out_of_stock';
      } else if (this.status === 'out_of_stock') {
        // If stock was 0 and now has stock, make it active
        this.status = 'active';
      } else if (this.status === 'inactive') {
        // Keep inactive if explicitly set
        this.status = 'inactive';
      }
      // If already active, keep it active

      return newStock;
    }
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
  },

  wishlistCount: {
    type: Number,
    default: 0
  },

  // Add sales count
  salesCount: {
    type: Number,
    default: 0
  },

  // Add view count
  viewCount: {
    type: Number,
    default: 0
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
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  //   next();
});

productSchema.virtual('stockStatus').get(function () {
  if (this.quantityInStock <= 0) {
    return 'out_of_stock';
  } else if (this.quantityInStock < 5) {
    return 'low_stock';
  } else {
    return 'in_stock';
  }
});

// Add instance method to check stock
productSchema.methods.checkAndUpdateStatus = function () {
  if (this.quantityInStock <= 0) {
    this.status = 'out_of_stock';
  } else if (this.quantityInStock < 10) {
    this.status = 'active'; // Still active but low stock
  } else {
    this.status = 'active';
  }
  return this;
};

// Add instance method to reduce stock safely
productSchema.methods.reduceStock = async function (quantity) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  if (this.quantityInStock < quantity) {
    throw new Error(`Insufficient stock. Available: ${this.quantityInStock}, Requested: ${quantity}`);
  }

  this.quantityInStock -= quantity;

  // Update status based on new stock
  if (this.quantityInStock <= 0) {
    this.status = 'out_of_stock';
  } else if (this.quantityInStock < 10) {
    this.status = 'active'; // Still active but low stock
  }

  await this.save();
  return this;
};

// Add instance method to add stock
productSchema.methods.addStock = async function (quantity) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  this.quantityInStock += quantity;

  // If stock was 0 and we're adding stock, set to active
  if (this.status === 'out_of_stock' && this.quantityInStock > 0) {
    this.status = 'active';
  }

  await this.save();
  return this;
};

// productSchema.post('save', async function(doc) {
//   // Auto-update status based on stock
//   if (doc.quantityInStock <= 0 && doc.status !== 'out_of_stock') {
//     await Product.findByIdAndUpdate(doc._id, {
//       status: 'out_of_stock',
//       updatedAt: new Date()
//     });
//   } else if (doc.quantityInStock > 0 && doc.status === 'out_of_stock') {
//     await Product.findByIdAndUpdate(doc._id, {
//       status: 'active',
//       updatedAt: new Date()
//     });
//   }
// });

// productSchema.post('findOneAndUpdate', async function(doc) {
//   if (doc) {
//     // Check stock and update status if needed
//     if (doc.quantityInStock <= 0 && doc.status !== 'out_of_stock') {
//       await Product.findByIdAndUpdate(doc._id, {
//         status: 'out_of_stock',
//         updatedAt: new Date()
//       });
//     } else if (doc.quantityInStock > 0 && doc.status === 'out_of_stock') {
//       await Product.findByIdAndUpdate(doc._id, {
//         status: 'active',
//         updatedAt: new Date()
//       });
//     }
//   }
// });

const Product = mongoose.model('Product', productSchema);

export default Product;