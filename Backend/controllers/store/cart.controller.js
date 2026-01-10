// controllers/store/cart.controller.js
import Cart from '../../models/Cart.model.js';
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';

// @desc    Get cart
// @route   GET /api/store/cart
// @access  Private (Vendor)
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id })
      .populate('items.product', 'productName ndcNumber strength dosageForm manufacturer image quantityInStock');
    
    if (!cart) {
      // Create empty cart if doesn't exist
      const newCart = await Cart.create({
        customer: req.user.id,
        items: []
      });
      return res.status(200).json({
        success: true,
        data: newCart
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/store/cart/items
// @access  Private (Vendor)
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
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
    
    // Check stock
    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantityInStock} items available in stock`
      });
    }
    
    // Check if customer is trying to buy from themselves
    if (product.vendor._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot purchase your own products'
      });
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ customer: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({
        customer: req.user.id,
        items: []
      });
    }
    
    // Check if item already in cart
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );
    
    const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    
    if (product.quantityInStock < totalQuantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${quantity} more items. Only ${product.quantityInStock - (existingItem?.quantity || 0)} available`
      });
    }
    
    // Add to cart
    await cart.addItem(product, quantity);
    
    // Populate product info
    await cart.populate('items.product', 'productName ndcNumber strength dosageForm manufacturer image');
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/store/cart/items/:productId
// @access  Private (Vendor)
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }
    
    const cart = await Cart.findOne({ customer: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantityInStock} items available in stock`
      });
    }
    
    // Update quantity
    await cart.updateQuantity(productId, quantity);
    
    await cart.populate('items.product', 'productName ndcNumber strength dosageForm manufacturer image');
    
    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/store/cart/items/:productId
// @access  Private (Vendor)
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ customer: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    await cart.removeItem(productId);
    
    await cart.populate('items.product', 'productName ndcNumber strength dosageForm manufacturer image');
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/store/cart
// @access  Private (Vendor)
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    await cart.clear();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};