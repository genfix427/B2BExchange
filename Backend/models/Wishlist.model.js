// models/Wishlist.model.js
import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure one wishlist per vendor
wishlistSchema.index({ vendor: 1 }, { unique: true });

// Update product wishlist count when item is added/removed
wishlistSchema.statics.updateProductWishlistCount = async function(productId) {
  const count = await this.aggregate([
    { $unwind: '$products' },
    { $match: { 'products.product': productId } },
    { $count: 'count' }
  ]);
  
  await mongoose.model('Product').findByIdAndUpdate(productId, {
    wishlistCount: count[0]?.count || 0
  });
};

wishlistSchema.post('save', async function() {
  for (const item of this.products) {
    await this.constructor.updateProductWishlistCount(item.product);
  }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;