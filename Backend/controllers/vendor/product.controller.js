// controllers/vendor/product.controller.js
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../services/cloudinary.service.js';

// @desc    Create a new product
// @route   POST /api/vendor/products
// @access  Private (Vendor)
export const createProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const {
      ndcNumber,
      productName,
      strength,
      dosageForm,
      manufacturer,
      expirationMonth,
      expirationYear,
      packageCondition,
      originalPackSize,
      isFridgeProduct,
      packQuantity,
      quantityInStock,
      price,
      lotNumber
    } = req.body;

    // Validate required fields
    if (!ndcNumber || !productName || !strength || !dosageForm || !manufacturer) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({ ndcNumber });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this NDC number already exists'
      });
    }

    // Handle image upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }

    let imageUrl = '';
    let publicId = '';

    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'product_images');
      imageUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload product image'
      });
    }

    // Parse expiration date
    const expirationDate = new Date(expirationYear, expirationMonth - 1);

    // Create product
    const product = await Product.create({
      ndcNumber,
      productName,
      strength,
      dosageForm,
      manufacturer,
      expirationDate,
      packageCondition,
      originalPackSize: parseInt(originalPackSize),
      isFridgeProduct,
      packQuantity,
      quantityInStock: parseInt(quantityInStock),
      price: parseFloat(price),
      lotNumber,
      image: {
        url: imageUrl,
        publicId: publicId
      },
      vendor: vendor._id,
      vendorName: vendor.pharmacyInfo?.legalBusinessName || vendor.pharmacyInfo?.dba || 'Unknown Vendor',
      status: parseInt(quantityInStock) > 0 ? 'active' : 'out_of_stock'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    // Clean up uploaded image if product creation failed
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.error('Failed to clean up image:', deleteError);
      }
    }
    
    next(error);
  }
};

// @desc    Get vendor's products
// @route   GET /api/vendor/products
// @access  Private (Vendor)
export const getVendorProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = { vendor: req.user.id };
    
    // Add search filter
    if (search) {
      query.$or = [
        { ndcNumber: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status && ['active', 'inactive', 'out_of_stock'].includes(status)) {
      query.status = status;
    }

    const products = await Product.find(query)
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

// @desc    Get single product
// @route   GET /api/vendor/products/:id
// @access  Private (Vendor)
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user.id
    });

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

// @desc    Update product
// @route   PUT /api/vendor/products/:id
// @access  Private (Vendor)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user.id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      productName,
      strength,
      dosageForm,
      manufacturer,
      expirationMonth,
      expirationYear,
      packageCondition,
      originalPackSize,
      isFridgeProduct,
      packQuantity,
      quantityInStock,
      price,
      lotNumber,
      status
    } = req.body;

    // Update fields
    if (productName) product.productName = productName;
    if (strength) product.strength = strength;
    if (dosageForm) product.dosageForm = dosageForm;
    if (manufacturer) product.manufacturer = manufacturer;
    
    if (expirationMonth && expirationYear) {
      product.expirationDate = new Date(expirationYear, expirationMonth - 1);
    }
    
    if (packageCondition) product.packageCondition = packageCondition;
    if (originalPackSize) product.originalPackSize = parseInt(originalPackSize);
    if (isFridgeProduct) product.isFridgeProduct = isFridgeProduct;
    if (packQuantity) product.packQuantity = packQuantity;
    if (quantityInStock) {
      product.quantityInStock = parseInt(quantityInStock);
      // Update status based on quantity
      product.status = parseInt(quantityInStock) > 0 ? 'active' : 'out_of_stock';
    }
    if (price) product.price = parseFloat(price);
    if (lotNumber) product.lotNumber = lotNumber;
    if (status) product.status = status;

    // Handle image update
    if (req.file) {
      try {
        // Delete old image
        await deleteFromCloudinary(product.image.publicId);
        
        // Upload new image
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'product_images');
        product.image.url = uploadResult.url;
        product.image.publicId = uploadResult.publicId;
      } catch (uploadError) {
        console.error('Image update error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update product image'
        });
      }
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

// @desc    Delete product
// @route   DELETE /api/vendor/products/:id
// @access  Private (Vendor)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user.id
    });

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
      // Continue with product deletion even if image deletion fails
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

// @desc    Get product statistics
// @route   GET /api/vendor/products/stats
// @access  Private (Vendor)
export const getProductStats = async (req, res, next) => {
  try {
    const stats = await Product.aggregate([
      {
        $match: { vendor: req.user._id }
      },
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
          totalStock: { $sum: '$quantityInStock' },
          totalValue: { $sum: { $multiply: ['$quantityInStock', '$price'] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        totalStock: 0,
        totalValue: 0
      }
    });
  } catch (error) {
    next(error);
  }
};