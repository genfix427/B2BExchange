// models/Order.model.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  ndcNumber: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0.01
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0.01
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  }
});

const shippingAddressSchema = new mongoose.Schema({
  line1: {
    type: String,
    required: true
  },
  line2: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    enum: [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ]
  },
  zipCode: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
});

const vendorOrderSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  carrier: {
    type: String,
    enum: ['UPS', 'FedEx', 'USPS', 'DHL', 'Other']
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
});

const orderSchema = new mongoose.Schema({
  // Order Identification - NOT required, auto-generated
  orderNumber: {
    type: String,
    unique: true,
    index: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  
  customerName: {
    type: String,
    required: true
  },
  
  customerEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  
  items: [orderItemSchema],
  
  shippingAddress: shippingAddressSchema,
  
  vendorOrders: [vendorOrderSchema],
  
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'wire_transfer', 'check'],
    required: true
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  
  subtotal: {
    type: Number,
    required: true,
    min: 0.01
  },
  
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  
  total: {
    type: Number,
    required: true,
    min: 0.01
  },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate unique 9-digit alphanumeric order number BEFORE validation
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    // Generate 3 letters
    for (let i = 0; i < 3; i++) {
      result += characters.charAt(Math.floor(Math.random() * 26));
    }
    
    // Generate 4 numbers
    for (let i = 0; i < 4; i++) {
      result += Math.floor(Math.random() * 10);
    }
    
    // Generate 2 letters
    for (let i = 0; i < 2; i++) {
      result += characters.charAt(Math.floor(Math.random() * 26));
    }
    
    this.orderNumber = result;
  }
  // next();
});

// Update product stock when order is created
orderSchema.post('save', async function(doc, next) {
  try {
    const Product = mongoose.model('Product');
    
    // Update stock for each item
    for (const item of doc.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          quantityInStock: -item.quantity,
          salesCount: item.quantity
        }
      });
    }
  } catch (error) {
    console.error('Error updating product stock:', error);
  }
  // next();
});

// Indexes
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'items.vendor': 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'vendorOrders.vendor': 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;