// models/Cart.model.js
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  price: {
    type: Number,
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one cart per customer
cartSchema.index({ customer: 1 }, { unique: true });

// Virtual for cart total
cartSchema.virtual('total').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// Method to add item to cart
cartSchema.methods.addItem = async function(product, quantity = 1) {
  const existingItem = this.items.find(item => 
    item.product.toString() === product._id.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: product._id,
      quantity,
      price: product.price,
      vendor: product.vendor,
      vendorName: product.vendorName
    });
  }
  
  await this.save();
  return this;
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId
  );
  
  await this.save();
  return this;
};

// Method to update quantity
cartSchema.methods.updateQuantity = async function(productId, quantity) {
  const item = this.items.find(item => 
    item.product.toString() === productId
  );
  
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }
    item.quantity = quantity;
    await this.save();
  }
  
  return this;
};

// Method to clear cart
cartSchema.methods.clear = async function() {
  this.items = [];
  await this.save();
  return this;
};

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;