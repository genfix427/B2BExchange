// middleware/stock.middleware.js
import Product from '../models/Product.model.js';

export const validateStock = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity) {
      return next();
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if stock is sufficient
    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantityInStock}`,
        availableStock: product.quantityInStock
      });
    }
    
    // Add product info to request for later use
    req.product = product;
    req.requestedQuantity = quantity;
    
    next();
  } catch (error) {
    next(error);
  }
};

export const updateStockAfterOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return next();
    }
    
    // Process each item in the order
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (product) {
        // Use the reduceStock method
        await product.reduceStock(item.quantity);
        
        // Log stock update
        console.log(`Stock updated for product ${product.ndcNumber}: -${item.quantity}`);
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};