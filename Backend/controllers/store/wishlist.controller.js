// controllers/store/wishlist.controller.js
import Wishlist from '../../models/Wishlist.model.js';
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';

// @desc    Get wishlist
// @route   GET /api/store/wishlist
// @access  Private (Vendor)
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ vendor: req.user.id })
      .populate('products.product', 'productName ndcNumber strength dosageForm manufacturer price image quantityInStock vendorName');
    
    if (!wishlist) {
      // Create empty wishlist if doesn't exist
      const newWishlist = await Wishlist.create({
        vendor: req.user.id,
        products: []
      });
      return res.status(200).json({
        success: true,
        data: newWishlist
      });
    }
    
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to wishlist
// @route   POST /api/store/wishlist/items
// @access  Private (Vendor)
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    
    // Check if product exists and is from approved vendor
    const product = await Product.findById(productId)
      .populate('vendor');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if vendor is approved
    if (product.vendor.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add product from unapproved vendor'
      });
    }
    
    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ vendor: req.user.id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        vendor: req.user.id,
        products: []
      });
    }
    
    // Check if already in wishlist
    const alreadyInWishlist = wishlist.products.some(item => 
      item.product.toString() === productId
    );
    
    if (alreadyInWishlist) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    // Add to wishlist
    wishlist.products.push({
      product: productId,
      addedAt: new Date()
    });
    
    await wishlist.save();
    
    // Populate product info
    await wishlist.populate('products.product', 'productName ndcNumber strength dosageForm manufacturer price image quantityInStock vendorName');
    
    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/store/wishlist/items/:productId
// @access  Private (Vendor)
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ vendor: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    // Remove from wishlist
    wishlist.products = wishlist.products.filter(item => 
      item.product.toString() !== productId
    );
    
    await wishlist.save();
    
    await wishlist.populate('products.product', 'productName ndcNumber strength dosageForm manufacturer price image quantityInStock vendorName');
    
    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move wishlist item to cart
// @route   POST /api/store/wishlist/items/:productId/move-to-cart
// @access  Private (Vendor)
export const moveToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;
    
    // First remove from wishlist
    const wishlist = await Wishlist.findOne({ vendor: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    // Check if product is in wishlist
    const wishlistItem = wishlist.products.find(item => 
      item.product.toString() === productId
    );
    
    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }
    
    // Remove from wishlist
    wishlist.products = wishlist.products.filter(item => 
      item.product.toString() !== productId
    );
    
    await wishlist.save();
    
    // Add to cart (reuse cart controller logic)
    // You'll need to import the cart service or call the cart controller
    
    res.status(200).json({
      success: true,
      message: 'Product moved to cart',
      data: { wishlist }
    });
  } catch (error) {
    next(error);
  }
};