// controllers/store/product.controller.js - UPDATED
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';

// @desc    Get all products for store (approved vendors only, exclude own products)
// @route   GET /api/store/products
// @access  Private (Vendor)
// controllers/store/product.controller.js - ADD DEBUG LOGS
export const getStoreProducts = async (req, res, next) => {
  try {
    console.log('🛍️ Store products request - User ID:', req.user?.id);
    console.log('🛍️ Query parameters:', req.query);

    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      minPrice = '',
      maxPrice = '',
      inStock = 'true', // Default is 'true'
      vendor = '',
      sort = 'newest'
    } = req.query;

    const skip = (page - 1) * limit;
    const userId = req.user.id;

    // ✅ First, get approved vendors (excluding self if logged in)
    const approvedVendorQuery = { status: 'approved' };
    approvedVendorQuery._id = { $ne: userId };

    const approvedVendors = await Vendor.find(approvedVendorQuery).select('_id');
    const approvedVendorIds = approvedVendors.map(v => v._id);

    console.log('🛍️ Approved vendor IDs (excluding self):', approvedVendorIds);
    console.log('🛍️ Current user ID:', userId);

    // Build query
    const query = {
      status: 'active',
      vendor: { $in: approvedVendorIds }
    };

    console.log('🛍️ Base query:', query);

    // 🔍 Search
    if (search) {
      query.$or = [
        { ndcNumber: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }

    // 📦 Category
    if (category) {
      query.dosageForm = category;
    }

    // 💲 Price
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 📊 Stock - THIS IS THE PROBLEM!
    console.log('🛍️ inStock filter value:', inStock);
    if (inStock === 'true') {
      query.quantityInStock = { $gt: 0 };
      console.log('🛍️ Applying stock filter: quantityInStock > 0');
    } else {
      console.log('🛍️ No stock filter applied');
    }

    // 🏪 Vendor filter
    if (vendor) {
      query.vendor = vendor;
    }

    console.log('🛍️ Final query before executing:', JSON.stringify(query, null, 2));

    // 🔃 Sort
    let sortOption = { createdAt: -1 };
    if (sort === 'priceLow') sortOption = { price: 1 };
    else if (sort === 'priceHigh') sortOption = { price: -1 };

    // Count total documents
    const total = await Product.countDocuments(query);
    console.log('🛍️ Total products matching query:', total);

    // Get products with vendor info
    const products = await Product.find(query)
      .populate('vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    console.log('🛍️ Found products:', products.length);

    if (products.length > 0) {
      console.log('🛍️ First product:', {
        id: products[0]._id,
        name: products[0].productName,
        stock: products[0].quantityInStock,
        price: products[0].price,
        vendorId: products[0].vendor?._id,
        vendorName: products[0].vendorName
      });
    }

    if (inStock === 'true') {
      query.quantityInStock = { $gt: 0 };
      console.log('🛍️ Applying stock filter: quantityInStock > 0');
    }

    // In the response mapping, add stockStatus:
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products.map(product => ({
        _id: product._id,
        ndcNumber: product.ndcNumber,
        productName: product.productName,
        strength: product.strength,
        dosageForm: product.dosageForm,
        manufacturer: product.manufacturer,
        price: product.price,
        quantityInStock: product.quantityInStock,
        stockStatus: product.stockStatus, // Add this
        image: product.image,
        vendor: product.vendor?._id,
        vendorName: product.vendorName || (product.vendor?.pharmacyInfo?.legalBusinessName || product.vendor?.pharmacyInfo?.dba),
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }))
    });
  } catch (error) {
    console.error('🛍️ Error fetching store products:', error);
    next(error);
  }
};

// @desc    Get single product for store
// @route   GET /api/store/products/:id
// @access  Private (Vendor)
export const getStoreProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba pharmacyInfo.phone email')
      .populate({
        path: 'vendor',
        select: '-password -__v',
        populate: {
          path: 'pharmacyInfo',
          select: 'city state shippingAddress'
        }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if vendor is approved
    const vendor = await Vendor.findById(product.vendor);
    if (!vendor || vendor.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Product not available'
      });
    }

    // Get related products from same vendor (exclude current product)
    const relatedProducts = await Product.find({
      vendor: product.vendor,
      _id: { $ne: product._id },
      status: 'active',
      quantityInStock: { $gt: 0 }
    })
      .limit(4)
      .select('productName strength dosageForm price image quantityInStock vendorName')
      .populate('vendor', 'pharmacyInfo.legalBusinessName');

    res.status(200).json({
      success: true,
      data: {
        product: {
          _id: product._id,
          ndcNumber: product.ndcNumber,
          productName: product.productName,
          strength: product.strength,
          dosageForm: product.dosageForm,
          manufacturer: product.manufacturer,
          price: product.price,
          quantityInStock: product.quantityInStock,
          image: product.image,
          vendor: product.vendor?._id,
          vendorName: product.vendorName || (product.vendor?.pharmacyInfo?.legalBusinessName || product.vendor?.pharmacyInfo?.dba),
          description: product.description,
          status: product.status,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        },
        relatedProducts: relatedProducts.map(p => ({
          _id: p._id,
          productName: p.productName,
          strength: p.strength,
          dosageForm: p.dosageForm,
          price: p.price,
          image: p.image,
          quantityInStock: p.quantityInStock,
          vendorName: p.vendorName
        }))
      }
    });
  } catch (error) {
    console.error('🛍️ Error fetching single product:', error);
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/store/products/featured
// @access  Private (Vendor)
export const getFeaturedProducts = async (req, res, next) => {
  try {
    console.log('🛍️ Featured products request - User ID:', req.user?.id);

    const userId = req.user.id;

    // Get approved vendors (excluding current user)
    const approvedVendors = await Vendor.find({
      status: 'approved',
      _id: { $ne: userId }
    }).select('_id');

    const approvedVendorIds = approvedVendors.map(v => v._id);

    console.log('🛍️ Approved vendor IDs for featured:', approvedVendorIds.length);

    // Get 8 random active products from approved vendors
    const products = await Product.aggregate([
      {
        $match: {
          vendor: { $in: approvedVendorIds },
          status: 'active',
          quantityInStock: { $gt: 0 }
        }
      },
      { $sample: { size: 8 } },
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendor',
          foreignField: '_id',
          as: 'vendorInfo'
        }
      },
      {
        $unwind: '$vendorInfo'
      },
      {
        $project: {
          _id: 1,
          ndcNumber: 1,
          productName: 1,
          strength: 1,
          dosageForm: 1,
          manufacturer: 1,
          price: 1,
          image: 1,
          quantityInStock: 1,
          vendor: 1,
          vendorName: 1,
          vendorData: {
            name: '$vendorInfo.pharmacyInfo.legalBusinessName',
            dba: '$vendorInfo.pharmacyInfo.dba'
          }
        }
      }
    ]);

    console.log('🛍️ Featured products found:', products.length);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products.map(product => ({
        _id: product._id,
        ndcNumber: product.ndcNumber,
        productName: product.productName,
        strength: product.strength,
        dosageForm: product.dosageForm,
        manufacturer: product.manufacturer,
        price: product.price,
        image: product.image,
        quantityInStock: product.quantityInStock,
        vendor: product.vendor,
        vendorName: product.vendorName || product.vendorData?.name || product.vendorData?.dba
      }))
    });
  } catch (error) {
    console.error('🛍️ Error fetching featured products:', error);
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/store/products/search
// @access  Private (Vendor)
export const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Find approved vendors (excluding self)
    const approvedVendors = await Vendor.find({
      status: 'approved',
      _id: { $ne: userId }
    }).select('_id');

    const approvedVendorIds = approvedVendors.map(v => v._id);

    const products = await Product.find({
      vendor: { $in: approvedVendorIds },
      status: 'active',
      $or: [
        { ndcNumber: { $regex: q, $options: 'i' } },
        { productName: { $regex: q, $options: 'i' } },
        { manufacturer: { $regex: q, $options: 'i' } },
        { dosageForm: { $regex: q, $options: 'i' } }
      ]
    })
      .limit(20)
      .select('productName strength dosageForm manufacturer price image quantityInStock vendorName vendor')
      .populate('vendor', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products.map(product => ({
        _id: product._id,
        productName: product.productName,
        strength: product.strength,
        dosageForm: product.dosageForm,
        manufacturer: product.manufacturer,
        price: product.price,
        image: product.image,
        quantityInStock: product.quantityInStock,
        vendor: product.vendor?._id,
        vendorName: product.vendorName || (product.vendor?.pharmacyInfo?.legalBusinessName || product.vendor?.pharmacyInfo?.dba)
      }))
    });
  } catch (error) {
    console.error('🛍️ Error searching products:', error);
    next(error);
  }
};

// @desc    Get available filters
// @route   GET /api/store/products/filters
// @access  Private (Vendor)
export const getFilters = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get approved vendors (excluding self)
    const approvedVendors = await Vendor.find({
      status: 'approved',
      _id: { $ne: userId }
    }).select('_id');

    const approvedVendorIds = approvedVendors.map(v => v._id);

    // Get all dosage forms
    const dosageForms = await Product.distinct('dosageForm', {
      vendor: { $in: approvedVendorIds },
      status: 'active'
    });

    // Get price range
    const priceStats = await Product.aggregate([
      {
        $match: {
          vendor: { $in: approvedVendorIds },
          status: 'active',
          quantityInStock: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    // Get vendors list
    const vendors = await Vendor.find({
      status: 'approved',
      _id: { $ne: userId }
    })
      .select('pharmacyInfo.legalBusinessName pharmacyInfo.dba')
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        dosageForms: dosageForms.filter(Boolean).sort(),
        priceRange: priceStats[0] || { minPrice: 0, maxPrice: 1000, avgPrice: 100 },
        vendors: vendors.map(v => ({
          _id: v._id,
          name: v.pharmacyInfo.dba || v.pharmacyInfo.legalBusinessName
        }))
      }
    });
  } catch (error) {
    console.error('🛍️ Error fetching filters:', error);
    next(error);
  }
};