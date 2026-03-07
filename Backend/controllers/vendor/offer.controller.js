// controllers/vendor/offer.controller.js
import Offer from '../../models/Offer.model.js';
import Product from '../../models/Product.model.js';
import Order from '../../models/Order.model.js';
import Vendor from '../../models/Vendor.model.js';
import notificationService from '../../services/notification.service.js';

// Helper: Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Helper: Create order from accepted offer
const createOrderFromOffer = async (offer) => {
  const product = await Product.findById(offer.product);
  if (!product) {
    throw new Error('Product no longer available');
  }

  // Check stock
  if (product.quantityInStock < offer.quantity) {
    throw new Error('Insufficient stock to fulfill this offer');
  }

  // Determine final price
  const finalPrice = offer.status === 'counter_accepted' ? offer.counterPrice : offer.offerPrice;

  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    customer: offer.buyerVendor,
    customerName: offer.buyerVendorName,
    customerEmail: '', // Will be populated
    items: [{
      product: offer.product,
      productName: offer.productName,
      ndcNumber: offer.productNDC,
      quantity: offer.quantity,
      price: finalPrice,
      totalPrice: finalPrice * offer.quantity,
      vendor: offer.sellerVendor,
      vendorName: offer.sellerVendorName,
      image: offer.productImage
    }],
    subtotal: finalPrice * offer.quantity,
    total: finalPrice * offer.quantity,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'ach_stripe',
    shippingAddress: {}, // Will be filled from buyer profile
    vendorOrders: [{
      vendor: offer.sellerVendor,
      vendorName: offer.sellerVendorName,
      status: 'pending',
      items: [{
        product: offer.product,
        quantity: offer.quantity,
        price: finalPrice,
        totalPrice: finalPrice * offer.quantity
      }],
      subtotal: finalPrice * offer.quantity
    }],
    offerReference: offer._id,
    isFromOffer: true
  });

  // Reduce stock
  product.quantityInStock -= offer.quantity;
  product.checkAndUpdateStatus();
  await product.save();

  // Populate buyer email
  const buyer = await Vendor.findById(offer.buyerVendor);
  if (buyer) {
    order.customerEmail = buyer.email;
    // Set shipping address from buyer profile
    if (buyer.pharmacyInfo?.address) {
      order.shippingAddress = {
        street: buyer.pharmacyInfo.address.street || '',
        city: buyer.pharmacyInfo.address.city || '',
        state: buyer.pharmacyInfo.address.state || '',
        zipCode: buyer.pharmacyInfo.address.zipCode || '',
        country: 'US'
      };
    }
    await order.save();
  }

  return order;
};

// @desc    Create a new offer (Buyer makes offer)
// @route   POST /api/vendor/offers
// @access  Private (Vendor)
export const createOffer = async (req, res, next) => {
  try {
    const { productId, offerPrice, quantity, message } = req.body;

    // Validate input
    if (!productId || !offerPrice || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, offer price, and quantity are required'
      });
    }

    if (offerPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Offer price must be greater than 0'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Get product
    const product = await Product.findById(productId).populate('vendor');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.quantityInStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.quantityInStock} available.`
      });
    }

    // Prevent self-offers
    if (product.vendor._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot make an offer on your own product'
      });
    }

    // Check for existing pending offer from this buyer on this product
    const existingOffer = await Offer.findOne({
      product: productId,
      buyerVendor: req.user.id,
      status: { $in: ['pending', 'countered'] }
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending offer on this product. Please wait for the seller to respond or cancel your existing offer.'
      });
    }

    // Get buyer vendor info
    const buyerVendor = await Vendor.findById(req.user.id);
    if (!buyerVendor) {
      return res.status(404).json({
        success: false,
        message: 'Buyer vendor not found'
      });
    }

    // Create offer
    const offer = await Offer.create({
      product: product._id,
      productName: product.productName,
      productNDC: product.ndcNumber,
      productImage: product.image,
      originalPrice: product.price,
      buyerVendor: req.user.id,
      buyerVendorName: buyerVendor.pharmacyInfo?.legalBusinessName || buyerVendor.pharmacyInfo?.dba || 'Unknown',
      sellerVendor: product.vendor._id,
      sellerVendorName: product.vendorName || product.vendor.pharmacyInfo?.legalBusinessName || 'Unknown',
      offerPrice: parseFloat(offerPrice),
      quantity: parseInt(quantity),
      message: message || '',
      productSnapshot: {
        strength: product.strength,
        dosageForm: product.dosageForm,
        manufacturer: product.manufacturer,
        packSize: product.originalPackSize?.toString() || product.packQuantity || '',
        lotNumber: product.lotNumber,
        expirationDate: product.expirationDate,
        packageCondition: product.packageCondition
      }
    });

    // Send notification to seller
    await notificationService.notifyOfferReceived(offer);

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully',
      data: offer
    });
  } catch (error) {
    console.error('Create offer error:', error);
    next(error);
  }
};

// @desc    Get received offers (Seller's incoming offers)
// @route   GET /api/vendor/offers/received
// @access  Private (Vendor)
export const getReceivedOffers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = { sellerVendor: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    // Auto-expire old offers
    await Offer.updateMany(
      {
        sellerVendor: req.user.id,
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      {
        status: 'expired'
      }
    );

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('product', 'productName ndcNumber image price quantityInStock')
        .lean(),
      Offer.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: offers,
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

// @desc    Get sent offers (Buyer's outgoing offers)
// @route   GET /api/vendor/offers/sent
// @access  Private (Vendor)
export const getSentOffers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = { buyerVendor: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    // Auto-expire old offers
    await Offer.updateMany(
      {
        buyerVendor: req.user.id,
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      {
        status: 'expired'
      }
    );

    const [offers, total] = await Promise.all([
      Offer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('product', 'productName ndcNumber image price quantityInStock')
        .lean(),
      Offer.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: offers,
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

// @desc    Get single offer details
// @route   GET /api/vendor/offers/:id
// @access  Private (Vendor)
export const getOfferDetails = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('product', 'productName ndcNumber image price quantityInStock strength dosageForm manufacturer')
      .populate('convertedOrder', 'orderNumber status total');

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Check authorization
    const isAuthorized =
      offer.buyerVendor.toString() === req.user.id.toString() ||
      offer.sellerVendor.toString() === req.user.id.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this offer'
      });
    }

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept offer (Seller accepts buyer's offer)
// @route   PUT /api/vendor/offers/:id/accept
// @access  Private (Vendor - Seller)
export const acceptOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Only seller can accept
    if (offer.sellerVendor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can accept this offer'
      });
    }

    // Check if offer is in valid state
    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept offer with status: ${offer.status}`
      });
    }

    // Check if expired
    if (offer.isExpired()) {
      offer.status = 'expired';
      await offer.save();
      return res.status(400).json({
        success: false,
        message: 'This offer has expired'
      });
    }

    // Create order from offer
    const order = await createOrderFromOffer(offer);

    // Update offer status
    offer.status = 'accepted';
    offer.acceptedAt = new Date();
    offer.convertedOrder = order._id;
    await offer.save();

    // Send notifications
    await notificationService.notifyOfferAccepted(offer);
    await notificationService.notifyOrderCreatedFromOffer(offer, order);

    res.status(200).json({
      success: true,
      message: 'Offer accepted and order created successfully',
      data: {
        offer,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status
        }
      }
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    next(error);
  }
};

// @desc    Reject offer (Seller rejects buyer's offer)
// @route   PUT /api/vendor/offers/:id/reject
// @access  Private (Vendor - Seller)
export const rejectOffer = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (offer.sellerVendor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can reject this offer'
      });
    }

    if (!['pending', 'countered'].includes(offer.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject offer with status: ${offer.status}`
      });
    }

    offer.status = 'rejected';
    offer.rejectedAt = new Date();
    offer.rejectionReason = reason || '';
    await offer.save();

    // Notify buyer
    await notificationService.notifyOfferRejected(offer);

    res.status(200).json({
      success: true,
      message: 'Offer rejected',
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Counter offer (Seller counters buyer's offer)
// @route   PUT /api/vendor/offers/:id/counter
// @access  Private (Vendor - Seller)
export const counterOffer = async (req, res, next) => {
  try {
    const { counterPrice, counterMessage } = req.body;

    if (!counterPrice || counterPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Counter price is required and must be greater than 0'
      });
    }

    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (offer.sellerVendor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can counter this offer'
      });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot counter offer with status: ${offer.status}`
      });
    }

    if (offer.isExpired()) {
      offer.status = 'expired';
      await offer.save();
      return res.status(400).json({
        success: false,
        message: 'This offer has expired'
      });
    }

    offer.counterPrice = parseFloat(counterPrice);
    offer.counterMessage = counterMessage || '';
    offer.counteredAt = new Date();
    offer.status = 'countered';
    // Reset expiration for counter
    offer.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await offer.save();

    // Notify buyer
    await notificationService.notifyOfferCountered(offer);

    res.status(200).json({
      success: true,
      message: 'Counter offer sent successfully',
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept counter offer (Buyer accepts seller's counter)
// @route   PUT /api/vendor/offers/:id/accept-counter
// @access  Private (Vendor - Buyer)
export const acceptCounterOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (offer.buyerVendor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can accept the counter offer'
      });
    }

    if (offer.status !== 'countered') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept counter for offer with status: ${offer.status}`
      });
    }

    if (offer.isExpired()) {
      offer.status = 'expired';
      await offer.save();
      return res.status(400).json({
        success: false,
        message: 'This counter offer has expired'
      });
    }

    // Create order with counter price
    const order = await createOrderFromOffer(offer);

    offer.status = 'counter_accepted';
    offer.acceptedAt = new Date();
    offer.convertedOrder = order._id;
    await offer.save();

    // Notifications
    await notificationService.notifyCounterAccepted(offer);
    await notificationService.notifyOrderCreatedFromOffer(offer, order);

    res.status(200).json({
      success: true,
      message: 'Counter offer accepted and order created',
      data: {
        offer,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status
        }
      }
    });
  } catch (error) {
    console.error('Accept counter offer error:', error);
    next(error);
  }
};

// @desc    Reject counter offer (Buyer rejects seller's counter)
// @route   PUT /api/vendor/offers/:id/reject-counter
// @access  Private (Vendor - Buyer)
export const rejectCounterOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (offer.buyerVendor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can reject the counter offer'
      });
    }

    if (offer.status !== 'countered') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject counter for offer with status: ${offer.status}`
      });
    }

    offer.status = 'counter_rejected';
    offer.rejectedAt = new Date();
    await offer.save();

    // Notify seller
    await notificationService.notifyCounterRejected(offer);

    res.status(200).json({
      success: true,
      message: 'Counter offer rejected',
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel offer (Buyer cancels their own offer)
// @route   PUT /api/vendor/offers/:id/cancel
// @access  Private (Vendor - Buyer)
export const cancelOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (offer.buyerVendor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can cancel this offer'
      });
    }

    if (!['pending', 'countered'].includes(offer.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel offer with status: ${offer.status}`
      });
    }

    offer.status = 'cancelled';
    offer.cancelledAt = new Date();
    await offer.save();

    res.status(200).json({
      success: true,
      message: 'Offer cancelled',
      data: offer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get offer counts (for badges)
// @route   GET /api/vendor/offers/counts
// @access  Private (Vendor)
export const getOfferCounts = async (req, res, next) => {
  try {
    // Auto-expire old offers first
    await Offer.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      { status: 'expired' }
    );

    const [receivedCount, sentCount, receivedPendingCount, sentPendingCount] = await Promise.all([
      Offer.countDocuments({
        sellerVendor: req.user.id,
        status: { $in: ['pending'] }
      }),
      Offer.countDocuments({
        buyerVendor: req.user.id,
        status: { $in: ['pending', 'countered'] }
      }),
      Offer.countDocuments({
        sellerVendor: req.user.id,
        status: 'pending'
      }),
      Offer.countDocuments({
        buyerVendor: req.user.id,
        status: 'countered'
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        received: receivedCount,
        sent: sentCount,
        receivedPending: receivedPendingCount,
        sentPending: sentPendingCount,
        total: receivedCount + sentCount
      }
    });
  } catch (error) {
    next(error);
  }
};