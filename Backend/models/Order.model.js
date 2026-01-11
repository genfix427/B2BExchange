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

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  changedByType: {
    type: String,
    enum: ['buyer', 'seller', 'system'],
    required: true
  },
  note: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
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
    enum: ['UPS', 'FedEx', 'USPS', 'DHL', 'Other', '']
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  notes: {
    type: String
  },
  // Add sub-total for this vendor's items
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  // Track items for this vendor
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }]
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
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'partially_shipped', 'partially_delivered'],
    default: 'pending'
  },
  
  // Add status history
  statusHistory: [statusHistorySchema],
  
  // Add overall status description
  overallStatusDescription: {
    type: String,
    default: 'Order placed'
  },
  
  notes: {
    type: String
  }
}, {
  timestamps: true
});

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

// Method to calculate overall order status based on vendor orders
orderSchema.methods.calculateOverallStatus = function() {
  const vendorOrders = this.vendorOrders || [];
  
  if (vendorOrders.length === 0) {
    this.status = 'pending';
    this.overallStatusDescription = 'Order placed';
    return this;
  }
  
  const allStatuses = vendorOrders.map(vo => vo.status);
  
  // Count statuses
  const statusCount = {
    cancelled: 0,
    delivered: 0,
    shipped: 0,
    processing: 0,
    confirmed: 0,
    pending: 0
  };
  
  allStatuses.forEach(status => {
    if (statusCount[status] !== undefined) {
      statusCount[status]++;
    }
  });
  
  // Determine overall status
  if (statusCount.cancelled === vendorOrders.length) {
    this.status = 'cancelled';
    this.overallStatusDescription = 'All vendor orders cancelled';
  } else if (statusCount.delivered === vendorOrders.length) {
    this.status = 'delivered';
    this.overallStatusDescription = 'All items delivered';
  } else if (statusCount.delivered > 0 && statusCount.delivered < vendorOrders.length) {
    this.status = 'partially_delivered';
    this.overallStatusDescription = `${statusCount.delivered}/${vendorOrders.length} vendors delivered`;
  } else if (statusCount.shipped === vendorOrders.length) {
    this.status = 'shipped';
    this.overallStatusDescription = 'All items shipped';
  } else if (statusCount.shipped > 0 && statusCount.shipped < vendorOrders.length) {
    this.status = 'partially_shipped';
    this.overallStatusDescription = `${statusCount.shipped}/${vendorOrders.length} vendors shipped`;
  } else if (statusCount.processing === vendorOrders.length) {
    this.status = 'processing';
    this.overallStatusDescription = 'All vendors processing order';
  } else if (statusCount.confirmed === vendorOrders.length) {
    this.status = 'confirmed';
    this.overallStatusDescription = 'Order confirmed by all vendors';
  } else if (statusCount.pending === vendorOrders.length) {
    this.status = 'pending';
    this.overallStatusDescription = 'Awaiting vendor confirmation';
  } else {
    // Mixed statuses
    this.status = 'processing';
    this.overallStatusDescription = 'Order in progress';
  }
  
  return this;
};

// Method to add status history entry
orderSchema.methods.addStatusHistory = function(status, changedBy, changedByType, note = '') {
  this.statusHistory.push({
    status,
    changedBy,
    changedByType,
    note,
    timestamp: new Date()
  });
  
  // Keep only last 20 status history entries
  if (this.statusHistory.length > 20) {
    this.statusHistory = this.statusHistory.slice(-20);
  }
  
  return this;
};

// Method to update vendor order status
orderSchema.methods.updateVendorOrderStatus = function(vendorId, newStatus, trackingNumber = null, carrier = null, notes = '') {
  const vendorOrder = this.vendorOrders.find(vo => vo.vendor.toString() === vendorId.toString());
  
  if (!vendorOrder) {
    throw new Error('Vendor order not found');
  }
  
  // Validate status transition
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  };
  
  const currentStatus = vendorOrder.status;
  
  if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }
  
  // Update vendor order
  vendorOrder.status = newStatus;
  vendorOrder.notes = notes || vendorOrder.notes;
  
  // Update timestamps and tracking info
  if (newStatus === 'shipped') {
    vendorOrder.shippedAt = new Date();
    if (trackingNumber) vendorOrder.trackingNumber = trackingNumber;
    if (carrier) vendorOrder.carrier = carrier;
  } else if (newStatus === 'delivered') {
    vendorOrder.deliveredAt = new Date();
  }
  
  // Recalculate overall status
  this.calculateOverallStatus();
  
  return this;
};

// Post-save hook to update overall status
orderSchema.pre('save', function(next) {
  // Calculate overall status if vendor orders exist
  if (this.vendorOrders && this.vendorOrders.length > 0) {
    this.calculateOverallStatus();
  }
  // next();
});

// Update product stock when order is created
orderSchema.post('save', async function(doc, next) {
  try {
    const Product = mongoose.model('Product');
    
    // Only update stock if order is not cancelled
    if (doc.status !== 'cancelled') {
      for (const item of doc.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 
            quantityInStock: -item.quantity,
            salesCount: item.quantity
          }
        });
      }
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
orderSchema.index({ 'vendorOrders.status': 1 });


// // Generate unique 9-digit alphanumeric order number BEFORE validation
// orderSchema.pre('validate', function(next) {
//   if (!this.orderNumber) {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let result = '';
    
//     // Generate 3 letters
//     for (let i = 0; i < 3; i++) {
//       result += characters.charAt(Math.floor(Math.random() * 26));
//     }
    
//     // Generate 4 numbers
//     for (let i = 0; i < 4; i++) {
//       result += Math.floor(Math.random() * 10);
//     }
    
//     // Generate 2 letters
//     for (let i = 0; i < 2; i++) {
//       result += characters.charAt(Math.floor(Math.random() * 26));
//     }
    
//     this.orderNumber = result;
//   }
//   // next();
// });

// // Update product stock when order is created
// orderSchema.post('save', async function(doc, next) {
//   try {
//     const Product = mongoose.model('Product');
    
//     // Update stock for each item
//     for (const item of doc.items) {
//       await Product.findByIdAndUpdate(item.product, {
//         $inc: { 
//           quantityInStock: -item.quantity,
//           salesCount: item.quantity
//         }
//       });
//     }
//   } catch (error) {
//     console.error('Error updating product stock:', error);
//   }
//   // next();
// });

// // Indexes
// orderSchema.index({ orderNumber: 1 }, { unique: true });
// orderSchema.index({ customer: 1, createdAt: -1 });
// orderSchema.index({ 'items.vendor': 1, status: 1 });
// orderSchema.index({ status: 1, createdAt: -1 });
// orderSchema.index({ 'vendorOrders.vendor': 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;