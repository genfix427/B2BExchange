import mongoose from 'mongoose';
import Offer from '../../models/Offer.model.js';
import Order from '../../models/Order.model.js';
import Product from '../../models/Product.model.js';
import Vendor from '../../models/Vendor.model.js';

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

/**
 * Map any payment method string to a valid Order enum value
 * Order model accepts: 'bank_transfer', 'wire_transfer', 'check'
 */
const mapPaymentMethod = (method) => {
  if (!method) return 'bank_transfer';

  const normalized = method.toLowerCase().replace(/[\s-_]+/g, '_');

  const mapping = {
    'ach_stripe': 'bank_transfer',
    'ach': 'bank_transfer',
    'stripe': 'bank_transfer',
    'bank_transfer': 'bank_transfer',
    'bank': 'bank_transfer',
    'wire_transfer': 'wire_transfer',
    'wire': 'wire_transfer',
    'check': 'check',
    'cheque': 'check',
    'net_30': 'bank_transfer',
    'net_60': 'bank_transfer',
    'credit_card': 'bank_transfer',
    'paypal': 'bank_transfer'
  };

  return mapping[normalized] || 'bank_transfer';
};

/**
 * Build a valid shippingAddress object from a Vendor document.
 * Uses pharmacyInfo.shippingAddress fields + pharmacyInfo.phone
 * as fallback for the required phone field.
 *
 * Based on the EXACT Vendor model structure:
 *   vendor.pharmacyInfo.shippingAddress.line1
 *   vendor.pharmacyInfo.shippingAddress.line2
 *   vendor.pharmacyInfo.shippingAddress.city
 *   vendor.pharmacyInfo.shippingAddress.state
 *   vendor.pharmacyInfo.shippingAddress.zipCode
 *   vendor.pharmacyInfo.phone
 *   vendor.pharmacyOwner.mobile
 */
const buildShippingAddress = (vendor) => {
  const shipping = vendor.pharmacyInfo?.shippingAddress || {};
  const mailing = vendor.pharmacyInfo?.mailingAddress || {};

  // Use shipping address first, fall back to mailing address
  const line1 = shipping.line1 || mailing.line1;
  const line2 = shipping.line2 || mailing.line2 || '';
  const city = shipping.city || mailing.city;
  const state = shipping.state || mailing.state;
  const zipCode = shipping.zipCode || mailing.zipCode;

  // Phone: shippingAddress doesn't have phone in Vendor model,
  // so use pharmacyInfo.phone or pharmacyOwner.mobile
  const phone = vendor.pharmacyInfo?.phone
    || vendor.pharmacyOwner?.mobile
    || vendor.primaryContact?.mobile
    || '';

  // Validate we have all required fields
  if (!line1 || !city || !state || !zipCode || !phone) {
    console.warn('⚠️ Missing shipping address fields:', {
      line1: !!line1,
      city: !!city,
      state: !!state,
      zipCode: !!zipCode,
      phone: !!phone,
      vendorId: vendor._id
    });
  }

  return {
    line1: line1 || 'Address not provided',
    line2: line2,
    city: city || 'City not provided',
    state: state || 'NY', // fallback to valid state
    zipCode: zipCode || '00000',
    phone: phone || '0000000000'
  };
};

/**
 * Get customer name from vendor profile
 */
const getCustomerName = (vendor) => {
  return vendor.pharmacyInfo?.legalBusinessName
    || vendor.pharmacyInfo?.dba
    || `${vendor.pharmacyOwner?.firstName || ''} ${vendor.pharmacyOwner?.lastName || ''}`.trim()
    || 'Unknown';
};

/**
 * Get customer email from vendor profile
 */
const getCustomerEmail = (vendor) => {
  return vendor.pharmacyOwner?.email
    || vendor.email
    || vendor.primaryContact?.email
    || '';
};

/**
 * Get vendor display name
 */
const getVendorName = (vendor) => {
  return vendor.pharmacyInfo?.legalBusinessName
    || vendor.pharmacyInfo?.dba
    || `${vendor.pharmacyOwner?.firstName || ''} ${vendor.pharmacyOwner?.lastName || ''}`.trim()
    || 'Unknown Vendor';
};


// ──────────────────────────────────────────────
// CONTROLLERS
// ──────────────────────────────────────────────

// @desc    Create a new offer (buyer makes an offer)
// @route   POST /api/vendor/offers
// @access  Private (Vendor)
export const createOffer = async (req, res, next) => {
  try {
    const buyerId = req.vendor._id;
    const {
      productId,
      quantity,
      offeredPrice,
      message
    } = req.body;

    // Validate input
    if (!productId || !quantity || !offeredPrice) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, quantity, and offered price are required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    if (offeredPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Offered price must be greater than 0'
      });
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Cannot offer on own product
    if (product.vendor.toString() === buyerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot make an offer on your own product'
      });
    }

    // Check stock
    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantityInStock}`
      });
    }

    // Check for existing active offer
    const existingOffer = await Offer.findOne({
      buyer: buyerId,
      product: productId,
      status: { $in: ['pending', 'countered'] }
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active offer on this product'
      });
    }

    // Create the offer
    const offer = new Offer({
      buyer: buyerId,
      seller: product.vendor,
      product: product._id,
      productName: product.productName,
      ndcNumber: product.ndcNumber || '',
      manufacturer: product.manufacturer || '',
      quantity,
      originalPrice: product.price,
      offeredPrice,
      message: message || '',
      status: 'pending',
      history: [{
        action: 'created',
        performedBy: buyerId,
        performedByRole: 'buyer',
        price: offeredPrice,
        message: message || 'Offer created'
      }]
    });

    await offer.save();

    // Populate for response
    await offer.populate('buyer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba');
    await offer.populate('seller', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba');
    await offer.populate('product', 'productName ndcNumber price image');

    res.status(201).json({
      success: true,
      message: 'Offer sent successfully',
      data: offer
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    next(error);
  }
};


// @desc    Accept an offer
// @route   PUT /api/vendor/offers/:offerId/accept
// @access  Private (Vendor)
export const acceptOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const currentVendorId = req.vendor._id;

    // ── 1. Find the offer with populated references ──
    const offer = await Offer.findById(offerId)
      .populate('product');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // ── 2. Determine roles ──
    const isSeller = offer.seller.toString() === currentVendorId.toString();
    const isBuyer = offer.buyer.toString() === currentVendorId.toString();

    if (!isSeller && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this offer'
      });
    }

    // ── 3. Validate status-based acceptance ──
    if (isSeller && offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Seller can only accept pending offers. Current status: "${offer.status}"`
      });
    }

    if (isBuyer && offer.status !== 'countered') {
      return res.status(400).json({
        success: false,
        message: `Buyer can only accept counter offers. Current status: "${offer.status}"`
      });
    }

    // ── 4. Fetch FULL buyer and seller vendor docs ──
    const buyerVendor = await Vendor.findById(offer.buyer);
    const sellerVendor = await Vendor.findById(offer.seller);

    if (!buyerVendor) {
      return res.status(404).json({
        success: false,
        message: 'Buyer vendor account not found'
      });
    }

    if (!sellerVendor) {
      return res.status(404).json({
        success: false,
        message: 'Seller vendor account not found'
      });
    }

    // ── 5. Fetch fresh product data ──
    const product = await Product.findById(
      offer.product._id || offer.product
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product no longer exists'
      });
    }

    // ── 6. Determine final agreed price ──
    const finalPrice = offer.status === 'countered'
      ? (offer.counterPrice || offer.offeredPrice)
      : offer.offeredPrice;

    const quantity = offer.quantity;

    // ── 7. Check stock ──
    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantityInStock}, Requested: ${quantity}`
      });
    }

    // ── 8. Extract buyer info using exact Vendor model fields ──
    const customerName = getCustomerName(buyerVendor);
    const customerEmail = getCustomerEmail(buyerVendor);

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Buyer email not found in vendor profile. Cannot create order.'
      });
    }

    // ── 9. Build shipping address from buyer's vendor profile ──
    const shippingAddress = buildShippingAddress(buyerVendor);

    // ── 10. Get seller info ──
    const sellerName = getVendorName(sellerVendor);

    // ── 11. Map payment method ──
    const paymentMethod = mapPaymentMethod(
      offer.paymentMethod || 'bank_transfer'
    );

    // ── 12. Calculate totals ──
    const subtotal = parseFloat((finalPrice * quantity).toFixed(2));
    const shippingCost = 0;
    const tax = 0;
    const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

    // ── 13. Log what we're about to create (for debugging) ──
    console.log('📦 Creating order from offer:', {
      offerId: offer._id,
      offerStatus: offer.status,
      acceptedBy: isSeller ? 'seller' : 'buyer',
      buyer: {
        id: buyerVendor._id,
        name: customerName,
        email: customerEmail
      },
      seller: {
        id: sellerVendor._id,
        name: sellerName
      },
      product: {
        id: product._id,
        name: product.productName,
        ndcNumber: product.ndcNumber,
        stockAvailable: product.quantityInStock
      },
      pricing: {
        originalPrice: offer.originalPrice,
        offeredPrice: offer.offeredPrice,
        counterPrice: offer.counterPrice,
        finalPrice,
        quantity,
        subtotal,
        total
      },
      shippingAddress: {
        line1: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        phone: shippingAddress.phone
      },
      paymentMethod
    });

    // ── 14. Build order data matching EXACT Order model schema ──
    const orderData = {
      // Customer (buyer)
      customer: buyerVendor._id,
      customerName: customerName,
      customerEmail: customerEmail,

      // Items array
      items: [
        {
          product: product._id,
          productName: product.productName || offer.productName || 'Unknown Product',
          ndcNumber: product.ndcNumber || offer.ndcNumber || 'N/A',
          quantity: quantity,
          unitPrice: finalPrice,
          totalPrice: subtotal,
          vendor: sellerVendor._id,
          vendorName: sellerName
        }
      ],

      // Shipping address (from buyer profile)
      shippingAddress: {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        phone: shippingAddress.phone
      },

      // Vendor orders
      vendorOrders: [
        {
          vendor: sellerVendor._id,
          vendorName: sellerName,
          status: 'confirmed',
          subtotal: subtotal,
          items: [
            {
              product: product._id,
              productName: product.productName || offer.productName || 'Unknown Product',
              quantity: quantity,
              unitPrice: finalPrice,
              totalPrice: subtotal
            }
          ]
        }
      ],

      // Payment
      paymentMethod: paymentMethod,
      paymentStatus: 'pending',

      // Totals
      subtotal: subtotal,
      shippingCost: shippingCost,
      tax: tax,
      total: total,

      // Status
      status: 'confirmed',

      // Status history
      statusHistory: [
        {
          status: 'confirmed',
          changedBy: currentVendorId,
          changedByType: isSeller ? 'seller' : 'buyer',
          note: `Order created from accepted offer. Offer ID: ${offer._id}. ` +
                `${isSeller ? 'Seller accepted buyer\'s offer' : 'Buyer accepted seller\'s counter offer'}. ` +
                `Final price: $${finalPrice}/unit`,
          timestamp: new Date()
        }
      ],

      // Notes
      notes: [
        `Created from Offer #${offer._id}`,
        `Original listing price: $${offer.originalPrice}`,
        `Buyer's offered price: $${offer.offeredPrice}`,
        offer.counterPrice ? `Seller's counter price: $${offer.counterPrice}` : null,
        `Final agreed price: $${finalPrice}`,
        `Quantity: ${quantity}`,
        `Total: $${total}`
      ].filter(Boolean).join(' | ')
    };

    // ── 15. Create and save the order ──
    const order = new Order(orderData);

    try {
      await order.save();
      console.log('✅ Order created successfully:', {
        orderNumber: order.orderNumber,
        orderId: order._id,
        total: order.total
      });
    } catch (saveError) {
      // Detailed error logging for validation failures
      console.error('❌ Order save failed:', {
        message: saveError.message,
        name: saveError.name
      });

      if (saveError.name === 'ValidationError') {
        const fieldErrors = Object.entries(saveError.errors).map(
          ([field, err]) => ({
            field,
            message: err.message,
            value: err.value
          })
        );

        console.error('❌ Validation errors:', fieldErrors);

        return res.status(400).json({
          success: false,
          message: 'Order validation failed. Please check vendor profile data.',
          errors: fieldErrors
        });
      }

      throw saveError;
    }

    // ── 16. Update offer status ──
    offer.status = 'accepted';
    offer.acceptedBy = currentVendorId;
    offer.acceptedAt = new Date();
    offer.resultingOrder = order._id;
    offer.finalPrice = finalPrice;

    // Add to offer history
    if (!offer.history) offer.history = [];
    offer.history.push({
      action: 'accepted',
      performedBy: currentVendorId,
      performedByRole: isSeller ? 'seller' : 'buyer',
      price: finalPrice,
      message: `Offer accepted. Order #${order.orderNumber} created.`
    });

    await offer.save();
    console.log('✅ Offer updated to accepted');

    // ── 17. Return success response ──
    res.status(200).json({
      success: true,
      message: 'Offer accepted and order created successfully!',
      data: {
        offer: {
          _id: offer._id,
          status: offer.status,
          offeredPrice: offer.offeredPrice,
          counterPrice: offer.counterPrice || null,
          finalPrice: finalPrice,
          acceptedAt: offer.acceptedAt,
          acceptedBy: isSeller ? 'seller' : 'buyer'
        },
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          total: order.total,
          subtotal: order.subtotal,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          items: order.items.map(item => ({
            productName: item.productName,
            ndcNumber: item.ndcNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            vendorName: item.vendorName
          })),
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Error in acceptOffer:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
    next(error);
  }
};


// @desc    Counter an offer (seller counters)
// @route   PUT /api/vendor/offers/:offerId/counter
// @access  Private (Vendor - Seller)
export const counterOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { counterPrice, message } = req.body;
    const currentVendorId = req.vendor._id;

    // Validate
    if (!counterPrice || counterPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid counter price greater than 0'
      });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Only seller can counter
    if (offer.seller.toString() !== currentVendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can send a counter offer'
      });
    }

    // Can only counter pending offers
    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot counter an offer with status "${offer.status}". Only pending offers can be countered.`
      });
    }

    // Update offer
    offer.status = 'countered';
    offer.counterPrice = counterPrice;
    offer.counterMessage = message || '';
    offer.counteredAt = new Date();

    // Add to history
    if (!offer.history) offer.history = [];
    offer.history.push({
      action: 'countered',
      performedBy: currentVendorId,
      performedByRole: 'seller',
      price: counterPrice,
      message: message || `Counter offer: $${counterPrice}/unit`
    });

    await offer.save();

    // Populate for response
    await offer.populate('buyer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba');
    await offer.populate('seller', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba');
    await offer.populate('product', 'productName ndcNumber price image');

    res.status(200).json({
      success: true,
      message: 'Counter offer sent successfully',
      data: offer
    });
  } catch (error) {
    console.error('Error in counterOffer:', error);
    next(error);
  }
};


// @desc    Reject an offer
// @route   PUT /api/vendor/offers/:offerId/reject
// @access  Private (Vendor)
export const rejectOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { reason } = req.body;
    const currentVendorId = req.vendor._id;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Either buyer or seller can reject
    const isSeller = offer.seller.toString() === currentVendorId.toString();
    const isBuyer = offer.buyer.toString() === currentVendorId.toString();

    if (!isSeller && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this offer'
      });
    }

    // Validate status
    if (!['pending', 'countered'].includes(offer.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject an offer with status "${offer.status}"`
      });
    }

    // Additional role-based validation
    if (isBuyer && offer.status === 'pending') {
      // Buyer can cancel their own pending offer
      offer.status = 'cancelled';
    } else {
      offer.status = 'rejected';
    }

    offer.rejectionReason = reason || '';
    offer.rejectedBy = currentVendorId;
    offer.rejectedAt = new Date();

    // Add to history
    if (!offer.history) offer.history = [];
    offer.history.push({
      action: offer.status === 'cancelled' ? 'cancelled' : 'rejected',
      performedBy: currentVendorId,
      performedByRole: isSeller ? 'seller' : 'buyer',
      message: reason || `Offer ${offer.status}`
    });

    await offer.save();

    res.status(200).json({
      success: true,
      message: `Offer ${offer.status} successfully`,
      data: offer
    });
  } catch (error) {
    console.error('Error in rejectOffer:', error);
    next(error);
  }
};


// @desc    Get offers received (as seller)
// @route   GET /api/vendor/offers/received
// @access  Private (Vendor)
export const getReceivedOffers = async (req, res, next) => {
  try {
    const vendorId = req.vendor._id;
    const {
      status = '',
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { seller: vendorId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sort]: order === 'desc' ? -1 : 1 };

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate('buyer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba pharmacyOwner.firstName pharmacyOwner.lastName')
        .populate('product', 'productName ndcNumber price image quantityInStock')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Offer.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get offers sent (as buyer)
// @route   GET /api/vendor/offers/sent
// @access  Private (Vendor)
export const getSentOffers = async (req, res, next) => {
  try {
    const vendorId = req.vendor._id;
    const {
      status = '',
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { buyer: vendorId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sort]: order === 'desc' ? -1 : 1 };

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate('seller', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba')
        .populate('product', 'productName ndcNumber price image quantityInStock')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Offer.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get single offer details
// @route   GET /api/vendor/offers/:offerId
// @access  Private (Vendor)
export const getOfferDetails = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const vendorId = req.vendor._id;

    // ✅ Prevent CastError
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid offer ID'
      });
    }

    const offer = await Offer.findById(offerId)
      .populate('buyer', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba pharmacyOwner.firstName pharmacyOwner.lastName pharmacyOwner.email pharmacyInfo.phone')
      .populate('seller', 'pharmacyInfo.legalBusinessName pharmacyInfo.dba pharmacyOwner.firstName pharmacyOwner.lastName pharmacyOwner.email pharmacyInfo.phone')
      .populate('product', 'productName ndcNumber price image quantityInStock manufacturer strength dosageForm')
      .populate('resultingOrder', 'orderNumber status total');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    const isBuyer = offer.buyer._id.toString() === vendorId.toString();
    const isSeller = offer.seller._id.toString() === vendorId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this offer'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...offer.toObject(),
        currentUserRole: isBuyer ? 'buyer' : 'seller'
      }
    });

  } catch (error) {
    next(error);
  }
};


// @desc    Get offer statistics for current vendor
// @route   GET /api/vendor/offers/stats
// @access  Private (Vendor)
export const getOfferStats = async (req, res, next) => {
  try {
    const vendorId = req.vendor._id;

    const [receivedStats, sentStats] = await Promise.all([
      // Received offers stats (as seller)
      Offer.aggregate([
        { $match: { seller: new mongoose.Types.ObjectId(vendorId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      // Sent offers stats (as buyer)
      Offer.aggregate([
        { $match: { buyer: new mongoose.Types.ObjectId(vendorId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const formatStats = (statsArray) => {
      const result = {
        total: 0,
        pending: 0,
        countered: 0,
        accepted: 0,
        rejected: 0,
        expired: 0,
        cancelled: 0
      };
      statsArray.forEach(item => {
        result[item._id] = item.count;
        result.total += item.count;
      });
      return result;
    };

    res.status(200).json({
      success: true,
      data: {
        received: formatStats(receivedStats),
        sent: formatStats(sentStats)
      }
    });
  } catch (error) {
    next(error);
  }
};