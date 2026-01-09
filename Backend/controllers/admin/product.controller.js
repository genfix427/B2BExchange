// controllers/admin/product.controller.js
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';
import { deleteFromCloudinary } from '../../services/cloudinary.service.js';

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private (Admin)
export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', vendor = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { ndcNumber: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add vendor filter
    if (vendor) {
      query.vendor = vendor;
    }
    
    // Add status filter
    if (status && ['active', 'inactive', 'out_of_stock'].includes(status)) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate('vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product (admin)
// @route   GET /api/admin/products/:id
// @access  Private (Admin)
export const getProductAdmin = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba pharmacyOwner.email pharmacyOwner.mobile');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
export const updateProductAdmin = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Admin can update any field except ndcNumber (unique identifier)
    const updates = req.body;
    delete updates.ndcNumber; // Prevent NDC number changes

    // Update product
    Object.assign(product, updates);
    
    // Update status if quantity changes
    if (updates.quantityInStock !== undefined) {
      product.status = updates.quantityInStock > 0 ? 'active' : 'out_of_stock';
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
export const deleteProductAdmin = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete image from Cloudinary
    try {
      await deleteFromCloudinary(product.image.publicId);
    } catch (deleteError) {
      console.error('Image deletion error:', deleteError);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product statistics (admin)
// @route   GET /api/admin/products/stats
// @access  Private (Admin)
export const getProductStatsAdmin = async (req, res, next) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] }
          },
          totalVendors: { $addToSet: '$vendor' },
          totalStock: { $sum: '$quantityInStock' },
          totalValue: { $sum: { $multiply: ['$quantityInStock', '$price'] } },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $project: {
          totalProducts: 1,
          activeProducts: 1,
          outOfStockProducts: 1,
          totalVendors: { $size: '$totalVendors' },
          totalStock: 1,
          totalValue: 1,
          avgPrice: { $round: ['$avgPrice', 2] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        totalVendors: 0,
        totalStock: 0,
        totalValue: 0,
        avgPrice: 0
      }
    });
  } catch (error) {
    next(error);
  }
};