// controllers/admin/product.controller.js
import mongoose from 'mongoose'; // Add this import
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';
import { deleteFromCloudinary } from '../../services/cloudinary.service.js';

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private (Admin)
// Example backend controller for admin products
export const getAllProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            vendor = '',
            status = '',
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;
        const query = {};

        // 🔎 Search filter
        if (search) {
            query.$or = [
                { ndcNumber: { $regex: search, $options: 'i' } },
                { productName: { $regex: search, $options: 'i' } },
                { manufacturer: { $regex: search, $options: 'i' } }
            ];
        }

        // ✅ VENDOR FILTER - Fixed
        if (vendor) {
            // Check if it's a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(vendor)) {
                query.vendor = new mongoose.Types.ObjectId(vendor);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid vendor ID'
                });
            }
        }

        // ✅ Status filter
        if (status && ['active', 'inactive', 'out_of_stock'].includes(status)) {
            query.status = status;
        }

        const sortOptions = {
            [sort]: order === 'desc' ? -1 : 1
        };

        // Fetch products with vendor filter
        const products = await Product.find(query)
            .populate({
                path: 'vendor',
                select: 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email status',
                model: 'Vendor'
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get products by specific vendor (admin)
// @route   GET /api/admin/vendors/:vendorId/products
// @access  Private (Admin)
export const getVendorProducts = async (req, res, next) => {
    try {
        const { vendorId } = req.params;
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        // Validate vendor ID
        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vendor ID'
            });
        }

        // Check if vendor exists
        const vendorExists = await Vendor.findById(vendorId);
        if (!vendorExists) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        const skip = (page - 1) * limit;
        const query = { vendor: vendorId };

        // 🔎 Search filter
        if (search) {
            query.$or = [
                { ndcNumber: { $regex: search, $options: 'i' } },
                { productName: { $regex: search, $options: 'i' } },
                { manufacturer: { $regex: search, $options: 'i' } }
            ];
        }

        // ✅ Status filter
        if (status && ['active', 'inactive', 'out_of_stock'].includes(status)) {
            query.status = status;
        }

        const sortOptions = {
            [sort]: order === 'desc' ? -1 : 1
        };

        // Fetch products for this vendor
        const products = await Product.find(query)
            .populate({
                path: 'vendor',
                select: 'pharmacyInfo.legalBusinessName pharmacyInfo.dba email',
                model: 'Vendor'
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        // Calculate vendor-specific stats
        const vendorStats = await Product.aggregate([
            { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
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
                    totalValue: { $sum: { $multiply: ['$quantityInStock', '$price'] } },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: products,
            stats: vendorStats[0] || {
                totalProducts: 0,
                activeProducts: 0,
                outOfStockProducts: 0,
                totalStock: 0,
                totalValue: 0,
                avgPrice: 0
            },
            vendor: {
                _id: vendorExists._id,
                name: vendorExists.pharmacyInfo?.legalBusinessName || vendorExists.pharmacyInfo?.dba || 'Unknown Vendor'
            },
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
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