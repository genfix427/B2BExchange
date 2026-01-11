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
      .populate('items.product', 'productName ndcNumber strength dosageForm manufacturer image quantityInStock status');

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

    // Check stock for each item and remove unavailable items
    let cartModified = false;
    const validItems = [];

    for (const item of cart.items) {
      if (item.product) {
        // Check if product is still available and has stock
        if (item.product.status === 'active' && item.product.quantityInStock >= item.quantity) {
          validItems.push(item);
        } else {
          cartModified = true;
          console.log(`Removing item ${item.product.productName} from cart - insufficient stock`);
        }
      } else {
        cartModified = true; // Product was deleted
      }
    }

    if (cartModified) {
      cart.items = validItems;
      cart.itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
      cart.total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await cart.save();
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart with advanced stock validation
// @route   POST /api/store/cart/items
// @access  Private (Vendor)
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Check if product exists and is from approved vendor
    const product = await Product.findById(productId)
      .populate('vendor');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check product status
    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available for purchase'
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
    if (product.quantityInStock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock',
        stockStatus: 'out_of_stock'
      });
    }

    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantityInStock} items available in stock`,
        available: product.quantityInStock,
        stockStatus: product.quantityInStock < 10 ? 'low_stock' : 'in_stock'
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

    // Check stock with new total quantity
    if (product.quantityInStock < totalQuantity) {
      const availableForAdding = product.quantityInStock - (existingItem?.quantity || 0);

      return res.status(400).json({
        success: false,
        message: `Cannot add ${quantity} more items. Only ${availableForAdding} available`,
        available: availableForAdding,
        currentInCart: existingItem?.quantity || 0
      });
    }

    // Add to cart
    await cart.addItem(product, quantity);

    // Populate product info
    await cart.populate('items.product', 'productName ndcNumber strength dosageForm manufacturer image quantityInStock status');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
      stockInfo: {
        available: product.quantityInStock - totalQuantity,
        stockStatus: product.quantityInStock < 10 ? 'low_stock' : 'in_stock'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity with stock validation
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

    if (quantity === 0) {
      // Remove item if quantity is 0
      return removeFromCart(req, res, next);
    }

    const cart = await Cart.findOne({ customer: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Check product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available'
      });
    }

    // Check stock availability
    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantityInStock} items available in stock`,
        available: product.quantityInStock,
        requested: quantity
      });
    }

    // Find existing item in cart
    const existingItem = cart.items.find(item =>
      item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Update quantity
    const quantityDifference = quantity - existingItem.quantity;

    if (quantityDifference > 0) {
      // Adding more items - check if vendor has enough stock
      if (product.quantityInStock < quantity) {
        const maxAvailable = product.quantityInStock;
        return res.status(400).json({
          success: false,
          message: `Cannot increase quantity to ${quantity}. Only ${maxAvailable} available`,
          available: maxAvailable,
          maxAllowed: maxAvailable
        });
      }
    }

    // Update quantity
    await cart.updateQuantity(productId, quantity);

    await cart.populate('items.product', 'productName ndcNumber strength dosageForm manufacturer image quantityInStock status');

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: cart,
      stockInfo: {
        productId,
        newStock: product.quantityInStock - quantity,
        stockStatus: (product.quantityInStock - quantity) <= 0 ? 'out_of_stock' :
          (product.quantityInStock - quantity) < 10 ? 'low_stock' : 'in_stock'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate cart stock before checkout
// @route   GET /api/store/cart/validate
// @access  Private (Vendor)
export const validateCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id })
      .populate('items.product', 'productName ndcNumber quantityInStock status price');

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Cart is empty',
        items: []
      });
    }

    const validationResults = [];
    let allValid = true;
    let totalItems = 0;
    let grandTotal = 0;

    for (const item of cart.items) {
      if (!item.product) {
        validationResults.push({
          productId: item.product?._id,
          productName: item.productName || 'Unknown Product',
          valid: false,
          reason: 'Product not found',
          action: 'remove'
        });
        allValid = false;
        continue;
      }

      const product = item.product;
      const available = product.quantityInStock;
      const requested = item.quantity;

      if (product.status !== 'active') {
        validationResults.push({
          productId: product._id,
          productName: product.productName,
          valid: false,
          reason: 'Product is not active',
          available: 0,
          requested,
          action: 'remove'
        });
        allValid = false;
      } else if (available < requested) {
        validationResults.push({
          productId: product._id,
          productName: product.productName,
          valid: false,
          reason: 'Insufficient stock',
          available,
          requested,
          action: 'adjust' // Suggest adjusting quantity
        });
        allValid = false;
      } else {
        validationResults.push({
          productId: product._id,
          productName: product.productName,
          valid: true,
          available,
          requested,
          itemTotal: product.price * requested
        });
        totalItems += requested;
        grandTotal += product.price * requested;
      }
    }

    res.status(200).json({
      success: true,
      valid: allValid,
      itemCount: totalItems,
      total: grandTotal,
      items: validationResults,
      warnings: validationResults.filter(item => !item.valid).length
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